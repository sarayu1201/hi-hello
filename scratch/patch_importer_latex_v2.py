import os

def patch_latex():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found!")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Bad target block
    bad_target = """    # Clean unescaped dollar signs inside LaTeX math blocks
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?)\\\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?)\\\\\\\\]', strip_dollars, text)"""
    
    # Correct replacement
    correct_replacement = """    # Clean unescaped dollar signs inside LaTeX math blocks
    def strip_dollars(match):
        return match.group(0).replace('$', '')
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\)', strip_dollars, text)
    text = re.sub(r'\\\\\\([\\s\\S]*?\\\\\\\])', strip_dollars, text)"""
    
    if bad_target in content:
        content = content.replace(bad_target, correct_replacement)
        print("Patched to_latex successfully (LF)!")
    else:
        bad_target_cr = bad_target.replace("\n", "\r\n")
        correct_replacement_cr = correct_replacement.replace("\n", "\r\n")
        if bad_target_cr in content:
            content = content.replace(bad_target_cr, correct_replacement_cr)
            print("Patched to_latex successfully (CRLF)!")
        else:
            print("Error: Target bad block not found!")
            return
            
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(content)
        
if __name__ == "__main__":
    patch_latex()
