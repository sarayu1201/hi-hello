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
