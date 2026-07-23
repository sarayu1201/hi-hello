import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_path = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    if not os.path.exists(importer_path):
        print("Importer script not found")
        return
        
    with open(importer_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Matches for 'direction' in import_all_papers.py:")
    for idx, line in enumerate(lines):
        if "direction" in line:
            print(f"  Line {idx+1}: {line.strip()}")
            
if __name__ == "__main__":
    search()
