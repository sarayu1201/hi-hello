import subprocess
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    val_script = os.path.join(root_dir, "QuestionBank", "python", "validate_json.py")
    
    if os.path.exists(val_script):
        res = subprocess.run(["python", val_script], cwd=root_dir, capture_output=True, text=True)
        # Scan output for the === VALIDATION FAILED === block or stderr
        lines = res.stdout.splitlines()
        
        # Find where VALIDATION FAILED starts
        failed_start = -1
        for idx, line in enumerate(lines):
            if "=== VALIDATION FAILED ===" in line:
                failed_start = idx
                break
                
        if failed_start != -1:
            print("Validation Errors:")
            for line in lines[failed_start:]:
                print(line)
        else:
            print("No failure header found. Stderr:")
            print(res.stderr)
            print("Stdout suffix:")
            print("\n".join(lines[-20:]))
    else:
        print("Validation script not found!")

if __name__ == "__main__":
    check()
