import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_3.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("Searching for 'frac' in sbi_clerk_test_3.json:")
    count = 0
    for q in data:
        qid = q.get("id")
        q_text = str(q.get("question", ""))
        exp_text = str(q.get("explanation", ""))
        options = q.get("options", [])
        
        has_frac = False
        if "frac" in q_text:
            print(f"  Q#{qid} Question: {repr(q_text)}")
            has_frac = True
        for opt_idx, opt in enumerate(options):
            opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
            if "frac" in str(opt_text):
                print(f"  Q#{qid} Option {chr(65+opt_idx)}: {repr(opt_text)}")
                has_frac = True
                
        if has_frac:
            count += 1
            if count >= 10:
                print("... truncated list ...")
                break

if __name__ == "__main__":
    check()
