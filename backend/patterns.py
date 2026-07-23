"""
Parser Engine Centralized Patterns Module
=========================================
Stores all compiled regular expression patterns grouped by parsing categories.
Includes a built-in unit test suite to validate pattern correctness.
"""

import re
import unittest
from typing import Pattern, Tuple, Optional

# -----------------------------------------------------------------------------
# 1. QUESTION START PATTERNS
# -----------------------------------------------------------------------------
# Standard CGL start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
SSC_CGL_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# Candidate response sheet start (mandatory Q. or Question prefix to prevent splitting on option markers like 1., 2.)
SSC_CANDIDATE_START_RE: Pattern[str] = re.compile(r"^(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?(?:\s+|$)")
# CHSL start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
SSC_CHSL_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# RRB start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
RRB_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# TSPSC start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
TSPSC_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# APPSC start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
APPSC_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# SI Police start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
SI_POLICE_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# TET start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
TET_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")
# DSC start: optional Q. with trailing dot/paren OR mandatory Q. with optional trailing dot/paren
DSC_START_RE: Pattern[str] = re.compile(r"^(?:(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]|(?:Q(?:uestion)?\.?\s*)(\d{1,3})[.)]?)(?:\s+|$)")

# Generic fallback question start pattern
GENERIC_START_RE: Pattern[str] = re.compile(
    r"^(?:(?:Q(?:uestion)?\s*\.?\s*)?(\d{1,3})[.\)-]|"
    r"Q(?:uestion)?\s*(\d{1,3})|"
    r"[\(\[](\d{1,3})[\)\]]|"
    r"([①-⑳])|"
    r"(?:Q(?:uestion)?\s*\.?\s*)?([IVXivx]+)[.\)-]|"
    r"[\(\[]([IVXivx]+)[\)\]]"
    r")(?:\s+|$)"
)

# -----------------------------------------------------------------------------
# 2. OPTION MARKER PATTERNS
# -----------------------------------------------------------------------------
# Matches parenthesis option markers like (a), (B), (1), (4), [a]
PAREN_OPTION_RE: Pattern[str] = re.compile(r"\(([a-eA-E1-5i-vI-V])\)|\[([a-eA-E1-5i-vI-V])\]")
# Matches dot option markers like A. or 1.
DOT_OPTION_RE: Pattern[str] = re.compile(r"\b([A-Ea-e1-5i-vI-V])[.)]\s+|\b(?:Option|Choice)\s+([A-Ea-e1-5i-vI-V])\b", re.IGNORECASE)
# Matches bare option markers at start of lines (Adda247 style: A. text)
BARE_OPTION_LINE_RE: Pattern[str] = re.compile(
    r"^([A-Ea-e1-5i-vI-V])[.\)]\s*(.*)$|"
    r"^([①-⑤])\s*(.*)$|"
    r"^(?:Option|Choice)\s+([A-Ea-e1-5i-vI-V])[.\):]?\s*(.*)$", 
    re.IGNORECASE
)

# -----------------------------------------------------------------------------
# 3. ANSWER KEY & SOLUTIONS PATTERNS
# -----------------------------------------------------------------------------
# Inline correct answers embedded inside question text
EMBEDDED_ANSWER_RE: Pattern[str] = re.compile(
    r"\bAnswer\s*:\s*\(?([A-Ea-e])\)?|\bAns\.\s*\(?([A-Ea-e])\)?", re.IGNORECASE
)
# Chosen Option in candidate response sheet metadata
CHOSEN_OPTION_RE: Pattern[str] = re.compile(r"Chosen\s+Option\s*:\s*([1-5])", re.IGNORECASE)
# Divider pattern locating the start of a Solutions / Answer Key block at end of PDF
SOLUTIONS_BLOCK_RE: Pattern[str] = re.compile(
    r"\n+(?:Solutions|Answer\s+Key|Answers\s+Key|Ans\.)\b|\n+Answers?\s*\n+", re.IGNORECASE
)
# Matches individual entries inside a Solutions block: e.g. "21. Ans.(B) explanation"
SOLUTION_ITEM_RE: Pattern[str] = re.compile(
    r"S?(\d+)\.\s*(?:Ans\.\((\w)\)|Ans\.\s*\((\w)\)|Answer\s*:\s*(\w))\s*(.*?)(?=(?:S?\d+\.\s*(?:Ans\.|Answer))|$)",
    re.DOTALL | re.IGNORECASE
)

# -----------------------------------------------------------------------------
# 4. PUBLISHER SIGNATURE PATTERNS
# -----------------------------------------------------------------------------
ADDA247_SIGNATURE_RE: Pattern[str] = re.compile(r"adda247|bankersadda|sscadda|careerpower", re.IGNORECASE)
CRACKU_SIGNATURE_RE: Pattern[str] = re.compile(r"cracku", re.IGNORECASE)
TSPSC_SIGNATURE_RE: Pattern[str] = re.compile(r"tspsc|telangana\s+state\s+public\s+service", re.IGNORECASE)
APPSC_SIGNATURE_RE: Pattern[str] = re.compile(r"appsc|andhra\s+pradesh\s+public\s+service", re.IGNORECASE)

# -----------------------------------------------------------------------------
# 5. SECTION HEADER PATTERNS
# -----------------------------------------------------------------------------
SECTION_MATHS_RE: Pattern[str] = re.compile(r"mathematics|arithmetic|numerical|maths|quantitative", re.IGNORECASE)
SECTION_REASONING_RE: Pattern[str] = re.compile(r"general\s+intelligence|reasoning|mental\s+ability", re.IGNORECASE)
SECTION_SCIENCE_RE: Pattern[str] = re.compile(r"general\s+science|physics|chemistry|biology", re.IGNORECASE)
SECTION_GA_RE: Pattern[str] = re.compile(r"general\s+awareness|gk|general\s+knowledge|current\s+affairs|general\s+studies", re.IGNORECASE)
SECTION_ENGLISH_RE: Pattern[str] = re.compile(r"english", re.IGNORECASE)

# -----------------------------------------------------------------------------
# 6. HEADERS, FOOTERS & PAGE NUMBERS
# -----------------------------------------------------------------------------
# Matches page numbers like "Page 3 of 15" or "12 / 24"
PAGE_NUMBER_RE: Pattern[str] = re.compile(r"^\s*(?:page\s*)?\d+\s*(?:of|/)\s*\d+\s*$|^\s*\d+\s*$", re.IGNORECASE)
# Commercial advertising headers to strip
HEADER_AD_RE: Pattern[str] = re.compile(r"www\.bankersadda\.com|Downloaded\s+from\s+cracku\.in", re.IGNORECASE)

# -----------------------------------------------------------------------------
# 7. CONTEXT / DIRECTIONS TRIGGER PATTERNS
# -----------------------------------------------------------------------------
COMMON_CONTEXT_TRIGGER_RE: Pattern[str] = re.compile(
    r"^(directions?\b|read the (following )?passage|cloze test|"
    r"rearrange the (following )?sentences?|arrange the (following )?sentences?|"
    r"parts of the (following )?sentence|sentence improvement|"
    r"study the following|consider the following statements?)", re.IGNORECASE
)


def match_bare_option(text: str) -> Optional[Tuple[str, str]]:
    m = BARE_OPTION_LINE_RE.match(text)
    if not m:
        return None
    opt_id = m.group(1) or m.group(3) or m.group(5)
    opt_text = m.group(2) or m.group(4) or m.group(6)
    if opt_id:
        return opt_id, (opt_text.strip() if opt_text else "")
    return None


# -----------------------------------------------------------------------------
# UNIT TESTS FOR REGEX PATTERN VALIDATION
# -----------------------------------------------------------------------------
class TestRegexPatterns(unittest.TestCase):
    """Unit tests validating regex parsing boundaries on standard exam strings."""

    def test_question_starts(self) -> None:
        # Match Q.1 (optional trailing dot)
        m1 = SSC_CGL_START_RE.match("Q.1 Which of the...")
        self.assertIsNotNone(m1)
        self.assertEqual(m1.group(1) or m1.group(2), "1")
        
        # Match 23. (mandatory trailing dot)
        m2 = SSC_CGL_START_RE.match("23. Three numbers...")
        self.assertIsNotNone(m2)
        self.assertEqual(m2.group(1) or m2.group(2), "23")
        
        # Match Q.45 (trailing space, no trailing dot)
        m3 = RRB_START_RE.match("Q.45 ")
        self.assertIsNotNone(m3)
        self.assertEqual(m3.group(1) or m3.group(2), "45")

        # Plain numbers with no trailing dot/paren should NOT match
        self.assertIsNone(GENERIC_START_RE.match("45 "))
        self.assertIsNone(GENERIC_START_RE.match("125"))
        
    def test_option_markers(self) -> None:
        self.assertTrue(PAREN_OPTION_RE.fullmatch("(a)"))
        self.assertTrue(PAREN_OPTION_RE.fullmatch("(D)"))
        self.assertTrue(DOT_OPTION_RE.search("A. 23 "))
        self.assertTrue(BARE_OPTION_LINE_RE.match("A. Rs. 1400"))

    def test_answer_keys(self) -> None:
        ans1 = EMBEDDED_ANSWER_RE.search("Correct Ans. (b)")
        self.assertIsNotNone(ans1)
        self.assertEqual(ans1.group(1) or ans1.group(2), "b")
        
        chosen = CHOSEN_OPTION_RE.search("Chosen Option : 3")
        self.assertIsNotNone(chosen)
        self.assertEqual(chosen.group(1), "3")

    def test_section_headers(self) -> None:
        self.assertTrue(SECTION_MATHS_RE.search("Section : Quantitative Aptitude"))
        self.assertTrue(SECTION_REASONING_RE.search("General Intelligence and Reasoning"))

    def test_context_triggers(self) -> None:
        self.assertTrue(COMMON_CONTEXT_TRIGGER_RE.match("Directions (1-5): Read the passage..."))
        self.assertTrue(COMMON_CONTEXT_TRIGGER_RE.match("Consider the following statements:"))


if __name__ == "__main__":
    unittest.main()
