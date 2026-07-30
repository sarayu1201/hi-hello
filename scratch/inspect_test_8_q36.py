import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def get_questions_at(test_num, q_nums):
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
    
    # Parse Questions
    pattern = r'(?:^\s*(?:Q\s*\.?\s*)?([1-9]\d*)\s*\.\s*(?!\d)|(?<=[a-zA-Z])Q([1-9]\d*)\s*\.\s*(?!\d))'
    q_matches = list(re.finditer(pattern, questions_text, re.MULTILINE | re.IGNORECASE))
    
    seen_nums = set()
    filtered_q_matches = []
    for m in q_matches:
        num_str = m.group(1) or m.group(2)
        num = int(num_str)
        if 1 <= num <= 100 and num not in seen_nums:
            seen_nums.add(num)
            filtered_q_matches.append((num, m))
            
    filtered_q_matches.sort(key=lambda x: x[1].start())
    
    questions = {}
    for idx, (q_num, match) in enumerate(filtered_q_matches):
        start_pos = match.end()
        end_pos = filtered_q_matches[idx + 1][1].start() if idx + 1 < len(filtered_q_matches) else len(questions_text)
        questions[q_num] = questions_text[start_pos:end_pos].strip()

    print(f"\n=================== Test {test_num} ===================")
    for q_num in q_nums:
        snippet = questions.get(q_num, "Not Found")
        # Keep first 200 chars
        snippet_clean = snippet.replace('\n', ' ')[:180]
        print(f"Q{q_num}: {snippet_clean}...")

get_questions_at(8, [31, 35, 36, 65, 66, 70, 71])
get_questions_at(9, [31, 35, 36, 65, 66, 70, 71])
get_questions_at(10, [31, 35, 36, 65, 66, 70, 71])
