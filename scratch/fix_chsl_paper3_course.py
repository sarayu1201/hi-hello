import json

filepath = "QuestionBank/json/ssc_chsl_tier1_papers/ssc_chsl_tier1_paper3.json"
with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

for q in data:
    q["course"] = "SSC CHSL"

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully fixed course field in ssc_chsl_tier1_paper3.json on disk.")
