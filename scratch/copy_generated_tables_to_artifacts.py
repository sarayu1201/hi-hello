import os
import shutil

src_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images\\ibps_clerk_prelims"
dest_dir = "C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\2c767794-1854-4b5d-9e5f-fcb36b865f91"

os.makedirs(dest_dir, exist_ok=True)

files = [
    "ibps_clerk_prelims_test3_table_functions.png",
    "ibps_clerk_prelims_test5_table_bikes.png"
]

for filename in files:
    src_file = os.path.join(src_dir, filename)
    if os.path.exists(src_file):
        dest_file = os.path.join(dest_dir, filename)
        shutil.copy(src_file, dest_file)
        print(f"Copied {filename} to artifacts directory (Size: {os.path.getsize(dest_file)} bytes)")
