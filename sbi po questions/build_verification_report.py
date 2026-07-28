import json
import os
import glob
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

orig_dir = r"C:\Users\Administrator\Downloads\question papers\json_output\sbi_po_prelims"
target_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"

total_issues = 0

for test_num in range(1, 11):
    fname = f"sbipo_test_{test_num}.json"
    p_orig = os.path.join(orig_dir, fname)
    p_target = os.path.join(target_dir, fname)
    
    with open(p_orig, 'r', encoding='utf-8') as f:
        d_orig = json.load(f)
    with open(p_target, 'r', encoding='utf-8') as f:
        d_target = json.load(f)
        
    orig_map = {q['id']: q for q in d_orig}
    target_map = {q['id']: q for q in d_target}
    
    issues_in_test = 0
    print(f"\n================ {fname} ================")
    
    for qid in range(1, 101):
        q_orig = orig_map.get(qid, {})
        q_target = target_map.get(qid, {})
        
        q_text_orig = q_orig.get('question', '')
        q_text_target = q_target.get('question', '')
        
        # 1. Check if target question text is corrupted or empty
        if not q_text_target or q_text_target.strip() == "":
            print(f"  Q{qid}: Target question text is EMPTY!")
            issues_in_test += 1
        elif "' '" in q_text_target or q_text_target.startswith("'W'h'i'c'h'"):
            print(f"  Q{qid}: Target question text CORRUPTED: {q_text_target[:40]}")
            issues_in_test += 1
        elif "text not found" in q_text_target.lower():
            print(f"  Q{qid}: Target question text BAD: {q_text_target}")
            issues_in_test += 1

        # 2. Check options in target
        opts_target = q_target.get('options', [])
        opts_orig = q_orig.get('options', [])
        
        opts_orig_dict = {o['id']: o['text'] for o in opts_orig}
        
        if len(opts_target) < 5:
            print(f"  Q{qid}: Target has only {len(opts_target)} options!")
            issues_in_test += 1
            
        for opt in opts_target:
            opt_id = opt.get('id')
            opt_txt = opt.get('text', '')
            orig_txt = opts_orig_dict.get(opt_id, '')
            
            if not opt_txt or opt_txt == "":
                print(f"  Q{qid} Opt {opt_id}: Target EMPTY! Orig was '{orig_txt}'")
                issues_in_test += 1
            elif "[Option" in opt_txt:
                print(f"  Q{qid} Opt {opt_id}: Target PLACEHOLDER '{opt_txt}'! Orig was '{orig_txt}'")
                issues_in_test += 1

    print(f"Total issues in {fname}: {issues_in_test}")
    total_issues += issues_in_test

print(f"\n================ TOTAL ISSUES ACROSS ALL 10 TESTS: {total_issues} ================")
