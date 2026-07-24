import json
import os
import re

def clean_segment(s):
    s = s.strip()
    s = re.sub(r'^[\s/\-.,;:]+', '', s)
    s = re.sub(r'[\s/\-.,;:]+$', '', s)
    return s.strip()

def parse_question_data(question_text):
    # Find positions of (A), (B), (C), (D) or (a), (b), (c), (d)
    pos_a = re.search(r'\(\s*[Aa]\s*\)', question_text)
    pos_b = re.search(r'\(\s*[Bb]\s*\)', question_text)
    pos_c = re.search(r'\(\s*[Cc]\s*\)', question_text)
    pos_d = re.search(r'\(\s*[Dd]\s*\)', question_text)
    
    if not (pos_a and pos_b and pos_c and pos_d):
        return None
        
    idx_a = pos_a.start()
    idx_b = pos_b.start()
    idx_c = pos_c.start()
    idx_d = pos_d.start()
    
    part_before_a = question_text[:idx_a]
    part_a_b = question_text[pos_a.end():idx_b]
    part_b_c = question_text[pos_b.end():idx_c]
    part_c_d = question_text[pos_c.end():idx_d]
    part_after_d = question_text[pos_d.end():]
    
    # Check if this is Case 2 (label-before):
    # If the part_before_a ends with a punctuation (excluding trailing spaces) and has no actual sentence words,
    # or if we find the last punctuation in part_before_a and the part after it is empty or just spaces/slashes.
    is_label_before = False
    
    # Find last index of . or : or ? in part_before_a
    last_punc = -1
    for i in range(len(part_before_a) - 1, -1, -1):
        if part_before_a[i] in ['.', ':', '?', '!']:
            last_punc = i
            break
            
    if last_punc != -1:
        clean_instr = part_before_a[:last_punc + 1].strip()
        sentence_start = part_before_a[last_punc + 1:].strip()
    else:
        clean_instr = ""
        sentence_start = part_before_a.strip()
        
    if not clean_segment(sentence_start):
        is_label_before = True
        
    if is_label_before:
        # Case 2: (A) OptA (B) OptB (C) OptC (D) OptD
        opt_a = clean_segment(part_a_b)
        opt_b = clean_segment(part_b_c)
        opt_c = clean_segment(part_c_d)
        opt_d = clean_segment(part_after_d)
        
        new_q = clean_instr if clean_instr else "Identify the correct option."
    else:
        # Case 1: OptA (A) / OptB (B) / OptC (C) / OptD (D)
        opt_a = clean_segment(sentence_start)
        opt_b = clean_segment(part_a_b)
        opt_c = clean_segment(part_b_c)
        opt_d = clean_segment(part_c_d)
        
        # Clean the sentence of any trailing period (e.g. from the end of the question)
        opt_d_clean = re.sub(r'\.+$', '', opt_d).strip()
        
        clean_sentence = f"{opt_a} / {opt_b} / {opt_c} / {opt_d_clean}"
        
        # Standardize instructions
        if "no error" in clean_instr.lower() or "free from error" in clean_instr.lower():
            instr_part = "Identify the part of the sentence that contains an error. If the sentence is free from error, choose 'No Error'."
        else:
            instr_part = "Identify the part of the sentence that contains an error."
        new_q = f"{instr_part}\n\n{clean_sentence}"
        
    return {
        "question": new_q,
        "options": [
            {"id": "A", "text": opt_a},
            {"id": "B", "text": opt_b},
            {"id": "C", "text": opt_c},
            {"id": "D", "text": opt_d}
        ]
    }

def test():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    pattern = r'\(A\).*?\(B\).*?\(C\).*?\(D\)'
    
    for filename in files:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q.get("id")
            question = q.get("question", "") or ""
            
            if re.search(pattern, question, re.IGNORECASE):
                parsed = parse_question_data(question)
                if parsed:
                    print(f"=== {filename} Q{q_id} ===")
                    print(f"Original: {repr(question)}")
                    print(f"Parsed Question: {repr(parsed['question'])}")
                    print("Parsed Options:")
                    for opt in parsed["options"]:
                        print(f"  {opt['id']}: {repr(opt['text'])}")
                    print("-" * 60)

if __name__ == "__main__":
    test()
