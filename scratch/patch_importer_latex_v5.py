import os

def patch():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found!")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Locate def to_latex start
    func_def = "def to_latex(text):"
    start_idx = content.find(func_def)
    if start_idx == -1:
        print("Error: Could not find def to_latex")
        return
        
    # Locate Phase 0 comment which marks the end of the block we want to overwrite
    phase_0_idx = content.find("# Phase 0: Delimiter Normalization", start_idx)
    if phase_0_idx == -1:
        phase_0_idx = content.find("Phase 0:", start_idx)
        if phase_0_idx == -1:
            print("Error: Could not find Phase 0 comment")
            return
            
    # Go back to the beginning of the line containing Phase 0 comment
    end_idx = content.rfind("\n", start_idx, phase_0_idx)
    if end_idx == -1:
        end_idx = phase_0_idx
        
    # The new function definition and clean dollars block
    new_start_block = """def to_latex(text):
    if not text:
        return ""

    # Clean unescaped dollar signs inside LaTeX math blocks
    parts = []
    idx = 0
    while idx < len(text):
        open_idx = text.find("\\\\(", idx)
        open_bracket_idx = text.find("\\\\[", idx)
        
        first_open = -1
        close_delim = ""
        if open_idx != -1 and (open_bracket_idx == -1 or open_idx < open_bracket_idx):
            first_open = open_idx
            close_delim = "\\\\)"
        elif open_bracket_idx != -1:
            first_open = open_bracket_idx
            close_delim = "\\\\]"
            
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
    
    """
    
    patched_content = content[:start_idx] + new_start_block + content[end_idx:]
    
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(patched_content)
        
    print("SUCCESS: import_all_papers.py to_latex successfully patched with pure Python parser!")

if __name__ == "__main__":
    patch()
