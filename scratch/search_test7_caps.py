import os
import re

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test7_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Lines in Test 7 containing potential section indicators:")
for idx, line in enumerate(lines[:1000]):
    line_clean = line.strip()
    if not line_clean:
        continue
    # Look for lines containing "english", "quant", "reason", "math", "numerical", "ability", "aptitude"
    if re.search(r'\b(english|quant|reason|math|numerical|ability|aptitude|subject)\b', line_clean, re.IGNORECASE):
        print(f"Line {idx+1}: '{line_clean}'")
