import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Search for delete_many or clear
    lines = content.splitlines()
    print("Matches for 'delete' or 'clear' in import_all_papers.py:")
    for idx, line in enumerate(lines):
        if "delete" in line or "clear" in line or "remove" in line:
            print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    search()
