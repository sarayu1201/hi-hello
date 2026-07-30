import os
import re

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test6_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

print("First 800 characters of Test 6 text:")
print(text[:800])

print("\nLines matching question numbers in Test 6:")
lines = text.split("\n")
matched_count = 0
for idx, line in enumerate(lines):
    # Search for anything looking like "Q1." or "Q1" or "Q.1" or "1." at start of line
    if re.match(r'^\s*(Q\s*\.?\s*\d+|\d+\.)', line, re.IGNORECASE):
        print(f"Line {idx+1}: {line.strip()}")
        matched_count += 1
        if matched_count > 15:
            break
