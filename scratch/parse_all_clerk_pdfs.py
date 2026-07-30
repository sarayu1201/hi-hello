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

def parse_pdf_text(text):
    # Find where SOLUTIONS starts
    sol_idx = text.find("SOLUTIONS")
    if sol_idx == -1:
        sol_idx = text.find("Answers & Explanations")
    if sol_idx == -1:
        sol_idx = text.find("Answers")
    if sol_idx == -1:
        return None, "SOLUTIONS section not found"

    questions_text = text[:sol_idx]
    solutions_text = text[sol_idx:]

    # Pre-parse all direction blocks with ranges
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
    q_matches = list(re.finditer(r'\n\s*(\d+)\.\s*', questions_text))
    if len(q_matches) < 20:
        # Try fallback matching if question numbers are different
        q_matches = list(re.finditer(r'^\s*(\d+)\.\s*', questions_text, re.MULTILINE))

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
                
                # Truncate directions or headers from option E
                opt_val = re.split(r'(Directions\s*\(\d+[-–]\d+\)|NUMERICAL ABILITY|REASONING ABILITY|SOLUTIONS|ANSWERS)', opt_val, flags=re.IGNORECASE)[0].strip()
                options.append({
                    "id": opt_letter,
                    "text": opt_val
                })
        
        # Strip directions from question text if included
        q_text = re.split(r'(Directions\s*\(\d+[-–]\d+\)|NUMERICAL ABILITY|REASONING ABILITY|SOLUTIONS|ANSWERS)', q_text, flags=re.IGNORECASE)[0].strip()
        
        # Assign direction
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
    if len(sol_matches) < 20:
        sol_matches = list(re.finditer(r'^\s*(\d+)\.\s*', solutions_text, re.MULTILINE))

    solutions = {}
    for idx, match in enumerate(sol_matches):
        s_num = int(match.group(1))
        start_pos = match.end()
        end_pos = sol_matches[idx + 1].start() if idx + 1 < len(sol_matches) else len(solutions_text)
        
        sol_body = solutions_text[start_pos:end_pos].strip()
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

    # Merge
    merged = []
    for q_num in sorted(questions.keys()):
        q = questions[q_num]
        sol = solutions.get(q_num, {"correctAnswer": "A", "explanation": ""})
        
        subject = "English Language"
        if q_num > 30 and q_num <= 65:
            subject = "Quantitative Aptitude"
        elif q_num > 65:
            subject = "Reasoning Ability"

        # Sanitize correct answer letter, default to 'A' if not a valid a-e choice
        correct_answer = sol["correctAnswer"]
        if correct_answer not in ["A", "B", "C", "D", "E"]:
            correct_answer = "A"

        merged.append({
            "id": q_num,
            "unique_id": f"IBPSCLERKPRELIMS_TEST_Q{q_num}",
            "display_question_number": q_num,
            "question_number": q_num,
            "course": "IBPS Clerk Prelims",
            "exam_type": "Banking",
            "sub_type": "IBPS Clerk Prelims - Test",
            "paper_name": "IBPS Clerk Prelims - Test",
            "test_title": "",
            "test_id": "",
            "subject": subject,
            "section": subject,
            "category": "Bank & Insurance",
            "question": q["question"],
            "q": q["question"],
            "options": q["options"],
            "correctAnswer": correct_answer,
            "correct_answer": correct_answer,
            "correct_option": correct_answer,
            "correct_letter": correct_answer,
            "explanation": sol["explanation"],
            "question_image": "",
            "option_images": ["", "", "", "", ""],
            "direction": q["direction"],
            "status": "ok",
            "is_mock_eligible": True
        })

    return merged, None

def run():
    print("=== Extracting and parsing all IBPS Clerk PDFs ===")
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
            
            parsed, err = parse_pdf_text("\n".join(full_text))
            if err:
                print(f"  Failed: {err}")
                continue
                
            print(f"  Parsed {len(parsed)} questions successfully.")
            
            # Post-processing: set correct sub_type and test_id based on test number
            for q in parsed:
                q["unique_id"] = f"IBPSCLERKPRELIMS_IBPSCLERKPRELIMSTEST{test_idx}_2020_{q['subject'].replace(' ', '').upper()}_Q{q['id']}"
                q["sub_type"] = f"IBPS Clerk Prelims - Test {test_idx}"
                q["paper_name"] = f"IBPS Clerk Prelims - Test {test_idx}"
                q["test_id"] = f"ibps_clerk_prelims_test{test_idx}"
            
            # Write to destination JSON
            with open(dest_json_path, "w", encoding="utf-8") as f:
                json.dump(parsed, f, indent=2, ensure_ascii=False)
            print(f"  Saved to: {dest_json_path}")
            
        except Exception as e:
            print(f"  Error processing: {e}")

    print("\n=== All parsing complete! ===")

if __name__ == "__main__":
    run()
