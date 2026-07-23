import os

def find():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Search for def clean_text
    lines = content.splitlines()
    start_idx = -1
    for idx, line in enumerate(lines):
        if "def clean_text" in line:
            start_idx = idx
            break
            
    if start_idx != -1:
        print("FOUND clean_text implementation:")
        for idx in range(start_idx, min(start_idx + 80, len(lines))):
            print(f"  Line {idx+1}: {lines[idx]}")
    else:
        print("def clean_text not found")

if __name__ == "__main__":
    find()
