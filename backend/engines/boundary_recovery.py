"""
Boundary Recovery Engine Module
===============================
Provides the centralized, stateful FSM (Finite State Machine) layout block scanner.
Tracks passages, question boundaries, options, and explanations across page transitions.
"""

import re
import time
import hashlib
from typing import Dict, List, Optional, Set, Tuple, Generator, Any, Iterable

from config import ParserConfig
from models import ParsedQuestion, QuestionOption, ValidationResult, PageLayout, TextBlock
from strategies.base import BaseParser
from logger import get_logger, set_context, clear_context

# Re-use compiled triggers from patterns.py
from patterns import COMMON_CONTEXT_TRIGGER_RE, BARE_OPTION_LINE_RE, EMBEDDED_ANSWER_RE, match_bare_option

logger = get_logger("parser")


class ParserState:
    """
    FSM parsing states.
    """
    SEEKING_QUESTION = "SEEKING_QUESTION"
    READING_CONTEXT = "READING_CONTEXT"
    READING_QUESTION = "READING_QUESTION"
    READING_OPTIONS = "READING_OPTIONS"
    READING_EXPLANATION = "READING_EXPLANATION"
    PAGE_BREAK = "PAGE_BREAK"
    RECOVERY = "RECOVERY"
    FINISHED = "FINISHED"


def roman_to_int(roman: str) -> int:
    roman = roman.upper()
    roman_map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    val = 0
    for i in range(len(roman)):
        if i > 0 and roman_map[roman[i]] > roman_map[roman[i - 1]]:
            val += roman_map[roman[i]] - 2 * roman_map[roman[i - 1]]
        else:
            val += roman_map[roman[i]]
    return val

def circled_to_int(char: str) -> int:
    circled_map = {
        "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5, "⑥": 6, "⑦": 7, "⑧": 8, "⑨": 9, "⑩": 10,
        "⑪": 11, "⑫": 12, "⑬": 13, "⑭": 14, "⑮": 15, "⑯": 16, "⑰": 17, "⑱": 18, "⑲": 19, "⑳": 20
    }
    return circled_map.get(char, 1)


class BoundaryRecoveryEngine:
    """
    Deterministic Finite State Machine to recover question boundaries,
    multi-page splits, bilingual text blocks, and option lines.
    """
    def __init__(self, strategy: BaseParser, config: Optional[ParserConfig] = None) -> None:
        self.strategy = strategy
        self.config = config or ParserConfig()
        self.state = ParserState.SEEKING_QUESTION
        self._history_state = ParserState.SEEKING_QUESTION

    def _union_bboxes(self, bboxes: List[Tuple[float, float, float, float]]) -> Optional[Tuple[float, float, float, float]]:
        if not bboxes:
            return None
        valid_bboxes = [b for b in bboxes if b is not None]
        if not valid_bboxes:
            return None
        x0 = min(b[0] for b in valid_bboxes)
        y0 = min(b[1] for b in valid_bboxes)
        x1 = max(b[2] for b in valid_bboxes)
        y1 = max(b[3] for b in valid_bboxes)
        return (x0, y0, x1, y1)

    def _change_state(self, new_state: str, reason: str) -> None:
        """
        Transitions FSM to a new state and logs the decision.
        """
        if self.state != new_state:
            logger.info(f"FSM State Transition: {self.state} -> {new_state} (Reason: {reason})")
            self._history_state = self.state
            self.state = new_state

    def _finalize_current_question(self, qb: Optional[Dict[str, Any]]) -> Optional[ParsedQuestion]:
        """
        Validates, normalizes, and packages the current question buffer into a ParsedQuestion.
        """
        if not qb:
            return None

        raw_body = "\n".join(qb["question_parts"]).strip()
        if not raw_body or raw_body.strip() == "Ans":
            raw_body = "[Refer to PDF/Image]"
        
        # Tokenize options
        options: List[QuestionOption] = []
        option_lines = qb["option_lines"]
        
        # Try parsing option markers first
        for line in option_lines:
            stripped = line.strip()
            matched_opt = match_bare_option(stripped)
            if matched_opt:
                opt_id, opt_text = matched_opt
                digit_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
                opt_id = digit_to_letter.get(opt_id, opt_id)
                options.append(QuestionOption(id=opt_id, text=opt_text if opt_text else "[Refer to PDF]"))

        # Fallback to regex splits if no bare option lines matched
        if not options:
            full_opt_text = "\n".join(option_lines)
            opt_patterns = self.strategy.get_option_patterns()
            marks: List[re.Match[str]] = []
            for pat in opt_patterns:
                marks.extend(list(pat.finditer(full_opt_text)))
            
            # Sort option markers by start offset position
            marks = sorted(list(set(marks)), key=lambda x: x.start())
            
            for i, m in enumerate(marks):
                letter = None
                for val in m.groups():
                    if val is not None:
                        letter = val
                        break
                if not letter:
                    continue
                letter = letter.upper()
                digit_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
                letter = digit_to_letter.get(letter, letter)
                start = m.end()
                end = marks[i + 1].start() if i + 1 < len(marks) else len(full_opt_text)
                text = full_opt_text[start:end].strip(" \n\t-:")
                options.append(QuestionOption(id=letter, text=text if text else "[Refer to PDF]"))

        # Concatenate parent passage
        if qb["passage"]:
            question_text = f"[PASSAGE]\n{qb['passage']}\n[QUESTION]\n{raw_body}"
        else:
            question_text = raw_body

        correct_ans = qb["answer"]
        explanation = "\n".join(qb["explanation_parts"]).strip()

        # Align chosen option correctness
        for opt in options:
            if opt.id == correct_ans:
                opt.is_correct = True

        # Generate unique question hash ID
        raw_hash_data = f"{qb['page']}_{qb['number']}_{question_text[:50]}"
        q_id = hashlib.sha256(raw_hash_data.encode("utf-8")).hexdigest()[:16]

        union_box = self._union_bboxes(qb.get("bboxes", []))

        pq = ParsedQuestion(
            question_id=q_id,
            question_number=qb["number"],
            question=question_text,
            options=options,
            answer=correct_ans,
            explanation=explanation,
            page=qb["page"],
            source_pdf="",
            publisher=self.strategy.supported_publishers().copy().pop() if self.strategy.supported_publishers() else "Generic",
            exam="",
            subject=qb["section"],
            topic="",
            difficulty="",
            parser_used=self.strategy.strategy_name(),
            confidence_score=100,
            validation_errors=[],
            status="ok",
            raw_text="\n".join(qb["raw_lines"]),
            normalized_text="",
            layout_type="single_column",
            question_bbox=union_box
        )

        # Normalize statement texts
        pq = self.strategy.post_process(pq)
        pq.normalized_text = pq.question
        
        # Validation checks
        val_res = self.strategy.validate(pq)
        pq.confidence_score = self.strategy.confidence(pq)
        
        if not val_res.is_valid:
            pq.status = "needs_review"
            pq.validation_errors = val_res.error_codes
            logger.info(f"Question {qb['number']} saved to review queue. Reason: {val_res.review_reason}")

        return pq

    def _parse_passage_range(self, text: str) -> Optional[Tuple[int, int]]:
        """
        Parses question range (e.g. 19-20) from directions or passage text.
        """
        match = re.search(r"\b(?:Q\s*\.?\s*)?(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\b", text, re.I)
        if match:
            try:
                start_q = int(match.group(1))
                end_q = int(match.group(2))
                if start_q <= end_q:
                    return start_q, end_q
            except ValueError:
                pass
        return None

    def process_blocks(self, page_layouts: Iterable[PageLayout]) -> Generator[ParsedQuestion, None, None]:
        """
        Streams PageLayout blocks, parsing boundaries and yielding verified ParsedQuestions O(n).
        """
        self.state = ParserState.SEEKING_QUESTION
        self._history_state = ParserState.SEEKING_QUESTION
        
        active_section = ""
        active_passage = ""
        passage_range: Optional[Tuple[int, int]] = None
        passage_used_count = 0
        current_q: Optional[Dict[str, Any]] = None

        # Question start regexes
        q_start_patterns = self.strategy.get_question_start_patterns()
        
        for layout in page_layouts:
            set_context(page_number=layout.page_number)
            logger.info(f"FSM scanning layout blocks on page {layout.page_number}")

            # Handle page transition checks
            if self.state == ParserState.PAGE_BREAK:
                self._change_state(self._history_state, "page_break_resolved")

            for block in layout.blocks:
                text = block.text.strip()
                if not text:
                    continue

                # 1. Section changes take priority across all states
                sec_name = self.strategy.detect_section_name(text)
                if sec_name:
                    active_section = sec_name
                    if current_q:
                        pq = self._finalize_current_question(current_q)
                        if pq:
                            yield pq
                        current_q = None
                    self._change_state(ParserState.SEEKING_QUESTION, "section_header_matched")
                    continue

                # 2. Check for Context / Directions triggers
                if COMMON_CONTEXT_TRIGGER_RE.match(text):
                    active_passage = text
                    passage_range = self._parse_passage_range(text)
                    passage_used_count = 0
                    if current_q:
                        pq = self._finalize_current_question(current_q)
                        if pq:
                            yield pq
                        current_q = None
                    self._change_state(ParserState.READING_CONTEXT, "directions_trigger_matched")
                    continue

                # 3. Check for Question Start Boundary
                q_start_match: Optional[re.Match[str]] = None
                for pat in q_start_patterns:
                    m = self.strategy.safe_match(pat, text)
                    if m:
                        q_start_match = m
                        break

                if q_start_match:
                    # Enforce number sequencing guard to verify it's a real question boundary
                    # (prevents matching lists/math indices inside explanation bodies)
                    # Check all groups dynamically
                    q_num_str = None
                    for g_idx in range(1, 7):
                        try:
                            val = q_start_match.group(g_idx)
                            if val:
                                q_num_str = val
                                break
                        except IndexError:
                            continue

                    q_num = current_q["number"] + 1 if current_q else 1
                    if q_num_str:
                        stripped_num = q_num_str.strip()
                        if stripped_num.isdigit():
                            q_num = int(stripped_num)
                        elif any(c in "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳" for c in stripped_num):
                            q_num = circled_to_int(stripped_num)
                        elif re.match(r"^[IVXivx]+$", stripped_num):
                            q_num = roman_to_int(stripped_num)

                    is_valid_sequence = True
                    if current_q and q_num == current_q["number"]:
                        # Identical question number matched: treat as paragraph continuation
                        is_valid_sequence = False
                        logger.warning(f"Prevented duplicate question split on Q.{q_num}. Treating block as continuation.")

                    if is_valid_sequence:
                        if current_q:
                            pq = self._finalize_current_question(current_q)
                            if pq:
                                yield pq
                        
                        # Resolve active passage applicability
                        resolved_passage = ""
                        if active_passage:
                            if passage_range is not None:
                                if passage_range[0] <= q_num <= passage_range[1]:
                                    resolved_passage = active_passage
                                else:
                                    # Out of range, clear passage
                                    active_passage = ""
                                    passage_range = None
                            else:
                                # Single-use passage (like statements block)
                                if passage_used_count < 1:
                                    resolved_passage = active_passage
                                    passage_used_count += 1
                                else:
                                    active_passage = ""

                        statement_start_pos = q_start_match.end()
                        current_q = {
                            "number": q_num,
                            "question_parts": [text[statement_start_pos:].strip()],
                            "option_lines": [],
                            "answer": "",
                            "explanation_parts": [],
                            "page": layout.page_number,
                            "section": active_section,
                            "passage": resolved_passage,
                            "raw_lines": [text],
                            "bboxes": [block.bbox]
                        }
                        self._change_state(ParserState.READING_QUESTION, "question_start_matched")
                        continue

                # 4. FSM State updates & block routing
                if current_q:
                    current_q["raw_lines"].append(text)
                    current_q["bboxes"].append(block.bbox)

                    # Look for inline answer block: "Answer: C"
                    ans_match = EMBEDDED_ANSWER_RE.search(text)
                    if ans_match:
                        ans_val = ans_match.group(1) or ans_match.group(2)
                        if ans_val:
                            current_q["answer"] = ans_val.upper()
                            self._change_state(ParserState.READING_EXPLANATION, "answer_key_inline_matched")
                            continue

                    # Look for explanation block start
                    if text.lower().startswith("explanation:"):
                        current_q["explanation_parts"].append(text[12:].strip())
                        self._change_state(ParserState.READING_EXPLANATION, "explanation_header_matched")
                        continue

                    # Evaluate transitions
                    if self.state == ParserState.READING_QUESTION:
                        # Check if line matches option indicators
                        is_opt = False
                        for pat in self.strategy.get_option_patterns():
                            if self.strategy.safe_match(pat, text):
                                is_opt = True
                                break
                        if is_opt:
                            self._change_state(ParserState.READING_OPTIONS, "option_marker_matched")
                            current_q["option_lines"].append(text)
                        else:
                            current_q["question_parts"].append(text)

                    elif self.state == ParserState.READING_OPTIONS:
                        # Continue reading option lines
                        current_q["option_lines"].append(text)

                    elif self.state == ParserState.READING_EXPLANATION:
                        # Continue appending explanation block text
                        current_q["explanation_parts"].append(text)
                else:
                    # Ignore headers, ads, or instructions outside question boundaries
                    logger.debug(f"Ignoring block text outside active question bounds: {text[:40]}...")

            # Page transition state
            if self.state != ParserState.SEEKING_QUESTION:
                self._change_state(ParserState.PAGE_BREAK, "page_boundary_crossed")

        # Yield any remaining question block at EOF
        if current_q:
            pq = self._finalize_current_question(current_q)
            if pq:
                yield pq

        self._change_state(ParserState.FINISHED, "document_EOF")
        clear_context()
