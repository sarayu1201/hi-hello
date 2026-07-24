import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    filepath = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims", "sc_cgl_tier1_test1.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        if q.get("id") == 18 or q.get("question_number") == 18:
            print("--- QUESTION 18 ON DISK ---")
            for k, v in q.items():
                print(f"  {k}: {repr(v)}")

if __name__ == "__main__":
    check()
