import re

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
        current_math = parts[idx]
        gap = parts[idx + 1]
        next_math = parts[idx + 2]
        
        # Check if the gap is "math-like" and should be merged
        # A gap is math-like if it consists entirely of math operators, brackets, spaces, percentage signs,
        # superscripts/subscripts, connector words like 'of', 'and', 'to', or simple digits.
        is_math_gap = False
        
        # Clean the gap for checking
        clean_gap = gap.strip()
        
        # If the gap is empty or just spaces
        if not clean_gap:
            is_math_gap = True
        else:
            # Match math-like characters and words
            # Permitted: \times, \div, \text{of}, \text{ of }, \text{and}, %, \%, +, -, *, /, =, ^, _, digits, brackets, common words
            pattern = r'^[\s\d+\-*=/(),.?:^_%&|\\{}]+$|^(?:of|and|to|is|are|times|div|\\times|\\div|\\text\{of\}|\\text\{\s*of\s*\}|\\text\{and\}|\^3|\\%|%)$'
            # Let's check with a regex
            # A gap is math-like if it doesn't contain normal long English words (except specific short math connectors)
            words = re.findall(r'[a-zA-Z]+', clean_gap)
            all_words_math_like = True
            for w in words:
                if w.lower() not in ('of', 'and', 'to', 'is', 'are', 'times', 'div', 'text', 'sum', 'ge', 'le'):
                    all_words_math_like = False
                    break
            
            # Also check if it's very short (under 15 chars) or matches basic symbols
            if all_words_math_like and len(clean_gap) < 20:
                is_math_gap = True
                
        if is_math_gap:
            # Merge current_math + gap + next_math into a single math block
            # Since parts[idx] is inside math, and parts[idx+2] is inside math,
            # the combined string will be inside math.
            combined = current_math + gap + next_math
            # Replace parts[idx+2] with combined, and skip the gap
            parts[idx + 2] = combined
            idx += 2
        else:
            # Cannot merge, keep current math block as is
            merged_parts.append(current_math)
            merged_parts.append(gap)
            idx += 2
            
    # Append the last part
    merged_parts.append(parts[-1])
    
    # Reconstruct the string with dollar signs
    reconstructed = ""
    for i, p in enumerate(merged_parts):
        if i > 0:
            reconstructed += "$"
        reconstructed += p
        
    # Clean up empty math blocks like $$ or $$$ at the end of the text
    # e.g., 'text$$' -> 'text', or 'text$$$' -> 'text$'
    reconstructed = re.sub(r'(?<!\\)\$\$\$+$', r'$', reconstructed)
    reconstructed = re.sub(r'(?<!\\)\$\$$', r'', reconstructed)
    
    # Fix unbalanced parenthesis in math blocks (e.g. $7 \times 5 - 8)$ -> $(7 \times 5 - 8)$)
    def balance_parentheses(match):
        m = match.group(0)
        # Count open and close parentheses
        open_count = m.count('(')
        close_count = m.count(')')
        if close_count > open_count:
            # Insert '(' right after the opening '$'
            content = m[1:-1]
            # Find the first non-space character to place the '('
            idx = 0
            while idx < len(content) and content[idx].isspace():
                idx += 1
            content = content[:idx] + '(' + content[idx:]
            return f"${content}$"
        return m
        
    reconstructed = re.sub(r'(?<!\\)\$.*?(?<!\\)\$', balance_parentheses, reconstructed)
    
    return reconstructed

def test():
    test_cases = [
        "What will come in the place of question mark (?) in the following question?\n$7 \\times 5-$ 8)$\\div 9 + 3 = ?$",
        "What will come in the place of question mark (?) in the following question?\n$36 + 30$\\% \\text{ of }$750 - 136 = ?$^3$$",
        "What will come in the place of question mark (?) in the following question?\n$254 + 312 - ? = 420$$$",
        "What will come in the place of question mark (?) in the following question?\n$1280 \\div 8+$ 240)$\\div 40 = ? - 15$",
        "What will come in the place of question mark (?) in the following question?\n$10 + 7)^3$ = 8.5 $\\times$ (? - 12)"
    ]
    
    for tc in test_cases:
        print("\nINPUT: ")
        print(repr(tc))
        print("OUTPUT:")
        print(repr(merge_adjacent_math_blocks(tc)))

if __name__ == "__main__":
    test()
