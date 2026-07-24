import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
            
        filepath = os.path.join(json_dir, file)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_text = q.get("question") or q.get("question_text") or ""
            exp_text = q.get("explanation") or ""
            
            # Check for MATHBLOCK in question or explanation
            if "mathblock" in q_text.lower() or "mathblock" in exp_text.lower():
                print(f"\n=================== {file} Q{q.get('id')} ===================")
                print("Question:")
                print(repr(q_text))
                print("Explanation:")
                print(repr(exp_text))

if __name__ == "__main__":
    check()
