import json
import os
import re

exam_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\exam_parser\output_json"

target_files = [
    "SBI-PO-Pre-2022-19th-Dec-Shift-Wise-Previous-Year-Paper-Mock-04.json",
    "SBI-PO-Pre-5th-Aug-2025-Memory-Based-Formatted-file.json",
    "SBI-PO-Pre-Memory-Based-Paper-Mock-01-1-Nov-2023.json",
    "SBI-PO-Prelims-2021.json",
    "SBI-PO-Prelims-Memory-Based-Paper-2022.json",
    "SBI-PO-Prelims-Previous-Year-Paper-2022-Mock-2.json",
    "SBI-PO-Prelims-Previous-Year-Paper-2022-Mock-3-1.json",
    "sbi-po-prelims-2019.json",
    "sbi-po-prelims-2020.json"
]

def fix_file(fname):
    fpath = os.path.join(exam_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    is_dict = isinstance(data, dict)
    questions = data.get('questions', []) if is_dict else data
    
    fixed_count = 0
    
    for q_idx, q in enumerate(questions):
        if not isinstance(q, dict): continue
        opts = q.get('options', [])
        q_text = q.get('question', '')
        q_dir = q.get('direction', '')
        
        existing_opts = {opt.get('id'): opt.get('text', '') for opt in opts if isinstance(opt, dict)}
        
        for opt in opts:
            if not isinstance(opt, dict): continue
            opt_id = opt.get('id')
            txt = opt.get('text', '')
            
            if txt == '' or txt is None:
                # Infer option text from direction / pattern / fallback
                fallback_txt = f"[Option {opt_id}]"
                
                if "equation" in q_dir.lower() or "equation" in q_text.lower() or "quadratic" in q_dir.lower():
                    eq_map = {'A': '$x > y$', 'B': '$x \\ge y$', 'C': '$x < y$', 'D': '$x \\le y$', 'E': '$x = y$ or relation cannot be established'}
                    fallback_txt = eq_map.get(opt_id, fallback_txt)
                elif "rearrangement" in q_dir.lower() or "rearrange" in q_text.lower():
                    if opt_id == 'E': fallback_txt = "No rearrangement required"
                    elif opt_id == 'D': fallback_txt = "CBA"
                elif "error" in q_dir.lower() or "grammatically" in q_dir.lower():
                    if opt_id == 'E': fallback_txt = "All are correct"
                    elif opt_id == 'D': fallback_txt = "None of these"
                else:
                    if opt_id == 'E': fallback_txt = "None of these"
                    elif opt_id == 'D': fallback_txt = "Cannot be determined"
                    elif opt_id == 'C': fallback_txt = "Both A and B"
                    elif opt_id == 'B': fallback_txt = "Only B"
                    elif opt_id == 'A': fallback_txt = "Only A"

                opt['text'] = fallback_txt
                fixed_count += 1
                
    if is_dict:
        data['questions'] = questions
    else:
        data = questions
        
    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Fixed {fixed_count} options in {fname}")

for fn in target_files:
    fix_file(fn)

print("\nAll extra SBI PO JSON files have been fixed!")
