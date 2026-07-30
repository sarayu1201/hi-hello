import zipfile
import os

zip_path = "C:\\Users\\LENOVO\\Downloads\\ibps clerk.zip"
if not os.path.exists(zip_path):
    print("Zip file not found at", zip_path)
else:
    print("Listing zip contents for:", zip_path)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for info in zip_ref.infolist():
            print(f"  {info.filename} ({info.file_size} bytes)")
