import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

print("=== Scanning Clerk Text Dumps for Math Solutions ===")
for test_idx in range(1, 11):
    file_path = os.path.join(dumps_dir, f"test{test_idx}_text.txt")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    lines = text.split("\n")
    found_sols = []
    for idx, line in enumerate(lines):
        # Match lines like "S31. Ans" or "S46. Ans" or "S61. Ans"
        m = re.search(r'S(\d+)\.\s+Ans\.', line)
        if m:
            found_sols.append((int(m.group(1)), idx+1, line))
            
    if found_sols:
        print(f"Test {test_idx}: Found {len(found_sols)} solutions starting with S<num>. Range: {min(found_sols)[0]} to {max(found_sols)[0]}")
        # Print a few examples
        for q_num, line_num, l_content in sorted(found_sols)[:5]:
            print(f"  - Q{q_num} (Line {line_num}): {l_content}")
    else:
        print(f"Test {test_idx}: No S<num>. Ans. matches found.")
