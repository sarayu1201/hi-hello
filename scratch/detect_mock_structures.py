import re
import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def classify_text(text):
    text_l = text.lower()
    # English keywords
    if any(w in text_l for w in ["passage", "grammatical", "synonym", "antonym", "spelling", "sentence", "meaning", "phrase"]):
        return "English Language"
    # Quant keywords
    if any(w in text_l for w in ["speed", "ratio", "average", "compound interest", "simple interest", "profit", "loss", "percentage", "upstream", "downstream", "train", "work", "time and work", "x2", "y2", "equation"]):
        return "Quantitative Aptitude"
    # Reasoning keywords
    if any(w in text_l for w in ["puzzle", "floor", "seating", "blood", "direction", "box", "born", "months", "dates", "conclusions", "statements"]):
        return "Reasoning Ability"
        
    # Heuristics on text characters
    if re.search(r'[\u03c5-\u03c9]', text): # Greek letters/math symbols
        return "Quantitative Aptitude"
        
    return "Unknown"

def detect_test_order(test_num):
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

    # Classify Q10, Q50, Q90
    subj_10 = classify_text(questions.get(10, ""))
    subj_50 = classify_text(questions.get(50, ""))
    subj_90 = classify_text(questions.get(90, ""))
    
    print(f"Test {test_num}:")
    print(f"  Q10: {subj_10}  | snippet: '{questions.get(10, '')[:60]}...'")
    print(f"  Q50: {subj_50}  | snippet: '{questions.get(50, '')[:60]}...'")
    print(f"  Q90: {subj_90}  | snippet: '{questions.get(90, '')[:60]}...'")

for i in range(1, 11):
    detect_test_order(i)
