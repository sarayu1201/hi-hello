import re
import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def analyze_test_subjects(test_num):
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
    
    # 1. Resolve subject header positions
    header_regex = r'(REASONING\s+ABILITY|NUMERICAL\s+ABILITY|QUANTITATIVE\s+APTITUDE|ENGLISH\s+LANGUAGE)'
    matches = list(re.finditer(header_regex, questions_text, re.IGNORECASE))
    
    headers = []
    for m in matches:
        header_text = m.group(1).upper()
        subject = ""
        if "REASONING" in header_text:
            subject = "Reasoning Ability"
        elif "NUMERICAL" in header_text or "QUANTITATIVE" in header_text:
            subject = "Quantitative Aptitude"
        elif "ENGLISH" in header_text:
            subject = "English Language"
        headers.append((m.start(), subject))
        
    headers.sort(key=lambda x: x[0])
    
    # 2. Parse Questions
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
    
    subject_counts = {"English Language": 0, "Quantitative Aptitude": 0, "Reasoning Ability": 0, "Unknown": 0}
    for q_num, match in filtered_q_matches:
        # Determine subject dynamically based on preceding header
        q_pos = match.start()
        q_subject = "Unknown"
        for h_pos, h_subj in headers:
            if h_pos < q_pos:
                q_subject = h_subj
            else:
                break
        subject_counts[q_subject] += 1
        
    print(f"Test {test_num}: English: {subject_counts['English Language']}, Quant: {subject_counts['Quantitative Aptitude']}, Reasoning: {subject_counts['Reasoning Ability']}, Unknown: {subject_counts['Unknown']}")

for i in range(1, 11):
    analyze_test_subjects(i)
