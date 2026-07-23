"""
Confidence Scorer Engine Module
===============================
Calculates deterministic confidence scores based on validation and duplicate results.
Implements clamp limits, penalty profiles (strict, balanced, lenient), and FSM ingestion status.
"""

import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Generator, Any, Iterable

from config import ParserConfig
from models import ParsedQuestion
from engines.validation_engine import ValidationResult
from engines.duplicate_detector import DuplicateResult
from logger import get_logger

logger = get_logger("parser")


@dataclass(slots=True)
class PenaltyRule:
    """
    Metadata representation of a scoring penalty rule.
    """
    code: str
    description: str
    penalty: int
    enabled: bool = True


@dataclass(slots=True)
class ConfidenceResult:
    """
    Detailed output of the scoring pipeline execution.
    """
    score: int
    status: str                  # "ok" | "needs_review" | "rejected"
    accepted: bool
    penalties: List[str]
    warnings: List[str]
    review_codes: List[str]
    calculation_time_ms: float
    parser_version: str = "V2.0.0"


class ConfidenceScorer:
    """
    Centralized Confidence Scoring Pipeline.
    Resolves final status based on weighted penalty accumulation.
    """
    def __init__(self, config: Optional[ParserConfig] = None, profile: str = "balanced") -> None:
        self.config = config or ParserConfig()
        self.profile = profile.upper()  # "STRICT" | "BALANCED" | "LENIENT"
        
        # Load penalty rules registry
        self.rules: Dict[str, PenaltyRule] = {
            "NO_ANSWER": PenaltyRule("NO_ANSWER", "Missing Answer", 15),
            "MISSING_OPTION": PenaltyRule("MISSING_OPTION", "Option Count Mismatch", 20),
            "EMPTY_OPTION": PenaltyRule("EMPTY_OPTION", "Empty Option", 15),
            "SHORT_QUESTION": PenaltyRule("SHORT_QUESTION", "Question Too Short", 25),
            "DUPLICATE": PenaltyRule("DUPLICATE", "Duplicate", 10),
            "INVALID_GEOMETRY": PenaltyRule("INVALID_GEOMETRY", "Geometry Warning", 5),
            "LANGUAGE_WARNING": PenaltyRule("LANGUAGE_WARNING", "Language Warning", 5),
            "OCR_USED": PenaltyRule("OCR_USED", "OCR Used", 5),
            "UNKNOWN_PUBLISHER": PenaltyRule("UNKNOWN_PUBLISHER", "Unknown Publisher", 5),
            "TABLE_WARNING": PenaltyRule("TABLE_WARNING", "Table Parsing Warning", 5)
        }

        # Apply profile multipliers
        if self.profile == "STRICT":
            for rule in self.rules.values():
                rule.penalty = min(50, rule.penalty * 2)
        elif self.profile == "LENIENT":
            for rule in self.rules.values():
                rule.penalty = max(1, rule.penalty // 2)

    def apply_penalty(self, score: int, rule_code: str, applied_penalties: List[str]) -> int:
        """
        Deducts penalty score if the rule code is active.
        """
        rule = self.rules.get(rule_code)
        if rule and rule.enabled:
            score -= rule.penalty
            applied_penalties.append(f"{rule.description} (-{rule.penalty})")
        return score

    def resolve_status(self, score: int) -> Tuple[str, bool]:
        """
        Resolves FSM ingestion status based on confidence score bands.
        """
        if score >= 97:
            return "ok", True
        elif score >= 60:
            return "needs_review", False
        else:
            return "rejected", False

    def score(
        self, 
        question: ParsedQuestion, 
        val_res: ValidationResult, 
        dup_res: DuplicateResult
    ) -> ConfidenceResult:
        """
        Calculates confidence score and status for a single ParsedQuestion.
        Safely recovers from internal exceptions.
        """
        start_time = time.time()
        score = 100
        applied_penalties: List[str] = []
        warnings = list(val_res.warnings)
        review_codes = list(val_res.review_codes)

        try:
            # 1. Apply validation rules penalties
            for code in val_res.review_codes:
                score = self.apply_penalty(score, code, applied_penalties)

            # 2. Apply duplicate match penalties
            if dup_res.is_duplicate:
                score = self.apply_penalty(score, "DUPLICATE", applied_penalties)
                review_codes.append("DUPLICATE")

            # 3. OCR and publisher metadata check penalties
            if "ocr" in question.parser_used.lower():
                score = self.apply_penalty(score, "OCR_USED", applied_penalties)
            # Generic unknown publisher does not receive any penalty under balanced mode
            pass

            # Clamp score between 0 and 100
            score = max(0, min(100, score))

        except Exception as e:
            logger.error(f"Scoring pipeline crashed on question ID {question.question_id}: {e}")
            score = 50
            applied_penalties.append(f"Scoring Engine Error: {e} (-50)")

        status, accepted = self.resolve_status(score)
        total_time_ms = (time.time() - start_time) * 1000.0

        logger.info(
            f"Confidence Score resolved: Q.{question.question_number} score={score} "
            f"status='{status}' (Penalties: {len(applied_penalties)})"
        )

        return ConfidenceResult(
            score=score,
            status=status,
            accepted=accepted,
            penalties=applied_penalties,
            warnings=warnings,
            review_codes=review_codes,
            calculation_time_ms=total_time_ms
        )

    def score_stream(
        self, 
        stream: Iterable[Tuple[ParsedQuestion, ValidationResult, DuplicateResult]]
    ) -> Generator[Tuple[ParsedQuestion, ConfidenceResult], None, None]:
        """
        Streams questions page-by-page, returning scoring results.
        """
        for q, val, dup in stream:
            yield q, self.score(q, val, dup)

    def score_many(
        self, 
        questions: List[Tuple[ParsedQuestion, ValidationResult, DuplicateResult]]
    ) -> List[Tuple[ParsedQuestion, ConfidenceResult]]:
        """
        Calculates scores for a list of questions sequentially.
        """
        return list(self.score_stream(questions))
