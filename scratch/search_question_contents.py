import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    if not os.path.exists(sbi_dir):
        print("Directory not found")
        return
        
    for filename in sorted(os.listdir(sbi_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(sbi_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_text = q.get("question", "") or ""
            direction = q.get("direction", "") or ""
            exp_text = q.get("explanation", "") or ""
            
            # Check for '>/' or 'or inappropriate'
            if ">/" in q_text or ">/" in direction or ">/" in exp_text:
                print(f"[{filename}] Q#{q.get('id')} has '>/' in:")
                if ">/" in direction: print(f"  direction: {repr(direction)}")
                if ">/" in q_text: print(f"  question: {repr(q_text)}")
                if ">/" in exp_text: print(f"  explanation: {repr(exp_text)}")
                
            # Check for 'or inappropriate'
            if "or inappropriate" in direction or "or inappropriate" in q_text:
                print(f"[{filename}] Q#{q.get('id')} has 'or inappropriate' in:")
                if "or inappropriate" in direction: print(f"  direction: {repr(direction)}")
                if "or inappropriate" in q_text: print(f"  question: {repr(q_text)}")

if __name__ == "__main__":
    check()
