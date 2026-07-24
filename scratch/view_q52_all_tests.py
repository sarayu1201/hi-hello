import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
        filepath = os.path.join(json_dir, file)
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            if q.get("id") == 52 or q.get("question_number") == 52:
                print(f"\n=================== {file} Q52 ===================")
                print("Question:")
                print(repr(q.get("question") or q.get("question_text")))
                print("Options:")
                for opt in q.get("options", []):
                    print(f"  {opt.get('id')}: {repr(opt.get('text'))}")
                print("Explanation:")
                print(repr(q.get("explanation")))

if __name__ == "__main__":
    check()
