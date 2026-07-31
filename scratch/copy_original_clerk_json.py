import os
import shutil

src_dir = "C:\\Users\\LENOVO\\Downloads\\ibps_clerk_prelims\\ibps_clerk_prelims"
dest_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

try:
    if not os.path.exists(dest_dir):
        print(f"Creating directory: {dest_dir}")
        os.makedirs(dest_dir)
        
    print(f"Copying files from {src_dir} to {dest_dir}...")
    copied_count = 0
    for filename in os.listdir(src_dir):
        if filename.endswith(".json"):
            src_path = os.path.join(src_dir, filename)
            dest_path = os.path.join(dest_dir, filename)
            shutil.copy2(src_path, dest_path)
            print(f"  Copied: {filename} ({os.path.getsize(dest_path)} bytes)")
            copied_count += 1
            
    print(f"\nSuccessfully copied {copied_count} original JSON files.")
    
except Exception as e:
    print(f"An error occurred: {e}")
