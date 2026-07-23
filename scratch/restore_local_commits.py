import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    os.chdir(root_dir)
    
    # Run git reflog
    res = subprocess.run(["git", "reflog", "-n", "30"], capture_output=True, text=True)
    print("GIT REFLOG OUTPUT:")
    print(res.stdout)

if __name__ == "__main__":
    check()
