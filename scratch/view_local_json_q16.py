import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims", "sc_cgl_tier1_test1.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        q_text = str(q.get("question", ""))
        exp_text = str(q.get("explanation", ""))
        
        if "bottom number" in exp_text.lower():
            print("Question ID:", q.get("id"))
            print("Question:", repr(q_text))
            print("Explanation:", repr(exp_text))

if __name__ == "__main__":
    check()
