import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test7_text.txt"

if os.path.exists(file_path):
    size = os.path.getsize(file_path)
    print(f"File size: {size} bytes")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read(500)
    print("First 500 characters:")
    print(repr(content))
else:
    print("File not found!")
