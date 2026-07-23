import os

def patch_importer():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found!")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Target code block inside normalize_math_commands
    target = """    text = re.sub(r'(?<!\\)pi\\b', r'\\\\pi', text)
    text = re.sub(r'(?<!\\)sum\\b', r'\\\\sum', text)
    text = re.sub(r'(?<!\\)int\\b', r'\\\\int', text)
    text = re.sub(r'(?<!\\)le\\b', r'\\\\le', text)
    text = re.sub(r'(?<!\\)ge\\b', r'\\\\ge', text)
    text = re.sub(r'(?<!\\)sin\\b', r'\\\\sin', text)
    text = re.sub(r'(?<!\\)cos\\b', r'\\\\cos', text)
    text = re.sub(r'(?<!\\)tan\\b', r'\\\\tan', text)
    text = re.sub(r'(?<!\\)log\\b', r'\\\\log', text)
    text = re.sub(r'(?<!\\)ln\\b', r'\\\\ln', text)"""
    
    replacement = """    text = re.sub(r'\\b(?<!\\)pi\\b', r'\\\\pi', text)
    text = re.sub(r'\\b(?<!\\)sum\\b', r'\\\\sum', text)
    text = re.sub(r'\\b(?<!\\)int\\b', r'\\\\int', text)
    text = re.sub(r'\\b(?<!\\)le\\b', r'\\\\le', text)
    text = re.sub(r'\\b(?<!\\)ge\\b', r'\\\\ge', text)
    text = re.sub(r'\\b(?<!\\)sin\\b', r'\\\\sin', text)
    text = re.sub(r'\\b(?<!\\)cos\\b', r'\\\\cos', text)
    text = re.sub(r'\\b(?<!\\)tan\\b', r'\\\\tan', text)
    text = re.sub(r'\\b(?<!\\)log\\b', r'\\\\log', text)
    text = re.sub(r'\\b(?<!\\)ln\\b', r'\\\\ln', text)"""
    
    if target in content:
        content = content.replace(target, replacement)
        print("Patched normalize_math_commands successfully (LF)!")
    else:
        target_cr = target.replace("\n", "\r\n")
        replacement_cr = replacement.replace("\n", "\r\n")
        if target_cr in content:
            content = content.replace(target_cr, replacement_cr)
            print("Patched normalize_math_commands successfully (CRLF)!")
        else:
            print("Error: Target pattern inside normalize_math_commands not found!")
            return
            
    # Write the patched content back
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(content)
        
if __name__ == "__main__":
    patch_importer()
