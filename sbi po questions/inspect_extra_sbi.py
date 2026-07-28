import os
import json

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

for fname in target_files:
    fpath = os.path.join(exam_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    questions = data.get('questions', []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
    
    empty_list = []
    for q_idx, q in enumerate(questions):
        if not isinstance(q, dict): continue
        q_id = q.get('id', q.get('question_number', q_idx + 1))
        opts = q.get('options', [])
        for opt in opts:
            if not isinstance(opt, dict): continue
            txt = opt.get('text', '')
            if txt == '' or txt is None:
                empty_list.append((q_id, opt.get('id'), q.get('question', '')[:50]))
                
    print(f"\n================ {fname} ({len(empty_list)} empty options) ================")
    for item in empty_list:
        print(f"  Q{item[0]} Opt {item[1]}: question='{item[2]}'")
