import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_dir = os.path.join(root_dir, "frontend")
    
    print("Searching frontend for .direction or ['direction']:")
    for root, dirs, files in os.walk(frontend_dir):
        if "node_modules" in root or "dist" in root or ".git" in root:
            continue
        for f in files:
            if f.endswith((".jsx", ".js", ".tsx", ".ts")):
                file_path = os.path.join(root, f)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()
                    
                if "direction" in content:
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if ".direction" in line or "['direction']" in line or "direction:" in line:
                            print(f"  {f}:{idx+1}: {line.strip()}")
                            
if __name__ == "__main__":
    check()
