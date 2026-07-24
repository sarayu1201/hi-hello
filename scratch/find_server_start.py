import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Searching for mongoose.connect or app.listen in server.js:")
    for idx, line in enumerate(lines):
        if "mongoose.connect" in line or "app.listen" in line:
            print(f"  Line {idx+1}: {line.strip()}")
            # Print context
            start = max(0, idx - 4)
            end = min(len(lines), idx + 8)
            print("--- CONTEXT ---")
            for c_idx in range(start, end):
                print(f"    {c_idx+1}: {lines[c_idx]}", end="")
            print("\n---------------\n")

if __name__ == "__main__":
    check()
