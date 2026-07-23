import subprocess
import os

def force_push():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    os.chdir(root_dir)
    
    # 1. Reset hard back to our local commit with all files
    print("Making sure all files are restored locally...")
    res1 = subprocess.run(["git", "reset", "--hard", "e4f0849"], capture_output=True, text=True)
    if res1.returncode != 0:
        print(f"Error resetting: {res1.stderr}")
        return
        
    print("Files restored successfully.")
    
    # 2. Force push to GitHub
    print("Force pushing to GitHub to match your local files...")
    res2 = subprocess.run(["git", "push", "-f", "origin", "main"], capture_output=True, text=True)
    if res2.returncode == 0:
        print("\nSUCCESS: Code force-pushed to GitHub successfully!")
        print("Your local files are safe, and GitHub now matches your local folder exactly.")
    else:
        print(f"\nPush failed: {res2.stderr}")

if __name__ == "__main__":
    force_push()
