import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    models_js = os.path.join(root_dir, "backend", "models.js")
    
    if os.path.exists(models_js):
        with open(models_js, "r", encoding="utf-8") as f:
            content = f.read()
            
        start_idx = content.find("const questionSchema")
        if start_idx == -1:
            start_idx = content.find("QuestionSchema")
        if start_idx == -1:
            start_idx = content.find("new mongoose.Schema")
            
        if start_idx != -1:
            line_num = content[:start_idx].count("\n") + 1
            print(f"Question schema starts at line {line_num}")
            lines = content[start_idx:start_idx+100].splitlines()
            for idx, line in enumerate(lines):
                print(f"  Line {line_num + idx}: {line}")
        else:
            print("Question Schema definition not found")
    else:
        print("backend/models.js not found!")

if __name__ == "__main__":
    check()
