import re
import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def print_nums(test_num):
    file_path = os.path.join(dumps_dir, f"test{test_num}_text.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    # Find solutions index using line-level headers
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
    
    q_matches_with_0 = list(re.finditer(r'^\s*(?:Q\s*\.?\s*)?(\d+)\s*\.\s*', questions_text, re.MULTILINE | re.IGNORECASE))
    nums_with_0 = [int(m.group(1)) for m in q_matches_with_0]
    
    q_matches_without_0 = list(re.finditer(r'^\s*(?:Q\s*\.?\s*)?([1-9]\d*)\s*\.\s*', questions_text, re.MULTILINE | re.IGNORECASE))
    nums_without_0 = [int(m.group(1)) for m in q_matches_without_0]
    
    print(f"\n=================== Test {test_num} ===================")
    print("Parsed question numbers (allowing 0):", len(nums_with_0))
    print(nums_with_0)
    print("Parsed question numbers (excluding 0):", len(nums_without_0))
    print(nums_without_0)

print_nums(5)
print_nums(8)
print_nums(10)
