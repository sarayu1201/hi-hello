import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test1_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
for idx, line in enumerate(lines):
    if "79." in line:
        print(f"--- Found '79.' at Line {idx+1} ---")
        for k in range(max(0, idx - 10), min(len(lines), idx + 20)):
            print(f"{k+1}: '{lines[k]}'")
        print("-" * 40)
        break
