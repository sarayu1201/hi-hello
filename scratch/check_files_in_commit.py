import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    res = subprocess.run(["git", "show", "--name-status", "b0622d4"], capture_output=True, text=True, cwd=root_dir, shell=True)
    print("FILES IN COMMIT b0622d4:")
    print(res.stdout)
    
if __name__ == "__main__":
    check()
