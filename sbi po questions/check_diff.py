import json
import glob
import os

dir_orig = r"C:\Users\Administrator\Downloads\question papers\json_output\sbi_po_prelims"
dir_target = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"

for i in range(1, 11):
    fname = f"sbipo_test_{i}.json"
    f1 = os.path.join(dir_orig, fname)
    f2 = os.path.join(dir_target, fname)
    
    if not os.path.exists(f1) or not os.path.exists(f2):
        print(f"Missing file for {fname}")
        continue

    with open(f1, 'r', encoding='utf-8') as file1:
        d1 = json.load(file1)
    with open(f2, 'r', encoding='utf-8') as file2:
        d2 = json.load(file2)
        
    print(f"=== {fname} ===")
    print(f"  Orig question count: {len(d1)}, Target question count: {len(d2)}")
    
    missing_opts = 0
    q_text_mismatch = 0
    
    for q1, q2 in zip(d1, d2):
        opts1 = {opt['id']: opt['text'] for opt in q1.get('options', [])}
        opts2 = {opt['id']: opt['text'] for opt in q2.get('options', [])}
        
        for k in ['A', 'B', 'C', 'D', 'E']:
            t1 = opts1.get(k, '')
            t2 = opts2.get(k, '')
            if t1 and (not t2 or t2 == "" or "[Option" in t2):
                missing_opts += 1
                if missing_opts <= 3:
                    print(f"  Q{q1.get('id')}: Opt {k} Orig='{t1}' vs Target='{t2}'")

        if q1.get('question', '').strip() != q2.get('question', '').strip():
            # Check if difference is just latex or actual content change
            q_text_mismatch += 1

    print(f"  Total missing/placeholder options in target: {missing_opts}")
    print(f"  Question text differences (including latex): {q_text_mismatch}")
