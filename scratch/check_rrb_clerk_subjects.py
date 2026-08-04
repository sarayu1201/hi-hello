import os
import json

root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
clerk_dir = os.path.join(root_dir, "QuestionBank", "json", "rrb_clerk")

for filename in sorted(os.listdir(clerk_dir)):
    if not filename.endswith(".json"):
        continue
    filepath = os.path.join(clerk_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    subjects = {}
    for q in data:
        subj = q.get("subject", "None")
        subjects[subj] = subjects.get(subj, 0) + 1
    print(f"{filename}: {subjects}")
