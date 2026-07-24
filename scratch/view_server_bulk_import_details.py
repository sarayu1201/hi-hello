import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Inspecting handleSuccessfulParse mapping in server.js:")
    for idx in range(4154, min(4186, len(lines))):
        print(f"  Line {idx+1}: {lines[idx]}", end="")

if __name__ == "__main__":
    check()
