import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # List files in backend/ and subfolders
    backend_dir = os.path.join(root_dir, "backend")
    if os.path.exists(backend_dir):
        print(f"Files in {backend_dir}:")
        for root, dirs, files in os.walk(backend_dir):
            for f in files:
                if f.endswith(".js"):
                    rel = os.path.relpath(os.path.join(root, f), backend_dir)
                    if "node_modules" not in rel:
                        print(f"  {rel}")

if __name__ == "__main__":
    check()
