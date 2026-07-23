import os
import subprocess
import shutil

def run_cmd(args):
    print(f"Running: {' '.join(args)}")
    res = subprocess.run(args, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  Error: {res.stderr.strip()}")
    else:
        print(f"  Output: {res.stdout.strip()}")
    return res.returncode == 0

def resolve():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    os.chdir(root_dir)
    
    # 1. Abort rebase
    run_cmd(["git", "rebase", "--abort"])
    
    # 2. Backup our modified files
    temp_dir = os.path.join(root_dir, "scratch", "backup_temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    server_js = os.path.join(root_dir, "backend", "server.js")
    importer_py = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    
    shutil.copy2(server_js, os.path.join(temp_dir, "server.js"))
    shutil.copy2(importer_py, os.path.join(temp_dir, "import_all_papers.py"))
    print("Backed up modified code files.")
    
    # 3. Fetch latest from GitHub
    run_cmd(["git", "fetch", "origin"])
    
    # 4. Reset hard to origin/main (to clean all local conflicts and match remote exactly)
    run_cmd(["git", "reset", "--hard", "origin/main"])
    
    # 5. Restore our files from backup
    shutil.copy2(os.path.join(temp_dir, "server.js"), server_js)
    shutil.copy2(os.path.join(temp_dir, "import_all_papers.py"), importer_py)
    print("Restored modified code files over the reset state.")
    
    # 6. Stage only the two modified files
    run_cmd(["git", "add", "backend/server.js", "QuestionBank/python/import_all_papers.py"])
    
    # 7. Commit changes
    run_cmd(["git", "commit", "-m", "Fix resolveDbSubType mapping and LaTeX text corruption/math splitting in importer"])
    
    # 8. Push to GitHub
    if run_cmd(["git", "push", "origin", "main"]):
        print("\nSUCCESS: Code pushed to GitHub successfully!")
    else:
        print("\nPush failed. Please check the output.")

if __name__ == "__main__":
    resolve()
