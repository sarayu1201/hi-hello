import os
import shutil
import subprocess

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    sbi_folder = os.path.join(root_dir, "QuestionBank", "json", "sbi_clerk_prelims")
    
    print("=== 1. Deleting all SBI Clerk files from root ===")
    for i in range(1, 11):
        filename = f"sbi_clerk_test_{i}.json"
        root_path = os.path.join(root_dir, filename)
        if os.path.exists(root_path):
            os.remove(root_path)
            print(f"Deleted {filename} from root")
            
    print("\n=== 2. Deleting the sbi_clerk_prelims folder recursively ===")
    if os.path.exists(sbi_folder):
        shutil.rmtree(sbi_folder)
        print("Deleted sbi_clerk_prelims folder completely!")
    else:
        print("sbi_clerk_prelims folder not found")

    print("\n=== 3. Rebuilding the Database (Clearing SBI Clerk from MongoDB) ===")
    importer_script = os.path.join(root_dir, "QuestionBank", "python", "import_all_papers.py")
    res = subprocess.run(["python", importer_script], cwd=root_dir, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print("Errors during import:")
        print(res.stderr)
        
    print("All SBI Clerk data and folder deleted successfully!")

if __name__ == "__main__":
    main()
