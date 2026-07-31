import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

for i in range(1, 11):
    file_path = os.path.join(dumps_dir, f"test{i}_text.txt")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print(f"=== Test {i} Image Prompts ===")
    lines = text.split("\n")
    for idx, line in enumerate(lines):
        # We look for "Directions (31-" or "Directions (41-" or "Directions (51-" etc.
        if "directions" in line.lower() and ("graph" in line.lower() or "chart" in line.lower() or "table" in line.lower()):
            # Print the next 5 lines
            print(f"Line {idx+1}: {repr(line)}")
            for k in range(1, 4):
                print(f"  + {lines[idx+k]}")
            print("-" * 20)
