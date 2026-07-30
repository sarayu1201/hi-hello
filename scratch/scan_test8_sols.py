import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test8_text.txt"

if not os.path.exists(file_path):
    print("File does not exist:", file_path)
    exit()

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
print(f"Total lines in test8_text.txt: {len(lines)}")
for idx, line in enumerate(lines):
    if "18" in line:
        print(f"Line {idx+1}: {repr(line)}")
