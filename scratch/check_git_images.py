import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # Check .gitignore
    gitignore_path = os.path.join(root_dir, ".gitignore")
    if os.path.exists(gitignore_path):
        print("Content of .gitignore:")
        with open(gitignore_path, "r", encoding="utf-8") as f:
            print(f.read())
            
    # Check backend/.gitignore if it exists
    backend_gitignore = os.path.join(root_dir, "backend", ".gitignore")
    if os.path.exists(backend_gitignore):
        print("\nContent of backend/.gitignore:")
        with open(backend_gitignore, "r", encoding="utf-8") as f:
            print(f.read())
            
    # Check if there are images locally in backend/uploads/images
    uploads_dir = os.path.join(root_dir, "backend", "uploads", "images")
    if os.path.exists(uploads_dir):
        files = os.listdir(uploads_dir)
        print(f"\nLocal images count in backend/uploads/images: {len(files)}")
        if files:
            print(f"  Sample files: {files[:5]}")
    else:
        print("\nbackend/uploads/images directory does not exist locally!")

if __name__ == "__main__":
    check()
