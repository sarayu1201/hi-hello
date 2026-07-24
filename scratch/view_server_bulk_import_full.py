import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Inspecting handleSuccessfulParse in backend/server.js:")
    for idx in range(4097, min(4140, len(lines))):
        print(f"  Line {idx+1}: {lines[idx]}", end="")

if __name__ == "__main__":
    check()
