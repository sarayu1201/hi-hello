import os
import re

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test10_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

print("Finding occurrences of solutions-like headers in Test 10:")
lines = text.split("\n")
for idx, line in enumerate(lines):
    if re.search(r'^\s*(solutions|answers|explanations|hints)\s*$', line, re.IGNORECASE):
        print(f"Line {idx+1}: '{line.strip()}'")
