import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    frontend_dir = os.path.join(root_dir, "frontend")
    
    found = []
    if os.path.exists(frontend_dir):
        for root, dirs, files in os.walk(frontend_dir):
            # Prune node_modules and .git folders from the search
            if "node_modules" in dirs:
                dirs.remove("node_modules")
            if ".git" in dirs:
                dirs.remove(".git")
                
            for f in files:
                if f.endswith(".jsx") or f.endswith(".js"):
                    filepath = os.path.join(root, f)
                    with open(filepath, "r", encoding="utf-8") as file:
                        try:
                            content = file.read()
                        except Exception:
                            continue
                    if "cleanText" in content or "QuestionRenderer" in f:
                        found.append((f, filepath))
                        
    print("Found files with cleanText or QuestionRenderer:")
    for name, path in found:
        print(f"  File: {name} at {os.path.relpath(path, root_dir)}")

if __name__ == "__main__":
    check()
