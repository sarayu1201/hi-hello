import os
import json

def inspect():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test8.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 79 or q.get("question_number") == 79:
            print("Question 79 text:")
            print(q.get("question") or q.get("question_text"))
            print("\nExplanation:")
            print(q.get("explanation"))

if __name__ == "__main__":
    inspect()
