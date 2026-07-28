import json
import os

dirpath = "QuestionBank/json/rrb_po"

# 1. FIX PAPER 4 MISPLACED OPTIONS
filepath_p4 = os.path.join(dirpath, "rrb_po_prelims_paper4.json")
with open(filepath_p4, "r", encoding="utf-8") as f:
    data_p4 = json.load(f)

# Q67 (index 66)
q67 = data_p4[66]
q67["options"] = [
    {"id": "A", "text": "52 : 35"},
    {"id": "B", "text": "38 : 25"},
    {"id": "C", "text": "45 : 31"},
    {"id": "D", "text": "59 : 40"},
    {"id": "E", "text": "66 : 45"}
]
q67["correct_option"] = "A"
q67["correct_answer"] = "A"
q67["correct_letter"] = "A"

# Q68 (index 67)
q68 = data_p4[67]
q68["correct_option"] = "A"
q68["correct_answer"] = "A"
q68["correct_letter"] = "A"

# Q69 (index 68)
q69 = data_p4[68]
q69["correct_option"] = "A"
q69["correct_answer"] = "A"
q69["correct_letter"] = "A"

# Q70 (index 69)
q70 = data_p4[69]
q70["correct_option"] = "A"
q70["correct_answer"] = "A"
q70["correct_letter"] = "A"

with open(filepath_p4, "w", encoding="utf-8") as f:
    json.dump(data_p4, f, indent=2, ensure_ascii=False)
print("Fixed Paper 4 misplaced options.")


# 2. FIX PAPER 6 DATA SUFFICIENCY OPTIONS
filepath_p6 = os.path.join(dirpath, "rrb_po_prelims_paper6.json")
with open(filepath_p6, "r", encoding="utf-8") as f:
    data_p6 = json.load(f)

ds_options = [
    {"id": "A", "text": "If statement I alone is sufficient to answer the question"},
    {"id": "B", "text": "If statement II alone is sufficient to answer the question"},
    {"id": "C", "text": "If either statement I or II alone is sufficient to answer the question"},
    {"id": "D", "text": "If both statements I and II together are not sufficient to answer the question"},
    {"id": "E", "text": "If both statements I and II together are necessary to answer the question"}
]

# Q74 (index 73)
q74 = data_p6[73]
q74["options"] = ds_options
q74["correct_option"] = "E"
q74["correct_answer"] = "E"
q74["correct_letter"] = "E"

# Q75 (index 74)
q75 = data_p6[74]
q75["options"] = ds_options
q75["correct_option"] = "C"
q75["correct_answer"] = "C"
q75["correct_letter"] = "C"

with open(filepath_p6, "w", encoding="utf-8") as f:
    json.dump(data_p6, f, indent=2, ensure_ascii=False)
print("Fixed Paper 6 Data Sufficiency options.")
