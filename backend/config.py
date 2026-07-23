"""
Parser Engine Configuration Module
===================================
Defines the centralized configuration dataclass containing all geometry thresholds,
tolerances, duplicate indexes, logging formats, and scoring weight penalties.
Supports environment variable overrides and strict boundary validation.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, List, Set

@dataclass(frozen=True)
class ParserConfig:
    """
    Centralized configuration class containing all thresholds and variables.
    Grouped by system boundaries and operational parameters.
    """
    # -------------------------------------------------------------------------
    # 1. LAYOUT GEOMETRY & BAND SEGMENTATION
    # -------------------------------------------------------------------------
    gutter_min_width_ratio: float = 0.03   # Gutter size relative to page width (e.g., 3%)
    header_margin_ratio: float = 0.05       # Height fraction from top to ignore (header)
    footer_margin_ratio: float = 0.05       # Height fraction from bottom to ignore (footer)
    line_grouping_tolerance: float = 3.0    # Vertical distance tolerance (in points) for lines
    
    # -------------------------------------------------------------------------
    # 2. PUBLISHER DETECTION
    # -------------------------------------------------------------------------
    publisher_sample_max_pages: int = 2     # Max pages to scan to identify publisher signatures
    publisher_sample_max_lines: int = 60    # Max lines to read from docx for publisher signature
    
    # -------------------------------------------------------------------------
    # 3. OPTION DETECTION & ALIGNMENT
    # -------------------------------------------------------------------------
    option_y_alignment_delta: float = 4.0   # Max Y offset difference to count options as horizontal
    max_vertical_option_spacing: float = 80.0 # Max vertical spacing between options in a block
    expected_options_count: int = 4         # Default expected options count per question
    
    # -------------------------------------------------------------------------
    # 4. VALIDATION PARAMETERS
    # -------------------------------------------------------------------------
    min_question_text_length: int = 10      # Minimum characters in a valid question statement
    min_option_text_length: int = 1         # Minimum characters for a single option
    
    # -------------------------------------------------------------------------
    # 5. DUPLICATE DETECTION
    # -------------------------------------------------------------------------
    jaccard_similarity_threshold: float = 0.95  # Text similarity index threshold to identify duplicates
    shingle_length: int = 3                 # Length of character shingles for Jaccard matching
    
    # -------------------------------------------------------------------------
    # 6. LOGGING & BENCHMARKING
    # -------------------------------------------------------------------------
    log_format: str = '{"time": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "message": "%(message)s"}'
    benchmark_report_filename: str = "benchmark_report.html"
    
    # -------------------------------------------------------------------------
    # 7. DETERMINISTIC CONFIDENCE SCORER WEIGHTS & PENALTIES
    # -------------------------------------------------------------------------
    base_confidence_score: int = 100
    penalty_missing_section: int = 10
    penalty_option_count_mismatch: int = 20
    penalty_empty_option_text: int = 15
    penalty_suspicious_short_option: int = 15
    penalty_question_text_too_short: int = 25
    penalty_missing_answer_key: int = 15
    penalty_detected_duplicate: int = 10
    
    # Allowed correct answer mappings
    allowed_answer_letters: Set[str] = field(
        default_factory=lambda: {"A", "B", "C", "D", "E"}
    )

    def __post_init__(self) -> None:
        """
        Validate configuration ranges to prevent runtime division or coordinate bugs.
        Raises ValueError if thresholds are outside physical or mathematical bounds.
        """
        # Validate layout ratios
        if not (0.0 <= self.gutter_min_width_ratio <= 0.5):
            raise ValueError(f"gutter_min_width_ratio must be between 0.0 and 0.5, got {self.gutter_min_width_ratio}")
        if not (0.0 <= self.header_margin_ratio <= 0.25):
            raise ValueError(f"header_margin_ratio must be between 0.0 and 0.25, got {self.header_margin_ratio}")
        if not (0.0 <= self.footer_margin_ratio <= 0.25):
            raise ValueError(f"footer_margin_ratio must be between 0.0 and 0.25, got {self.footer_margin_ratio}")
            
        # Validate tolerances and spacing
        if self.line_grouping_tolerance <= 0.0:
            raise ValueError(f"line_grouping_tolerance must be positive, got {self.line_grouping_tolerance}")
        if self.option_y_alignment_delta <= 0.0:
            raise ValueError(f"option_y_alignment_delta must be positive, got {self.option_y_alignment_delta}")
        if self.max_vertical_option_spacing <= 0.0:
            raise ValueError(f"max_vertical_option_spacing must be positive, got {self.max_vertical_option_spacing}")
            
        # Validate count and thresholds
        if self.expected_options_count <= 0:
            raise ValueError(f"expected_options_count must be greater than 0, got {self.expected_options_count}")
        if not (0.0 <= self.jaccard_similarity_threshold <= 1.0):
            raise ValueError(f"jaccard_similarity_threshold must be between 0.0 and 1.0, got {self.jaccard_similarity_threshold}")
        if self.shingle_length <= 0:
            raise ValueError(f"shingle_length must be greater than 0, got {self.shingle_length}")
        if self.min_question_text_length <= 0:
            raise ValueError(f"min_question_text_length must be positive, got {self.min_question_text_length}")

    @classmethod
    def load_from_env(cls) -> "ParserConfig":
        """
        Builds a ParserConfig instantiating properties loaded from environmental overrides,
        falling back to default class parameters safely.
        """
        def _get_env_float(name: str, default: float) -> float:
            val = os.environ.get(name)
            if val is None:
                return default
            try:
                return float(val)
            except ValueError:
                return default

        def _get_env_int(name: str, default: int) -> int:
            val = os.environ.get(name)
            if val is None:
                return default
            try:
                return int(val)
            except ValueError:
                return default

        return cls(
            gutter_min_width_ratio=_get_env_float("PARSER_GUTTER_MIN_WIDTH_RATIO", 0.03),
            header_margin_ratio=_get_env_float("PARSER_HEADER_MARGIN_RATIO", 0.05),
            footer_margin_ratio=_get_env_float("PARSER_FOOTER_MARGIN_RATIO", 0.05),
            line_grouping_tolerance=_get_env_float("PARSER_LINE_GROUPING_TOLERANCE", 3.0),
            publisher_sample_max_pages=_get_env_int("PARSER_PUBLISHER_SAMPLE_MAX_PAGES", 2),
            publisher_sample_max_lines=_get_env_int("PARSER_PUBLISHER_SAMPLE_MAX_LINES", 60),
            option_y_alignment_delta=_get_env_float("PARSER_OPTION_Y_ALIGNMENT_DELTA", 4.0),
            max_vertical_option_spacing=_get_env_float("PARSER_MAX_VERTICAL_OPTION_SPACING", 80.0),
            expected_options_count=_get_env_int("PARSER_EXPECTED_OPTIONS_COUNT", 4),
            min_question_text_length=_get_env_int("PARSER_MIN_QUESTION_TEXT_LENGTH", 10),
            min_option_text_length=_get_env_int("PARSER_MIN_OPTION_TEXT_LENGTH", 1),
            jaccard_similarity_threshold=_get_env_float("PARSER_JACCARD_SIMILARITY_THRESHOLD", 0.95),
            shingle_length=_get_env_int("PARSER_SHINGLE_LENGTH", 3),
            log_format=os.environ.get("PARSER_LOG_FORMAT", cls.log_format),
            benchmark_report_filename=os.environ.get("PARSER_BENCHMARK_REPORT_FILENAME", cls.benchmark_report_filename),
            base_confidence_score=_get_env_int("PARSER_BASE_CONFIDENCE_SCORE", 100),
            penalty_missing_section=_get_env_int("PARSER_PENALTY_MISSING_SECTION", 10),
            penalty_option_count_mismatch=_get_env_int("PARSER_PENALTY_OPTION_COUNT_MISMATCH", 20),
            penalty_empty_option_text=_get_env_int("PARSER_PENALTY_EMPTY_OPTION_TEXT", 15),
            penalty_suspicious_short_option=_get_env_int("PARSER_PENALTY_SUSPICIOUS_SHORT_OPTION", 15),
            penalty_question_text_too_short=_get_env_int("PARSER_PENALTY_QUESTION_TEXT_TOO_SHORT", 25),
            penalty_missing_answer_key=_get_env_int("PARSER_PENALTY_MISSING_ANSWER_KEY", 15),
            penalty_detected_duplicate=_get_env_int("PARSER_PENALTY_DETECTED_DUPLICATE", 10)
        )
