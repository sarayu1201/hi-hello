import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def search_sol(test_idx, q_start, q_end):
    file_path = os.path.join(dumps_dir, f"test{test_idx}_text.txt")
    if not os.path.exists(file_path):
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    lines = text.split("\n")
    print(f"\n================ TEST {test_idx} (Q{q_start}-{q_end}) ================")
    
    for q_num in range(q_start, q_end + 1):
        found = False
        # Search for pattern like "S36. " or "S61. " or "36. ("
        patterns = [
            f"S{q_num}.",
            f" {q_num}. (",
            f" {q_num}."
        ]
        
        for idx, line in enumerate(lines):
            if any(p in line for p in patterns) and idx > 800:
                print(f"--- Q{q_num} Solution (Line {idx+1}) ---")
                # Print the line and the next 10 lines
                for k in range(0, 8):
                    if idx+k < len(lines):
                        print(f"  {lines[idx+k]}")
                found = True
                break
        if not found:
            # Fallback search anywhere in the file
            for idx, line in enumerate(lines):
                if f"S{q_num}." in line or f"Sol. {q_num}" in line:
                    print(f"--- Q{q_num} Solution (Fallback Line {idx+1}) ---")
                    for k in range(0, 8):
                        if idx+k < len(lines):
                            print(f"  {lines[idx+k]}")
                    break

# Map from the previous scan:
# Test 1 Q41-45 (residents bar graph)
# Test 2 Q61-65 (houses line graph)
# Test 3 Q61-65 (functions table)
# Test 4 Q31-35 (boats line graph)
# Test 5 Q36-40 (bikes table)
# Test 6 Q36-40 (boats line graph)
# Test 7 Q36-40 (bikes table)
# Test 8 Q31-35 (orders line graph)
# Test 9 Q31-35 (books table), Q36-40 (malls line graph)
# Test 10 Q31-35 (kiwi table), Q36-40 (persons bar graph)

search_sol(1, 41, 45)
search_sol(2, 61, 65)
search_sol(3, 61, 65)
search_sol(4, 31, 35)
search_sol(5, 36, 40)
search_sol(6, 36, 40)
search_sol(7, 36, 40)
search_sol(8, 31, 35)
search_sol(9, 31, 40)
search_sol(10, 31, 40)
