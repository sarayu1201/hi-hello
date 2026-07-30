import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"
failing = [7, 8, 9, 10]

for i in failing:
    file_path = os.path.join(dumps_dir, f"test{i}_text.txt")
    if not os.path.exists(file_path):
        continue
    print(f"\n=================== Test {i} ===================")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print("Start snippet (first 600 chars):")
    print(text[:600])
    
    print("Question number matches in first 50 lines:")
    lines = text.split("\n")
    matched_count = 0
    for idx, line in enumerate(lines[:150]):
        if re.search(r'\b(Q\s*\.?\s*\d+|\d+\.)\b', line, re.IGNORECASE):
            print(f"  Line {idx+1}: {line.strip()}")
            matched_count += 1
            if matched_count > 10:
                break
