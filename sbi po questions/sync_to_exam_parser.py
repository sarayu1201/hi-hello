import os
import json
import glob

exam_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\exam_parser\output_json"
qb_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"

test_mappings = {
    "sbipo_test_1.json": "SBI-PO-Pre-2022-19th-Dec-Shift-Wise-Previous-Year-Paper-Mock-5.json",
    "sbipo_test_2.json": "SBI-PO-Pre-2022-20th-Dec-Shift-Wise-Previous-Year-Paper-Mock-6.json",
    "sbipo_test_3.json": "SBI-PO-Pre-2024-25-Memory-Based-Paper-16-Mar-2025-1st-shift.json",
    "sbipo_test_4.json": "SBI-PO-Pre-2024-25-Memory-Based-Paper-24-Mar-2025-1st-shift-1.json",
    "sbipo_test_5.json": "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-Mar-2025-1st-shift.json",
    "sbipo_test_6.json": "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-March-2025-3rd-shift.json",
    "sbipo_test_7.json": "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-March-2025-4th-shift.json",
    "sbipo_test_8.json": "SBI-PO-Pre-2024-25-Memory-Based-Question-Paper-8-Mar-2025-2nd-shift-1.json",
    "sbipo_test_9.json": "SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift (1).json",
    "sbipo_test_10.json": "SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift.json"
}

# 1. Sync the 10 verified test JSONs into exam_parser output_json
for qb_file, exam_file in test_mappings.items():
    qb_path = os.path.join(qb_dir, qb_file)
    exam_path = os.path.join(exam_dir, exam_file)
    
    with open(qb_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open(exam_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Synced {qb_file} -> {exam_file} ({len(data)} Qs)")

