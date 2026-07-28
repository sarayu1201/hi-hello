import docx
import json
import os

docx_dir = r"C:\Users\Administrator\Downloads\sbi po prelims"
json_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"

docx_files = [
    "SBI-PO-Pre-2022-19th-Dec-Shift-Wise-Previous-Year-Paper-Mock-5.docx",
    "SBI-PO-Pre-2022-20th-Dec-Shift-Wise-Previous-Year-Paper-Mock-6.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-16-Mar-2025-1st-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-24-Mar-2025-1st-shift-1.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-Mar-2025-1st-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-March-2025-3rd-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-March-2025-4th-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Question-Paper-8-Mar-2025-2nd-shift-1.docx",
    "SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift (1).docx",
    "SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift.docx"
]

for i, docx_name in enumerate(docx_files, 1):
    json_name = f"sbipo_test_{i}.json"
    json_path = os.path.join(json_dir, json_name)
    docx_path = os.path.join(docx_dir, docx_name)
    
    with open(json_path, 'r', encoding='utf-8') as f:
        qdata = json.load(f)
        
    print(f"================ {json_name} ================")
    doc = docx.Document(docx_path)
    # find questions with empty or placeholder options
    bad_qs = []
    for q in qdata:
        q_num = q.get('id')
        opts = q.get('options', [])
        has_bad = False
        for opt in opts:
            t = opt.get('text', '')
            if t == '' or t is None or '[Option' in t:
                has_bad = True
                break
        if has_bad:
            bad_qs.append(q_num)
            
    print(f"Bad Q numbers ({len(bad_qs)}):", bad_qs[:15])
