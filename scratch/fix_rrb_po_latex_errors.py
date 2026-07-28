import json

# Fix Paper 10 Q31 (index 30)
with open("QuestionBank/json/rrb_po/rrb_po_prelims_paper10.json", "r", encoding="utf-8") as f:
    data_p10 = json.load(f)

q31_p10 = data_p10[30]
q31_p10["explanation"] = "Shortest distance BP = $\\sqrt{(0 - 0)^2 + (0 - (-4))^2} = 4$ m."

with open("QuestionBank/json/rrb_po/rrb_po_prelims_paper10.json", "w", encoding="utf-8") as f:
    json.dump(data_p10, f, indent=2, ensure_ascii=False)
print("Fixed Paper 10 Q31 explanation.")


# Fix Paper 8 Q1 (index 0)
with open("QuestionBank/json/rrb_po/rrb_po_prelims_paper8.json", "r", encoding="utf-8") as f:
    data_p8 = json.load(f)

q1_p8 = data_p8[0]
q1_p8["explanation"] = (
    "Coordinates: A = (-9, 0), B = (-9, -7), C = (-21, -7), D = (-21, -22), E = (4, -22).\n"
    "Shortest distance AE = $\\sqrt{(4 - (-9))^2 + (-22 - 0)^2} = \\sqrt{169 + 484} = \\sqrt{653}$ m."
)

with open("QuestionBank/json/rrb_po/rrb_po_prelims_paper8.json", "w", encoding="utf-8") as f:
    json.dump(data_p8, f, indent=2, ensure_ascii=False)
print("Fixed Paper 8 Q1 explanation.")
