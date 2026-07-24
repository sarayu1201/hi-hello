import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Printing lines 3059 to 3140 of server.js:")
    for idx in range(3058, min(3140, len(lines))):
        print(f"  Line {idx+1}: {lines[idx]}", end="")

if __name__ == "__main__":
    check()
