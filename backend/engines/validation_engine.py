"""
Validation Engine Module
=========================
Structured, pipeline-based validation engine for parsed questions.
Applies independent checks for text length, options count, answers,
geometry coordinates, and languages under strict, balanced, or lenient profiles.
"""

import time
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Generator, Any, Iterable

from config import ParserConfig
from models import ParsedQuestion, QuestionOption
from logger import get_logger

logger = get_logger("parser")

# Standardized Error Taxonomy
ERROR_TAXONOMY: Dict[str, str] = {
    "SHORT_QUESTION": "Question statement text is too short",
    "MISSING_OPTION": "Question options count is less than expected",
    "INVALID_GEOMETRY": "Bounding box coordinates are invalid or inverted",
    "DUPLICATE": "Question matches a duplicate shingle index",
    "NO_ANSWER": "Correct answer letter is missing or unresolved",
    "EMPTY_OPTION": "Option text is empty",
    "DUPLICATE_OPTION": "Option text matches another option text",
    "ORDER_MISMATCH": "Options are not ordered sequentially A->B->C->D",
    "OCR_LOW_CONFIDENCE": "OCR garbage ratio exceeds quality bounds",
    "HEADER_DETECTED": "Watermark or ad line was parsed into question statement",
    "UNKNOWN_LAYOUT": "Geometric column layout detection is ambiguous"
}


@dataclass(slots=True)
class ValidationResult:
    """
    Standardized validation results payload.
    """
    valid: bool
    status: str                   # "ok" | "needs_review" | "rejected"
    confidence: int
    errors: List[str]
    warnings: List[str]
    review_codes: List[str]
    validator_time_ms: float = 0.0
    duplicate_score: float = 0.0
    duplicate_id: str = ""
    parser_version: str = "V2.0.0"
    rule_metrics: Dict[str, float] = field(default_factory=dict)


class ValidationEngine:
    """
    Centralized Question Validation Pipeline.
    Supports configurable validation profiles: strict, balanced, and lenient.
    """
    def __init__(self, config: Optional[ParserConfig] = None, profile: str = "balanced") -> None:
        self.config = config or ParserConfig()
        self.profile = profile.lower()  # "strict" | "balanced" | "lenient"
        
        # Apply validation profile bounds overrides
        if self.profile == "strict":
            self.min_q_len = self.config.min_question_text_length * 2
            self.expected_options = self.config.expected_options_count
            self.allow_ocr_fallback = False
        elif self.profile == "lenient":
            self.min_q_len = max(5, self.config.min_question_text_length // 2)
            self.expected_options = 3  # Allow 3 options fallback
            self.allow_ocr_fallback = True
        else:
            self.min_q_len = self.config.min_question_text_length
            self.expected_options = self.config.expected_options_count
            self.allow_ocr_fallback = True

    def validate_text(self, text: str, errors: List[str], warnings: List[str], codes: List[str]) -> float:
        """
        Validates question text length, structure, and signatures.
        """
        start = time.time()
        stripped = text.strip()
        
        if len(stripped) < self.min_q_len:
            errors.append(ERROR_TAXONOMY["SHORT_QUESTION"])
            codes.append("SHORT_QUESTION")

        # Check if text repeats itself or contains only numbers/punctuation
        if stripped.isdigit():
            errors.append("Question text contains only numeric digits.")
            codes.append("SHORT_QUESTION")
        if not re.search(r"[a-zA-Z\u0c00-\u0c7f]", stripped):
            errors.append("Question lacks alphanumeric character sets.")
            codes.append("SHORT_QUESTION")

        return (time.time() - start) * 1000.0

    def validate_options(self, options: List[QuestionOption], errors: List[str], warnings: List[str], codes: List[str]) -> float:
        """
        Validates option count, unique IDs, orderings, and blank texts.
        """
        start = time.time()
        if len(options) < self.expected_options:
            errors.append(ERROR_TAXONOMY["MISSING_OPTION"])
            codes.append("MISSING_OPTION")

        opt_ids = [opt.id for opt in options]
        if len(opt_ids) != len(set(opt_ids)):
            errors.append("Duplicate option IDs found.")
            codes.append("DUPLICATE_OPTION")

        seen_texts: Set[str] = set()
        for opt in options:
            opt_text = opt.text.strip()
            if not opt_text:
                errors.append(ERROR_TAXONOMY["EMPTY_OPTION"])
                codes.append("EMPTY_OPTION")
            if opt_text in seen_texts and opt_text != "[Refer to PDF]":
                warnings.append(f"Option ID {opt.id} has duplicate option text.")
                codes.append("DUPLICATE_OPTION")
            seen_texts.add(opt_text)

        # Verify ordering A -> B -> C -> D if letters
        letter_opts = [o.id for o in options if o.id.isalpha()]
        if len(letter_opts) >= 2:
            sorted_letters = sorted(letter_opts)
            if letter_opts != sorted_letters:
                warnings.append(ERROR_TAXONOMY["ORDER_MISMATCH"])
                codes.append("ORDER_MISMATCH")

        return (time.time() - start) * 1000.0

    def validate_answer(self, answer: str, options: List[QuestionOption], errors: List[str], warnings: List[str], codes: List[str]) -> float:
        """
        Validates correct answer mappings.
        """
        start = time.time()
        if not answer:
            errors.append(ERROR_TAXONOMY["NO_ANSWER"])
            codes.append("NO_ANSWER")
            return (time.time() - start) * 1000.0

        opt_ids = [opt.id for opt in options]
        if answer not in opt_ids:
            errors.append(f"Correct answer '{answer}' does not match any available option ID.")
            codes.append("NO_ANSWER")

        return (time.time() - start) * 1000.0

    def validate_geometry(self, q_bbox: Optional[Tuple[float, float, float, float]], errors: List[str], warnings: List[str], codes: List[str]) -> float:
        """
        Validates question bounding box coordinate integrity.
        """
        start = time.time()
        if q_bbox is not None:
            x0, y0, x1, y1 = q_bbox
            if x0 < 0 or y0 < 0 or x1 < 0 or y1 < 0:
                warnings.append(ERROR_TAXONOMY["INVALID_GEOMETRY"])
                codes.append("INVALID_GEOMETRY")
            if x1 <= x0 or y1 <= y0:
                errors.append("Inverted bounding box dimensions detected.")
                codes.append("INVALID_GEOMETRY")
        return (time.time() - start) * 1000.0

    def calculate_confidence(self, errors: List[str], warnings: List[str], codes: List[str]) -> int:
        """
        Calculates confidence score applying configurable penalties.
        """
        score = self.config.base_confidence_score

        # Map stable error code penalties
        for code in codes:
            if code == "NO_ANSWER":
                score -= self.config.penalty_missing_answer_key
            elif code == "MISSING_OPTION":
                score -= self.config.penalty_option_count_mismatch
            elif code == "SHORT_QUESTION":
                score -= self.config.penalty_question_text_too_short
            elif code == "DUPLICATE":
                score -= self.config.penalty_detected_duplicate
            elif code == "EMPTY_OPTION":
                score -= self.config.penalty_empty_option_text
            else:
                score -= 5  # Standard default warning penalty

        return max(50, min(100, score))

    def _clean_unicode_errors(self, text: str) -> str:
        if not text:
            return ""
        # Remove raw non-printable character artifacts
        cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
        # Normalize NFKC unicode
        import unicodedata
        cleaned = unicodedata.normalize("NFKC", cleaned)
        # Replace replacement character \ufffd with space
        cleaned = cleaned.replace("\ufffd", " ")
        return " ".join(cleaned.split())

    def _recover_conjoined_options(self, question: ParsedQuestion) -> None:
        """
        Attempts to find and split options that were merged into a single option block.
        """
        pattern = re.compile(r"\b([B-Eb-e1-5])\s*[-.)]\s+(.+)$|\b[\(\[]([B-Eb-e1-5])[\)\]]\s*(.+)$")
        digit_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
        
        original_options = list(question.options)
        modified = False
        new_options = []
        
        for opt in original_options:
            match = pattern.search(opt.text)
            if match:
                marker = (match.group(1) or match.group(3)).upper()
                marker = digit_to_letter.get(marker, marker)
                existing_ids = [o.id for o in original_options]
                if marker not in existing_ids:
                    split_idx = match.start()
                    opt_self_text = opt.text[:split_idx].strip(" \n\t-:")
                    opt_new_text = (match.group(2) or match.group(4)).strip(" \n\t-:")
                    
                    opt.text = opt_self_text
                    new_options.append(opt)
                    
                    new_options.append(QuestionOption(
                        id=marker,
                        text=opt_new_text,
                        metadata={"recovered": True, "split_from": opt.id}
                    ))
                    modified = True
                    logger.info(f"Validation Recovery: Split conjoined option {opt.id} and created {marker}.")
                else:
                    new_options.append(opt)
            else:
                new_options.append(opt)
                
        if modified:
            question.options = sorted(new_options, key=lambda o: o.id)

    def validate_question(self, question: ParsedQuestion) -> ValidationResult:
        """
        Executes the validation pipeline on a single ParsedQuestion.
        Safely catches exceptions, returning ValidationResult with failed status.
        """
        start_time = time.time()
        errors: List[str] = []
        warnings: List[str] = []
        review_codes: List[str] = []
        rule_metrics: Dict[str, float] = {}

        # Apply recovery heuristics first
        try:
            question.question = self._clean_unicode_errors(question.question)
            for opt in question.options:
                opt.text = self._clean_unicode_errors(opt.text)
            
            if len(question.options) < self.expected_options:
                self._recover_conjoined_options(question)
        except Exception as recovery_err:
            logger.warning(f"Validation recovery pipeline failed: {recovery_err}")

        try:
            # 1. Text checks
            t_ms = self.validate_text(question.question, errors, warnings, review_codes)
            rule_metrics["text_validation_ms"] = t_ms

            # 2. Options checks
            o_ms = self.validate_options(question.options, errors, warnings, review_codes)
            rule_metrics["options_validation_ms"] = o_ms

            # 3. Answer checks
            a_ms = self.validate_answer(question.answer, question.options, errors, warnings, review_codes)
            rule_metrics["answer_validation_ms"] = a_ms

            # 4. Geometry checks
            g_ms = self.validate_geometry(question.question_bbox, errors, warnings, review_codes)
            rule_metrics["geometry_validation_ms"] = g_ms

            # 5. Retrieve duplicate status if mapped
            if question.status == "duplicate":
                errors.append(ERROR_TAXONOMY["DUPLICATE"])
                review_codes.append("DUPLICATE")

        except Exception as e:
            # Error Recovery: Never throw or block parsing; catch and return review result
            logger.error(f"Validation pipeline crashed on Q.{question.question_number}: {e}")
            errors.append(f"Validation Engine Exception: {e}")
            review_codes.append("UNKNOWN_LAYOUT")

        # Calculate confidence
        confidence = self.calculate_confidence(errors, warnings, review_codes)

        # Resolve status rules
        if len(errors) > 0 or confidence < 75:
            status = "needs_review"
            if confidence < 60 or self.profile == "strict":
                status = "rejected"
        else:
            status = "ok"

        valid = (status == "ok")
        total_time_ms = (time.time() - start_time) * 1000.0

        return ValidationResult(
            valid=valid,
            status=status,
            confidence=confidence,
            errors=errors,
            warnings=warnings,
            review_codes=review_codes,
            validator_time_ms=total_time_ms,
            duplicate_score=0.0,
            duplicate_id="",
            rule_metrics=rule_metrics
        )

    def validate_stream(self, questions: Iterable[ParsedQuestion]) -> Generator[Tuple[ParsedQuestion, ValidationResult], None, None]:
        """
        Streams questions page-by-page, returning validated tuple.
        """
        for q in questions:
            res = self.validate_question(q)
            yield q, res

    def validate_many(self, questions: List[ParsedQuestion]) -> List[Tuple[ParsedQuestion, ValidationResult]]:
        """
        Validates a list of questions sequentially.
        """
        return list(self.validate_stream(questions))
