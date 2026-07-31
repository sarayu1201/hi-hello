import os
import shutil

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
src_dir = os.path.join(workspace_dir, "QuestionBank", "images", "ibps_clerk_prelims")
dest_dir = os.path.join(workspace_dir, "backend", "uploads", "images", "ibps_clerk_prelims")

print("=== Copying Images to Backend Directory ===")
if not os.path.exists(src_dir):
    print(f"Error: Source directory {src_dir} not found.")
else:
    os.makedirs(dest_dir, exist_ok=True)
    files = os.listdir(src_dir)
    for filename in files:
        src_file = os.path.join(src_dir, filename)
        if os.path.isfile(src_file):
            dest_file = os.path.join(dest_dir, filename)
            shutil.copy(src_file, dest_file)
            print(f"Copied: {filename} -> backend/uploads/images/ibps_clerk_prelims/")
            
print("\nCopy complete!")
