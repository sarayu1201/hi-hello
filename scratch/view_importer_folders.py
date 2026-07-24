import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    importer_py = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    with open(importer_py, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.splitlines()
    print("Searching for folder scanning configurations in import_all_papers.py:")
    for idx, line in enumerate(lines):
        if "os.walk" in line or "os.listdir" in line or "ssc_cgl" in line.lower() or "cgl" in line.lower():
            print(f"  Line {idx+1}: {line.strip()}")
            # Print context
            start = max(0, idx - 4)
            end = min(len(lines), idx + 8)
            print("--- CONTEXT ---")
            for c_idx in range(start, end):
                print(f"    {c_idx+1}: {lines[c_idx]}")
            print("---------------\n")

if __name__ == "__main__":
    check()
