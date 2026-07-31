import os
import json

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

print("=== Scanning Simplification Questions ===")

for i in range(1, 11):
    filename = f"ibps_clerk_prelims_test{i}.json"
    filepath = os.path.join(json_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"\n--- Test {i} Simplifications ---")
    count = 0
    for q in data:
        q_id = q.get("id")
        q_text = q.get("question", "")
        
        # Check if the question looks like a simplification question
        is_simp = any(w in q_text.lower() for w in ["what will come in the place of", "what should come in place of", "place of (?)", "place of '?'"])
        if is_simp:
            count += 1
            if count <= 15:
                print(f"Q{q_id}: {repr(q_text)}")
