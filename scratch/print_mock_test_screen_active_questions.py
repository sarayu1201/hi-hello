import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("const cleanQuestions =")
    if start_idx == -1:
        print("cleanQuestions not found")
        return
        
    print("Inspecting MockTestScreen.jsx lines around cleanQuestions:")
    lines = content[start_idx:start_idx+1500].splitlines()
    for idx, line in enumerate(lines):
        print(f"  Line {idx+1}: {line}")

if __name__ == "__main__":
    search()
