import re
import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def parse_and_check(test_num):
    file_path = os.path.join(dumps_dir, f"test{test_num}_text.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    sol_idx = -1
    header_match = re.search(r'^\s*(SOLUTIONS|ANSWERS & EXPLANATIONS|ANSWERS|DETAILED SOLUTIONS|HINTS & SOLUTIONS|HINTS)\s*$', text, re.MULTILINE | re.IGNORECASE)
    if header_match:
        sol_idx = header_match.start()
    else:
        first_sol_match = re.search(r'^\s*S?1\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', text, re.MULTILINE | re.IGNORECASE)
        if not first_sol_match:
            first_sol_match = re.search(r'^\s*S?1\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', text, re.MULTILINE | re.IGNORECASE)
        if first_sol_match:
            sol_idx = first_sol_match.start()
            
    questions_text = text[:sol_idx]
    
    # Refined regex:
    # 1. ^\s*(?:Q\s*\.?\s*)?([1-9]\d*)\s*\.\s*(?!\d)
    # 2. (?:\b|(?<=[a-zA-Z]))Q([1-9]\d*)\s*\.\s*(?!\d)
    pattern = r'(?:^\s*(?:Q\s*\.?\s*)?([1-9]\d*)\s*\.\s*(?!\d)|(?<=[a-zA-Z])Q([1-9]\d*)\s*\.\s*(?!\d))'
    q_matches = list(re.finditer(pattern, questions_text, re.MULTILINE | re.IGNORECASE))
    
    nums = []
    for m in q_matches:
        num_str = m.group(1) or m.group(2)
        num = int(num_str)
        if 1 <= num <= 100:
            nums.append(num)
            
    # Sort and remove duplicates to see unique count
    unique_nums = sorted(list(set(nums)))
    print(f"Test {test_num}: parsed {len(unique_nums)} unique question numbers (total matches: {len(nums)}).")
    if len(unique_nums) != 100:
        missing = [n for n in range(1, 101) if n not in unique_nums]
        print(f"  Missing: {missing}")
        extra = [n for n in unique_nums if n > 100 or n < 1]
        print(f"  Extra: {extra}")

parse_and_check(5)
parse_and_check(8)
parse_and_check(10)
