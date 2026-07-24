import os
import sys
import json
import hashlib
import shutil
import re
from pymongo import MongoClient

def get_legacy_category(exam_type):
    exam_lower = str(exam_type).lower()
    if "ssc" in exam_lower or "sc_gd" in exam_lower or "sc_cgl" in exam_lower or "chsl" in exam_lower:
        return "SSC Exams"
    elif "rrb" in exam_lower or "rail" in exam_lower:
        return "RRB & Railways"
    elif "appsc" in exam_lower or "tspsc" in exam_lower or "state" in exam_lower:
        return "State Exams"
    elif "neet" in exam_lower or "jee" in exam_lower:
        return "NEET / JEE"
    elif "upsc" in exam_lower or "civil" in exam_lower:
        return "UPSC / Civil"
    else:
        return "Bank & Insurance"

def get_cbt_exam_type(category):
    if category == "SSC Exams":
        return "SSC"
    elif category == "RRB & Railways":
        return "RRB"
    elif category == "State Exams":
        return "APPSC Groups"
    elif category == "UPSC / Civil":
        return "UPSC"
    elif category == "NEET / JEE":
        return "NEET / JEE"
    else:
        return "Banking"

def map_filename_to_subtype(filename):
    name = os.path.splitext(filename)[0]
    
    m = re.match(r'sbi_?po_test_(\d+)', name, re.IGNORECASE)
    if m: return f"SBI PO Prelims - Test {m.group(1)}"
    
    m = re.match(r'sbi_?clerk_test_(\d+)', name, re.IGNORECASE)
    if m: return f"SBI Clerk Prelims - Test {m.group(1)}"
    
    m = re.match(r'ibps_?po_test_(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS PO Prelims - Test {m.group(1)}"
    
    m = re.match(r'ibps_?clerk_(?:prelims_)?test_?(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS Clerk Prelims - Test {m.group(1)}"

    
    m = re.match(r'sc_cgl_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CGL Prelims - Test {m.group(1)}"
    
    m = re.match(r'ssc_cgl_mains_test(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CGL Mains - Test {m.group(1)}"
    
    m = re.match(r'ssc_chsl_tier1_paper(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CHSL Prelims - Test {m.group(1)}"
    
    m = re.match(r'ssc_chsl_tier2_paper(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CHSL Mains - Test {m.group(1)}"
    
    m = re.match(r'rrb_ntpc_cbt2_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"RRB NTPC CBT 2 - Test {m.group(1)}"
    
    m = re.match(r'rrb_gd_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"RRB GD - Test {m.group(1)}"
    
    m = re.match(r'rrb_clerk_paper(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS RRB Clerk Prelims - Test {m.group(1)}"
    
    m = re.match(r'rrb_po_prelims_paper(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS RRB PO Prelims - Test {m.group(1)}"
    
    m = re.match(r'ssc_gd_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"SSC GD Constable Prelims - Test {m.group(1)}"
    
    if name.lower() == "rrb-cbt-test-1":
        return "RRB CBT - Test 1"
        
    m = re.match(r'RRB-NTPC-UG-Question-Paper-(.*?)-Shift-(\d+)-exam', name, re.IGNORECASE)
    if m:
        date_part = m.group(1).replace('-', ' ')
        return f"RRB NTPC UG - {date_part} Shift {m.group(2)}"
        
    return name.replace('_', ' ').replace('-', ' ').title()


def get_standardized_subject(exam_type, sub_type_val, q_id, original_subject):
    # 0. If original subject is present and valid, prioritize, normalize and return it!
    if original_subject:
        subj = str(original_subject).strip()
        subj_lower = subj.lower()
        if subj_lower not in {"", "general", "default", "none", "unknown", "subject"}:
            if "math" in subj_lower or "quant" in subj_lower or "arithmetic" in subj_lower or "numerical" in subj_lower:
                return "Quantitative Aptitude"
            if "reason" in subj_lower or "intelligence" in subj_lower or "mental" in subj_lower:
                return "Reasoning Ability"
            if "english" in subj_lower or "verbal" in subj_lower or "comprehension" in subj_lower or "lang" in subj_lower:
                return "English Language"
            if "aware" in subj_lower or "general" in subj_lower or "science" in subj_lower or "current" in subj_lower or "gk" in subj_lower:
                return "General Awareness"
            return subj

    exam_lower = str(exam_type).lower()
    sub_lower = str(sub_type_val).lower()
    try:
        q_num = int(q_id)
    except:
        q_num = 1
    
    # 0. RRB PO and RRB Clerk Prelims mock tests (80 questions: Q1-40 Reasoning, Q41-80 Quant)
    if "rrb po" in sub_lower or "rrb clerk" in sub_lower:
        if "mains" not in sub_lower and "main" not in sub_lower:
            if q_num <= 40:
                return "Reasoning Ability"
            else:
                return "Quantitative Aptitude"

    # 1. Standard Banking Prelims mock tests (100 questions)
    if "bank" in exam_lower or "sbi" in sub_lower or "ibps" in sub_lower:
        if "mains" not in sub_lower and "main" not in sub_lower:
            if "sbi po" in sub_lower:
                if q_num <= 40:
                    return "English Language"
                elif q_num <= 70:
                    return "Quantitative Aptitude"
                else:
                    return "Reasoning Ability"
            else:
                if q_num <= 30:
                    return "English Language"
                elif q_num <= 65:
                    return "Quantitative Aptitude"
                else:
                    return "Reasoning Ability"
                
    # 2. Standard SSC Prelims/Tier 1 mock tests (100 questions)
    if "ssc" in exam_lower or "cgl prelims" in sub_lower or "chsl prelims" in sub_lower or "chsl tier 1" in sub_lower:
        if "mains" not in sub_lower and "tier 2" not in sub_lower:
            if q_num <= 25:
                return "Reasoning Ability"
            elif q_num <= 50:
                return "General Awareness"
            elif q_num <= 75:
                return "Quantitative Aptitude"
            else:
                return "English Language"
                
    # Otherwise return original subject (cleaned)
    if original_subject:
        subj = str(original_subject).strip()
        subj_lower = subj.lower()
        if "math" in subj_lower or "quant" in subj_lower or "arithmetic" in subj_lower:
            return "Quantitative Aptitude"
        if "reason" in subj_lower or "intelligence" in subj_lower or "mental" in subj_lower:
            return "Reasoning Ability"
        if "english" in subj_lower or "verbal" in subj_lower or "comprehension" in subj_lower or "lang" in subj_lower:
            return "English Language"
        if "aware" in subj_lower or "general" in subj_lower or "science" in subj_lower:
            return "General Awareness"
        return subj
        
    return "General"

def clean_text(text):
    if not text:
        return ""
    fixed = str(text)
    # Correct common merged words from PDF OCR / ingestion issues
    fixed = re.sub(r'\bIfthe\b', 'If the', fixed)
    fixed = re.sub(r'\bofasphere\b', 'of a sphere', fixed)
    fixed = re.sub(r'\bfindthe\b', 'find the', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bvalueof\b', 'value of', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\beachof\b', 'each of', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bfitin\b', 'fit in', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bwhatis\b', 'what is', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bquestions?\b', 'question', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bnumberof\b', 'number of', fixed, flags=re.IGNORECASE)
    
    # Fix spaces around alphanumeric boundaries: e.g. "56cm" -> "56 cm", "sphere56" -> "sphere 56"
    fixed = re.sub(r'([a-zA-Z]+)([0-9]+)', r'\1 \2', fixed)
    fixed = re.sub(r'([0-9]+)([a-zA-Z]+)', r'\1 \2', fixed)
    # Double spaces to single spaces
    fixed = re.sub(r'[ ]{2,}', ' ', fixed)
    return fixed

# Helper to find matching closing parenthesis/brace, supporting nested structures
def get_nested_content(text, start_idx):
    if start_idx >= len(text):
        return "", start_idx
    open_char = text[start_idx]
    if open_char not in ('(', '{', '['):
        return "", start_idx
    
    close_char = ')' if open_char == '(' else ('}' if open_char == '{' else ']')
    depth = 0
    for idx in range(start_idx, len(text)):
        if text[idx] == open_char:
            depth += 1
        elif text[idx] == close_char:
            depth -= 1
            if depth == 0:
                return text[start_idx+1:idx], idx
    return text[start_idx+1:], len(text)

def normalize_unicode(text):
    # Mapping greek letters
    text = text.replace("α", "\\alpha")
    text = text.replace("β", "\\beta")
    text = text.replace("γ", "\\gamma")
    text = text.replace("θ", "\\theta")
    text = text.replace("λ", "\\lambda")
    text = text.replace("μ", "\\mu")
    text = text.replace("σ", "\\sigma")
    text = text.replace("Δ", "\\Delta")
    text = text.replace("Ω", "\\Omega")
    
    # Operators and mathematical constants
    text = text.replace("√", "\\sqrt")
    text = text.replace("π", "\\pi")
    text = text.replace("∑", "\\sum")
    text = text.replace("∫", "\\int")
    text = text.replace("≤", "\\le")
    text = text.replace("≥", "\\ge")
    text = text.replace("×", "\\times")
    text = text.replace("÷", "\\div")
    text = text.replace("°", "^\\circ")
    text = text.replace("∞", "\\infty")
    text = text.replace("≈", "\\approx")
    text = text.replace("≠", "\\ne")
    text = text.replace("±", "\\pm")
    text = text.replace("∝", "\\propto")
    text = text.replace("∈", "\\in")
    text = text.replace("∉", "\\notin")
    text = text.replace("⊂", "\\subset")
    text = text.replace("⊆", "\\subseteq")
    text = text.replace("⇒", "\\Rightarrow")
    text = text.replace("→", "\\rightarrow")
    text = text.replace("↔", "\\leftrightarrow")
    
    # Superscripts
    text = text.replace("¹", "^1")
    text = text.replace("²", "^2")
    text = text.replace("³", "^3")
    
    # Subscripts
    text = text.replace("₁", "_1")
    text = text.replace("₂", "_2")
    text = text.replace("₃", "_3")
    
    return text

def normalize_math_commands(text):
    # Normalize command prefixes missing backslashes
    text = re.sub(r'(?<!\\)sqrt', r'\\sqrt', text)
    text = re.sub(r'(?<!\\)frac', r'\\frac', text)
    text = re.sub(r'\b(?<!\\)pi\b', r'\\pi', text)
    text = re.sub(r'\b(?<!\\)sum\b', r'\\sum', text)
    text = re.sub(r'\b(?<!\\)int\b', r'\\int', text)
    text = re.sub(r'\b(?<!\\)le\b', r'\\le', text)
    text = re.sub(r'\b(?<!\\)ge\b', r'\\ge', text)
    text = re.sub(r'\b(?<!\\)sin\b', r'\\sin', text)
    text = re.sub(r'\b(?<!\\)cos\b', r'\\cos', text)
    text = re.sub(r'\b(?<!\\)tan\b', r'\\tan', text)
    text = re.sub(r'\b(?<!\\)log\b', r'\\log', text)
    text = re.sub(r'\b(?<!\\)ln\b', r'\\ln', text)
    return text

def normalize_roots_recursive(text):
    idx = 0
    while True:
        match = re.search(r'\\sqrt', text[idx:])
        if not match:
            break
        
        start_pos = idx + match.start()
        arg_start = start_pos + 5
        
        while arg_start < len(text) and text[arg_start].isspace():
            arg_start += 1
            
        if arg_start >= len(text):
            break
            
        if text[arg_start] in ('(', '{', '['):
            content, end_pos = get_nested_content(text, arg_start)
            normalized_content = normalize_roots_recursive(content)
            text = text[:start_pos] + f"\\sqrt{{{normalized_content}}}" + text[end_pos+1:]
            idx = start_pos + len(normalized_content) + 7
        elif text[arg_start].isdigit():
            digits_match = re.match(r'\d+', text[arg_start:])
            digits = digits_match.group(0)
            text = text[:start_pos] + f"\\sqrt{{{digits}}}" + text[arg_start + len(digits):]
            idx = start_pos + len(digits) + 7
        elif text[arg_start].isalpha():
            letter = text[arg_start]
            text = text[:start_pos] + f"\\sqrt{{{letter}}}" + text[arg_start + 1:]
            idx = start_pos + 8
        else:
            idx = arg_start
            
    return text

def normalize_fractions_recursive(text):
    idx = 0
    while True:
        match = re.search(r'\\frac', text[idx:])
        if not match:
            break
            
        start_pos = idx + match.start()
        num_start = start_pos + 5
        
        while num_start < len(text) and text[num_start].isspace():
            num_start += 1
            
        if num_start >= len(text):
            break
            
        num_content = ""
        den_start = num_start
        
        if text[num_start] in ('(', '{', '['):
            num_content, end_num = get_nested_content(text, num_start)
            den_start = end_num + 1
        elif text[num_start].isdigit() and (num_start + 1 < len(text) and text[num_start+1].isdigit()):
            digits_match = re.match(r'\d+', text[num_start:])
            digits = digits_match.group(0)
            if len(digits) == 2:
                num_content = digits[0]
                den_content = digits[1]
                text = text[:start_pos] + f"\\frac{{{num_content}}}{{{den_content}}}" + text[num_start + 2:]
                idx = start_pos + 13
                continue
            else:
                idx = num_start + len(digits)
                continue
        elif text[num_start].isdigit():
            num_content = text[num_start]
            den_start = num_start + 1
        else:
            idx = num_start
            continue
            
        while den_start < len(text) and text[den_start].isspace():
            den_start += 1
            
        if den_start >= len(text):
            break
            
        den_content = ""
        end_den = den_start
        
        if text[den_start] in ('(', '{', '['):
            den_content, end_den = get_nested_content(text, den_start)
            num_normalized = normalize_fractions_recursive(num_content)
            den_normalized = normalize_fractions_recursive(den_content)
            text = text[:start_pos] + f"\\frac{{{num_normalized}}}{{{den_normalized}}}" + text[end_den+1:]
            idx = start_pos + len(num_normalized) + len(den_normalized) + 15
        elif text[den_start].isdigit():
            den_content = text[den_start]
            num_normalized = normalize_fractions_recursive(num_content)
            text = text[:start_pos] + f"\\frac{{{num_normalized}}}{{{den_content}}}" + text[den_start+1:]
            idx = start_pos + len(num_normalized) + 14
        else:
            idx = den_start
            
    def replace_slash_fraction(match):
        num = match.group(1)
        den = match.group(2)
        if len(num) > 2 and len(den) > 2:
            return match.group(0)
        return f"\\frac{{{num}}}{{{den}}}"
        
    text = re.sub(r'(?<![\d/])(\d+)/(\d+)(?![\d/])', replace_slash_fraction, text)
    return text

def wrap_latex_commands(text):
    idx = 0
    while idx < len(text):
        match = re.search(r'\\(sqrt|frac|pi|sum|int|le|ge|times|div|sin|cos|tan|log|ln|alpha|beta|gamma|theta|lambda|mu|sigma|Delta|Omega|infty|approx|ne|pm|propto|subset|subseteq|Rightarrow|rightarrow|leftrightarrow)\b', text[idx:])
        if not match:
            break
            
        start_pos = idx + match.start()
        cmd = match.group(1)
        curr = start_pos + len(cmd) + 1
        
        if cmd == 'sqrt':
            while curr < len(text) and text[curr].isspace():
                curr += 1
            if curr < len(text) and text[curr] == '{':
                _, end_pos = get_nested_content(text, curr)
                curr = end_pos + 1
        elif cmd == 'frac':
            while curr < len(text) and text[curr].isspace():
                curr += 1
            if curr < len(text) and text[curr] == '{':
                _, end_pos = get_nested_content(text, curr)
                curr = end_pos + 1
            while curr < len(text) and text[curr].isspace():
                curr += 1
            if curr < len(text) and text[curr] == '{':
                _, end_pos = get_nested_content(text, curr)
                curr = end_pos + 1
                
        matched_str = text[start_pos:curr].replace('$', '')
        text = text[:start_pos] + f"${matched_str}$" + text[curr:]
        idx = start_pos + len(matched_str) + 3
        
    return text


def merge_adjacent_math_blocks(text):
    if not text:
        return ""
        
    # Split by unescaped dollar signs
    parts = re.split(r'(?<!\\)\$', text)
    if len(parts) < 3:
        return text # No math blocks or only one block
        
    merged_parts = [parts[0]]
    idx = 1
    while idx < len(parts) - 1:
        if idx + 2 >= len(parts):
            # No more blocks to merge, append remaining
            merged_parts.append(parts[idx])
            idx += 1
            break
            
        current_math = parts[idx]
        gap = parts[idx + 1]
        next_math = parts[idx + 2]
        
        # Check if the gap is "math-like" and should be merged
        is_math_gap = False
        clean_gap = gap.strip()
        
        if not clean_gap:
            is_math_gap = True
        else:
            # Check if it has any normal non-math words
            words = re.findall(r'[a-zA-Z]+', clean_gap)
            all_words_math_like = True
            for w in words:
                if w.lower() not in ('of', 'and', 'to', 'is', 'are', 'times', 'div', 'text', 'sum', 'ge', 'le'):
                    all_words_math_like = False
                    break
            
            if all_words_math_like and len(clean_gap) < 20:
                is_math_gap = True
                
        if is_math_gap:
            combined = current_math + gap + next_math
            parts[idx + 2] = combined
            idx += 2
        else:
            merged_parts.append(current_math)
            merged_parts.append(gap)
            idx += 2
            
    # Append the last part if we didn't finish via break
    if idx < len(parts):
        merged_parts.append(parts[-1])
        
    # Reconstruct the string with dollar signs
    reconstructed = ""
    for i, p in enumerate(merged_parts):
        if i > 0:
            reconstructed += "$"
        reconstructed += p
        
    # Clean up empty math blocks like $$ or $$$ at the end of the text
    reconstructed = re.sub(r'(?<!\\)\$\$\$+$', r'$', reconstructed)
    reconstructed = re.sub(r'(?<!\\)\$\$$', r'', reconstructed)
    
    # Fix unbalanced parenthesis in math blocks (e.g. $7 \times 5 - 8)$ -> $(7 \times 5 - 8)$)
    def balance_parentheses(match):
        m = match.group(0)
        open_count = m.count('(')
        close_count = m.count(')')
        if close_count > open_count:
            content = m[1:-1]
            idx = 0
            while idx < len(content) and content[idx].isspace():
                idx += 1
            content = content[:idx] + '(' + content[idx:]
            return f"${content}$"
        return m
        
    reconstructed = re.sub(r'(?<!\\)\$.*?(?<!\\)\$', balance_parentheses, reconstructed)
    
    return reconstructed


def to_latex(text):
    if not text:
        return ""
    text = merge_adjacent_math_blocks(text)

    # Clean unescaped dollar signs inside LaTeX math blocks
    parts = []
    idx = 0
    while idx < len(text):
        open_idx = text.find("\\(", idx)
        open_bracket_idx = text.find("\\[", idx)
        
        first_open = -1
        close_delim = ""
        if open_idx != -1 and (open_bracket_idx == -1 or open_idx < open_bracket_idx):
            first_open = open_idx
            close_delim = "\\)"
        elif open_bracket_idx != -1:
            first_open = open_bracket_idx
            close_delim = "\\]"
            
        if first_open == -1:
            parts.append(text[idx:])
            break
            
        parts.append(text[idx:first_open])
        
        close_idx = text.find(close_delim, first_open + 2)
        if close_idx == -1:
            block_content = text[first_open:].replace('$', '')
            parts.append(block_content)
            break
            
        block_content = text[first_open:close_idx + 2].replace('$', '')
        parts.append(block_content)
        idx = close_idx + 2
        
    text = "".join(parts)
    
    
    # Phase 0: Delimiter Normalization (Convert escaped and parenthesis OCR math delimiters to $)
    text = re.sub(r'\\\$[\s*([{\s]*', r'$', text)
    text = re.sub(r'\\\([\s*([{\s]*', r'$', text)
    text = re.sub(r'[\s*)[\]}\s]*\\\$', r'$', text)
    text = re.sub(r'[\s*)[\]}\s]*\\\)', r'$', text)
    
    text = clean_text(str(text))
        
    # Phase 1: LaTeX Block Protection (Negative lookbehind avoids escaped dollar signs)
    math_blocks = []
    def protect_math(match):
        placeholder = f"MATHBLOCK{len(math_blocks)}"
        math_blocks.append(match.group(0))
        return placeholder
        
    processed = re.sub(r'(?<!\\)\$\$[\s\S]*?(?<!\\)\$\$', protect_math, text)
    processed = re.sub(r'(?<!\\)\$[\s\S]*?(?<!\\)\$', protect_math, processed)
    
    currency_blocks = []
    def protect_currency(match):
        placeholder = f"CURRENCYBLOCK{len(currency_blocks)}"
        currency_blocks.append(match.group(0))
        return placeholder
    processed = re.sub(r'\$\s*\d+(?:\.\d+)?\b', protect_currency, processed)
    
    # Phase 2: Unicode & Command Normalizations
    processed = normalize_unicode(processed)
    processed = normalize_math_commands(processed)
    
    # Phase 3: Recursive Roots and Fractions Normalization
    processed = normalize_roots_recursive(processed)
    processed = normalize_fractions_recursive(processed)
    
    # Phase 4: Wrap newly created commands in math delimiters recursively
    processed = wrap_latex_commands(processed)
    
    # Wrap standalone variable super/subscripts (only outside math blocks)
    parts = processed.split('$')
    for i in range(len(parts)):
        if i % 2 == 0: # Outside math blocks
            part = parts[i]
            
            def wrap_match(match):
                m = match.group(0)
                return f"${m}$"
                
            part = re.sub(r'\b([a-zA-Z])\^(\{?[a-zA-Z0-9+\-*=]+\}?)', wrap_match, part)
            part = re.sub(r'\b([a-zA-Z])_(\{?[a-zA-Z0-9+\-*=]+\}?)', wrap_match, part)
            part = re.sub(r'(\([^)]+\))\^(\{?[a-zA-Z0-9+\-*=]+\}?)', wrap_match, part)
            part = re.sub(r'(\([^)]+\))_(\{?[a-zA-Z0-9+\-*=]+\}?)', wrap_match, part)
            part = re.sub(r'(\^\s*\\circ)\b', wrap_match, part)
            
            part = re.sub(r'\$$', '', part)
            part = re.sub(r'\$\$+', '$', part)
            parts[i] = part
            
    processed = '$'.join(parts)
    processed = re.sub(r'\$\$+', '$', processed)
    
    # Phase 5: Restore Protected blocks
    for idx, block in enumerate(currency_blocks):
        escaped_currency = block.replace("$", "\\$")
        processed = processed.replace(f"CURRENCYBLOCK{idx}", escaped_currency)
        
    for idx, block in enumerate(math_blocks):
        processed = processed.replace(f"MATHBLOCK{idx}", block)
        
    # Auto-close uneven dollars
    unescaped_dollars = len(re.findall(r'(?<!\\)\$', processed))
    if unescaped_dollars % 2 != 0:
        processed += '$'
        
    return processed


def find_actual_image_path(ref_path, base_images_dir):
    if not ref_path:
        return ""
    
    ref_path = ref_path.replace('\\', '/')
    parts = ref_path.split('/')
    filename = parts[-1]
    folder = parts[-2] if len(parts) > 1 else ""
    
    # Direct match check
    target_absolute = os.path.join(base_images_dir, ref_path)
    if os.path.exists(target_absolute):
        return ref_path
        
    # Search recursively for smart matching
    for root, dirs, files in os.walk(base_images_dir):
        root_clean = os.path.basename(root)
        if folder and root_clean.lower() != folder.lower():
            continue
            
        for f in files:
            if f.lower() == filename.lower():
                return os.path.relpath(os.path.join(root, f), base_images_dir).replace('\\', '/')
            
            # diagram / table fallback
            alt_f = filename.replace('diagram', 'table').replace('table', 'diagram').replace('image', 'diagram')
            if f.lower() == alt_f.lower():
                return os.path.relpath(os.path.join(root, f), base_images_dir).replace('\\', '/')
                
            # prefix fallback (e.g. dir_36_40)
            stem = os.path.splitext(filename)[0]
            if '_' in stem:
                parts_stem = stem.split('_')
                if len(parts_stem) > 2 and parts_stem[0] == 'dir':
                    prefix = '_'.join(parts_stem[:3])
                    if f.lower().startswith(prefix.lower()):
                        return os.path.relpath(os.path.join(root, f), base_images_dir).replace('\\', '/')
                        
    return ref_path

def copy_images(src_dir, dest_dir):
    print(f"Copying images from {src_dir} to {dest_dir}...")
    if not os.path.exists(src_dir):
        print(f"Source uploads images directory not found at {src_dir}")
        return
        
    os.makedirs(dest_dir, exist_ok=True)
    
    for item in os.listdir(src_dir):
        s = os.path.join(src_dir, item)
        d = os.path.join(dest_dir, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
            print(f" Copied folder: {item}")
        else:
            shutil.copy2(s, d)
            print(f" Copied file: {item}")

def clean_option_text(text, index):
    if not text:
        return ""
    text_str = str(text).strip()
    
    label_char = chr(65 + index) # 'A', 'B', etc.
    patterns = [
        r'^\(' + label_char + r'\)\s*',
        r'^\(' + label_char.lower() + r'\)\s*',
        r'^\[?' + label_char + r'\]\s*',
        r'^\[?' + label_char.lower() + r'\]\s*',
        r'^Option\s+' + label_char + r'\b\s*[\.\:\-\s]*\s*',
        r'^Option\s+' + label_char.lower() + r'\b\s*[\.\:\-\s]*\s*',
        r'^' + label_char + r'\s*[\.\)\]\-]\s*',
        r'^' + label_char.lower() + r'\s*[\.\)\]\-]\s*',
        r'^' + label_char + r'\s+',
        r'^' + label_char.lower() + r'\s+',
    ]
    
    for pat in patterns:
        match = re.match(pat, text_str)
        if match:
            remaining = text_str[match.end():].strip()
            if remaining:
                return remaining
    return text_str

def import_all_papers(json_dir, images_dir, mongo_uri, db_name="kr_academy"):
    if not os.path.exists(json_dir):
        print(f"Error: JSON directory not found at {json_dir}")
        sys.exit(1)

    print("Connecting to MongoDB...")
    try:
        client = MongoClient(mongo_uri)
        db = client[db_name]
        questions_col = db["questions"]
        print("Clearing questions collection for a clean import...")
        questions_col.delete_many({})
        
        # Drop existing indexes to prevent IndexKeySpecsConflict
        try:
            questions_col.drop_index("unique_id_1")
        except Exception:
            pass
        try:
            questions_col.drop_index("content_hash_1")
        except Exception:
            pass
            
        questions_col.create_index("unique_id", unique=True)
        questions_col.create_index("content_hash")
    except Exception as e:
        print(f"Database connection error: {e}")
        sys.exit(1)

    all_json_files = []
    for root, dirs, files in os.walk(json_dir):
        for file in files:
            if file.endswith(".json"):
                all_json_files.append(os.path.join(root, file))

    print(f"Found {len(all_json_files)} JSON files to process.")

    total_success = 0
    total_duplicate = 0
    total_error = 0
    docs_to_insert = []

    for filepath in all_json_files:
        filename = os.path.basename(filepath)
        folder = os.path.basename(os.path.dirname(filepath))
        sub_type_val = map_filename_to_subtype(filename)
        print(f"\nProcessing {filename} -> mapped to subtype: '{sub_type_val}'")
        
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                questions_list = json.load(f)
            except Exception as e:
                print(f"  Error parsing {filename}: {e}")
                total_error += 1
                continue

        if not isinstance(questions_list, list):
            print(f"  Skipping {filename}: Root is not a list")
            total_error += 1
            continue

        # Apply LaTeX conversions and save back to disk
        modified = False
        for q in questions_list:
            # Check question
            old_q = q.get("question", "") or ""
            new_q = to_latex(old_q)
            if old_q != new_q:
                q["question"] = new_q
                modified = True
                
            # Check explanation
            old_exp = q.get("explanation", "") or ""
            new_exp = to_latex(old_exp)
            if old_exp != new_exp:
                q["explanation"] = new_exp
                modified = True
                
            # Check options
            options = q.get("options", [])
            for opt in options:
                if isinstance(opt, dict):
                    old_text = opt.get("text", "") or ""
                    new_text = to_latex(old_text)
                    if old_text != new_text:
                        opt["text"] = new_text
                        modified = True

        if modified:
            try:
                with open(filepath, "w", encoding="utf-8") as fw:
                    json.dump(questions_list, fw, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"  Warning: failed to write updated JSON back to disk: {e}")

        for idx, q in enumerate(questions_list):
            try:
                q_id = q.get("id")
                exam = q.get("exam")
                if not exam or str(exam).lower() == "general":
                    exam = folder
                year = q.get("year", 2025)
                original_subject = q.get("subject")
                subject = get_standardized_subject(exam, sub_type_val, q_id, original_subject)
                question_text = q.get("question", "") or ""
                direction = q.get("direction", "") or ""
                question_image_ref = q.get("questionImage") or q.get("question_image", "") or ""
                correct_ans = q.get("correctAnswer") or q.get("correct_answer")
                options = q.get("options", [])

                has_question_content = bool(str(question_text).strip() or str(direction).strip() or str(question_image_ref).strip())

                # Validation checks
                if not q_id or not subject or not has_question_content or not correct_ans or len(options) < 2:
                    print(f"  Skipping Q index {idx}: Missing critical fields (id: {q_id}, subject: {subject}, has_content: {has_question_content}, correct_ans: {correct_ans}, options: {len(options)})")
                    total_error += 1
                    continue

                full_question_text = to_latex(question_text)
                normalized_direction = to_latex(direction)
                
                # Uniqueness enhancement: include sub_type (test name) to prevent collision
                clean_exam = "".join(c for c in str(exam) if c.isalnum()).upper()
                clean_subject = "".join(c for c in str(subject) if c.isalnum()).upper()
                clean_sub_type = "".join(c for c in str(sub_type_val) if c.isalnum()).upper()
                unique_id = f"{clean_exam}_{clean_sub_type}_{year}_{clean_subject}_Q{q_id}"

                # Option mapping and content hashing
                mapped_options = [clean_option_text(opt.get("text", "") or "", opt_idx) for opt_idx, opt in enumerate(options)]
                normalized_options = [to_latex(opt) for opt in mapped_options]
                raw_options_str = "".join([str(opt.get("text", "") or "") for opt in options])
                raw_content = (question_text or "") + raw_options_str
                content_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()[:16]

                # Correct option index mapping
                opt_letter = str(correct_ans).strip().upper()
                correct_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
                correct_idx = correct_map.get(opt_letter, 0)

                legacy_category = get_legacy_category(exam)
                cbt_exam_type = get_cbt_exam_type(legacy_category)

                # Smart image matching on disk
                resolved_question_image = find_actual_image_path(question_image_ref, images_dir)
                
                resolved_option_images = []
                json_option_images = q.get("option_images") or q.get("optionImages") or []
                for opt_idx, opt in enumerate(options):
                    opt_image_ref = opt.get("image", "") or "" if isinstance(opt, dict) else ""
                    if not opt_image_ref and opt_idx < len(json_option_images):
                        opt_image_ref = json_option_images[opt_idx] or ""
                    resolved_opt_img = find_actual_image_path(opt_image_ref, images_dir)
                    resolved_option_images.append(resolved_opt_img)

                # Format Explanation Images to resolve correctly
                raw_explanation = q.get("explanation", "") or ""
                explanation = to_latex(raw_explanation)
                def replace_md_image(match):
                    title = match.group(1)
                    img_path = match.group(2)
                    resolved = find_actual_image_path(img_path, images_dir)
                    return f"![{title}]({resolved})"
                
                explanation = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_md_image, explanation)

                doc = {
                    'unique_id': unique_id,
                    'content_hash': content_hash,
                    'display_question_number': q_id,
                    'course': exam,
                    'exam_type': cbt_exam_type,
                    'sub_type': sub_type_val,
                    'paper_name': sub_type_val,
                    'subject': subject,
                    'chapter': q.get('topic', ''),
                    'topic': q.get('topic', ''),
                    'difficulty': q.get('difficulty', 'Medium'),
                    'question_type': 'multiple_choice',
                    'question': full_question_text,
                    'options': normalized_options,
                    'correct_option': opt_letter,
                    'correct_answer': opt_letter,
                    'explanation': explanation,
                    'question_image': resolved_question_image,
                    'option_images': resolved_option_images,
                    'direction': normalized_direction,
                    'raw_direction': direction,
                    'raw_question': question_text,
                    'raw_explanation': raw_explanation,
                    'raw_options': mapped_options,
                    'created_at': "2026-07-18 22:30:00",
                    'updated_at': "2026-07-18 22:30:00",
                    
                    # Legacy compatibility
                    'category': legacy_category,
                    'section': subject,
                    'q': full_question_text,
                    'correct': correct_idx,
                    'question_number': q_id,
                    'source_file': filename,
                    'correct_letter': opt_letter,
                    'status': 'ok',
                    'is_mock_eligible': True
                }

                docs_to_insert.append(doc)
                total_success += 1

            except Exception as e:
                print(f"  Error processing question index {idx} in {filename}: {e}")
                total_error += 1

    if docs_to_insert:
        print(f"Bulk inserting {len(docs_to_insert)} questions into MongoDB...")
        try:
            questions_col.insert_many(docs_to_insert, ordered=False)
        except Exception as e:
            print(f"Error during bulk insertion: {e}")

    print("\n=== OVERALL IMPORT SUMMARY ===")
    print(f"Total Processed JSON Files: {len(all_json_files)}")
    print(f"Total Successfully Imported: {total_success}")
    print(f"Total Overwritten Duplicates: {total_duplicate}")
    print(f"Total Errors / Skips:         {total_error}")
    print("==============================")

if __name__ == "__main__":
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    json_folder = os.path.join(workspace_root, "QuestionBank", "json")
    images_folder = os.path.join(workspace_root, "QuestionBank", "images")
    uploads_images_folder = os.path.join(workspace_root, "backend", "uploads", "images")
    
    # 1. Copy images from backend uploads folder to QuestionBank images folder
    copy_images(uploads_images_folder, images_folder)
    
    # Try to load MONGODB_URI from environment variables or backend/.env
    mongo_uri = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URI")
    if not mongo_uri:
        mongo_uri = "mongodb://localhost:27017/kr_academy"
        env_file = os.path.join(workspace_root, "backend", ".env")
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("MONGODB_URI="):
                        mongo_uri = line.split("=", 1)[1].strip()
                        break
    
    print(f"Using MongoDB URI: {mongo_uri[:35]}...")
    
    # 2. Run MongoDB Ingestion
    import_all_papers(
        json_dir=json_folder,
        images_dir=images_folder,
        mongo_uri=mongo_uri
    )
