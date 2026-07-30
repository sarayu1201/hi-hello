import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def inspect_test(test_num):
    file_path = os.path.join(dumps_dir, f"test{test_num}_text.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print(f"\n=================== Inspecting Test {test_num} ===================")
    print(f"Total character length: {len(text)}")
    
    # Check SOLUTIONS index
    sol_idx = -1
    for term in ["solutions", "answers & explanations", "answers", "detailed solutions", "hints & solutions", "hints"]:
        idx = text.lower().find(term)
        if idx != -1:
            sol_idx = idx
            print(f"Found term '{term}' at index {idx} (Line {text[:idx].count(chr(10)) + 1})")
            break
            
    if sol_idx == -1:
        first_sol_match = re.search(r'(?:\n\s*S?1\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\))', text, re.IGNORECASE)
        if first_sol_match:
            sol_idx = first_sol_match.start()
            print(f"Found fallback first solution marker at index {sol_idx} (Line {text[:sol_idx].count(chr(10)) + 1})")
            
    if sol_idx == -1:
        print("SOLUTIONS section not found!")
        return
        
    questions_text = text[:sol_idx]
    solutions_text = text[sol_idx:]
    
    q_matches = list(re.finditer(r'^\s*(?:Q\s*\.?\s*)?(\d+)\s*\.\s*', questions_text, re.MULTILINE | re.IGNORECASE))
    print(f"Found {len(q_matches)} question markers in questions block.")
    if len(q_matches) > 0:
        print("First 3 question markers:")
        for qm in q_matches[:3]:
            print(f"  - Q{qm.group(1)} at index {qm.start()} (Line {questions_text[:qm.start()].count(chr(10)) + 1})")
        print("Last 3 question markers:")
        for qm in q_matches[-3:]:
            print(f"  - Q{qm.group(1)} at index {qm.start()} (Line {questions_text[:qm.start()].count(chr(10)) + 1})")
            
    sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', solutions_text, re.MULTILINE | re.IGNORECASE))
    if len(sol_matches) < 20:
        sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', solutions_text, re.MULTILINE | re.IGNORECASE))
    print(f"Found {len(sol_matches)} solution markers in solutions block.")
    if len(sol_matches) > 0:
        print("First 3 solution markers:")
        for sm in sol_matches[:3]:
            print(f"  - S{sm.group(1)} (Answer: {sm.group(2)}) at index {sm.start()} (Line {solutions_text[:sm.start()].count(chr(10)) + 1})")
        print("Last 3 solution markers:")
        for sm in sol_matches[-3:]:
            print(f"  - S{sm.group(1)} (Answer: {sm.group(2)}) at index {sm.start()} (Line {solutions_text[:sm.start()].count(chr(10)) + 1})")

inspect_test(4)
inspect_test(5)
inspect_test(10)
