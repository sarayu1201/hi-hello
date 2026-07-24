import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Searching for router prefixes in server.js:")
    for idx, line in enumerate(lines):
        if "app.use(" in line and ("router" in line.lower() or "api" in line.lower()):
            print(f"  Line {idx+1}: {line.strip()}")

if __name__ == "__main__":
    check()
