import os
import json

workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")

# 1. Revert Test 2 Q97
t2_file = os.path.join(json_dir, "ibps_clerk_prelims_test2.json")
if os.path.exists(t2_file):
    with open(t2_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        if q.get("id") == 97:
            q["question"] = q["question"].replace("many^2’s", "many 2’s")
            q["q"] = q["q"].replace("many^2’s", "many 2’s")
            q["raw_question"] = q["raw_question"].replace("many^2’s", "many 2’s")
            print("Reverted false positive in Test 2 Q97")
    with open(t2_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# 2. Revert Test 3 Q43
t3_file = os.path.join(json_dir, "ibps_clerk_prelims_test3.json")
if os.path.exists(t3_file):
    with open(t3_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        if q.get("id") == 43:
            q["question"] = q["question"].replace("by^3/5", "by 3/5")
            q["q"] = q["q"].replace("by^3/5", "by 3/5")
            q["raw_question"] = q["raw_question"].replace("by^3/5", "by 3/5")
            print("Reverted false positive in Test 3 Q43")
    with open(t3_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
