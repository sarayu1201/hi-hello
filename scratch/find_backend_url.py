import os

def find():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_dir = os.path.join(root_dir, "frontend")
    
    print("Searching frontend files for backend URLs or VITE_API_URL:")
    for root, dirs, files in os.walk(frontend_dir):
        if "node_modules" in root or "dist" in root or ".git" in root:
            continue
        for f in files:
            if f.endswith((".env", ".env.production", ".js", ".jsx", ".json")):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    for line_num, line in enumerate(file):
                        if "VITE_API_URL" in line or "onrender.com" in line:
                            print(f"  {f}:{line_num+1}: {line.strip()}")

if __name__ == "__main__":
    find()
