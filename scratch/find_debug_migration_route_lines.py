import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find('app.get("/api/run-image-migration"')
    if start_idx != -1:
        line_num = content[:start_idx].count("\n") + 1
        print(f"Temporary route starts at line {line_num}")
        lines = content[start_idx:start_idx+3500].splitlines()
        for idx, line in enumerate(lines):
            if "app.use((req, res, next)" in line:
                print(f"Temporary route ends around line {line_num + idx}")
                break
    else:
        print("Temporary route not found")

if __name__ == "__main__":
    check()
