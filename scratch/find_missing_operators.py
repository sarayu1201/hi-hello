import os
import json
import re

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

print("=== Scanning for Broken Math Expressions and Missing Operators ===")

for i in range(1, 11):
    filename = f"ibps_clerk_prelims_test{i}.json"
    filepath = os.path.join(json_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        q_id = q.get("id")
        q_text = q.get("question", "")
        
        # Check for multiple spaces inside short numeric-heavy sentences
        # For example, "24  12  36" or "12 ?  3"
        # Also check for division symbols or signs that might have turned into weird chars
        
        # 1. Look for sequences of numbers separated by spaces only in questions containing "?"
        # e.g., "120 15 3 = ?" or "12 3 4 = ?"
        if "?" in q_text:
            # Match patterns like: number space number space number or similar
            # that might suggest missing operators
            parts = re.findall(r'\d+\s+\d+\s+\d+', q_text)
            if parts:
                print(f"Test {i} Q{q_id}: Potential missing operators in text: {repr(q_text)}")
                
            # Check for multiple consecutive spaces inside math parts
            if "  " in q_text:
                # Only warn if it looks like a math expression
                math_leak = re.search(r'\d+\s{2,}\d+[\s\d\?=]*', q_text)
                if math_leak:
                    print(f"Test {i} Q{q_id}: Consecutive spaces in math: {repr(q_text)}")
