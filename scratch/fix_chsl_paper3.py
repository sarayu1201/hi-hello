import json

filepath = "QuestionBank/json/ssc_chsl_tier1_papers/ssc_chsl_tier1_paper3.json"
with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

# Q18 (index 17)
q18 = data[17]
clean_q18_text = "If '*' denotes 'added to', '&' denotes 'divided by', '@' denotes 'multiplied by' and '%' denotes 'subtracted from', then 153 & 17 @ 6 % 9 * 18 = ?"
q18["question"] = clean_q18_text
q18["q"] = clean_q18_text

# Q52 (index 51)
q52 = data[51]
clean_q52_text = "If $2x - 1 < 5x + 2$ and $2x + 5 < 6 - 3x$, then $x$ can take which of the following values?"
q52["question"] = clean_q52_text
q52["q"] = clean_q52_text
q52["options"] = [
    {"id": "A", "text": "2"},
    {"id": "B", "text": "0"},
    {"id": "C", "text": "1"},
    {"id": "D", "text": "-2"}
]

# Q56 (index 55)
q56 = data[55]
q56["options"] = [
    {"id": "A", "text": "$50\\sqrt{2} + 50$ sq cm"},
    {"id": "B", "text": "$50\\sqrt{2} + 100$ sq cm"},
    {"id": "C", "text": "$100\\sqrt{2} + 50$ sq cm"},
    {"id": "D", "text": "$100\\sqrt{2} + 100$ sq cm"}
]

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully fixed Paper 3 issues.")
