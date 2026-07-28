import json
import os

orig_json_dir = r"C:\Users\Administrator\Downloads\question papers\json_output\sbi_po_prelims"

print("Auditing orig_json_dir (question papers)...")

for test_num in range(1, 11):
    fname = f"sbipo_test_{test_num}.json"
    path_orig = os.path.join(orig_json_dir, fname)
    
    with open(path_orig, 'r', encoding='utf-8') as f:
        data_orig = json.load(f)
        
    print(f"\n================ Test {test_num}: {fname} ================")
    
    empty_opts = []
    placeholder_opts = []
    empty_qs = []
    
    for idx, q in enumerate(data_orig):
        q_id = q.get('id', idx + 1)
        q_text = q.get('question', '')
        if not q_text or q_text.strip() == "":
            empty_qs.append(q_id)
            
        opts = q.get('options', [])
        for opt in opts:
            txt = opt.get('text', '')
            if txt == "" or txt is None:
                empty_opts.append((q_id, opt.get('id')))
            elif "[Option" in txt:
                placeholder_opts.append((q_id, opt.get('id'), txt))
                
    print(f"Empty Questions ({len(empty_qs)}): {empty_qs}")
    print(f"Empty Options ({len(empty_opts)}): {empty_opts[:10]}")
    print(f"Placeholder Options ({len(placeholder_opts)}): {placeholder_opts[:10]}")

