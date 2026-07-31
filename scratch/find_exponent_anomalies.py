import os
import json
import re

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

print("=== Scanning for Exponent / Superscript Anomalies ===")

# Regex to find:
# 1. Variable followed immediately by a digit (like x2, y2, ?2)
# 2. Closing parenthesis followed immediately by a digit or fraction (like (18)2, (2744)1/3)
pattern1 = r'\b[xy]\d\b'
pattern2 = r'\?\d+'
pattern3 = r'\)\d+(?:/\d+)?'

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
        
        # Test math patterns
        m1 = re.findall(pattern1, q_text)
        m2 = re.findall(pattern2, q_text)
        m3 = re.findall(pattern3, q_text)
        
        # Also scan options and explanations
        all_text = q_text + " " + " ".join(opt.get("text", "") if isinstance(opt, dict) else str(opt) for opt in q.get("options", []))
        all_text += " " + q.get("explanation", "")
        
        has_anomaly = False
        # Specific check for x2, y2, ?2 or similar
        for term in re.findall(r'\b[xy\?]\d+\b', all_text):
            if not term.startswith("?"): # ignore standard question mark if not followed by digit
                has_anomaly = True
                
        # Look for )2 or )1/3 or )3
        if re.search(r'\)\d+', all_text):
            has_anomaly = True
            
        if has_anomaly:
            print(f"Test {i} Q{q_id} Anomaly detected:")
            print(f"  Q: {repr(q_text)}")
            print(f"  Matches: {re.findall(r'\b[xy\?]\d+\b|\)\d+(?:/\d+)?', all_text)}")
