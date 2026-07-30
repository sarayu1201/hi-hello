import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def inspect_sections(test_num):
    file_path = os.path.join(dumps_dir, f"test{test_num}_text.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print(f"\n=================== Section Headers in Test {test_num} ===================")
    lines = text.split("\n")
    for idx, line in enumerate(lines[:1200]): # questions portion
        line_clean = line.strip().upper()
        if "ENGLISH LANGUAGE" in line_clean or "NUMERICAL ABILITY" in line_clean or "QUANTITATIVE APTITUDE" in line_clean or "REASONING ABILITY" in line_clean:
            print(f"Line {idx+1}: '{line.strip()}'")
            
        # Also print first few questions near each header
        # Let's find matches near this line
        
inspect_sections(1)
inspect_sections(2)
inspect_sections(3)
inspect_sections(8)
