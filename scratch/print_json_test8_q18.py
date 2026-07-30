import json

file_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims\\ibps_clerk_prelims_test8.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Find question with id 18
q18 = next(q for q in data if q["id"] == 18)
print(json.dumps(q18, indent=2))
