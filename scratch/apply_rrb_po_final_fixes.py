import json
import os

dirpath = "QuestionBank/json/rrb_po"

# 1. FIX PAPER 4 DI QUESTIONS
filepath_p4 = os.path.join(dirpath, "rrb_po_prelims_paper4.json")
with open(filepath_p4, "r", encoding="utf-8") as f:
    data_p4 = json.load(f)

# Clean directions text (no outer dollars, clean spacing)
clean_dir_text = (
    "Direction (66-70): Read the information carefully and answer the following questions. "
    "The pie chart shows the percentage of total students (male and females) in four colleges "
    "and another pie chart shows the number of females in these colleges.\n-\n"
    "Total Students (Males + Females) = 2000:\n"
    "A: 30.5%\n"
    "B: 25%\n"
    "C: 12.5%\n"
    "D: 32%\n-\n"
    "Females = 800:\n"
    "A: 130\n"
    "B: X (calculated as 300)\n"
    "C: 220\n"
    "D: 150"
)

# Q66 (index 65)
q66 = data_p4[65]
q66["question"] = clean_dir_text + "\n-\nQ 66. Find the average number of males in B, C and D."
q66["q"] = clean_dir_text.replace("following question.", "following questions.") + "\n-\nQ66. Find the average number of males in B, C and D."

# Q67 (index 66)
q67 = data_p4[66]
q67["question"] = clean_dir_text + "\n-\nQ 67. Find the ratio of males in college C and D together to females in A and C together."
q67["q"] = clean_dir_text.replace("following question.", "following questions.") + "\n-\nQ67. Find the ratio of males in college C and D together to females in A and C together."

# Q68 (index 67)
q68 = data_p4[67]
q68["question"] = clean_dir_text + "\n-\nQ 68. Find the total females in C and B together is what percentage of total students in D."
q68["q"] = clean_dir_text.replace("following question.", "following questions.") + "\n-\nQ68. Find the total females in C and B together is what percentage of total students in D."

# Q69 (index 68)
q69 = data_p4[68]
q69["question"] = clean_dir_text + "\n-\nQ 69. In college D, total number of students is 3X, out of that 35% are females. Find the males in D is what percentage more/less than total students in B."
q69["q"] = clean_dir_text.replace("following question.", "following questions.") + "\n-\nQ69. In college D, total number of students is 3X, out of that 35% are females. Find the males in D is what percentage more/less than total students in B."

# Q70 (index 69)
q70 = data_p4[69]
q70["question"] = clean_dir_text + "\n-\nQ 70. Find the difference between total students in A and B together and twice the males in B."
q70["q"] = clean_dir_text.replace("following question.", "following questions.") + "\n-\nQ70. Find the difference between total students in A and B together and twice the males in B."

with open(filepath_p4, "w", encoding="utf-8") as f:
    json.dump(data_p4, f, indent=2, ensure_ascii=False)
print("Applied final fixes to Paper 4.")


# 2. FIX PAPER 6 STATEMENT II IN Q75
filepath_p6 = os.path.join(dirpath, "rrb_po_prelims_paper6.json")
with open(filepath_p6, "r", encoding="utf-8") as f:
    data_p6 = json.load(f)

# Q75 (index 74)
q75 = data_p6[74]
clean_q75_text = (
    "Directions (74-75): Given below in each question there are two statements (I) and (II). "
    "You must determine which statement is enough to give the answer of the question. "
    "Also, there are five alternatives given, you have to choose one alternative as your answer of the question.\n-\n"
    "Q 75. Side of square is 3.5 cm more than radius of circle. What will be area of square?-\n"
    "I. Difference between circumference and diameter of circle is 45 cm.\n"
    "II. Radius of circle is 50% more than breadth of rectangle whose length is 15 cm. Ratio of circumference of circle and perimeter of rectangle is 3:2."
)
q75["question"] = clean_q75_text
q75["q"] = clean_q75_text.replace("answer of the question.", "answer of the questions.").replace("Q 75.", "Q75.")

with open(filepath_p6, "w", encoding="utf-8") as f:
    json.dump(data_p6, f, indent=2, ensure_ascii=False)
print("Applied final fixes to Paper 6.")
