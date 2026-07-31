import json
import os
import re

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

latex_count = 0
examples = []

for i in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        # Check all text fields
        fields = [q["question"], q["explanation"], q["direction"]] + [o["text"] for o in q["options"]]
        for fld in fields:
            if "$" in fld or "\\" in fld:
                latex_count += 1
                if len(examples) < 15:
                    examples.append((i, q["id"], fld))
                break

print(f"Total fields containing LaTeX symbols ($ or \\): {latex_count}")
print("\n--- Examples of LaTeX fields ---")
for idx, (test_num, q_id, text) in enumerate(examples, 1):
    print(f"{idx}. Test {test_num} Q{q_id}: {repr(text)}")
