import json

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims\\ibps_clerk_prelims_test2.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Find question 6
q6 = next(q for q in data if q["id"] == 6)
print("Question 6:")
print("  Question Text:", repr(q6["question"]))
print("  Options:", json.dumps(q6["options"], indent=2))
print("  Correct Answer:", q6["correctAnswer"])
print("  Explanation:", repr(q6["explanation"]))
