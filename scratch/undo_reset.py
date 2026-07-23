import subprocess
import os

def undo():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    os.chdir(root_dir)
    
    print("Restoring your local commits and files...")
    # Reset hard back to HEAD@{4} which is e4f0849
    res = subprocess.run(["git", "reset", "--hard", "e4f0849"], capture_output=True, text=True)
    if res.returncode == 0:
        print("SUCCESS: Local files fully restored to e4f0849!")
    else:
        print(f"Error restoring: {res.stderr}")
        
    # Check status
    status = subprocess.run(["git", "status"], capture_output=True, text=True)
    print("\nGit Status:")
    print(status.stdout)

if __name__ == "__main__":
    undo()
