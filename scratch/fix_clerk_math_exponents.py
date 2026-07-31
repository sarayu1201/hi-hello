import os
import json
import re

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

# Fixes list
fixes_applied = 0

def fix_text(text):
    global fixes_applied
    if not isinstance(text, str):
        return text
        
    original = text
    
    # 1. Fix variables followed by digit (x2, y2, ?2) in math contexts
    # Match x2, y2, ?2 but not inside words. Let's use word boundary or regex
    # Replace x2 -> x^2, y2 -> y^2
    text = re.sub(r'\bx2\b', 'x^2', text)
    text = re.sub(r'\by2\b', 'y^2', text)
    text = re.sub(r'\?\s*2\b', '?^2', text)
    text = re.sub(r'\?\s*3\b', '?^3', text)
    
    # 2. Fix parenthesis followed by digit/fraction like (18)2 -> (18)^2
    # (2744)1/3 -> (2744)^(1/3)
    # (12)3 -> (12)^3
    text = re.sub(r'\((\d+)\)2\b', r'(\1)^2', text)
    text = re.sub(r'\((\d+)\)3\b', r'(\1)^3', text)
    text = re.sub(r'\((\d+)\)1/3\b', r'(\1)^(1/3)', text)
    text = re.sub(r'\((\d+)\)1/2\b', r'(\1)^(1/2)', text)
    
    # Custom specific replacements for other occurrences found in scans:
    text = text.replace("(? )2", "(?)^2")
    text = text.replace("(? ) 2", "(?)^2")
    
    if text != original:
        fixes_applied += 1
        
    return text

print("=== Running Exponent and Option Cleanup ===")

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
        
        # Specific cleanup for Test 1 Q47 Option E
        if i == 1 and q_id == 47:
            options = q.get("options", [])
            if len(options) >= 5 and "Rs.4345 200/250" in options[4]:
                options[4] = "Rs.4345"
                file_updated = True
                print("  Fixed Test 1 Q47 Option E leak.")
                
        # Apply standard math replacements
        orig_q = q.get("question", "")
        fixed_q = fix_text(orig_q)
        if fixed_q != orig_q:
            q["question"] = fixed_q
            # Update legacy q field as well
            q["q"] = fixed_q
            q["raw_question"] = fixed_q
            file_updated = True
            print(f"  Fixed question math in Test {i} Q{q_id}: {repr(fixed_q)}")
            
        # Also clean options
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

print(f"\nMath formatting cleanup complete! Total fixes applied: {fixes_applied}")
