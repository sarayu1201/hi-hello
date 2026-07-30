import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test2_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
found = False
for idx, line in enumerate(lines):
    if "sufficient" in line.lower():
        found = True
        print(f"--- Found 'sufficient' at Line {idx+1} ---")
        start = max(0, idx - 10)
        end = min(len(lines), idx + 10)
        for k in range(start, end):
            print(f"{k+1}: '{lines[k]}'")
        print("-" * 40)

if not found:
    print("Substring 'sufficient' not found at all!")
