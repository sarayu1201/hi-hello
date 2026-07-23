"""
Publisher Detector Module
==========================
Weighted, multi-signal classification engine that detects the document's publisher profile
or template. Prevents classification errors by analyzing metadata, headers, watermarks,
section structures, and instruction lists.
"""

import time
from typing import Dict, List, Optional, Tuple, Any
import fitz  # PyMuPDF

from config import ParserConfig
from patterns import (
    ADDA247_SIGNATURE_RE, CRACKU_SIGNATURE_RE, TSPSC_SIGNATURE_RE, APPSC_SIGNATURE_RE
)
from logger import get_logger, set_context, clear_context

logger = get_logger("parser")


class PublisherDetector:
    """
    Weighted scoring classifier to identify the publisher or exam catalog of a PDF.
    Does not read the entire PDF; samples pages in a low memory footprint.
    """
    def __init__(self, config: Optional[ParserConfig] = None) -> None:
        self.config = config or ParserConfig()
        self.min_confidence_threshold = 50.0  # Configurable threshold

    def _sample_pages(self, doc: fitz.Document) -> List[str]:
        """
        Samples specific pages (First, Second, Middle, Last) to read target texts.
        """
        num_pages = len(doc)
        if num_pages == 0:
            return []

        pages_to_sample = {0}  # Always sample first page
        if num_pages > 1:
            pages_to_sample.add(1)  # Second page
        if num_pages > 2:
            pages_to_sample.add(num_pages // 2)  # Middle page
        if num_pages > 3:
            pages_to_sample.add(num_pages - 1)  # Last page

        sampled_texts: List[str] = []
        for idx in sorted(pages_to_sample):
            try:
                page = doc.load_page(idx)
                sampled_texts.append(page.get_text() or "")
            except Exception as e:
                logger.warning(f"Failed to load sample page {idx + 1}: {e}")
        return sampled_texts

    def detect(self, pdf_path: str) -> Dict[str, Any]:
        """
        Runs the weighted classification pipeline.
        Returns:
            {
                "publisher": str,
                "confidence": float,
                "matched_signals": List[str],
                "reason": str
            }
        """
        start_time = time.time()
        doc = None
        try:
            doc = fitz.open(pdf_path)
            metadata = doc.metadata or {}
            
            # 1. Sample document texts
            samples = self._sample_pages(doc)
            full_sample_text = "\n".join(samples).lower()

            # Initialize scores for all target publishers
            scores: Dict[str, float] = {
                "ADDA247": 0.0,
                "CRACKU": 0.0,
                "RRB": 0.0,
                "SSC": 0.0,
                "SBI_PO": 0.0,
                "IBPS_PO": 0.0,
                "APPSC": 0.0,
                "TSPSC": 0.0
            }
            matched_signals: Dict[str, List[str]] = {k: [] for k in scores.keys()}

            # 2. Score Metadata Signatures
            meta_author = str(metadata.get("author", "")).lower()
            meta_producer = str(metadata.get("producer", "")).lower()
            meta_creator = str(metadata.get("creator", "")).lower()

            # Adda247 Metadata Check
            if any(k in meta_author or k in meta_producer or k in meta_creator for k in ["adda247", "bankersadda", "careerpower"]):
                scores["ADDA247"] += 30.0
                matched_signals["ADDA247"].append("metadata_signature_match")
            
            # Cracku Metadata Check
            if "cracku" in meta_author or "cracku" in meta_producer or "cracku" in meta_creator:
                scores["CRACKU"] += 30.0
                matched_signals["CRACKU"].append("metadata_signature_match")

            # 3. Score Content Text Signatures
            # Adda247 Headers / Watermarks
            if ADDA247_SIGNATURE_RE.search(full_sample_text):
                scores["ADDA247"] += 40.0
                matched_signals["ADDA247"].append("adda247_regex_signature_hit")
            if "test prime" in full_sample_text or "bankersadda.com" in full_sample_text:
                scores["ADDA247"] += 30.0
                matched_signals["ADDA247"].append("adda247_phrase_signature_hit")

            # Cracku Headers / Watermarks
            if CRACKU_SIGNATURE_RE.search(full_sample_text):
                scores["CRACKU"] += 40.0
                matched_signals["CRACKU"].append("cracku_regex_signature_hit")
            if "downloaded from cracku.in" in full_sample_text or "ssc chsl mocks" in full_sample_text:
                scores["CRACKU"] += 30.0
                matched_signals["CRACKU"].append("cracku_phrase_signature_hit")

            # Official RRB Candidate Sheets
            if "railway recruitment boards" in full_sample_text or "रेल भर्ती बोर्ड" in full_sample_text:
                scores["RRB"] += 45.0
                matched_signals["RRB"].append("rrb_official_header_match")
            if "chosen option" in full_sample_text or "options shown in green color" in full_sample_text:
                scores["RRB"] += 45.0
                matched_signals["RRB"].append("rrb_candidate_metadata_format")
            if "rrb ntpc" in full_sample_text or "cbt i" in full_sample_text:
                scores["RRB"] += 20.0
                matched_signals["RRB"].append("rrb_exam_keyword")

            # Official SSC
            if "staff selection commission" in full_sample_text or "कर्मचारी चयन आयोग" in full_sample_text:
                scores["SSC"] += 40.0
                matched_signals["SSC"].append("ssc_official_header_match")
            if any(k in full_sample_text for k in ["combined graduate level", "ssc cgl", "cgle", "chsl", "multi tasking"]):
                scores["SSC"] += 40.0
                matched_signals["SSC"].append("ssc_exam_keyword")
            if "chosen option" in full_sample_text or "options shown in green color" in full_sample_text:
                scores["SSC"] += 30.0
                matched_signals["SSC"].append("ssc_candidate_metadata_format")

            # SBI PO pre mock papers
            if "sbi po" in full_sample_text or "state bank of india" in full_sample_text:
                scores["SBI_PO"] += 50.0
                matched_signals["SBI_PO"].append("sbi_po_keyword_match")
            if "sbi po pre" in full_sample_text:
                scores["SBI_PO"] += 30.0
                matched_signals["SBI_PO"].append("sbi_po_exact_exam_hit")

            # IBPS PO pre mock papers
            if "ibps po" in full_sample_text or "institute of banking personnel" in full_sample_text:
                scores["IBPS_PO"] += 50.0
                matched_signals["IBPS_PO"].append("ibps_po_keyword_match")
            if "ibps po pre" in full_sample_text:
                scores["IBPS_PO"] += 30.0
                matched_signals["IBPS_PO"].append("ibps_po_exact_exam_hit")

            # APPSC State Exams
            if "appsc" in full_sample_text or APPSC_SIGNATURE_RE.search(full_sample_text):
                scores["APPSC"] += 50.0
                matched_signals["APPSC"].append("appsc_regex_signature_hit")
            if "andhra pradesh public service" in full_sample_text:
                scores["APPSC"] += 30.0
                matched_signals["APPSC"].append("appsc_commission_name_hit")

            # TSPSC State Exams
            if "tspsc" in full_sample_text or TSPSC_SIGNATURE_RE.search(full_sample_text):
                scores["TSPSC"] += 50.0
                matched_signals["TSPSC"].append("tspsc_regex_signature_hit")
            if "telangana state public service" in full_sample_text or "telangana movement" in full_sample_text:
                scores["TSPSC"] += 30.0
                matched_signals["TSPSC"].append("tspsc_commission_name_hit")

            # 4. Resolve Winner
            highest_pub = "GENERIC"
            highest_score = 0.0
            
            for pub, score in scores.items():
                if score > highest_score:
                    highest_score = score
                    highest_pub = pub

            # Cap confidence at 100%
            confidence = min(highest_score, 100.0)

            # 5. Enforce Safe Guess Confidence Gate
            final_pub = highest_pub
            if confidence < self.min_confidence_threshold:
                final_pub = "GENERIC"
                reason = f"Detection confidence {confidence:.1f}% is below config threshold {self.min_confidence_threshold}%"
                logger.info(f"Fallback to GENERIC: {reason}")
            else:
                reason = f"Highest matching scores: {highest_pub} ({confidence:.1f}%)"

            processing_time = time.time() - start_time
            logger.info(
                f"Publisher classification complete in {processing_time:.3f}s. "
                f"Detected: {final_pub} (Confidence={confidence:.1f}%)"
            )

            return {
                "publisher": final_pub,
                "confidence": confidence,
                "matched_signals": matched_signals.get(highest_pub, []) if final_pub != "GENERIC" else [],
                "reason": reason,
                "processing_time": processing_time
            }

        except Exception as e:
            # Revert to GENERIC fallback instead of throwing error/crashing
            processing_time = time.time() - start_time
            logger.error(f"Publisher detection failed: {e}. Falling back to GENERIC.")
            return {
                "publisher": "GENERIC",
                "confidence": 0.0,
                "matched_signals": [],
                "reason": f"Detector crashed with exception: {e}",
                "processing_time": processing_time
            }
        finally:
            if doc:
                doc.close()
