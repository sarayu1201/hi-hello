import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def inspect_lines(test_num, start_line, end_line):
    file_path = os.path.join(dumps_dir, f"test{test_num}_text.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    print(f"\n=== Test {test_num} Lines {start_line} to {end_line} ===")
    for idx in range(start_line - 1, min(len(lines), end_line)):
        print(f"{idx+1}: {lines[idx].strip()}")

# Search for the string "8064" in test 10 text
file_path_10 = os.path.join(dumps_dir, "test10_text.txt")
with open(file_path_10, "r", encoding="utf-8") as f:
    t10_lines = f.readlines()
for idx, l in enumerate(t10_lines):
    if "8064" in l:
        print(f"Test 10 line containing '8064' (Line {idx+1}): '{l.strip()}'")
        inspect_lines(10, max(1, idx - 3), min(len(t10_lines), idx + 5))

# Search for Q52 in test 8
file_path_8 = os.path.join(dumps_dir, "test8_text.txt")
with open(file_path_8, "r", encoding="utf-8") as f:
    t8_lines = f.readlines()
for idx, l in enumerate(t8_lines):
    if "52." in l or "52 " in l or "52" in l:
        if re.search(r'\b52\b', l):
            print(f"Test 8 line containing '52' (Line {idx+1}): '{l.strip()}'")
            inspect_lines(8, max(1, idx - 3), min(len(t8_lines), idx + 5))
