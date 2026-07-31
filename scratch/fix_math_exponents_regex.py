import os
import json
import re

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

fixes_applied = 0

def fix_text(text):
    global fixes_applied
    if not isinstance(text, str):
        return text
        
    original = text
    
    # Correctly match any x2 or y2 even if preceded by a number (like 2x2, 3y2)
    # Match: (variable) followed by (optional spaces) followed by (2 or 3)
    text = re.sub(r'([xy])\s*2\b', r'\1^2', text)
    text = re.sub(r'([xy])\s*3\b', r'\1^3', text)
    
    if text != original:
        fixes_applied += 1
        
    return text

print("=== Running Refined Exponent Replacement ===")

for i in range(1, 11):
    filename = f"ibps_clerk_prelims_test{i}.json"
    filepath = os.path.join(json_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    file_updated = False
    for q in data:
        q_id = q.get("id")
        
        orig_q = q.get("question", "")
        fixed_q = fix_text(orig_q)
        if fixed_q != orig_q:
            q["question"] = fixed_q
            q["q"] = fixed_q
            q["raw_question"] = fixed_q
            file_updated = True
            print(f"  Fixed question in Test {i} Q{q_id}: {repr(fixed_q)}")
            
        # Clean options
        options = q.get("options", [])
        for idx, opt in enumerate(options):
            if isinstance(opt, dict):
                orig_opt = opt.get("text", "")
                fixed_opt = fix_text(orig_opt)
                if fixed_opt != orig_opt:
                    opt["text"] = fixed_opt
                    file_updated = True
            elif isinstance(opt, str):
                fixed_opt = fix_text(opt)
                if fixed_opt != opt:
                    options[idx] = fixed_opt
                    file_updated = True
                    
        # Clean explanation
        orig_exp = q.get("explanation", "")
        fixed_exp = fix_text(orig_exp)
        if fixed_exp != orig_exp:
            q["explanation"] = fixed_exp
            q["raw_explanation"] = fixed_exp
            file_updated = True
            
    if file_updated:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved updates to {filename}")

print(f"\nRefined math formatting complete! Total fixes applied: {fixes_applied}")
