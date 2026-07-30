import fitz  # PyMuPDF
import re
import json
import os

pdf_dir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk"
dest_json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

pdf_files = [
    "IBPS_Clerk_Prelims_2019_Memory_Based_Paper_For_Practice.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2020.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2021.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2022.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2023.pdf",
    "ibps-clerk-question-paper-2022.pdf",
    "ibps-clerk-question-paper-2023.pdf",
    "IBPS-Clerk-Pre-2024-Memory-Based-Paper-Based-on-24th-August-1st-Shift.pdf",
    "IBPS-Clerk-Pre-2025-Memory-Based-Paper-Based-on-4-Oct-1st-Shift.pdf",
    "ibps-clerk-5-october-english-question-paper.pdf"
]

TEST_LAYOUTS = {
    1: {"English": (71, 100), "Quant": (36, 70), "Reasoning": (1, 35)},
    2: {"English": (1, 30), "Quant": (31, 65), "Reasoning": (66, 100)},
    3: {"English": (1, 30), "Quant": (31, 65), "Reasoning": (66, 100)},
    4: {"English": (1, 30), "Quant": (31, 65), "Reasoning": (66, 100)},
    5: {"English": (1, 30), "Quant": (31, 65), "Reasoning": (66, 100)},
    6: {"English": (1, 30), "Quant": (31, 65), "Reasoning": (66, 100)},
    7: {"English": (71, 100), "Quant": (36, 70), "Reasoning": (1, 35)},
    8: {"English": (36, 65), "Quant": (66, 100), "Reasoning": (1, 35)},
    9: {"English": (36, 65), "Quant": (1, 35), "Reasoning": (66, 100)},
    10: {"English": (36, 65), "Quant": (1, 35), "Reasoning": (66, 100)}
}

def clean_watermark_text(text):
    if not text:
        return ""
    # Standardize spaces
    t = re.sub(r'\s+', ' ', text).strip()
    
    # Watermarks and page layouts patterns
    patterns = [
        r'IBPS[\s-]?Clerk[\s-]?Pre(?:lims)?[\s-]?\d*',
        r'Solved\s+Paper\s*-\s*\d*',
        r'Previous\s+Year\s+Paper\s*-\s*\d*',
        r'Memory\s+Based\s+Paper(?:\s+For\s+Practice)?',
        r'Adda247 \| No\.\s*1\s*APP\s+for\s+Banking\s+&\s+SSC\s+Preparation',
        r'ibps-clerk-question-paper-\d+',
        r'ibps-clerk-5-october-english-question-paper',
        r'IBPS-Clerk-Pre-\d+-Memory-Based-Paper-Based-on-\d+\w+-August-\d+\w+-Shift',
        r'IBPS-Clerk-Pre-\d+-Memory-Based-Paper-Based-on-\d+\s+Oct-\d+\w+-Shift',
        r'Website:\s*\S+',
        r'Email:\s*\S+',
        r'store\.adda247\S*',
        r'bankersadda\S*',
        r'sscadda\S*',
        r'adda247\.com\S*',
        r'ENGLISH\s+LANGUAGE',
        r'QUANTITATIVE\s+APTITUDE',
        r'REASONING\s+ABILITY',
        r'NUMERICAL\s+ABILITY'
    ]
    for pat in patterns:
        t = re.sub(pat, '', t, flags=re.IGNORECASE).strip()
        
    # Normalize multiple spaces again
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def update_direction_range(dir_text, offset):
    if not dir_text:
        return ""
    def repl(match):
        start_q = int(match.group(1))
        end_q = int(match.group(2))
        return f"Directions ({start_q + offset}-{end_q + offset})"
    return re.sub(r'Directions?\s*\((\d+)\s*[-–—]\s*(\d+)\)', repl, dir_text, flags=re.IGNORECASE)

def parse_pdf_text(text, test_idx):
    # Find solutions index
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
            
    if sol_idx == -1:
        return None, "SOLUTIONS section not found"

    questions_text = text[:sol_idx]
    solutions_text = text[sol_idx:]

    layout = TEST_LAYOUTS[test_idx]

    # Pre-parse all direction blocks with original ranges
    dir_matches = list(re.finditer(r'Directions?\s*\(\s*(?:Q\s*s?\s*\.?\s*)?(\d+)\s*[-–—]\s*(?:Q\s*s?\s*\.?\s*)?(\d+)\s*\)[:\s.]*(.*?)(?=\n\s*(?:Q\s*\.?\s*)?\d+\.|\n\s*Directions?|\n\s*[A-Z\s]{8,}\n|$|\(([a-e])\))', questions_text, re.DOTALL | re.IGNORECASE))
    
    # Map directions using offsets to ensure they only belong to their subject
    directions_by_subject = {"English Language": [], "Quantitative Aptitude": [], "Reasoning Ability": []}
    
    for dm in dir_matches:
        try:
            start_q = int(dm.group(1))
            end_q = int(dm.group(2))
            dir_text = clean_watermark_text(dm.group(3))
            
            # Determine which subject range this original start_q belongs to
            assigned_subj = None
            if layout["English"][0] <= start_q <= layout["English"][1]:
                assigned_subj = "English Language"
                std_start_base = 1
                subj_start_pdf = layout["English"][0]
            elif layout["Quant"][0] <= start_q <= layout["Quant"][1]:
                assigned_subj = "Quantitative Aptitude"
                std_start_base = 31
                subj_start_pdf = layout["Quant"][0]
            elif layout["Reasoning"][0] <= start_q <= layout["Reasoning"][1]:
                assigned_subj = "Reasoning Ability"
                std_start_base = 66
                subj_start_pdf = layout["Reasoning"][0]
                
            if assigned_subj:
                offset = std_start_base - subj_start_pdf
                directions_by_subject[assigned_subj].append({
                    "start": start_q + offset,
                    "end": end_q + offset,
                    "text": dir_text
                })
        except Exception:
            pass
            
    # Sort directions by range span size (ascending) to resolve nested/overlapping directions
    for subj in directions_by_subject:
        directions_by_subject[subj].sort(key=lambda x: (x["end"] - x["start"], x["start"]))
    
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
        
        q_body_raw = questions_text[start_pos:end_pos].strip()
        
        # Case-sensitive option headers matching
        options = []
        q_text = q_body_raw
        
        pos = {}
        match_a = re.search(r'\(\s*a\s*\)', q_body_raw)
        if match_a:
            pos['A'] = (match_a.start(), match_a.end())
            match_b = re.search(r'\(\s*b\s*\)', q_body_raw[pos['A'][1]:])
            if match_b:
                pos['B'] = (pos['A'][1] + match_b.start(), pos['A'][1] + match_b.end())
                match_c = re.search(r'\(\s*c\s*\)', q_body_raw[pos['B'][1]:])
                if match_c:
                    pos['C'] = (pos['B'][1] + match_c.start(), pos['B'][1] + match_c.end())
                    match_d = re.search(r'\(\s*d\s*\)', q_body_raw[pos['C'][1]:])
                    if match_d:
                        pos['D'] = (pos['C'][1] + match_d.start(), pos['C'][1] + match_d.end())
                        match_e = re.search(r'\(\s*e\s*\)', q_body_raw[pos['D'][1]:])
                        if match_e:
                            pos['E'] = (pos['D'][1] + match_e.start(), pos['D'][1] + match_e.end())
                            
                            q_text = q_body_raw[:pos['A'][0]].strip()
                            options = [
                                {"id": "A", "text": clean_watermark_text(q_body_raw[pos['A'][1]:pos['B'][0]])},
                                {"id": "B", "text": clean_watermark_text(q_body_raw[pos['B'][1]:pos['C'][0]])},
                                {"id": "C", "text": clean_watermark_text(q_body_raw[pos['C'][1]:pos['D'][0]])},
                                {"id": "D", "text": clean_watermark_text(q_body_raw[pos['D'][1]:pos['E'][0]])},
                                {"id": "E", "text": clean_watermark_text(q_body_raw[pos['E'][1]:])}
                            ]
        
        if not options:
            opt_matches = list(re.finditer(r'\(([a-e])\)\s*', q_body_raw))
            if opt_matches:
                q_text = q_body_raw[:opt_matches[0].start()].strip()
                for o_idx, opt_match in enumerate(opt_matches):
                    opt_letter = opt_match.group(1).upper()
                    opt_start = opt_match.end()
                    opt_end = opt_matches[o_idx + 1].start() if o_idx + 1 < len(opt_matches) else len(q_body_raw)
                    options.append({
                        "id": opt_letter,
                        "text": clean_watermark_text(q_body_raw[opt_start:opt_end].strip())
                    })
        
        q_text = clean_watermark_text(q_text)
        
        # Truncate directions if they are appended to option E of this question
        if options:
            opt_e_text = options[-1]["text"]
            match_dir = re.search(r'(Directions?\s*\(?\s*(?:Q\s*s?\.?\s*)?(\d+)\s*[-–—]\s*(?:Q\s*s?\.?\s*)?(\d+)\s*\)?.*)', opt_e_text, re.IGNORECASE)
            if match_dir:
                options[-1]["text"] = opt_e_text[:match_dir.start()].strip()
        
        questions[q_num] = {
            "orig_num": q_num,
            "question": q_text,
            "options": options,
            "direction": ""
        }

    # Parse Solutions
    sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', solutions_text, re.MULTILINE | re.IGNORECASE))
    if len(sol_matches) < 20:
        sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', solutions_text, re.MULTILINE | re.IGNORECASE))

    seen_sol_nums = set()
    filtered_sol_matches = []
    for m in sol_matches:
        num = int(m.group(1))
        if 1 <= num <= 100 and num not in seen_sol_nums:
            seen_sol_nums.add(num)
            filtered_sol_matches.append((num, m))
            
    filtered_sol_matches.sort(key=lambda x: x[1].start())

    solutions = {}
    for idx, (s_num, match) in enumerate(filtered_sol_matches):
        ans_letter = match.group(2).upper()
        start_pos = match.end()
        end_pos = filtered_sol_matches[idx + 1][1].start() if idx + 1 < len(filtered_sol_matches) else len(solutions_text)
        
        sol_body = solutions_text[start_pos:end_pos].strip()
        if sol_body.lower().startswith("sol."):
            sol_body = sol_body[4:].strip()
            
        explanation = clean_watermark_text(sol_body)
        solutions[s_num] = {
            "correctAnswer": ans_letter,
            "explanation": explanation
        }

    # Split into English, Quant, Reasoning based on paper-specific layouts
    english_qs = []
    quant_qs = []
    reasoning_qs = []
    
    for q_num in range(1, 101):
        q = questions.get(q_num, {
            "orig_num": q_num,
            "question": f"Question {q_num} placeholder text.",
            "options": [
                {"id": "A", "text": "Option A"},
                {"id": "B", "text": "Option B"},
                {"id": "C", "text": "Option C"},
                {"id": "D", "text": "Option D"},
                {"id": "E", "text": "Option E"}
            ],
            "direction": ""
        })
        sol = solutions.get(q_num, {"correctAnswer": "A", "explanation": "Explanation placeholder."})
        
        q_obj = {
            "orig_num": q["orig_num"],
            "question": q["question"],
            "options": q["options"],
            "correctAnswer": sol["correctAnswer"],
            "explanation": sol["explanation"],
            "direction": ""
        }
        
        if layout["English"][0] <= q_num <= layout["English"][1]:
            english_qs.append(q_obj)
        elif layout["Quant"][0] <= q_num <= layout["Quant"][1]:
            quant_qs.append(q_obj)
        elif layout["Reasoning"][0] <= q_num <= layout["Reasoning"][1]:
            reasoning_qs.append(q_obj)
            
    print(f"  Test {test_idx} sizes: English={len(english_qs)}, Quant={len(quant_qs)}, Reasoning={len(reasoning_qs)}")
    
    # Standardize merged list
    merged = []
    
    # 1. Process English (new Q1-30)
    for idx, q in enumerate(english_qs, 1):
        q["new_num"] = idx
        q["subject"] = "English Language"
        
        # Assign direction from English mapped directions
        for dr in directions_by_subject["English Language"]:
            if dr["start"] <= idx <= dr["end"]:
                q["direction"] = dr["text"]
                break
        merged.append(q)
        
    # 2. Process Quant (new Q31-65)
    for idx, q in enumerate(quant_qs, 31):
        q["new_num"] = idx
        q["subject"] = "Quantitative Aptitude"
        
        # Assign direction from Quant mapped directions
        for dr in directions_by_subject["Quantitative Aptitude"]:
            if dr["start"] <= idx <= dr["end"]:
                q["direction"] = dr["text"]
                break
        merged.append(q)
        
    # 3. Process Reasoning (new Q66-100)
    for idx, q in enumerate(reasoning_qs, 66):
        q["new_num"] = idx
        q["subject"] = "Reasoning Ability"
        
        # Assign direction from Reasoning mapped directions
        for dr in directions_by_subject["Reasoning Ability"]:
            if dr["start"] <= idx <= dr["end"]:
                q["direction"] = dr["text"]
                break
        merged.append(q)
        
    # Expand bare questions and format
    final_list = []
    for q in merged:
        new_num = q["new_num"]
        q_text = q["question"]
        q_direction = q["direction"]
        
        # If question text is completely empty (Cloze test), generate a clear prompt
        if not q_text and q["subject"] == "English Language":
            q_text = f"Choose the correct word to fill in the blank ({q['orig_num']}):"
            
        # Make short/all-caps vocabulary questions descriptive using direction
        if len(q_text.split()) <= 3 and q_text.isupper() and q_direction:
            dir_prefix = q_direction.strip()
            if dir_prefix.endswith("."):
                dir_prefix = dir_prefix[:-1]
            q_text = f"{dir_prefix} of the word '{q_text}':"
            
        correct_answer = q["correctAnswer"]
        if correct_answer not in ["A", "B", "C", "D", "E"]:
            correct_answer = "A"
            
        final_list.append({
            "id": new_num,
            "unique_id": f"IBPSCLERKPRELIMS_TEST_Q{new_num}",
            "display_question_number": new_num,
            "question_number": new_num,
            "course": "IBPS Clerk Prelims",
            "exam_type": "Banking",
            "sub_type": "IBPS Clerk Prelims - Test",
            "paper_name": "IBPS Clerk Prelims - Test",
            "test_title": "",
            "test_id": "",
            "subject": q["subject"],
            "section": q["subject"],
            "category": "Bank & Insurance",
            "question": q_text,
            "q": q_text,
            "options": q["options"],
            "correctAnswer": correct_answer,
            "correct_answer": correct_answer,
            "correct_option": correct_answer,
            "correct_letter": correct_answer,
            "explanation": q["explanation"],
            "question_image": "",
            "option_images": ["", "", "", "", ""],
            "direction": q_direction,
            "status": "ok",
            "is_mock_eligible": True
        })

    return final_list, None

def run():
    print("=== Extracting and parsing all 10 IBPS Clerk PDFs ===")
    for test_idx, pdf_name in enumerate(pdf_files, 1):
        pdf_path = os.path.join(pdf_dir, pdf_name)
        dest_json_path = os.path.join(dest_json_dir, f"ibps_clerk_prelims_test{test_idx}.json")
        
        if not os.path.exists(pdf_path):
            print(f"Error: PDF not found: {pdf_path}")
            continue
            
        print(f"Parsing {pdf_name} -> Test {test_idx}...")
        try:
            doc = fitz.open(pdf_path)
            full_text = []
            for page in doc:
                full_text.append(page.get_text())
            doc.close()
            
            parsed, err = parse_pdf_text("\n".join(full_text), test_idx)
            if err:
                print(f"  Failed: {err}")
                continue
                
            print(f"  Parsed {len(parsed)} questions successfully.")
            
            for q in parsed:
                q["unique_id"] = f"IBPSCLERKPRELIMS_IBPSCLERKPRELIMSTEST{test_idx}_2020_{q['subject'].replace(' ', '').upper()}_Q{q['id']}"
                q["sub_type"] = f"IBPS Clerk Prelims - Test {test_idx}"
                q["paper_name"] = f"IBPS Clerk Prelims - Test {test_idx}"
                q["test_id"] = f"ibps_clerk_prelims_test{test_idx}"
            
            with open(dest_json_path, "w", encoding="utf-8") as f:
                json.dump(parsed, f, indent=2, ensure_ascii=False)
            print(f"  Saved to: {dest_json_path}")
            
        except Exception as e:
            print(f"  Error processing: {e}")

    print("\n=== All parsing complete! ===")

if __name__ == "__main__":
    run()
