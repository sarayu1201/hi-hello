import os
import shutil

def copy_src():
    src_dir = r"c:\Users\LENOVO\Downloads\akhil-website\hi-hello\frontend"
    dest_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main\frontend"
    
    if not os.path.exists(src_dir):
        print(f"Source folder not found: {src_dir}")
        return
        
    print(f"Copying frontend files from:\n  {src_dir}\nto:\n  {dest_dir}\n")
    
    # Custom walk to copy directories and files excluding node_modules and dist
    for root, dirs, files in os.walk(src_dir):
        # Ignore node_modules and dist/build folders
        if "node_modules" in root or "dist" in root or ".git" in root:
            continue
            
        rel_path = os.path.relpath(root, src_dir)
        target_dir = dest_dir if rel_path == "." else os.path.join(dest_dir, rel_path)
        
        os.makedirs(target_dir, exist_ok=True)
        
        for f in files:
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_dir, f)
            shutil.copy2(src_file, dest_file)
            print(f"Copied: frontend/{os.path.relpath(dest_file, dest_dir)}")
            
    print("\nSUCCESS: Frontend source files successfully copied!")

if __name__ == "__main__":
    copy_src()
