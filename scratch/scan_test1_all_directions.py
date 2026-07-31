import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

file_path = os.path.join(dumps_dir, "test1_text.txt")
if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print("=== Test 1 All Directions ===")
    lines = text.split("\n")
    for idx, line in enumerate(lines):
        if "directions" in line.lower():
            print(f"Line {idx+1}: {line}")
