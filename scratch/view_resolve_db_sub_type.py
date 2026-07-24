import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find("function resolveDbSubType")
    if start_idx != -1:
        print("FOUND resolveDbSubType in server.js:")
        lines = content[start_idx:start_idx+100].splitlines()
        for idx, line in enumerate(lines):
            print(f"  Line {idx+1}: {line}")
    else:
        print("resolveDbSubType not found")

if __name__ == "__main__":
    check()
