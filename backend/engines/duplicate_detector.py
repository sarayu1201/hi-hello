"""
Duplicate Detector Engine Module
================================
Provides a deterministic duplicate detection engine.
Uses text normalization, 3-character shingling, and bucket-based Jaccard similarity
indexing to prevent duplicate question hydration in O(n) time.
"""

import time
import hashlib
import unicodedata
import re
import threading
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Generator, Any, Iterable

from config import ParserConfig
from models import ParsedQuestion
from patterns import ADDA247_SIGNATURE_RE, CRACKU_SIGNATURE_RE, HEADER_AD_RE
from logger import get_logger

logger = get_logger("parser")


@dataclass(slots=True)
class DuplicateResult:
    """
    Result model representing a duplicate comparison match.
    """
    is_duplicate: bool
    similarity: float
    original_question_id: str
    duplicate_question_id: str
    algorithm: str = "jaccard"
    metadata: Dict[str, Any] = field(default_factory=dict)


class DuplicateDetector:
    """
    Deterministic Duplicate Detection Engine.
    Bins questions geometrically using bucket keys to maintain O(n) average-case speed.
    """
    def __init__(self, config: Optional[ParserConfig] = None, profile: str = "balanced") -> None:
        self.config = config or ParserConfig()
        self.profile = profile.lower()  # "strict" | "balanced" | "lenient"
        
        # Resolve Jaccard threshold overrides based on profile
        if self.profile == "strict":
            self.threshold = 0.90  # Strict: rejects matches with 90%+ similarity
        elif self.profile == "lenient":
            self.threshold = 0.98  # Lenient: rejects only near-exact matches
        else:
            self.threshold = self.config.jaccard_similarity_threshold

        # Thread-safe in-memory database lookup cache of normalized signatures
        # Key: bucket_key -> Value: List[Tuple[question_id, Set[shingles]]]
        self._bucket_cache: Dict[Tuple[int, str, str], List[Tuple[str, Set[str]]]] = {}
        self._lock = threading.Lock()

    def normalize(self, text: str) -> str:
        """
        Runs the normalizer pipeline: unicode normalize, lowercase, collapse whitespace,
        strip punctuation, watermarks, and page numbers.
        """
        if not text:
            return ""
        
        # 1. Unicode NFKC normalization & lowercase
        norm = unicodedata.normalize("NFKC", text).lower()
        
        # 2. Strip headers, footers, advertisements, watermarks
        norm = HEADER_AD_RE.sub("", norm)
        norm = ADDA247_SIGNATURE_RE.sub("", norm)
        norm = CRACKU_SIGNATURE_RE.sub("", norm)
        
        # 3. Strip punctuation & retain only alphanumeric characters & spaces
        norm = re.sub(r"[^\w\s\u0c00-\u0c7f]", "", norm)
        
        # 4. Collapse whitespace
        return " ".join(norm.split())

    def fingerprint(self, text: str) -> str:
        """
        Generates a SHA-256 fingerprint hash of the normalized text.
        """
        norm = self.normalize(text)
        return hashlib.sha256(norm.encode("utf-8")).hexdigest()[:16]

    def build_shingles(self, text: str) -> Set[str]:
        """
        Builds a set of 3-character shingles for Jaccard similarity index comparisons.
        """
        norm = self.normalize(text)
        length = len(norm)
        shingle_len = self.config.shingle_length

        if length < shingle_len:
            return {norm} if norm else set()

        return {norm[i:i + shingle_len] for i in range(length - shingle_len + 1)}

    def bucket_key(self, text: str, question_type: str = "mcq") -> Tuple[int, str, str]:
        """
        Computes the O(1) bucketing key: (normalized length group, first 5 tokens, question type).
        Grouping by length +/- 15 characters and initial tokens blocks unnecessary checks.
        """
        norm = self.normalize(text)
        tokens = norm.split()
        first_5_prefix = "".join(tokens[:5])
        
        # Bin length by groups of 15 characters
        length_bin = len(norm) // 15
        
        return (length_bin, first_5_prefix, question_type)

    def similarity(self, set_a: Set[str], set_b: Set[str]) -> float:
        """
        Calculates Jaccard Similarity index: |A intersection B| / |A union B|.
        """
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return intersection / union

    def detect(self, question: ParsedQuestion) -> DuplicateResult:
        """
        Checks if the question statement matches any cached duplicate signature in its bucket.
        Caches the checked question immediately.
        """
        start_time = time.time()
        q_text = question.question
        q_id = question.question_id
        
        q_shingles = self.build_shingles(q_text)
        b_key = self.bucket_key(q_text, question.layout_type)

        with self._lock:
            if b_key not in self._bucket_cache:
                self._bucket_cache[b_key] = []

            # Search only within the target bucket (O(1) average bin size)
            for cached_id, cached_shingles in self._bucket_cache[b_key]:
                if cached_id == q_id:
                    continue

                sim = self.similarity(q_shingles, cached_shingles)
                if sim >= self.threshold:
                    logger.warning(
                        f"Duplicate Match Found: Q.{question.question_number} matched cached question ID {cached_id}. "
                        f"Similarity: {sim:.2f} (Threshold={self.threshold:.2f})"
                    )
                    return DuplicateResult(
                        is_duplicate=True,
                        similarity=sim,
                        original_question_id=cached_id,
                        duplicate_question_id=q_id,
                        metadata={"detection_time_ms": (time.time() - start_time) * 1000.0}
                    )

            # Register/Cache this question signature for future scans
            self._bucket_cache[b_key].append((q_id, q_shingles))

        return DuplicateResult(
            is_duplicate=False,
            similarity=0.0,
            original_question_id="",
            duplicate_question_id=q_id,
            metadata={"detection_time_ms": (time.time() - start_time) * 1000.0}
        )

    def detect_stream(self, questions: Iterable[ParsedQuestion]) -> Generator[Tuple[ParsedQuestion, DuplicateResult], None, None]:
        """
        Streams questions page-by-page, returning duplicate validation checks.
        """
        for q in questions:
            res = self.detect(q)
            yield q, res

    def detect_many(self, questions: List[ParsedQuestion]) -> List[Tuple[ParsedQuestion, DuplicateResult]]:
        """
        Detects duplicates sequentially across an array of questions.
        """
        return list(self.detect_stream(questions))
