import os

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test10_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
print("=== Lines 520 to 570 of Test 10 ===")
for i in range(520, min(len(lines), 570)):
    print(f"{i+1}: {lines[i]}")
