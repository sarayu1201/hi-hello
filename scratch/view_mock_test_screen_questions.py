import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    if not os.path.exists(filepath):
        print("MockTestScreen.jsx not found")
        return
        
    print("Inspecting MockTestScreen.jsx questions mapping and state:")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.splitlines()
    for idx, line in enumerate(lines):
        if "question_image" in line or "questionImage" in line or "image:" in line:
            print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    search()
