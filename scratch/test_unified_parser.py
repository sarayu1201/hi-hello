import re
import os
import json

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def parse_text(text):
    # Find solutions index using line-level headers
    sol_idx = -1
    header_match = re.search(r'^\s*(SOLUTIONS|ANSWERS & EXPLANATIONS|ANSWERS|DETAILED SOLUTIONS|HINTS & SOLUTIONS|HINTS)\s*$', text, re.MULTILINE | re.IGNORECASE)
    if header_match:
        sol_idx = header_match.start()
    else:
        # Fallback to the first answer marker S1 or 1
        first_sol_match = re.search(r'^\s*S?1\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', text, re.MULTILINE | re.IGNORECASE)
        if not first_sol_match:
            first_sol_match = re.search(r'^\s*S?1\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', text, re.MULTILINE | re.IGNORECASE)
        if first_sol_match:
            sol_idx = first_sol_match.start()
            
    if sol_idx == -1:
        return None, "SOLUTIONS section not found"

    questions_text = text[:sol_idx]
    solutions_text = text[sol_idx:]

    # Parse directions
    dir_matches = list(re.finditer(r'Directions\s*\((\d+)\s*[-–]\s*(\d+)\)[:\s.]*(.*?)(?=\n\s*\d+\.|\n\s*Directions|\n\s*[A-Z\s]{8,}\n|$|\(([a-e])\))', questions_text, re.DOTALL | re.IGNORECASE))
    directions_by_range = []
    for dm in dir_matches:
        try:
            start_q = int(dm.group(1))
            end_q = int(dm.group(2))
            dir_text = dm.group(3).strip()
            directions_by_range.append({
                "start": start_q,
                "end": end_q,
                "text": dir_text
            })
        except Exception:
            pass
            
    # Parse Questions
    q_matches = list(re.finditer(r'^\s*(?:Q\s*\.?\s*)?(\d+)\s*\.\s*', questions_text, re.MULTILINE | re.IGNORECASE))

    questions = {}
    for idx, match in enumerate(q_matches):
        q_num = int(match.group(1))
        start_pos = match.end()
        end_pos = q_matches[idx + 1].start() if idx + 1 < len(q_matches) else len(questions_text)
        
        q_body_raw = questions_text[start_pos:end_pos].strip()
        
        options = []
        q_text = q_body_raw
        
        opt_matches = list(re.finditer(r'\(([a-e])\)\s*', q_body_raw))
        if opt_matches:
            q_text = q_body_raw[:opt_matches[0].start()].strip()
            for o_idx, opt_match in enumerate(opt_matches):
                opt_letter = opt_match.group(1).upper()
                opt_start = opt_match.end()
                opt_end = opt_matches[o_idx + 1].start() if o_idx + 1 < len(opt_matches) else len(q_body_raw)
                opt_val = q_body_raw[opt_start:opt_end].strip()
                
                # Clean opt_val
                opt_val = re.split(r'(Directions\s*\(\d+[-–]\d+\)|NUMERICAL ABILITY|REASONING ABILITY|SOLUTIONS|ANSWERS)', opt_val, flags=re.IGNORECASE)[0].strip()
                options.append({
                    "id": opt_letter,
                    "text": opt_val
                })
                
        # Clean q_text
        q_text = re.split(r'(Directions\s*\(\d+[-–]\d+\)|NUMERICAL ABILITY|REASONING ABILITY|SOLUTIONS|ANSWERS)', q_text, flags=re.IGNORECASE)[0].strip()
        
        q_direction = ""
        for dr in directions_by_range:
            if dr["start"] <= q_num <= dr["end"]:
                q_direction = dr["text"]
                break
                
        questions[q_num] = {
            "id": q_num,
            "question": q_text,
            "options": options,
            "direction": q_direction
        }

    # Parse Solutions
    sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', solutions_text, re.MULTILINE | re.IGNORECASE))
    if len(sol_matches) < 20:
        sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', solutions_text, re.MULTILINE | re.IGNORECASE))
        
    solutions = {}
    for idx, match in enumerate(sol_matches):
        s_num = int(match.group(1))
        ans_letter = match.group(2).upper()
        
        start_pos = match.end()
        end_pos = sol_matches[idx + 1].start() if idx + 1 < len(sol_matches) else len(solutions_text)
        
        sol_body = solutions_text[start_pos:end_pos].strip()
        
        # Strip Sol. prefix if present at start
        if sol_body.lower().startswith("sol."):
            sol_body = sol_body[4:].strip()
            
        # Clean explanation of BankersAdda / Adda247 lines
        clean_lines = []
        for line in sol_body.split("\n"):
            line_l = line.lower()
            if "adda247" in line_l or "bankersadda" in line_l or "sscadda" in line_l or "website:" in line_l or "email:" in line_l:
                continue
            clean_lines.append(line)
        explanation = "\n".join(clean_lines).strip()
        
        solutions[s_num] = {
            "correctAnswer": ans_letter,
            "explanation": explanation
        }
        
    # Merge
    merged = []
    for q_num in sorted(questions.keys()):
        q = questions[q_num]
        sol = solutions.get(q_num, {"correctAnswer": "A", "explanation": ""})
        merged.append({
            "id": q_num,
            "question": q["question"],
            "options": q["options"],
            "correctAnswer": sol["correctAnswer"],
            "explanation": sol["explanation"],
            "direction": q["direction"]
        })
        
    return merged, None

for i in range(1, 11):
    file_path = os.path.join(dumps_dir, f"test{i}_text.txt")
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    parsed, err = parse_text(text)
    if err:
        print(f"Test {i}: FAILED - {err}")
    else:
        print(f"Test {i}: PASSED - parsed {len(parsed)} questions.")
        if len(parsed) > 0:
            print(f"  First question text snippet: '{parsed[0]['question'][:60]}...'")
            print(f"  First solution answer: {parsed[0]['correctAnswer']}")
