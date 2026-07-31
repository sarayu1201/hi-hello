import json
import os
import fitz  # PyMuPDF
import re

pdf_dir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk"
json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

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

from parse_all_clerk_pdfs_final import parse_pdf_text

def run():
    print("=== Auto-correcting and filling incomplete math equations ===")
    
    total_repaired = 0
    for test_idx in range(1, 11):
        pdf_name = pdf_files[test_idx - 1]
        pdf_path = os.path.join(pdf_dir, pdf_name)
        json_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{test_idx}.json")
        
        if not os.path.exists(pdf_path) or not os.path.exists(json_path):
            print(f"Skipping Test {test_idx}: Files not found.")
            continue
            
        # Parse PDF in-memory for reference
        doc = fitz.open(pdf_path)
        full_text = [page.get_text() for page in doc]
        doc.close()
        
        parsed_qs, _ = parse_pdf_text("\n".join(full_text), test_idx)
        if not parsed_qs:
            print(f"Skipping Test {test_idx}: In-memory parsing failed.")
            continue
            
        parsed_by_id = {q["id"]: q for q in parsed_qs}
        
        # Load user JSON
        with open(json_path, "r", encoding="utf-8") as f:
            user_data = json.load(f)
            
        repaired_in_test = 0
        for u_q in user_data:
            q_id = u_q["id"]
            if q_id not in parsed_by_id:
                continue
            ref_q = parsed_by_id[q_id]
            
            # Check question text
            u_text = u_q["question"].strip()
            ref_text = ref_q["question"].strip()
            
            # Truncation check: ends with operator or is cut off
            if u_text != ref_text:
                if u_text.endswith("÷") or u_text.endswith("×") or u_text.endswith("+") or u_text.endswith("-") or u_text.endswith("=") or u_text.endswith("of") or (len(ref_text) > len(u_text) and u_text in ref_text):
                    u_q["question"] = ref_text
                    u_q["q"] = ref_text
                    repaired_in_test += 1
                    total_repaired += 1
                    
            # Check options
            for idx, opt in enumerate(u_q["options"]):
                if idx < len(ref_q["options"]):
                    u_opt = opt["text"].strip()
                    ref_opt = ref_q["options"][idx]["text"].strip()
                    if u_opt != ref_opt and (u_opt.endswith("÷") or u_opt.endswith("×") or u_opt.endswith("+") or u_opt.endswith("-") or u_opt.endswith("=")):
                        opt["text"] = ref_opt
                        
            # Check explanation
            u_exp = u_q["explanation"].strip()
            ref_exp = ref_q["explanation"].strip()
            if u_exp != ref_exp and (u_exp.endswith("÷") or u_exp.endswith("×") or u_exp.endswith("+") or u_exp.endswith("-") or u_exp.endswith("=")):
                u_q["explanation"] = ref_exp
                
        # Save back
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(user_data, f, indent=2, ensure_ascii=False)
            
        print(f"Test {test_idx}: Auto-repaired {repaired_in_test} incomplete questions.")

    print(f"\n=== Auto-correction Complete! Total Repaired: {total_repaired} questions ===")

if __name__ == "__main__":
    run()
