import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_src = os.path.join(root_dir, "frontend", "src")
    
    for root, dirs, files in os.walk(frontend_src):
        for f in files:
            if f.endswith((".js", ".jsx")):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    for line_num, line in enumerate(file):
                        if "Pattern Module" in line or "pattern module" in line.lower() or "offline" in line:
                            # Print matching lines
                            print(f"Found in {f}:{line_num+1}: {line.strip()}")

if __name__ == "__main__":
    search()
