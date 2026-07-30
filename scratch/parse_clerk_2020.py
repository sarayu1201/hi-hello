import re
import json

def parse_paper(txt_path):
    with open(txt_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Find where SOLUTIONS starts
    sol_idx = text.find("SOLUTIONS")
    if sol_idx == -1:
        print("Could not find SOLUTIONS section!")
        return None

    questions_text = text[:sol_idx]
    solutions_text = text[sol_idx:]

    # Pre-parse all direction blocks with ranges
    # Matches "Directions (X-Y): text" or similar
    dir_matches = list(re.finditer(r'Directions\s*\((\d+)\s*[-–]\s*(\d+)\)[:\s.]*(.*?)(?=\n\s*\d+\.|\n\s*Directions|\n\s*[A-Z\s]{8,}\n|$|\(([a-e])\))', questions_text, re.DOTALL | re.IGNORECASE))
    directions_by_range = []
    for dm in dir_matches:
        start_q = int(dm.group(1))
        end_q = int(dm.group(2))
        dir_text = dm.group(3).strip()
        directions_by_range.append({
            "start": start_q,
            "end": end_q,
            "text": dir_text
        })
    
    # Parse Questions
    q_matches = list(re.finditer(r'\n\s*(\d+)\.\s*', questions_text))
    questions = {}
    
    for idx, match in enumerate(q_matches):
        q_num = int(match.group(1))
        start_pos = match.end()
        end_pos = q_matches[idx + 1].start() if idx + 1 < len(q_matches) else len(questions_text)
        
        q_body_raw = questions_text[start_pos:end_pos].strip()
        
        # Parse options
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
                
                # Clean option values from directions or headers
                opt_val = re.split(r'(Directions\s*\(\d+[-–]\d+\)|NUMERICAL ABILITY|REASONING ABILITY|SOLUTIONS)', opt_val, flags=re.IGNORECASE)[0].strip()
                options.append({
                    "id": opt_letter,
                    "text": opt_val
                })
        
        # Strip directions from question text if it was included in the split
        q_text = re.split(r'(Directions\s*\(\d+[-–]\d+\)|NUMERICAL ABILITY|REASONING ABILITY|SOLUTIONS)', q_text, flags=re.IGNORECASE)[0].strip()
        
        # Assign direction if the question falls in a parsed range
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
    sol_matches = list(re.finditer(r'\n\s*(\d+)\.\s*', solutions_text))
    solutions = {}
    for idx, match in enumerate(sol_matches):
        s_num = int(match.group(1))
        start_pos = match.end()
        end_pos = sol_matches[idx + 1].start() if idx + 1 < len(sol_matches) else len(solutions_text)
        
        sol_body = solutions_text[start_pos:end_pos].strip()
        
        # The correct answer is usually the first letter in parentheses like (a) or (b)
        ans_match = re.match(r'\(([a-e])\)\s*', sol_body)
        correct_letter = "A"
        explanation = sol_body
        
        if ans_match:
            correct_letter = ans_match.group(1).upper()
            explanation = sol_body[ans_match.end():].strip()
            
        solutions[s_num] = {
            "correctAnswer": correct_letter,
            "explanation": explanation
        }

    # Merge Questions and Solutions
    merged = []
    for q_num in sorted(questions.keys()):
        q = questions[q_num]
        sol = solutions.get(q_num, {"correctAnswer": "A", "explanation": ""})
        
        # Determine subject based on question number
        subject = "English Language"
        if q_num > 30 and q_num <= 65:
            subject = "Quantitative Aptitude"
        elif q_num > 65:
            subject = "Reasoning Ability"

        # Determine topic
        topic = "N/A"
        
        merged.append({
            "id": q_num,
            "subject": subject,
            "topic": topic,
            "question": q["question"],
            "options": q["options"],
            "correctAnswer": sol["correctAnswer"],
            "explanation": sol["explanation"],
            "direction": q["direction"]
        })

    return merged

merged = parse_paper("c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_2020_pdf_text.txt")
if merged:
    print(f"Successfully parsed {len(merged)} questions!")
    print("\nSample parsed Q5:")
    print(json.dumps(merged[4], indent=2))
    print("\nSample parsed Q46:")
    print(json.dumps(merged[45], indent=2))
    print("\nSample parsed Q66:")
    print(json.dumps(merged[65], indent=2))
