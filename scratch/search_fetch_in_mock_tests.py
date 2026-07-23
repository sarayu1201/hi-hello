import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTests.jsx")
    
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Searching for fetch or axios in MockTests.jsx:")
    for idx, line in enumerate(lines):
        if "fetch" in line or "axios" in line or "api/questions" in line or "api/mock" in line:
            print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    search()
