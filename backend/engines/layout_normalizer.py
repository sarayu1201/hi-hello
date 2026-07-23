"""
Layout Normalizer Module
=========================
Performs deterministic, geometry-based text and layout extraction using PyMuPDF.
Supports mixed-column layouts within a page, header/footer/watermark removal,
rotation normalization, and scanned page detection.
"""

import os
import re
import time
import unicodedata
from typing import Dict, List, Optional, Tuple, Generator, Any
import fitz  # PyMuPDF

from config import ParserConfig
from patterns import PAGE_NUMBER_RE, HEADER_AD_RE, ADDA247_SIGNATURE_RE
from models import WordBox, TextBlock, PageLayout
from logger import get_logger, set_context, clear_context, log_exception

logger = get_logger("parser")


class LayoutNormalizer:
    """
    Layout Normalization Engine. Responsible for converting raw PDF pages into
    clean, reading-order PageLayout data objects using geometric block clustering.
    """
    def __init__(self, config: Optional[ParserConfig] = None) -> None:
        self.config = config or ParserConfig()

    def normalize_text(self, text: str) -> str:
        """
        Cleans and normalizes unicode characters, whitespaces, and punctuation.
        """
        if not text:
            return ""
        # Normalize unicode NFKC representation to clean ligatures (e.g. fi, fl)
        normalized = unicodedata.normalize("NFKC", text)
        # Normalize whitespaces to single spaces, preserve clean newlines
        normalized = " ".join(normalized.split())
        return normalized

    def _is_watermark_or_ad(self, text: str) -> bool:
        """
        Checks if a text block matches advertisement headers or watermarks.
        """
        stripped = text.strip()
        if not stripped:
            return True
        return bool(HEADER_AD_RE.search(stripped) or ADDA247_SIGNATURE_RE.search(stripped))

    def _is_header_or_footer(self, y0: float, y1: float, page_height: float, text: str) -> Tuple[bool, str]:
        """
        Checks if coordinates fall in header/footer margins or match page number regex.
        """
        stripped = text.strip()
        
        # Check page number text signature
        if PAGE_NUMBER_RE.match(stripped):
            return True, "page_number"

        # Check top/bottom coordinate bounds
        if y1 < page_height * self.config.header_margin_ratio:
            return True, "header"
        if y0 > page_height * (1.0 - self.config.footer_margin_ratio):
            return True, "footer"

        return False, ""

    def _detect_bands(self, blocks: List[Tuple[float, float, float, float, str, int, int]]) -> List[List[Tuple[float, float, float, float, str, int, int]]]:
        """
        Clusters blocks into vertical bands based on overlapping Y intervals.
        """
        if not blocks:
            return []
        
        # Sort blocks primarily by y0 (top coordinate)
        sorted_blocks = sorted(blocks, key=lambda b: (b[1], b[0]))
        
        bands: List[List[Tuple[float, float, float, float, str, int, int]]] = []
        current_band: List[Tuple[float, float, float, float, str, int, int]] = [sorted_blocks[0]]
        current_y_max = sorted_blocks[0][3]  # y1

        for b in sorted_blocks[1:]:
            y0 = b[1]
            y1 = b[3]
            # If the block overlaps vertically with the current band, merge it
            if y0 < current_y_max - self.config.line_grouping_tolerance:
                current_band.append(b)
                current_y_max = max(current_y_max, y1)
            else:
                bands.append(current_band)
                current_band = [b]
                current_y_max = y1
        
        if current_band:
            bands.append(current_band)
            
        return bands

    def _split_band_columns(
        self, 
        band: List[Tuple[float, float, float, float, str, int, int]], 
        page_width: float
    ) -> Tuple[List[Tuple[float, float, float, float, str, int, int]], List[Tuple[float, float, float, float, str, int, int]], Optional[float]]:
        """
        Checks if a vertical band contains two columns by searching for a central vertical gutter.
        """
        if len(band) < 2:
            return band, [], None

        # Sort band items by x0
        sorted_x = sorted(band, key=lambda b: b[0])
        
        # Search for a gutter down the middle of the page width
        left_bound = page_width * 0.25
        right_bound = page_width * 0.75
        
        best_gap = 0.0
        best_pos = None

        # Compare adjacent blocks along the X-axis to find the gutter gap
        for i in range(len(sorted_x) - 1):
            x1_curr = sorted_x[i][2]
            x0_next = sorted_x[i+1][0]
            mid = (x1_curr + x0_next) / 2.0
            
            if left_bound <= mid <= right_bound:
                gap = x0_next - x1_curr
                if gap > best_gap:
                    best_gap = gap
                    best_pos = mid

        # Validate if the gap qualifies as a layout column separator
        min_gutter_width = page_width * self.config.gutter_min_width_ratio
        if best_pos is not None and best_gap >= min_gutter_width:
            left_col = [b for b in band if (b[0] + b[2]) / 2.0 < best_pos]
            right_col = [b for b in band if (b[0] + b[2]) / 2.0 >= best_pos]
            # Ensure both sides have content blocks to count as columns
            if left_col and right_col:
                return left_col, right_col, best_pos

        return band, [], None

    def _is_high_quality_text(self, text: str) -> bool:
        """
        Evaluates the quality of extracted text based on length and garbage character ratios.
        """
        stripped = text.strip()
        if len(stripped) < 50:
            return False
        # Calculate percentage of clean alphanumeric/punctuation characters
        garbage_chars = len(re.findall(r"[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]", text))
        if len(text) > 0 and (garbage_chars / len(text)) > 0.15:
            return False
        return True

    def _extract_page_layout_plumber(self, pdf_path: str, page_idx: int, page_rotation: int) -> Tuple[List[WordBox], List[Tuple[float, float, float, float, str, int, int]]]:
        """
        Fallback extraction using pdfplumber when PyMuPDF yields poor quality text or high garbage ratio.
        """
        import pdfplumber
        words = []
        blocks = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                if page_idx >= len(pdf.pages):
                    return [], []
                plumber_page = pdf.pages[page_idx]
                
                # Extract words
                extracted = plumber_page.extract_words()
                for idx, w in enumerate(extracted):
                    words.append(WordBox(
                        text=w["text"],
                        x0=float(w["x0"]),
                        y0=float(w["top"]),
                        x1=float(w["x1"]),
                        y1=float(w["bottom"]),
                        font_name=w.get("fontname", "Default"),
                        font_size=float(w.get("size", 10.0)),
                        page=page_idx + 1,
                        rotation=page_rotation
                    ))
                
                # Group words into simple horizontal lines/blocks for structure recovery
                # Sort words top-to-bottom, left-to-right
                sorted_w = sorted(words, key=lambda wb: (wb.y0, wb.x0))
                current_block_words = []
                current_y_max = 0.0
                block_no = 0
                
                for w in sorted_w:
                    if not current_block_words:
                        current_block_words = [w]
                        current_y_max = w.y1
                    else:
                        # If overlap or close vertically, same block line
                        if w.y0 < current_y_max + 5.0:
                            current_block_words.append(w)
                            current_y_max = max(current_y_max, w.y1)
                        else:
                            # Finalize previous block line
                            bx0 = min(wb.x0 for wb in current_block_words)
                            by0 = min(wb.y0 for wb in current_block_words)
                            bx1 = max(wb.x1 for wb in current_block_words)
                            by1 = max(wb.y1 for wb in current_block_words)
                            btext = " ".join(wb.text for wb in current_block_words)
                            blocks.append((bx0, by0, bx1, by1, btext, block_no, 0)) # 0 is block_type text
                            block_no += 1
                            current_block_words = [w]
                            current_y_max = w.y1
                
                if current_block_words:
                    bx0 = min(wb.x0 for wb in current_block_words)
                    by0 = min(wb.y0 for wb in current_block_words)
                    bx1 = max(wb.x1 for wb in current_block_words)
                    by1 = max(wb.y1 for wb in current_block_words)
                    btext = " ".join(wb.text for wb in current_block_words)
                    blocks.append((bx0, by0, bx1, by1, btext, block_no, 0))
                    
        except Exception as e:
            logger.error(f"pdfplumber extraction crashed on page {page_idx + 1}: {e}")
            
    def _detect_block_type(self, bbox: Tuple[float, float, float, float], tables: List[Any]) -> str:
        """
        Determines if a block overlaps significantly with a detected table structure.
        """
        for tab in tables:
            try:
                tab_bbox = tab.bbox
                x_left = max(bbox[0], tab_bbox[0])
                y_top = max(bbox[1], tab_bbox[1])
                x_right = min(bbox[2], tab_bbox[2])
                y_bottom = min(bbox[3], tab_bbox[3])
                if x_right > x_left and y_bottom > y_top:
                    overlap_area = (x_right - x_left) * (y_bottom - y_top)
                    block_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                    if block_area > 0 and (overlap_area / block_area) > 0.5:
                        return "table"
            except Exception:
                continue
        return "text"

    def normalize_page(self, doc: fitz.Document, page_idx: int, debug: bool = False) -> PageLayout:
        """
        Extracts, normalizes, and classifies text blocks of a page.
        """
        set_context(page_number=page_idx + 1)
        start_time = time.time()
        page = doc.load_page(page_idx)
        
        # Detect page table layouts
        tables = []
        try:
            tables = page.find_tables()
        except Exception:
            pass

        page_width = page.rect.width
        page_height = page.rect.height
        page_rotation = page.rotation

        # Detect raw PyMuPDF text quality
        fitz_text = page.get_text()
        is_fitz_high_quality = self._is_high_quality_text(fitz_text)
        
        is_scanned = len(fitz_text.strip()) < 50
        ocr_active = False
        engine_used = "PyMuPDF"

        # Initialize collections
        raw_words = []
        raw_blocks = []

        if is_fitz_high_quality:
            # Extract via standard PyMuPDF
            raw_words = page.get_text("words")
            raw_blocks = page.get_text("blocks")
        else:
            # Attempt pdfplumber fallback if valid file path exists
            pdf_path = doc.name
            if pdf_path and os.path.exists(pdf_path):
                logger.info(f"Low quality PyMuPDF text on page {page_idx + 1}. Attempting pdfplumber fallback...")
                plumber_words, plumber_blocks = self._extract_page_layout_plumber(pdf_path, page_idx, page_rotation)
                if len(plumber_words) > 10:
                    raw_words = [(w.x0, w.y0, w.x1, w.y1, w.text, idx, 0, 0) for idx, w in enumerate(plumber_words)]
                    raw_blocks = plumber_blocks
                    engine_used = "pdfplumber"
                    is_scanned = False
                    logger.info(f"Page {page_idx + 1} successfully extracted with pdfplumber.")
            
            # If still no text or very short, fallback to OCR if possible
            if not raw_words and is_scanned:
                try:
                    ocr_text = page.get_text("text", ocr=True)
                    if len(ocr_text.strip()) > 10:
                        is_scanned = False
                        ocr_active = True
                        raw_words = page.get_text("words", ocr=True)
                        raw_blocks = page.get_text("blocks", ocr=True)
                        engine_used = "PyMuPDF-OCR"
                        logger.info(f"Page {page_idx + 1} OCR extraction succeeded.")
                except Exception as ocr_err:
                    logger.warning(f"PyMuPDF OCR failed (Tesseract may not be installed): {ocr_err}")

        logger.info(f"Normalizing page {page_idx + 1}. Engine: {engine_used}, Scanned status: {is_scanned}, OCR Active: {ocr_active}, Rotation: {page_rotation}")

        words_by_block: Dict[int, List[WordBox]] = {}
        for w in raw_words:
            # Reconstruct color if available in character properties, otherwise None
            word_box = WordBox(
                text=w[4],
                x0=w[0],
                y0=w[1],
                x1=w[2],
                y1=w[3],
                font_name="Default",
                font_size=10.0,
                page=page_idx + 1,
                rotation=page_rotation
            )
            block_no = w[5]
            if block_no not in words_by_block:
                words_by_block[block_no] = []
            words_by_block[block_no].append(word_box)

        # Extract blocks: list of (x0, y0, x1, y1, "text", block_no, block_type)
        raw_blocks = page.get_text("blocks")
        
        content_blocks: List[Tuple[float, float, float, float, str, int, int]] = []
        headers: List[TextBlock] = []
        footers: List[TextBlock] = []
        watermarks: List[TextBlock] = []

        # First Pass: filter out headers, footers, watermarks
        for b in raw_blocks:
            x0, y0, x1, y1, text, block_no, block_type = b
            block_words = words_by_block.get(block_no, [])
            
            # Skip non-text blocks
            if block_type != 0:
                continue

            # Check Watermarks or Advertisements
            if self._is_watermark_or_ad(text):
                tb = TextBlock(text=text, words=block_words, bbox=(x0, y0, x1, y1), page=page_idx + 1, block_type="watermark")
                watermarks.append(tb)
                continue

            # Check Headers / Footers
            is_hf, hf_type = self._is_header_or_footer(y0, y1, page_height, text)
            if is_hf:
                tb = TextBlock(text=text, words=block_words, bbox=(x0, y0, x1, y1), page=page_idx + 1, block_type=hf_type)
                if hf_type == "header":
                    headers.append(tb)
                else:
                    footers.append(tb)
                continue

            # Split block starting with Ans\n to separate Ans metadata from Option 1
            ans_match = re.match(r"^(Ans\s*)\r?\n", text, re.I)
            if ans_match:
                ans_text = ans_match.group(0)
                rest_text = text[ans_match.end():]
                
                # Split Y coordinate (assume ~15pt height for "Ans")
                split_y = min(y1, y0 + 15.0)
                
                ans_words = [w for w in block_words if w.y1 <= split_y + 2.0]
                rest_words = [w for w in block_words if w.y1 > split_y + 2.0]
                
                # Register split wordboxes
                words_by_block[block_no] = ans_words
                new_block_no = 10000 + block_no
                words_by_block[new_block_no] = rest_words
                
                # Append two separate blocks
                content_blocks.append((x0, y0, x1, split_y, ans_text, block_no, block_type))
                content_blocks.append((x0, split_y, x1, y1, rest_text, new_block_no, block_type))
            else:
                content_blocks.append(b)

        # Second Pass: Column and Band Segmentation
        normalized_blocks: List[TextBlock] = []
        bands = self._detect_bands(content_blocks)
        layout_decisions: List[Dict[str, Any]] = []

        page_layout_type = "single_column"
        page_columns: List[Tuple[float, float, float, float]] = []

        for band_idx, band in enumerate(bands):
            left_col, right_col, gutter_pos = self._split_band_columns(band, page_width)
            
            if gutter_pos is not None:
                # Two-column layout band
                page_layout_type = "mixed" if len(bands) > 1 else "two_column"
                # Register column geometries
                page_columns.append((0.0, band[0][1], gutter_pos, band[-1][3]))
                page_columns.append((gutter_pos, band[0][1], page_width, band[-1][3]))

                # Sort columns left then right, top-to-bottom
                sorted_left = sorted(left_col, key=lambda item: item[1])
                sorted_right = sorted(right_col, key=lambda item: item[1])

                for item in sorted_left:
                    bbox = (item[0], item[1], item[2], item[3])
                    b_type = self._detect_block_type(bbox, tables)
                    tb = TextBlock(
                        text=item[4],
                        words=words_by_block.get(item[5], []),
                        bbox=bbox,
                        page=page_idx + 1,
                        block_type=b_type,
                        column=0
                    )
                    normalized_blocks.append(tb)

                for item in sorted_right:
                    bbox = (item[0], item[1], item[2], item[3])
                    b_type = self._detect_block_type(bbox, tables)
                    tb = TextBlock(
                        text=item[4],
                        words=words_by_block.get(item[5], []),
                        bbox=bbox,
                        page=page_idx + 1,
                        block_type=b_type,
                        column=1
                    )
                    normalized_blocks.append(tb)
                
                if debug:
                    layout_decisions.append({
                        "band": band_idx,
                        "type": "two_column",
                        "gutter": gutter_pos
                    })
            else:
                # Single column layout band
                sorted_single = sorted(band, key=lambda item: item[1])
                for item in sorted_single:
                    bbox = (item[0], item[1], item[2], item[3])
                    b_type = self._detect_block_type(bbox, tables)
                    tb = TextBlock(
                        text=item[4],
                        words=words_by_block.get(item[5], []),
                        bbox=bbox,
                        page=page_idx + 1,
                        block_type=b_type,
                        column=0
                    )
                    normalized_blocks.append(tb)
                
                if debug:
                    layout_decisions.append({
                        "band": band_idx,
                        "type": "single_column"
                    })

        # Compile final PageLayout metadata payload
        metadata = {
            "processing_time": time.time() - start_time,
            "is_scanned": is_scanned,
            "has_drawings": len(page.get_drawings()) > 0
        }
        if debug:
            metadata["layout_decisions"] = layout_decisions
            metadata["original_blocks_count"] = len(raw_blocks)

        logger.info(
            f"Finished normalizing page {page_idx + 1} in {metadata['processing_time']:.3f}s. "
            f"Blocks={len(normalized_blocks)}, Layout={page_layout_type}"
        )

        return PageLayout(
            page_number=page_idx + 1,
            width=page_width,
            height=page_height,
            rotation=page_rotation,
            layout_type=page_layout_type,
            columns=page_columns,
            blocks=normalized_blocks,
            headers=headers,
            footers=footers,
            watermarks=watermarks,
            metadata=metadata
        )

    def process_document(self, pdf_path: str, debug: bool = False) -> Generator[PageLayout, None, None]:
        """
        Strips and normalizes PDF layout page-by-page to keep low memory footprint.
        Yields PageLayout objects.
        """
        doc = None
        try:
            doc = fitz.open(pdf_path)
            if doc.is_encrypted:
                logger.error(f"Cannot parse layout: PDF is password-protected or encrypted: {pdf_path}")
                return
            
            limit = int(os.environ.get("PARSER_PAGE_LIMIT", "0"))
            pages_to_run = len(doc)
            if limit > 0:
                pages_to_run = min(pages_to_run, limit)

            for page_idx in range(pages_to_run):
                try:
                    yield self.normalize_page(doc, page_idx, debug=debug)
                except Exception as e:
                    # Log error on specific page and continue parsing subsequent pages safely
                    set_context(page_number=page_idx + 1)
                    log_exception(f"Failed to parse page layout on index {page_idx}", e)
                    clear_context()
        finally:
            if doc:
                doc.close()
