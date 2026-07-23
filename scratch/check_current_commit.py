import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    
    # 1. Print current branch and commits
    res = subprocess.run(["git", "log", "-n", "3", "--oneline"], capture_output=True, text=True, cwd=root_dir, shell=True)
    print("CURRENT LOCAL COMMITS:")
    print(res.stdout)
    
    # 2. Print git status
    res_status = subprocess.run(["git", "status"], capture_output=True, text=True, cwd=root_dir, shell=True)
    print("\nCURRENT GIT STATUS:")
    print(res_status.stdout)
    
if __name__ == "__main__":
    check()
