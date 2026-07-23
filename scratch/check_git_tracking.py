import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    os.chdir(root_dir)
    
    # Run git ls-files to see tracked images
    res = subprocess.run(["git", "ls-files", "backend/uploads/images"], capture_output=True, text=True)
    tracked_files = res.stdout.strip().splitlines()
    
    print(f"Total image files tracked by Git in backend/uploads/images: {len(tracked_files)}")
    if tracked_files:
        print(f"  Sample tracked: {tracked_files[:5]}")
    else:
        print("  NO IMAGES ARE TRACKED IN backend/uploads/images!")
        
    # Check git status of the folder
    status_res = subprocess.run(["git", "status", "backend/uploads/images"], capture_output=True, text=True)
    print("\nGit Status of backend/uploads/images:")
    print(status_res.stdout)

if __name__ == "__main__":
    check()
