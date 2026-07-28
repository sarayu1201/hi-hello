import re

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

# Test cases
test_cases = [
    "x^2 - 20x + 91 = 0",
    "x > y",
    "x >= y",
    "x <= y",
    "Rs. 9000",
    "12.5%",
    "3:4",
    "Option A",
    "24",
    "12.5x + 10",
    "Out of the total population of all the cities 35% are females",
    "I: x^2 - 20x + 91 = 0 \nII: y^2 - 28y + 195 = 0",
    "2/5th of flats occupied",
    "1/8 of total bikes"
]

for tc in test_cases:
    print(f"Original: {repr(tc)}")
    print(f"Latexified: {repr(latexify(tc))}")
    print("-" * 50)
