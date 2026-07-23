"""
Answer Mapper Engine Module
===========================
Centralized correct answer mapping engine.
Implements color-highlight overlays via pdfplumber character coordinate checks,
inline regex extracts, and remote solutions key matching with priority sorting.
"""

import re
import threading
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Any
import pdfplumber

from config import ParserConfig
from models import QuestionOption
from patterns import EMBEDDED_ANSWER_RE, CHOSEN_OPTION_RE, SOLUTION_ITEM_RE
from logger import get_logger

logger = get_logger("parser")


@dataclass(slots=True)
class MappedAnswer:
    """
    Standardized resolved answer metadata record.
    """
    question_number: int
    answer: str
    page: int
    source: str
    confidence: float
    mapping_method: str  # "visual" | "candidate_metadata" | "inline" | "answer_key" | "explanation"


class AnswerMapper:
    """
    Unified Correct Answer Resolver.
    Caches page characters to avoid repeated PDF loading overhead.
    """
    _char_cache: Dict[str, Dict[int, List[Dict[str, Any]]]] = {}
    _cache_lock = threading.Lock()

    def __init__(self, config: Optional[ParserConfig] = None) -> None:
        self.config = config or ParserConfig()

    def _get_page_chars(self, pdf_path: str, page_idx: int) -> List[Dict[str, Any]]:
        """
        Thread-safe getter reading from singleton page character cache.
        Loads page from pdfplumber on cache miss.
        """
        if not pdf_path:
            return []

        with self._cache_lock:
            if pdf_path not in self._char_cache:
                self._char_cache[pdf_path] = {}

            if page_idx not in self._char_cache[pdf_path]:
                try:
                    with pdfplumber.open(pdf_path) as pdf:
                        if page_idx < len(pdf.pages):
                            page = pdf.pages[page_idx]
                            # Load and cache char properties
                            self._char_cache[pdf_path][page_idx] = page.chars
                        else:
                            self._char_cache[pdf_path][page_idx] = []
                except Exception as e:
                    logger.warning(f"Failed to extract page characters for answer color mapping: {e}")
                    self._char_cache[pdf_path][page_idx] = []

            return self._char_cache[pdf_path][page_idx]

    def clear_cache(self) -> None:
        with self._cache_lock:
            self._char_cache.clear()
            logger.info("Answer mapper character cache cleared.")

    def map_answer(
        self, 
        pdf_path: str, 
        q_num: int, 
        q_top: float, 
        q_bottom: float, 
        page: int, 
        text_content: str,
        options: List[QuestionOption]
    ) -> Optional[MappedAnswer]:
        """
        Runs the answer resolution pipeline following strict priority rules.
        """
        # 1. VISUAL COLOR MAPPING (Priority 1)
        visual_ans = self._map_visual_color(pdf_path, q_top, q_bottom, page, options)
        if visual_ans:
            return MappedAnswer(
                question_number=q_num,
                answer=visual_ans,
                page=page,
                source=pdf_path,
                confidence=100.0,
                mapping_method="visual"
            )

        # 1.5. BOLD OPTION MAPPING (Priority 1.5)
        bold_ans = self._map_bold_text(pdf_path, q_top, q_bottom, page, options)
        if bold_ans:
            return MappedAnswer(
                question_number=q_num,
                answer=bold_ans,
                page=page,
                source=pdf_path,
                confidence=98.0,
                mapping_method="bold"
            )

        # 2. CANDIDATE METADATA CHECK (Priority 2)
        metadata_ans = self._map_candidate_metadata(text_content, options)
        if metadata_ans:
            return MappedAnswer(
                question_number=q_num,
                answer=metadata_ans,
                page=page,
                source=pdf_path,
                confidence=95.0,
                mapping_method="candidate_metadata"
            )

        # 3. INLINE ANSWER MARKER CHECK (Priority 3)
        inline_ans = self._map_inline_answer(text_content)
        if inline_ans:
            return MappedAnswer(
                question_number=q_num,
                answer=inline_ans,
                page=page,
                source=pdf_path,
                confidence=90.0,
                mapping_method="inline"
            )

        # 4. EXPLANATION BLOCK CHECK (Priority 4)
        expl_ans = self._map_explanation_block(text_content)
        if expl_ans:
            return MappedAnswer(
                question_number=q_num,
                answer=expl_ans,
                page=page,
                source=pdf_path,
                confidence=80.0,
                mapping_method="explanation"
            )

        return None

    def _map_bold_text(self, pdf_path: str, q_top: float, q_bottom: float, page: int, options: List[QuestionOption]) -> Optional[str]:
        """
        Inspects PDF character fonts to locate bold option text or bold option markers.
        If exactly one option is bolded, maps it as the correct answer.
        """
        if not pdf_path or not options:
            return None

        page_idx = page - 1
        chars = self._get_page_chars(pdf_path, page_idx)
        if not chars:
            return None

        # Filter characters within this question's coordinates
        q_chars = [c for c in chars if q_top - 5 <= c["top"] <= q_bottom + 5]
        if not q_chars:
            return None

        # Check font of option markers or option texts
        bold_options = []
        for opt in options:
            opt_text = opt.text.strip()
            if not opt_text:
                continue
            clean_opt = "".join(opt_text.split()).lower()
            n = len(clean_opt)
            
            # Find char range matching this option text
            opt_chars = []
            for idx in range(len(q_chars) - n + 1):
                sub_chars = q_chars[idx:idx + n]
                sub_str = "".join(c["text"] for c in sub_chars).replace(" ", "").lower()
                if sub_str == clean_opt:
                    opt_chars = sub_chars
                    break
                    
            if opt_chars:
                bold_count = sum(1 for c in opt_chars if "bold" in str(c.get("fontname", "")).lower())
                if len(opt_chars) > 0 and (bold_count / len(opt_chars)) > 0.8:
                    bold_options.append(opt.id)

        if len(bold_options) == 1:
            logger.info(f"Answer Mapper: Mapped correct answer '{bold_options[0]}' via bold option text.")
            return bold_options[0]

        return None

    def _map_visual_color(self, pdf_path: str, q_top: float, q_bottom: float, page: int, options: Optional[List[QuestionOption]] = None) -> Optional[str]:
        """
        Inspects PDF character colors to locate green highlights (visual answers).
        Calibrates coordinates offset dynamically using option text matching.
        """
        if not pdf_path:
            return None

        page_idx = page - 1
        chars = self._get_page_chars(pdf_path, page_idx)
        if not chars:
            return None

        # Compute coordinate translation offset dynamically
        y_shift = 0.0
        if options:
            found_shift = False
            for opt in options:
                opt_text = opt.text.strip()
                if not opt_text or len(opt_text) < 2:
                    continue
                clean_opt = "".join(opt_text.split()).lower()
                n = len(clean_opt)
                for idx in range(len(chars) - n + 1):
                    sub_chars = chars[idx:idx + n]
                    sub_str = "".join(c["text"] for c in sub_chars).replace(" ", "").lower()
                    if sub_str == clean_opt:
                        if opt.bbox:
                            y_shift = sub_chars[0]["top"] - opt.bbox[1]
                            found_shift = True
                            logger.debug(f"Answer Mapper: Calibrated coordinates offset. y_shift={y_shift:.2f}")
                            break
                if found_shift:
                    break

        shifted_top = q_top + y_shift
        shifted_bottom = q_bottom + y_shift

        # Filter characters matching green color highlight
        for c in chars:
            color = c.get("non_stroking_color")
            if color and len(color) == 3:
                r, g, b = color
                # Green highlight thresholds (r < 0.4, g > 0.6, b < 0.4)
                if g > 0.6 and r < 0.4 and b < 0.4:
                    char_text = c["text"].upper()
                    
                    resolved_letter = None
                    if char_text in self.config.allowed_answer_letters:
                        resolved_letter = char_text
                    elif char_text in ["1", "2", "3", "4", "5"]:
                        mapping = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
                        resolved_letter = mapping[char_text]

                    if resolved_letter:
                        # Check vertical coordinate alignment: 5px offset padding
                        if shifted_top - 5 <= c["top"] <= shifted_bottom + 5:
                            logger.info(f"Answer Mapper: Mapped correct answer letter '{resolved_letter}' visually via color highlights.")
                            return resolved_letter
        return None

    def _map_candidate_metadata(self, text: str, options: List[QuestionOption]) -> Optional[str]:
        """
        Checks Chosen Option metadata (candidate response format) and aligns option ID.
        """
        chosen_match = CHOSEN_OPTION_RE.search(text)
        if chosen_match:
            chosen_opt_str = chosen_match.group(1)
            # Find the option item matching this index
            for idx, opt in enumerate(options):
                # Check if option ID or index matching the chosen option digit (e.g. index 1-4)
                if opt.id == chosen_opt_str or str(idx + 1) == chosen_opt_str:
                    logger.info(f"Answer Mapper: Mapped chosen option '{opt.id}' via candidate metadata.")
                    return opt.id
        return None

    def _map_inline_answer(self, text: str) -> Optional[str]:
        """
        Checks inline strings for embedded answers (e.g. "Answer: C").
        """
        ans_match = EMBEDDED_ANSWER_RE.search(text)
        if ans_match:
            ans_val = ans_match.group(1) or ans_match.group(2)
            if ans_val:
                ans_letter = ans_val.upper()
                if ans_letter in self.config.allowed_answer_letters:
                    logger.info(f"Answer Mapper: Mapped correct answer '{ans_letter}' via inline text checks.")
                    return ans_letter
        return None

    def _map_explanation_block(self, text: str) -> Optional[str]:
        """
        Checks explanation text bodies for correct option indicators.
        """
        lower_text = text.lower()
        if "explanation" in lower_text or "solution" in lower_text or "ans" in lower_text:
            ans_match = EMBEDDED_ANSWER_RE.search(text)
            if ans_match:
                ans_val = ans_match.group(1) or ans_match.group(2)
                if ans_val:
                    ans_letter = ans_val.upper()
                    if ans_letter in self.config.allowed_answer_letters:
                        logger.info(f"Answer Mapper: Mapped correct answer '{ans_letter}' via explanation blocks.")
                        return ans_letter
        return None
