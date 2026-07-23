import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_dir = os.path.join(root_dir, "frontend")
    
    print("Searching frontend files for image rendering references:")
    for root, dirs, files in os.walk(frontend_dir):
        if "node_modules" in root or "dist" in root or ".git" in root:
            continue
        for f in files:
            if f.endswith((".js", ".jsx")):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    for line_num, line in enumerate(file):
                        if "question_image" in line or "image" in line or "img" in line:
                            # Filter for actual image display logic
                            if "<img" in line or ".image" in line or "questionImage" in line or "BACKEND_URL" in line:
                                print(f"  {f}:{line_num+1}: {line.strip()}")

if __name__ == "__main__":
    search()
