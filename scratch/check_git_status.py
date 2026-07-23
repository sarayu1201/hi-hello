import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    res = subprocess.run(["git", "status"], capture_output=True, text=True, cwd=root_dir, shell=True)
    print("GIT STATUS OUTPUT:")
    print(res.stdout)
    
if __name__ == "__main__":
    check()
