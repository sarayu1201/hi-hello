import os

def patch_latex():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found!")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Broken block in importer
    bad_block = """    # Clean unescaped dollar signs inside LaTeX math blocks
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\\])', strip_dollars, text)"""
    
    # Verified correct block
    correct_block = """    # Clean unescaped dollar signs inside LaTeX math blocks
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\\])', strip_dollars, text)"""
    
    # Wait, in content, how was it actually written?
    # Let's inspect the actual lines in importer first to do a safe, direct replace.
    # Let's find def to_latex and get the block.
    
    # We will do a robust replacement of the whole function start:
    target = """def to_latex(text):
    if not text:
        return ""

    # Clean unescaped dollar signs inside LaTeX math blocks
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?)\\\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?)\\\\\\\\]', strip_dollars, text)"""
    
    # Wait! If we already patched it to the incorrect v2 block:
    # Let's see what is currently in import_all_papers.py around to_latex!
    
if __name__ == "__main__":
    # We'll just read import_all_papers.py, find the bad lines, and replace them.
    root_dir = r"c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Safe regex replace for the def to_latex start block
    import re
    # Find anything from def to_latex(text): to text = re.sub(r'\\\\\\([\\s\\S]*?...
    # Let's just find the start of the function and replace it up to the start of Phase 0.
    pattern = r"def to_latex\(text\):\n\s*if not text:\n\s*return \"\"\n\n\s*# Clean unescaped dollar signs[\s\S]*?(?=\n\s*# Phase 0:)"
    
    replacement = """def to_latex(text):
    if not text:
        return ""

    # Clean unescaped dollar signs inside LaTeX math blocks
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\\])', strip_dollars, text)
"""
    
    # Let's compile and do it
    new_content, count = re.subn(pattern, replacement, content)
    if count > 0:
        with open(importer_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"SUCCESS: to_latex patched successfully! (re.sub replaced {count} matches)")
    else:
        # Try with CRLF
        pattern_cr = pattern.replace("\n", "\r\n")
        replacement_cr = replacement.replace("\n", "\r\n")
        new_content, count = re.subn(pattern_cr, replacement_cr, content)
        if count > 0:
            with open(importer_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"SUCCESS: to_latex patched successfully! (re.sub CRLF replaced {count} matches)")
        else:
            print("Error: Could not locate the bad block in import_all_papers.py")
