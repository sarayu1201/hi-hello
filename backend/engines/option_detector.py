"""
Option Detector Engine Module
=============================
Provides geometry-first and text-fallback option detection.
Analyzes coordinate alignments to classify horizontal/vertical layouts,
clusters multi-line option text, and handles sequence validation and recovery.
"""

import re
from typing import Dict, List, Optional, Tuple, Any

from config import ParserConfig
from models import QuestionOption, WordBox
from patterns import PAREN_OPTION_RE, DOT_OPTION_RE, BARE_OPTION_LINE_RE
from logger import get_logger

logger = get_logger("parser")


class OptionDetector:
    """
    Centralized Option Detection Engine.
    Employs geometry-first bounding box analysis, fallback regex splitters,
    and sequence recovery algorithms.
    """
    def __init__(self, config: Optional[ParserConfig] = None) -> None:
        self.config = config or ParserConfig()

    def _union_bboxes(self, bboxes: List[Tuple[float, float, float, float]]) -> Optional[Tuple[float, float, float, float]]:
        """
        Calculates the bounding box union of a list of coordinates.
        """
        if not bboxes:
            return None
        x0 = min(b[0] for b in bboxes)
        y0 = min(b[1] for b in bboxes)
        x1 = max(b[2] for b in bboxes)
        y1 = max(b[3] for b in bboxes)
        return (x0, y0, x1, y1)

    def _validate_sequence(self, sequence: List[str]) -> bool:
        """
        Validates if option markers form a logical progression (e.g. A-D, a-d, or 1-4).
        Resists false positives like nested lists or mathematical vars.
        """
        if len(sequence) < 2:
            return False
            
        progressions = [
            ["A", "B", "C", "D", "E"],
            ["a", "b", "c", "d", "e"],
            ["1", "2", "3", "4", "5"],
            ["I", "II", "III", "IV"]
        ]
        
        normalized = [s.upper() for s in sequence]
        for prog in progressions:
            # Check if sequence is a sub-list of this progression
            try:
                start_idx = prog.index(normalized[0])
                if prog[start_idx:start_idx + len(normalized)] == normalized:
                    return True
            except ValueError:
                continue
        return False

    def _detect_options_by_geometry(self, words: List[WordBox], page: int) -> List[QuestionOption]:
        """
        Extracts option markers and text based on word bounding box coordinate geometry.
        """
        candidates: List[Tuple[int, str, Tuple[float, float, float, float]]] = []
        digit_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
        roman_to_letter = {
            "I": "A", "II": "B", "III": "C", "IV": "D", "V": "E",
            "i": "A", "ii": "B", "iii": "C", "iv": "D", "v": "E"
        }

        # Find words matching option marker structures
        idx = 0
        while idx < len(words):
            w = words[idx]
            text = w.text.strip()
            if not text:
                idx += 1
                continue

            # 1. Parenthesis: (A) or (a) or (1)
            paren_m = re.match(r"^\(([a-eA-E1-5i-vI-V])\)$|^\[([a-eA-E1-5i-vI-V])\]$", text)
            if paren_m:
                val = paren_m.group(1) or paren_m.group(2)
                candidates.append((idx, val, (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue

            # 2. Circled numbers: ① - ⑤
            circle_m = re.match(r"^([①-⑤])$", text)
            if circle_m:
                val = circle_m.group(1)
                mapping = {"①": "1", "②": "2", "③": "3", "④": "4", "⑤": "5"}
                candidates.append((idx, mapping[val], (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue

            # 3. Dot option markers: A. or a. or 1. or I.
            dot_m = re.match(r"^([A-Ea-e1-5i-vI-V])[.]$", text)
            if dot_m:
                candidates.append((idx, dot_m.group(1), (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue
                
            # 4. Right paren marker: A) or a) or 1) or I)
            right_m = re.match(r"^([A-Ea-e1-5i-vI-V])\)$", text)
            if right_m:
                candidates.append((idx, right_m.group(1), (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue

            # 5. Prefix word options: Option A or Choice A
            if text.lower() in ["option", "choice"] and idx + 1 < len(words):
                next_word = words[idx + 1]
                next_text = next_word.text.strip().strip(".:)")
                if re.match(r"^([a-eA-E1-5i-vI-V])$", next_text):
                    candidates.append((idx, next_text, (w.x0, w.y0, next_word.x1, next_word.y1)))
                    idx += 2
                    continue

            # 6. Prefix paren/dot/right paren options merged with text (e.g. (A)OptionText)
            prefix_paren = re.match(r"^\(([a-eA-E1-5i-vI-V])\)(.+)$", text)
            if prefix_paren:
                candidates.append((idx, prefix_paren.group(1), (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue

            prefix_dot = re.match(r"^([A-Ea-e1-5i-vI-V])[\.](.+)$", text)
            if prefix_dot:
                candidates.append((idx, prefix_dot.group(1), (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue

            prefix_right = re.match(r"^([A-Ea-e1-5i-vI-V])\)(.+)$", text)
            if prefix_right:
                candidates.append((idx, prefix_right.group(1), (w.x0, w.y0, w.x1, w.y1)))
                idx += 1
                continue

            idx += 1

        # Enforce sequence validation to ignore math variables or list numbers
        seq_letters = [c[1] for c in candidates]
        if not self._validate_sequence(seq_letters):
            logger.debug(f"Geometry options candidate sequence {seq_letters} is invalid. Falling back to text parsing.")
            return []

        options: List[QuestionOption] = []
        layout_type = "vertical"
        midpoints = []

        # Determine horizontal vs vertical layout and midpoints
        if len(candidates) >= 2:
            y_diffs = [abs(candidates[i][2][1] - candidates[i+1][2][1]) for i in range(len(candidates)-1)]
            if all(d < self.config.option_y_alignment_delta for d in y_diffs):
                layout_type = "horizontal"
                for i in range(len(candidates) - 1):
                    x1_curr = candidates[i][2][2]
                    x0_next = candidates[i+1][2][0]
                    midpoints.append((x1_curr + x0_next) / 2.0)

        # Cluster words following each option marker
        for i, (idx, letter, bbox) in enumerate(candidates):
            letter_id = letter.upper()
            letter_id = digit_to_letter.get(letter_id, letter_id)
            letter_id = roman_to_letter.get(letter_id, letter_id)

            if layout_type == "horizontal":
                # Extract words specifically within the horizontal column's bounds
                x_min = bbox[0] - 2.0
                x_max = midpoints[i] if i < len(midpoints) else 99999.0
                chunk_words = []
                for w in words:
                    # Capture words below the marker top, and matching the X interval bounds
                    if w.y1 > bbox[1] - 2.0 and x_min <= w.x0 < x_max:
                        # Exclude other marker words
                        is_marker = False
                        for c in candidates:
                            if abs(w.x0 - c[2][0]) < 1.0 and abs(w.y0 - c[2][1]) < 1.0:
                                is_marker = True
                                break
                        if not is_marker:
                            chunk_words.append(w)
            else:
                next_idx = candidates[i + 1][0] if i + 1 < len(candidates) else len(words)
                chunk_words = words[idx + 1: next_idx]
            
            opt_text = " ".join(w.text for w in chunk_words).strip()
            
            # Compute union box of option text
            text_bboxes = [(w.x0, w.y0, w.x1, w.y1) for w in chunk_words]
            union_bbox = self._union_bboxes(text_bboxes) or bbox
            
            metadata = {
                "page": page,
                "confidence": 100,
                "layout_type": layout_type
            }

            options.append(QuestionOption(
                id=letter_id,
                text=opt_text if opt_text else "[Refer to PDF]",
                bbox=union_bbox,
                metadata=metadata
            ))

        return options

    def _detect_options_by_text(self, text: str, page: int) -> List[QuestionOption]:
        """
        Fallback option tokenizer using regex splits on text lines.
        Supports: (A), [A], A., A), 1., 1), circled numbers, and Roman numerals.
        """
        pattern = re.compile(r"(\([A-Ea-e1-5i-vI-V]\)|\[[A-Ea-e1-5i-vI-V]\]|\b[A-Ea-e1-5i-vI-V]\s*[\.\)])")
        parts = pattern.split(text)
        options: List[QuestionOption] = []
        current_id = None
        
        digit_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
        roman_to_letter = {
            "I": "A", "II": "B", "III": "C", "IV": "D", "V": "E",
            "i": "A", "ii": "B", "iii": "C", "iv": "D", "v": "E"
        }
        
        for part in parts:
            stripped = part.strip()
            if not stripped:
                continue
            
            m = re.match(r"^[\(\[ ]*([A-Ea-e1-5i-vI-V])[\)\]\.]*$", stripped)
            if m and len(stripped) <= 4:
                if current_id:
                    options.append(QuestionOption(
                        id=current_id,
                        text="[Refer to PDF]",
                        metadata={"page": page, "confidence": 80}
                    ))
                letter = m.group(1).upper()
                letter = digit_to_letter.get(letter, letter)
                letter = roman_to_letter.get(letter, letter)
                current_id = letter
            else:
                if current_id:
                    opt_text = stripped.strip(" \n\t-:")
                    options.append(QuestionOption(
                        id=current_id,
                        text=opt_text if opt_text else "[Refer to PDF]",
                        metadata={"page": page, "confidence": 80}
                    ))
                    current_id = None

        if current_id:
            options.append(QuestionOption(
                id=current_id,
                text="[Refer to PDF]",
                metadata={"page": page, "confidence": 80}
            ))

        # Enforce sequence validation to ignore false-positive math variables or list numbers
        seq_ids = [opt.id for opt in options]
        if not self._validate_sequence(seq_ids):
            logger.debug(f"Text-split option sequence {seq_ids} is invalid. Discarding candidates.")
            return []
            
        return options

    def detect_options(self, block_text: str, words: List[WordBox], page: int) -> List[QuestionOption]:
        """
        Runs the option detection pipeline. Uses geometry coordinates first,
        falling back to regex text splitters. Applies validations and recoveries.
        """
        options: List[QuestionOption] = []

        # 1. Geometry-first detection
        if words:
            options = self._detect_options_by_geometry(words, page)

        # 2. Fallback to text parsing
        if not options:
            options = self._detect_options_by_text(block_text, page)

        # 3. Apply recovery rules
        options = self._apply_recovery_rules(options, block_text, page)

        # 4. Final validation checks
        self._validate_options(options)

        return options

    def _apply_recovery_rules(self, options: List[QuestionOption], block_text: str, page: int) -> List[QuestionOption]:
        """
        Applies deterministic recovery rules for missing, duplicate, or wrapped option markers.
        """
        # Case A: 3 options found (Missing 4th option recovery)
        if len(options) == 3:
            # Check if there is a trailing paragraph that looks like option D but missing marker
            lines = [l.strip() for l in block_text.split("\n") if l.strip()]
            if lines:
                last_line = lines[-1]
                # If last line doesn't start with option marker but stands as a separate block
                if not BARE_OPTION_LINE_RE.match(last_line) and len(last_line) > 2:
                    # Treat last line as option D recovery
                    logger.info("Option Recovery: Recovered missing option D from trailing paragraph.")
                    options.append(QuestionOption(
                        id="D",
                        text=last_line,
                        metadata={"page": page, "confidence": 70, "recovered": True}
                    ))

        # Case B: 5 options found (Discard invalid/trailing options if profile expects 4)
        if len(options) == 5 and self.config.expected_options_count == 4:
            # Check if the 5th option ID is outside A-D range (e.g. E)
            if options[-1].id == "E":
                logger.info("Option Recovery: Standard 5-option format detected. Preserving all options.")
            else:
                # Remove duplicate option if applicable
                seen: Set[str] = set()
                deduplicated = []
                for opt in options:
                    if opt.id not in seen:
                        seen.add(opt.id)
                        deduplicated.append(opt)
                    else:
                        logger.warning(f"Option Recovery: Discarded duplicate option ID: {opt.id}")
                options = deduplicated

        # Reject duplicate option texts
        seen_texts = set()
        dedup_text_options = []
        for opt in options:
            norm_text = opt.text.strip().lower()
            if norm_text not in seen_texts:
                seen_texts.add(norm_text)
                dedup_text_options.append(opt)
            else:
                logger.warning(f"Option Recovery: Discarded option {opt.id} with duplicate text: {opt.text}")
        options = dedup_text_options

        # Auto-recover broken option ordering by sorting sequentially
        if len(options) >= 2:
            options = sorted(options, key=lambda o: o.id.upper())

        return options

    def _validate_options(self, options: List[QuestionOption]) -> None:
        """
        Validates option count, uniqueness, and text completeness.
        """
        if not options:
            return

        opt_ids = [opt.id for opt in options]
        # Check uniqueness
        if len(opt_ids) != len(set(opt_ids)):
            logger.warning(f"Validation Warning: Duplicate option IDs detected: {opt_ids}")

        # Check for empty options
        for opt in options:
            if not opt.text.strip():
                logger.warning(f"Validation Warning: Empty option text found on option ID: {opt.id}")
