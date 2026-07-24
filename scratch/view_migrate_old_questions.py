import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("const migrateOldQuestions")
    if start_idx == -1:
        start_idx = content.find("function migrateOldQuestions")
        
    if start_idx != -1:
        print("FOUND migrateOldQuestions function:")
        lines = content[start_idx:start_idx+500].splitlines()
        for idx in range(min(45, len(lines))):
            print(f"  Line {idx+1}: {lines[idx]}")
    else:
        print("migrateOldQuestions not found")

if __name__ == "__main__":
    check()
