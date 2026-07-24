import pymongo
import re

import os

MONGO_URI = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URI")
if not MONGO_URI:
    env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    MONGO_URI = line.split("=", 1)[1].strip()
                    break

if not MONGO_URI:
    MONGO_URI = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"

def clean_text(text):
    if not text:
        return ""
    fixed = str(text)
    fixed = re.sub(r'\bIfthe\b', 'If the', fixed)
    fixed = re.sub(r'\bofasphere\b', 'of a sphere', fixed)
    fixed = re.sub(r'\bfindthe\b', 'find the', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bvalueof\b', 'value of', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\beachof\b', 'each of', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bfitin\b', 'fit in', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bwhatis\b', 'what is', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bquestions?\b', 'question', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'\bnumberof\b', 'number of', fixed, flags=re.IGNORECASE)
    fixed = re.sub(r'([a-zA-Z]+)([0-9]+)', r'\1 \2', fixed)
    fixed = re.sub(r'([0-9]+)([a-zA-Z]+)', r'\1 \2', fixed)
    fixed = re.sub(r'[ ]{2,}', ' ', fixed)
    return fixed

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
    text = text.replace("α", "\\alpha")
    text = text.replace("β", "\\beta")
    text = text.replace("γ", "\\gamma")
    text = text.replace("θ", "\\theta")
    text = text.replace("λ", "\\lambda")
    text = text.replace("μ", "\\mu")
    text = text.replace("σ", "\\sigma")
    text = text.replace("Δ", "\\Delta")
    text = text.replace("Ω", "\\Omega")
    
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
    
    text = text.replace("¹", "^1")
    text = text.replace("²", "^2")
    text = text.replace("³", "^3")
    
    text = text.replace("₁", "_1")
    text = text.replace("₂", "_2")
    text = text.replace("₃", "_3")
    return text

def normalize_math_commands(text):
    text = re.sub(r'(?<!\\)sqrt', r'\\sqrt', text)
    text = re.sub(r'(?<!\\)frac', r'\\frac', text)
    text = re.sub(r'(?<!\\)pi\b', r'\\pi', text)
    text = re.sub(r'(?<!\\)sum\b', r'\\sum', text)
    text = re.sub(r'(?<!\\)int\b', r'\\int', text)
    text = re.sub(r'(?<!\\)le\b', r'\\le', text)
    text = re.sub(r'(?<!\\)ge\b', r'\\ge', text)
    text = re.sub(r'(?<!\\)sin\b', r'\\sin', text)
    text = re.sub(r'(?<!\\)cos\b', r'\\cos', text)
    text = re.sub(r'(?<!\\)tan\b', r'\\tan', text)
    text = re.sub(r'(?<!\\)log\b', r'\\log', text)
    text = re.sub(r'(?<!\\)ln\b', r'\\ln', text)
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
        idx = start_pos + len(matched_str) + 2
        
    return text

def to_latex(text):
    if not text:
        return ""
        
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
        
    processed = re.sub(r'\DoubleDollars[\s\S]*?\DoubleDollars', protect_math, text) # check legacy placeholder
    processed = re.sub(r'(?<!\\)\$\$[\s\S]*?(?<!\\)\$\$', protect_math, processed)
    processed = re.sub(r'(?<!\\)\$[\s\S]*?(?<!\\)\$', protect_math, processed)
    
    currency_blocks = []
    def protect_currency(match):
        placeholder = f"CURRENCYBLOCK{len(currency_blocks)}"
        currency_blocks.append(match.group(0))
        return placeholder
    processed = re.sub(r'\$\s*\d+(?:\.\d+)?\b', protect_currency, processed)
    
    processed = normalize_unicode(processed)
    processed = normalize_math_commands(processed)
    processed = normalize_roots_recursive(processed)
    processed = normalize_fractions_recursive(processed)
    processed = wrap_latex_commands(processed)
    
    parts = processed.split('$')
    for i in range(len(parts)):
        if i % 2 == 0:
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
            part = re.sub(r'\DoubleDollars+', '$', part)
            part = re.sub(r'\$\$+', '$', part)
            parts[i] = part
            
    processed = '$'.join(parts)
    processed = re.sub(r'\$\$+', '$', processed)
    
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

def repair_data():
    from pymongo import UpdateOne
    print("Connecting to MongoDB for production lineage migration...")
    client = pymongo.MongoClient(MONGO_URI)
    db = client.kr_academy
    questions_col = db.questions
    
    questions = list(questions_col.find({}))
    print(f"Loaded {len(questions)} questions. Starting lineage generation and normalization...")
    
    bulk_ops = []
    
    for q in questions:
        q_id = q["_id"]
        
        # Determine pristine raw source:
        raw_q = q.get("raw_question")
        if not raw_q:
            raw_q = q.get("question") or q.get("q") or ""
            
        raw_exp = q.get("raw_explanation")
        if not raw_exp:
            raw_exp = q.get("explanation") or ""
            
        raw_opts = q.get("raw_options")
        if not raw_opts:
            raw_opts = q.get("options") or []
            
        raw_dir = q.get("raw_direction")
        if not raw_dir:
            raw_dir = q.get("direction") or ""
            
        # Compile normalized versions from raw text strictly
        sf = q.get("source_file", "")
        if sf.startswith("sbi_clerk_test_") or sf.startswith("sc_cgl_tier1_test"):
            normalized_q = raw_q
            normalized_exp = raw_exp
            normalized_dir = raw_dir
            normalized_opts = []
            for opt_idx, opt in enumerate(raw_opts):
                opt_text = opt
                is_dict = False
                opt_id = "A"
                if isinstance(opt, dict):
                    opt_text = opt.get("text", "")
                    opt_id = opt.get("id", "A")
                    is_dict = True
                
                cleaned_text = clean_option_text(opt_text, opt_idx)
                if is_dict:
                    normalized_opts.append({"id": opt_id, "text": cleaned_text})
                else:
                    normalized_opts.append(cleaned_text)
        else:
            normalized_q = to_latex(raw_q)
            normalized_exp = to_latex(raw_exp)
            normalized_dir = to_latex(raw_dir)
            
            normalized_opts = []
            for opt_idx, opt in enumerate(raw_opts):
                opt_text = opt
                is_dict = False
                opt_id = "A"
                if isinstance(opt, dict):
                    opt_text = opt.get("text", "")
                    opt_id = opt.get("id", "A")
                    is_dict = True
                    
                cleaned_text = clean_option_text(opt_text, opt_idx)
                opt_clean = to_latex(cleaned_text)
                
                if is_dict:
                    normalized_opts.append({"id": opt_id, "text": opt_clean})
                else:
                    normalized_opts.append(opt_clean)
                
        bulk_ops.append(
            UpdateOne(
                {"_id": q_id},
                {
                    "$set": {
                        "raw_question": raw_q,
                        "question": normalized_q,
                        "q": normalized_q,
                        "raw_explanation": raw_exp,
                        "explanation": normalized_exp,
                        "raw_options": raw_opts,
                        "options": normalized_opts,
                        "raw_direction": raw_dir,
                        "direction": normalized_dir
                    }
                }
            )
        )
        
    if bulk_ops:
        print(f"Executing bulk write of {len(bulk_ops)} updates...")
        res = questions_col.bulk_write(bulk_ops, ordered=False)
        print(f"Successfully modified {res.modified_count} questions.")
    else:
        print("No operations to perform.")

if __name__ == "__main__":
    repair_data()
