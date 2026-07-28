import json
import os

dirpath = "QuestionBank/json/rrb_po"

# 1. FIX PAPER 7
filepath_p7 = os.path.join(dirpath, "rrb_po_prelims_paper7.json")
with open(filepath_p7, "r", encoding="utf-8") as f:
    data_p7 = json.load(f)

# Q41 to Q45 Directions Casing and Math Wrapper Fix
clean_directions = (
    "Directions (41-45): Read the data carefully and answer the questions.\n"
    "There are total 700 employees in three companies A, B and C. Total employees in A is $8\%$ more than that of in C, "
    "while the ratio of total employees in B to that of in A is $2:3$. The ratio of male employees in A to that of in B is $10:7$. "
    "The total female employees in A are $60\%$ more than total female employees in B. Total male employees in C is $42\\frac{6}{7}\\%$ "
    "more than total male employees in B."
)

for qn in range(41, 46):
    q = data_p7[qn - 1]
    # Reconstruct the question with clean directions and local question part
    local_parts = q["question"].split('\n-\n')
    if len(local_parts) >= 2:
        q["question"] = clean_directions + "\n-\n" + local_parts[-1]
    else:
        # Fallback split on Q
        q_split = q["question"].split('Q ')
        if len(q_split) >= 2:
            q["question"] = clean_directions + "\n-\nQ " + q_split[-1]
            
    # Do the same for 'q' field
    local_parts_q = q["q"].split('\n-\n')
    if len(local_parts_q) >= 2:
        q["q"] = clean_directions + "\n-\n" + local_parts_q[-1]
    else:
        q_split_q = q["q"].split('Q')
        if len(q_split_q) >= 2:
            q["q"] = clean_directions + "\n-\nQ" + q_split_q[-1]

# Fix misplaced options and truncated values for Q66 to Q80 in Paper 7
# Q66
data_p7[65]["options"] = [
    {"id": "A", "text": "508:375"},
    {"id": "B", "text": "356:245"},
    {"id": "C", "text": "432:315"},
    {"id": "D", "text": "584:425"},
    {"id": "E", "text": "660:495"}
]
data_p7[65]["correct_option"] = "A"
data_p7[65]["correct_answer"] = "A"
data_p7[65]["correct_letter"] = "A"

# Q67
data_p7[66]["correct_option"] = "A"
data_p7[66]["correct_answer"] = "A"
data_p7[66]["correct_letter"] = "A"

# Q68
data_p7[67]["correct_option"] = "A"
data_p7[67]["correct_answer"] = "A"
data_p7[67]["correct_letter"] = "A"

# Q69
data_p7[68]["correct_option"] = "A"
data_p7[68]["correct_answer"] = "A"
data_p7[68]["correct_letter"] = "A"

# Q70
data_p7[69]["correct_option"] = "A"
data_p7[69]["correct_answer"] = "A"
data_p7[69]["correct_letter"] = "A"

# Q71
data_p7[70]["correct_option"] = "A"
data_p7[70]["correct_answer"] = "A"
data_p7[70]["correct_letter"] = "A"

# Q72
data_p7[71]["correct_option"] = "A"
data_p7[71]["correct_answer"] = "A"
data_p7[71]["correct_letter"] = "A"

# Q73
data_p7[72]["correct_option"] = "A"
data_p7[72]["correct_answer"] = "A"
data_p7[72]["correct_letter"] = "A"

# Q74
data_p7[73]["correct_option"] = "A"
data_p7[73]["correct_answer"] = "A"
data_p7[73]["correct_letter"] = "A"

# Q76
data_p7[75]["correct_option"] = "A"
data_p7[75]["correct_answer"] = "A"
data_p7[75]["correct_letter"] = "A"

# Q77
data_p7[76]["options"] = [
    {"id": "A", "text": "23:15"},
    {"id": "B", "text": "17:11"},
    {"id": "C", "text": "20:13"},
    {"id": "D", "text": "26:17"},
    {"id": "E", "text": "29:19"}
]
data_p7[76]["correct_option"] = "A"
data_p7[76]["correct_answer"] = "A"
data_p7[76]["correct_letter"] = "A"

# Q78
data_p7[77]["options"] = [
    {"id": "A", "text": "233\\frac{1}{3}\%"},
    {"id": "B", "text": "165\\frac{2}{3}\%"},
    {"id": "C", "text": "199\\frac{1}{3}\%"},
    {"id": "D", "text": "267\\frac{2}{3}\%"},
    {"id": "E", "text": "301\\frac{1}{3}\%"},
]
data_p7[77]["correct_option"] = "A"
data_p7[77]["correct_answer"] = "A"
data_p7[77]["correct_letter"] = "A"

# Q79
data_p7[78]["correct_option"] = "A"
data_p7[78]["correct_answer"] = "A"
data_p7[78]["correct_letter"] = "A"

# Q80
data_p7[79]["options"] = [
    {"id": "A", "text": "30"},
    {"id": "B", "text": "20"},
    {"id": "C", "text": "25"},
    {"id": "D", "text": "35"},
    {"id": "E", "text": "40"}
]
data_p7[79]["correct_option"] = "A"
data_p7[79]["correct_answer"] = "A"
data_p7[79]["correct_letter"] = "A"

with open(filepath_p7, "w", encoding="utf-8") as f:
    json.dump(data_p7, f, indent=2, ensure_ascii=False)
print("Finished fixing Paper 7.")


# 2. FIX PAPER 8
filepath_p8 = os.path.join(dirpath, "rrb_po_prelims_paper8.json")
with open(filepath_p8, "r", encoding="utf-8") as f:
    data_p8 = json.load(f)

# Q55
data_p8[54]["correct_option"] = "A"
data_p8[54]["correct_answer"] = "A"
data_p8[54]["correct_letter"] = "A"

# Q56
data_p8[55]["correct_option"] = "A"
data_p8[55]["correct_answer"] = "A"
data_p8[55]["correct_letter"] = "A"

# Q57
data_p8[56]["correct_option"] = "A"
data_p8[56]["correct_answer"] = "A"
data_p8[56]["correct_letter"] = "A"

# Q60
data_p8[59]["correct_option"] = "A"
data_p8[59]["correct_answer"] = "A"
data_p8[59]["correct_letter"] = "A"

# Q66
data_p8[65]["correct_option"] = "A"
data_p8[65]["correct_answer"] = "A"
data_p8[65]["correct_letter"] = "A"

# Q67
data_p8[66]["options"] = [
    {"id": "A", "text": "21%"},
    {"id": "B", "text": "15%"},
    {"id": "C", "text": "18%"},
    {"id": "D", "text": "24%"},
    {"id": "E", "text": "27%"}
]
data_p8[66]["correct_option"] = "A"
data_p8[66]["correct_answer"] = "A"
data_p8[66]["correct_letter"] = "A"

# Q68
data_p8[67]["options"] = [
    {"id": "A", "text": "42:23"},
    {"id": "B", "text": "30:17"},
    {"id": "C", "text": "36:19"},
    {"id": "D", "text": "48:25"},
    {"id": "E", "text": "54:29"}
]
data_p8[67]["correct_option"] = "A"
data_p8[67]["correct_answer"] = "A"
data_p8[67]["correct_letter"] = "A"

# Q69
data_p8[68]["options"] = [
    {"id": "A", "text": "Rs. 60,000"},
    {"id": "B", "text": "Rs. 42,000"},
    {"id": "C", "text": "Rs. 51,000"},
    {"id": "D", "text": "Rs. 69,000"},
    {"id": "E", "text": "Rs. 78,000"}
]
data_p8[68]["correct_option"] = "A"
data_p8[68]["correct_answer"] = "A"
data_p8[68]["correct_letter"] = "A"

# Q70
data_p8[69]["correct_option"] = "A"
data_p8[69]["correct_answer"] = "A"
data_p8[69]["correct_letter"] = "A"

# Q71
data_p8[70]["correct_option"] = "A"
data_p8[70]["correct_answer"] = "A"
data_p8[70]["correct_letter"] = "A"

# Q72
data_p8[71]["correct_option"] = "A"
data_p8[71]["correct_answer"] = "A"
data_p8[71]["correct_letter"] = "A"

# Q73
data_p8[72]["options"] = [
    {"id": "A", "text": "104:55"},
    {"id": "B", "text": "74:39"},
    {"id": "C", "text": "89:47"},
    {"id": "D", "text": "119:63"},
    {"id": "E", "text": "134:71"}
]
data_p8[72]["correct_option"] = "A"
data_p8[72]["correct_answer"] = "A"
data_p8[72]["correct_letter"] = "A"

# Q74
data_p8[73]["correct_option"] = "A"
data_p8[73]["correct_answer"] = "A"
data_p8[73]["correct_letter"] = "A"

with open(filepath_p8, "w", encoding="utf-8") as f:
    json.dump(data_p8, f, indent=2, ensure_ascii=False)
print("Finished fixing Paper 8.")
