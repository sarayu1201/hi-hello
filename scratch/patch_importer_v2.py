import os

def patch_importer():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found!")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace target regexes line by line to avoid multi-line formatting issues
    replacements = {
        r"text = re.sub(r'(?<!\\)pi\b', r'\\pi', text)": r"text = re.sub(r'\b(?<!\\)pi\b', r'\\pi', text)",
        r"text = re.sub(r'(?<!\\)sum\b', r'\\sum', text)": r"text = re.sub(r'\b(?<!\\)sum\b', r'\\sum', text)",
        r"text = re.sub(r'(?<!\\)int\b', r'\\int', text)": r"text = re.sub(r'\b(?<!\\)int\b', r'\\int', text)",
        r"text = re.sub(r'(?<!\\)le\b', r'\\le', text)": r"text = re.sub(r'\b(?<!\\)le\b', r'\\le', text)",
        r"text = re.sub(r'(?<!\\)ge\b', r'\\ge', text)": r"text = re.sub(r'\b(?<!\\)ge\b', r'\\ge', text)",
        r"text = re.sub(r'(?<!\\)sin\b', r'\\sin', text)": r"text = re.sub(r'\b(?<!\\)sin\b', r'\\sin', text)",
        r"text = re.sub(r'(?<!\\)cos\b', r'\\cos', text)": r"text = re.sub(r'\b(?<!\\)cos\b', r'\\cos', text)",
        r"text = re.sub(r'(?<!\\)tan\b', r'\\tan', text)": r"text = re.sub(r'\b(?<!\\)tan\b', r'\\tan', text)",
        r"text = re.sub(r'(?<!\\)log\b', r'\\log', text)": r"text = re.sub(r'\b(?<!\\)log\b', r'\\log', text)",
        r"text = re.sub(r'(?<!\\)ln\b', r'\\ln', text)": r"text = re.sub(r'\b(?<!\\)ln\b', r'\\ln', text)"
    }
    
    patched_count = 0
    for target, replacement in replacements.items():
        if target in content:
            content = content.replace(target, replacement)
            patched_count += 1
        else:
            # Try with carriage returns just in case
            target_cr = target.replace("\n", "\r\n")
            replacement_cr = replacement.replace("\n", "\r\n")
            if target_cr in content:
                content = content.replace(target_cr, replacement_cr)
                patched_count += 1
                
    with open(importer_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"SUCCESS: Patched {patched_count} / {len(replacements)} lines in import_all_papers.py!")

if __name__ == "__main__":
    patch_importer()
