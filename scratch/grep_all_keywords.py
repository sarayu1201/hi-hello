import os
import re

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test7_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

print("Searching entire test7_text.txt for keywords...")
lines = text.split("\n")
matched = 0
for idx, line in enumerate(lines):
    if re.search(r'\b(english|reasoning|numerical|quantitative|ability|aptitude)\b', line, re.IGNORECASE):
        print(f"Line {idx+1}: '{line.strip()}'")
        matched += 1
        if matched > 30:
            print("Too many matches, truncating...")
            break
