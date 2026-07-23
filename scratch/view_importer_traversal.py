import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Inspecting import_all_papers.py lines 680-760:")
    for idx in range(680, min(760, len(lines))):
        print(f"  Line {idx+1}: {lines[idx].strip()}")

if __name__ == "__main__":
    search()
