import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    frontend_git = os.path.join(root_dir, "frontend", ".git")
    backend_git = os.path.join(root_dir, "backend", ".git")
    
    print("CHECKING NESTED .GIT FOLDERS:")
    print(f"  frontend/.git exists: {os.path.exists(frontend_git)}")
    print(f"  backend/.git exists: {os.path.exists(backend_git)}")
    
    # Check what git tracked files look like
    import subprocess
    res = subprocess.run(["git", "ls-files"], capture_output=True, text=True, cwd=root_dir, shell=True)
    tracked_files = res.stdout.splitlines()
    print(f"\nTotal tracked files in git: {len(tracked_files)}")
    print("Sample tracked files (first 20):")
    for f in tracked_files[:20]:
        print(f"  {f}")
        
if __name__ == "__main__":
    check()
