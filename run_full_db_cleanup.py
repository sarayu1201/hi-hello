import os
import shutil
import subprocess

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    json_dir = os.path.join(root_dir, "QuestionBank", "json")
    
    print("=== 1. Restoring Clean SBI Clerk JSONs from Root ===")
    for i in range(1, 11):
        src_name = f"sbi_clerk_test_{i}.json"
        src_path = os.path.join(root_dir, src_name)
        dst_path = os.path.join(json_dir, "sbi_clerk_prelims", src_name)
        if os.path.exists(src_path):
            shutil.copy(src_path, dst_path)
            print(f"Copied {src_name} to QuestionBank")
        else:
            print(f"Warning: {src_name} not found in root")
            
    print("\n=== 2. Running import_all_papers.py ===")
    importer_script = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    res = subprocess.run(["python", importer_script], cwd=root_dir, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print("Errors:")
        print(res.stderr)
        
    print("Database sync completed!")

if __name__ == "__main__":
    main()
