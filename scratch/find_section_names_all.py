import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def search_section_headers(test_num):
    file_path = os.path.join(dumps_dir, f"test{test_num}_text.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print(f"\n=================== Test {test_num} ===================")
    lines = text.split("\n")
    for idx, line in enumerate(lines[:1200]):
        line_clean = line.strip().upper()
        # Find lines containing English, Reasoning, Numerical, Quantitative
        if any(term in line_clean for term in ["ENGLISH", "REASONING", "NUMERICAL", "QUANTITATIVE"]):
            # Ignore lines containing "question", "passage", "direction"
            if not any(term in line_clean for term in ["QUESTION", "PASSAGE", "DIRECTIONS", "DIRECT"]):
                # Show lines that are short (usually headers are short)
                if len(line_clean) < 40:
                    print(f"Line {idx+1}: '{line.strip()}'")

for i in [1, 6, 7, 8, 9, 10]:
    search_section_headers(i)
