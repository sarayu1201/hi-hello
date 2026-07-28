import json
import re
import os

def latexify(text):
    if not isinstance(text, str) or not text:
        return text
    
    # Strip existing dollars first to normalize
    text = text.replace('$$', '$').replace('$', '')
    
    # If the whole text is a simple number
    if re.match(r'^\s*[\+\-]?\d+(?:\.\d+)?\s*$', text):
        return f"${text.strip()}$"
        
    # Patterns to match math expressions
    patterns = [
        # 1. Quadratic Equations
        r'\b[I|V|X]+\s*:\s*[xXyYzZ]\^2\s*[\+\-]\s*\d+[xXyYzZ]\s*[\+\-]\s*\d+\s*=\s*0\b',
        r'\b[xXyYzZ]\^2\s*[\+\-]\s*\d+[xXyYzZ]\s*[\+\-]\s*\d+\s*=\s*0\b',
        # 2. Relations
        r'\b[xXyYzZ]\s*(?:[><=]|\\ge|\\le|\\ne|>=|<=|≥|≤|≠)\s*(?:[xXyYzZ]|\d+)\b',
        # 3. Percentages
        r'(?:\b\d+(?:\.\d+)?|\([xXyYzZ]\s*[\+\-]\s*\d+\))\s*%',
        # 4. Fractions
        r'\b\d+/\d+(?:th)?\b',
        # 5. Ratios
        r'\b\d+\s*:\s*\d+\b',
        # 6. Currency
        r'\bRs\.?\s*\d+(?:,\d+)?\b',
        # 7. Algebraic expressions / operations (e.g. 12.5x + 10)
        r'\b(?:\d+(?:\.\d+)?)?[xXyYzZ]\s*[\+\-\*/]\s*(?:\d+(?:\.\d+)?[xXyYzZ]?|\d+)\b',
        r'\b\d+(?:\.\d+)?[xXyYzZ]\b',
        r'\b[xXyYzZ]\b'
    ]
    
    # Find all matches
    spans = []
    for pattern in patterns:
        for m in re.finditer(pattern, text):
            spans.append((m.start(), m.end(), m.group(0)))
            
    # Sort spans by start index, and then by length descending (to prefer longer matches)
    spans.sort(key=lambda x: (x[0], -(x[1] - x[0])))
    
    # Filter out overlapping spans
    filtered_spans = []
    last_end = -1
    for start, end, match_text in spans:
        if start >= last_end:
            filtered_spans.append((start, end, match_text))
            last_end = end
            
    # Reconstruct text with replacements in reverse order
    filtered_spans.sort(key=lambda x: x[0], reverse=True)
    for start, end, match_text in filtered_spans:
        # Format the match
        t = match_text
        t = t.replace('>=', '\\ge ').replace('<=', '\\le ')
        t = t.replace('≥', '\\ge ').replace('≤', '\\le ')
        t = t.replace('≠', '\\ne ')
        t = t.replace('÷', '\\div ').replace('×', '\\times ')
        
        if '%' in t:
            t = t.replace('\\%', '%').replace('%', '\\%')
            
        m_frac = re.match(r'^(\d+)/(\d+)(th)?$', t)
        if m_frac:
            num, den, th = m_frac.groups()
            formatted = f"$\\frac{{{num}}}{{{den}}}{th or ''}$"
        elif re.match(r'^Rs\.?\s*(\d+(?:,\d+)?)$', t, re.IGNORECASE):
            val = re.sub(r'Rs\.?\s*', '', t, flags=re.IGNORECASE)
            formatted = f"Rs. ${val}$"
        else:
            formatted = f"${t}$"
            
        text = text[:start] + formatted + text[end:]
        
    return text

def process_file(file_path):
    print(f"Processing {os.path.basename(file_path)}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    updated_count = 0
    for q in data:
        # Question text
        orig_q = q.get('question', '')
        new_q = latexify(orig_q)
        if orig_q != new_q:
            q['question'] = new_q
            updated_count += 1
            
        # Options text
        for opt in q.get('options', []):
            orig_o = opt.get('text', '')
            new_o = latexify(orig_o)
            if orig_o != new_o:
                opt['text'] = new_o
                updated_count += 1
                
        # Explanation text
        orig_e = q.get('explanation', '')
        new_e = latexify(orig_e)
        if orig_e != new_e:
            q['explanation'] = new_e
            updated_count += 1
            
        # Direction text
        if 'direction' in q:
            orig_d = q['direction']
            new_d = latexify(orig_d)
            if orig_d != new_d:
                q['direction'] = new_d
                updated_count += 1
                
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {os.path.basename(file_path)}. Updated {updated_count} fields.")

if __name__ == '__main__':
    for i in range(1, 8):
        fpath = f"c:/Users/Administrator/Downloads/sbi po questions/sbi_po_prelims test _{i}.json"
        if os.path.exists(fpath):
            process_file(fpath)
        else:
            print(f"File not found: {fpath}")
