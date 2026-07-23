"""
Parser Engine Reusable Data Models Module
=========================================
Defines slots-based memory-optimized Python dataclasses representing layout geometry,
word structures, parsed questions, validation results, and metrics reports.
Includes zero parsing, database, or network logic.
"""

import json
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Set, Tuple, Any

# -----------------------------------------------------------------------------
# 1. WordBox
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class WordBox:
    """
    Represents a single word with its precise layout geometry and metadata.
    """
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    font_name: str
    font_size: float
    page: int
    color: Optional[Tuple[float, ...]] = None
    rotation: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.page <= 0:
            raise ValueError(f"Page number must be positive, got {self.page}")
        if self.x0 > self.x1 or self.y0 > self.y1:
            raise ValueError(f"Invalid bounding box coordinates: ({self.x0}, {self.y0}, {self.x1}, {self.y1})")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WordBox":
        # Convert color list back to tuple if present
        color_data = data.get("color")
        color_val = tuple(color_data) if color_data else None
        return cls(
            text=data["text"],
            x0=data["x0"],
            y0=data["y0"],
            x1=data["x1"],
            y1=data["y1"],
            font_name=data["font_name"],
            font_size=data["font_size"],
            page=data["page"],
            color=color_val,
            rotation=data.get("rotation", 0),
            metadata=data.get("metadata", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 2. TextBlock
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class TextBlock:
    """
    Represents a contiguous block of text composed of multiple words,
    aligned geometrically.
    """
    text: str
    words: List[WordBox]
    bbox: Tuple[float, float, float, float]
    page: int
    block_type: str = "text"  # "text" | "table" | "header" | "footer" | "watermark"
    column: int = 0          # 0 for single/left column, 1 for right column
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.page <= 0:
            raise ValueError(f"Page number must be positive, got {self.page}")
        if self.bbox[0] > self.bbox[2] or self.bbox[1] > self.bbox[3]:
            raise ValueError(f"Invalid bounding box: {self.bbox}")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TextBlock":
        words_list = [WordBox.from_dict(w) for w in data.get("words", [])]
        bbox_data = data["bbox"]
        bbox_val = (bbox_data[0], bbox_data[1], bbox_data[2], bbox_data[3])
        return cls(
            text=data["text"],
            words=words_list,
            bbox=bbox_val,
            page=data["page"],
            block_type=data.get("block_type", "text"),
            column=data.get("column", 0),
            metadata=data.get("metadata", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 3. PageLayout
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class PageLayout:
    """
    Represents the geometric design layout of a single PDF document page.
    """
    page_number: int
    width: float
    height: float
    rotation: int
    layout_type: str = "single_column"  # "single_column" | "two_column" | "mixed"
    columns: List[Tuple[float, float, float, float]] = field(default_factory=list)
    blocks: List[TextBlock] = field(default_factory=list)
    headers: List[TextBlock] = field(default_factory=list)
    footers: List[TextBlock] = field(default_factory=list)
    watermarks: List[TextBlock] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.page_number <= 0:
            raise ValueError(f"Page number must be positive, got {self.page_number}")
        if self.width <= 0.0 or self.height <= 0.0:
            raise ValueError(f"Page dimensions must be positive: width={self.width}, height={self.height}")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PageLayout":
        return cls(
            page_number=data["page_number"],
            width=data["width"],
            height=data["height"],
            rotation=data["rotation"],
            layout_type=data.get("layout_type", "single_column"),
            columns=[(c[0], c[1], c[2], c[3]) for c in data.get("columns", [])],
            blocks=[TextBlock.from_dict(b) for b in data.get("blocks", [])],
            headers=[TextBlock.from_dict(b) for b in data.get("headers", [])],
            footers=[TextBlock.from_dict(b) for b in data.get("footers", [])],
            watermarks=[TextBlock.from_dict(b) for b in data.get("watermarks", [])],
            metadata=data.get("metadata", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 4. QuestionOption
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class QuestionOption:
    """
    Represents a single multiple choice answer option.
    """
    id: str                # e.g., "A", "B", "C", "D"
    text: str
    bbox: Optional[Tuple[float, float, float, float]] = None
    is_correct: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.id:
            raise ValueError("Option ID cannot be empty.")
        if self.bbox and (self.bbox[0] > self.bbox[2] or self.bbox[1] > self.bbox[3]):
            raise ValueError(f"Invalid bounding box: {self.bbox}")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "QuestionOption":
        bbox_data = data.get("bbox")
        bbox_val = (bbox_data[0], bbox_data[1], bbox_data[2], bbox_data[3]) if bbox_data else None
        return cls(
            id=data["id"],
            text=data["text"],
            bbox=bbox_val,
            is_correct=data.get("is_correct", False),
            metadata=data.get("metadata", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 5. ParsedQuestion
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class ParsedQuestion:
    """
    The main question record containing all structural texts, options,
    confidence metrics, and validation logs.
    """
    question_id: str
    question_number: int
    question: str
    options: List[QuestionOption]
    answer: str
    explanation: str
    page: int
    source_pdf: str
    publisher: str
    exam: str
    subject: str
    topic: str
    difficulty: str
    parser_used: str
    confidence_score: int
    validation_errors: List[str]
    status: str                         # "ok" | "needs_review"
    raw_text: str
    normalized_text: str
    layout_type: str
    review_question_text: bool = False
    review_options: bool = False
    review_answer_key: bool = False
    question_bbox: Optional[Tuple[float, float, float, float]] = None
    layout_version: str = "1.0.0"
    metadata: Dict[str, Any] = field(default_factory=dict)
    processing_notes: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.page <= 0:
            raise ValueError(f"Page number must be positive, got {self.page}")
        if self.question_number < 0:
            raise ValueError(f"Question number cannot be negative, got {self.question_number}")
        if not (0 <= self.confidence_score <= 100):
            raise ValueError(f"Confidence score must be between 0 and 100, got {self.confidence_score}")
        
        # Enforce option uniqueness
        opt_ids = [opt.id for opt in self.options]
        if len(opt_ids) != len(set(opt_ids)):
            # ValidationEngine will flag this duplicate option ID; do not raise to prevent parser crash.
            pass

    def finalize(self) -> None:
        import hashlib
        raw = (self.question or "") + "".join(o.text for o in self.options)
        self.question_id = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ParsedQuestion":
        opts = [QuestionOption.from_dict(o) for o in data.get("options", [])]
        bbox_data = data.get("question_bbox")
        bbox_val = (bbox_data[0], bbox_data[1], bbox_data[2], bbox_data[3]) if bbox_data else None
        return cls(
            question_id=data["question_id"],
            question_number=data["question_number"],
            question=data["question"],
            options=opts,
            answer=data["answer"],
            explanation=data.get("explanation", ""),
            page=data["page"],
            source_pdf=data["source_pdf"],
            publisher=data["publisher"],
            exam=data["exam"],
            subject=data["subject"],
            topic=data.get("topic", ""),
            difficulty=data.get("difficulty", ""),
            parser_used=data["parser_used"],
            confidence_score=data["confidence_score"],
            validation_errors=data.get("validation_errors", []),
            status=data["status"],
            raw_text=data["raw_text"],
            normalized_text=data["normalized_text"],
            layout_type=data["layout_type"],
            review_question_text=data.get("review_question_text", False),
            review_options=data.get("review_options", False),
            review_answer_key=data.get("review_answer_key", False),
            question_bbox=bbox_val,
            metadata=data.get("metadata", {}),
            processing_notes=data.get("processing_notes", [])
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)

    def summary(self) -> str:
        return f"Q.{self.question_number} (Score: {self.confidence_score}, Status: {self.status}) - {self.question[:60]}..."


# -----------------------------------------------------------------------------
# 6. ValidationResult
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class ValidationResult:
    """
    Represents the output validation status of a single ParsedQuestion.
    """
    is_valid: bool
    error_codes: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    confidence_penalty: int = 0
    review_reason: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ValidationResult":
        return cls(
            is_valid=data["is_valid"],
            error_codes=data.get("error_codes", []),
            warnings=data.get("warnings", []),
            confidence_penalty=data.get("confidence_penalty", 0),
            review_reason=data.get("review_reason"),
            metadata=data.get("metadata", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 7. DuplicateMatch
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class DuplicateMatch:
    """
    Represents a duplicate match index between two parsed questions.
    """
    original_question_id: str
    duplicate_question_id: str
    similarity: float
    algorithm: str = "jaccard"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not (0.0 <= self.similarity <= 1.0):
            raise ValueError(f"Similarity index must be between 0.0 and 1.0, got {self.similarity}")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DuplicateMatch":
        return cls(
            original_question_id=data["original_question_id"],
            duplicate_question_id=data["duplicate_question_id"],
            similarity=data["similarity"],
            algorithm=data.get("algorithm", "jaccard"),
            metadata=data.get("metadata", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 8. ParserMetrics
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class ParserMetrics:
    """
    Performance and accuracy metrics collected during document extraction.
    """
    pdf_name: str
    publisher: str
    layout_type: str
    extraction_time: float
    layout_time: float
    parsing_time: float
    validation_time: float
    duplicate_time: float
    total_time: float
    total_questions: int
    accepted: int
    review: int
    rejected: int
    duplicates: int
    average_confidence: float
    memory_usage: float  # In megabytes
    peak_memory: float   # In megabytes

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ParserMetrics":
        return cls(
            pdf_name=data["pdf_name"],
            publisher=data["publisher"],
            layout_type=data["layout_type"],
            extraction_time=data["extraction_time"],
            layout_time=data["layout_time"],
            parsing_time=data["parsing_time"],
            validation_time=data["validation_time"],
            duplicate_time=data["duplicate_time"],
            total_time=data["total_time"],
            total_questions=data["total_questions"],
            accepted=data["accepted"],
            review=data["review"],
            rejected=data["rejected"],
            duplicates=data["duplicates"],
            average_confidence=data["average_confidence"],
            memory_usage=data["memory_usage"],
            peak_memory=data["peak_memory"]
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


# -----------------------------------------------------------------------------
# 9. ParserReport
# -----------------------------------------------------------------------------
@dataclass(slots=True)
class ParserReport:
    """
    The final run summary report compiled after processing a PDF.
    """
    pdf_name: str
    start_time: str
    end_time: str
    status: str  # "success" | "partial" | "failed"
    metrics: ParserMetrics
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    review_summary: Dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ParserReport":
        metrics_data = data["metrics"]
        metrics_obj = ParserMetrics.from_dict(metrics_data) if isinstance(metrics_data, dict) else metrics_data
        return cls(
            pdf_name=data["pdf_name"],
            start_time=data["start_time"],
            end_time=data["end_time"],
            status=data["status"],
            metrics=metrics_obj,
            errors=data.get("errors", []),
            warnings=data.get("warnings", []),
            review_summary=data.get("review_summary", {})
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)
