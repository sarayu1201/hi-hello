import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "frontend", "src", "pages", "MockTestScreen.jsx")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("const renderLaTeX")
    if start_idx == -1:
        start_idx = content.find("function renderLaTeX")
        
    if start_idx != -1:
        print("FOUND renderLaTeX in MockTestScreen.jsx:")
        lines = content[start_idx:start_idx+300].splitlines()
        for idx, line in enumerate(lines):
            print(f"  Line {idx+1}: {line}")
    else:
        print("renderLaTeX definition not found")

if __name__ == "__main__":
    search()
