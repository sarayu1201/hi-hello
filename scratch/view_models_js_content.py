import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    models_js = os.path.join(root_dir, "backend", "models.js")
    
    with open(models_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("const QuestionSchema")
    if start_idx == -1:
        start_idx = content.find("QuestionSchema")
    if start_idx == -1:
        start_idx = content.find("new Schema")
    if start_idx == -1:
        start_idx = content.find("Schema")
        
    if start_idx != -1:
        print("FOUND schema definition context in backend/models.js:")
        lines = content[start_idx:start_idx+1200].splitlines()
        for idx in range(min(60, len(lines))):
            print(f"  Line {idx+1}: {lines[idx]}")
    else:
        print("Schema not found in backend/models.js")

if __name__ == "__main__":
    check()
