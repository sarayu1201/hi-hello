import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_dir = os.path.join(root_dir, "frontend")
    
    print("Searching frontend files for newline or custom rendering replacements:")
    for root, dirs, files in os.walk(frontend_dir):
        if "node_modules" in root or "dist" in root or ".git" in root:
            continue
        for f in files:
            if f.endswith((".jsx", ".js", ".tsx", ".ts", ".css")):
                file_path = os.path.join(root, f)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()
                    
                # Search for replace keywords or things modifying text
                if "replace(" in content:
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if "replace(" in line and ("n" in line or "br" in line or "/" in line or ">" in line):
                            print(f"  {f}:{idx+1}: {line.strip()}")
                            
if __name__ == "__main__":
    search()
