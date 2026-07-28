import json
import re

filepath = "QuestionBank/json/rrb_po/rrb_po_prelims_paper9.json"
with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

pattern = r"\n-\nTable details:[\s\S]*?(?=\nQ\s?\d+\.)"
pattern_q = r"\n-\nTable details:[\s\S]*?(?=\nQ\d+\.)"

for idx in range(75, 80):
    q_obj = data[idx]
    
    q_text = q_obj.get("question") or ""
    new_q_text = re.sub(pattern, "", q_text)
    q_obj["question"] = new_q_text
    
    q_field = q_obj.get("q") or ""
    new_q_field = re.sub(pattern_q, "", q_field)
    if new_q_field == q_field:
        # try the other pattern just in case
        new_q_field = re.sub(pattern, "", q_field)
    q_obj["q"] = new_q_field

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Removed repeating text tables from Paper 9 Q76-80.")
