import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    res = subprocess.run(["git", "ls-files"], capture_output=True, text=True, cwd=root_dir, shell=True)
    tracked_files = res.stdout.splitlines()
    
    frontend_files = [f for f in tracked_files if f.startswith("frontend/")]
    backend_files = [f for f in tracked_files if f.startswith("backend/")]
    
    print(f"Total frontend files tracked: {len(frontend_files)}")
    print(f"Total backend files tracked: {len(backend_files)}")
    
    if frontend_files:
        print("Sample frontend files:")
        for f in frontend_files[:5]:
            print(f"  {f}")
    else:
        print("WARNING: No frontend files are tracked in git!")
        
if __name__ == "__main__":
    check()
