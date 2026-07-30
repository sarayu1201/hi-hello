import os
import re

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps\\test2_text.txt"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
for idx, line in enumerate(lines[:120]):
    if "drop back" in line.lower():
        print(f"--- Raw Text around Line {idx+1} ---")
        for k in range(max(0, idx - 10), min(len(lines), idx + 10)):
            print(f"{k+1}: '{lines[k]}'")
        break
