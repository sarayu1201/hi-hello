import json
import os
import docx

docx_dir = r"C:\Users\Administrator\Downloads\sbi po prelims"
orig_json_dir = r"C:\Users\Administrator\Downloads\question papers\json_output\sbi_po_prelims"
target_json_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"

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

print("Auditing all 10 tests...")

for test_num in range(1, 11):
    fname = f"sbipo_test_{test_num}.json"
    docx_name = docx_files[test_num - 1]
    
    path_orig = os.path.join(orig_json_dir, fname)
    path_target = os.path.join(target_json_dir, fname)
    path_docx = os.path.join(docx_dir, docx_name)
    
    with open(path_orig, 'r', encoding='utf-8') as f:
        data_orig = json.load(f)
    with open(path_target, 'r', encoding='utf-8') as f:
        data_target = json.load(f)
        
    print(f"\n================ Test {test_num}: {fname} ================")
    print(f"Orig Qs: {len(data_orig)} | Target Qs: {len(data_target)}")
    
    # Check issues in target
    empty_opts = 0
    placeholder_opts = 0
    corrupt_qs = 0
    
    for idx, q in enumerate(data_target):
        q_id = q.get('id', idx + 1)
        q_text = q.get('question', '')
        
        # Check corrupt question text like "'W'h'a't'"
        if "' '" in q_text or "  " in q_text and len(q_text) > 10 and q_text.count("'") > 10:
            corrupt_qs += 1
            
        opts = q.get('options', [])
        for opt in opts:
            txt = opt.get('text', '')
            if txt == "" or txt is None:
                empty_opts += 1
            elif "[Option" in txt:
                placeholder_opts += 1
                
    print(f"Target Issues -> Empty Options: {empty_opts}, Placeholder Options: {placeholder_opts}, Corrupt Questions: {corrupt_qs}")

