import os

def patch():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_str = "def merge_adjacent_math_blocks(text):"
    end_str = "def to_latex(text):"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Error: Could not locate helper blocks")
        return
        
    correct_block = """def merge_adjacent_math_blocks(text):
    if not text:
        return ""
    import re
    # Split by unescaped dollar signs
    parts = re.split(r'(?<!\\)\\$', text)
    if len(parts) < 3:
        return text
        
    merged_parts = [parts[0]]
    idx = 1
    while idx < len(parts) - 1:
        if idx + 2 >= len(parts):
            merged_parts.append(parts[idx])
            idx += 1
            break
            
        current_math = parts[idx]
        gap = parts[idx + 1]
        next_math = parts[idx + 2]
        
        is_math_gap = False
        clean_gap = gap.strip()
        
        if not clean_gap:
            is_math_gap = True
        else:
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
            
    if idx < len(parts):
        merged_parts.append(parts[-1])
        
    reconstructed = ""
    for i, p in enumerate(merged_parts):
        if i > 0:
            reconstructed += "$"
        reconstructed += p
        
    reconstructed = re.sub(r'(?<!\\)\\$\\$\\$+$', r'$', reconstructed)
    reconstructed = re.sub(r'(?<!\\)\\$\\$', r'', reconstructed)
    
    def balance_parentheses(match):
        m = match.group(0)
        open_count = m.count('(')
        close_count = m.count(')')
        if close_count > open_count:
            content_str = m[1:-1]
            c_idx = 0
            while c_idx < len(content_str) and content_str[c_idx].isspace():
                c_idx += 1
            content_str = content_str[:c_idx] + '(' + content_str[c_idx:]
            return f"${content_str}$"
        return m
        
    reconstructed = re.sub(r'(?<!\\)\\$.*?(?<!\\)\\$', balance_parentheses, reconstructed)
    return reconstructed


"""

    patched_content = content[:start_idx] + correct_block + content[end_idx:]
    
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(patched_content)
        
    print("SUCCESS: import_all_papers.py regexes repaired successfully!")

if __name__ == "__main__":
    patch()
