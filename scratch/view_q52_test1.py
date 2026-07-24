import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims", "sc_cgl_tier1_test1.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 52 or q.get("question_number") == 52:
            print("Question 52 details in Test 1:")
            print("Question:")
            print(repr(q.get("question") or q.get("question_text")))
            print("\nOptions:")
            for opt in q.get("options", []):
                print(f"  {opt.get('id')}: {repr(opt.get('text'))}")
            print("\nExplanation:")
            print(repr(q.get("explanation")))

if __name__ == "__main__":
    check()
