import os
import json

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
filepath = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test1.json")

if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("=== Test 1 Quant Questions (Q31 to Q65) ===")
    for q in data:
        q_id = q.get("id")
        if 31 <= q_id <= 65:
            print(f"Q{q_id}: {repr(q.get('question'))}")
else:
    print("Test 1 JSON file not found.")
