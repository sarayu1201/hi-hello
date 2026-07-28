import json
import os
import glob

orig_dir = r"C:\Users\Administrator\Downloads\question papers\json_output\sbi_po_prelims"
target_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"

for i in range(1, 11):
    fname = f"sbipo_test_{i}.json"
    f_orig = os.path.join(orig_dir, fname)
    f_target = os.path.join(target_dir, fname)
    
    with open(f_orig, 'r', encoding='utf-8') as f:
        d_orig = json.load(f)
    with open(f_target, 'r', encoding='utf-8') as f:
        d_target = json.load(f)
        
    print(f"=== {fname} ===")
    
    # Map orig by question id
    orig_map = {q['id']: q for q in d_orig}
    target_map = {q['id']: q for q in d_target}
    
    missing_in_target = []
    bad_options_in_target = []
    q_text_mismatches = []
    
    for qid in sorted(orig_map.keys()):
        q1 = orig_map[qid]
        q2 = target_map.get(qid)
        
        if not q2:
            missing_in_target.append(qid)
            continue
            
        # Check options in target
        for opt in q2.get('options', []):
            txt = opt.get('text', '')
            if not txt or txt == "" or "[Option" in txt:
                # Get what orig had
                orig_opt = next((o['text'] for o in q1.get('options', []) if o['id'] == opt['id']), "")
                bad_options_in_target.append((qid, opt['id'], orig_opt))
                
        # Check question text matching
        if q1.get('question', '').strip() != q2.get('question', '').strip():
            q_text_mismatches.append((qid, q1.get('question', '')[:30], q2.get('question', '')[:30]))

    print(f"  Missing Q IDs in target: {missing_in_target}")
    print(f"  Bad options in target: {len(bad_options_in_target)}")
    if bad_options_in_target:
        print("  Sample bad options:", bad_options_in_target[:5])
    print(f"  Q text mismatches: {len(q_text_mismatches)}")
    if q_text_mismatches:
        print("  Sample Q text mismatches:", q_text_mismatches[:3])
