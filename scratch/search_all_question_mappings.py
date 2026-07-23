import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    with open(server_js, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.splitlines()
    print("Searching for question mapping patterns:")
    for idx, line in enumerate(lines):
        if "question_image:" in line or "option_images:" in line:
            print(f"  Line {idx+1}: {line.strip()}")
            # Print 5 lines above and below
            start = max(0, idx - 12)
            end = min(len(lines), idx + 8)
            print("--- CONTEXT ---")
            for c_idx in range(start, end):
                print(f"    {c_idx+1}: {lines[c_idx]}")
            print("---------------\n")

if __name__ == "__main__":
    check()
