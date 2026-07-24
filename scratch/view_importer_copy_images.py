import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_py = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_py, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for idx, line in enumerate(lines):
        if "def copy_images" in line or "def sync_images" in line or "shutil.copy" in line:
            print(f"FOUND Image Sync logic at Line {idx+1}:")
            # Print 15 lines above and 25 lines below
            start = max(0, idx - 15)
            end = min(len(lines), idx + 25)
            for c_idx in range(start, end):
                print(f"  {c_idx+1}: {lines[c_idx]}", end="")
            print("\n----------------\n")

if __name__ == "__main__":
    check()
