import json

filepath = "QuestionBank/json/ssc_chsl_tier1_papers/ssc_chsl_tier1_paper2.json"
with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

q97 = data[96]

# Update options
q97["options"] = [
    {"id": "A", "text": "$m\\ s^{-1}$"},
    {"id": "B", "text": "$m\\ s^{-2}$"},
    {"id": "C", "text": "$m\\ s^2$"},
    {"id": "D", "text": "$m/s$"}
]

# Update explanation
q97["explanation"] = "The SI unit of acceleration is metre per second squared ($m/s^2$ or $m\\ s^{-2}$)."

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully fixed Q97 (Local GA Q22) in Paper 2.")
