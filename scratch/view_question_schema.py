import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("const QuestionSchema")
    if start_idx == -1:
        start_idx = content.find("mongoose.Schema")
        
    if start_idx != -1:
        print("FOUND schema definition context:")
        lines = content[start_idx:start_idx+1000].splitlines()
        for idx in range(min(50, len(lines))):
            print(f"  Line {idx+1}: {lines[idx]}")
    else:
        print("Question Schema not found")

if __name__ == "__main__":
    check()
