import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "frontend", "src", "components", "QuestionRenderer.jsx")
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Search for option rendering or renderOption
    start_idx = content.find("options")
    if start_idx == -1:
        start_idx = content.find("Option")
        
    if start_idx != -1:
        line_num = content[:start_idx].count("\n") + 1
        print(f"Option rendering starts around line {line_num}")
        lines = content[start_idx:start_idx+120].splitlines()
        for idx, line in enumerate(lines):
            print(f"  Line {line_num + idx}: {line}")
            
if __name__ == "__main__":
    check()
