import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    val_script = os.path.join(root_dir, "QuestionBank", "python", "validate_json.py")
    
    if os.path.exists(val_script):
        print(f"Running validation check after fixes...")
        res = subprocess.run(["python", val_script], cwd=root_dir, capture_output=True, text=True)
        print(f"Exit Code: {res.returncode}")
        if res.returncode == 0:
            print("\n=== VALIDATION PASSED ===")
            print("No errors! The deployment will build successfully on Render!")
        else:
            print("\n=== VALIDATION FAILED ===")
            print(res.stdout)
            print(res.stderr)
    else:
        print("Validation script not found!")

if __name__ == "__main__":
    check()
