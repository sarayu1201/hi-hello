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
        # Try finding with double slashes or other spacing
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
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\\\])', strip_dollars, text)
    
    """
    
    patched_content = content[:start_idx] + new_start_block + content[end_idx:]
    
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(patched_content)
        
    print("SUCCESS: import_all_papers.py to_latex successfully patched with direct string slicing!")

if __name__ == "__main__":
    patch()
