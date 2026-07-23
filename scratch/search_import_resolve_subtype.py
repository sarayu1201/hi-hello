import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("def resolveDbSubType")
    if start_idx != -1:
        print("FOUND resolveDbSubType in import_all_papers.py:")
        lines = content[start_idx:start_idx+1000].splitlines()
        for idx, line in enumerate(lines):
            print(f"  Line {idx+1}: {line}")
    else:
        print("resolveDbSubType not found in import_all_papers.py")

if __name__ == "__main__":
    search()
