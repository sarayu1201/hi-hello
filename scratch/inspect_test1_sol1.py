import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test1_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
sol_start = False
for idx, line in enumerate(lines):
    if "solutions" in line.lower() or "hints" in line.lower():
        if idx > len(lines) // 2:
            sol_start = True
    if sol_start and "1." in line:
        print(f"--- Found Solution 1 at Line {idx+1} ---")
        for k in range(max(0, idx - 5), min(len(lines), idx + 20)):
            print(f"{k+1}: '{lines[k]}'")
        print("-" * 40)
        break
