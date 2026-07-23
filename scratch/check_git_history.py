import subprocess
import os

def check_history():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    try:
        res = subprocess.run(["git", "show", "--name-status", "HEAD"], capture_output=True, text=True, cwd=root_dir, shell=True)
        print("LAST COMMIT STATUS AND PATHS:")
        print(res.stdout)
    except Exception as e:
        print(f"Error checking git history: {e}")

if __name__ == "__main__":
    check_history()
