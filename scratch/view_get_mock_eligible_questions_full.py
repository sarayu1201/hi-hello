import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Printing lines 2736 to 2820 of server.js:")
    for idx in range(2735, min(2820, len(lines))):
        print(f"  Line {idx+1}: {lines[idx]}", end="")

if __name__ == "__main__":
    check()
