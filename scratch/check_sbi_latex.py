import json
import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    file_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_1.json")
    
    if not os.path.exists(file_path):
        print("File not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Total questions loaded from file: {len(data)}")
    
    # Scan for $ or LaTeX or >/ in the first 50 questions
    print("\nSAMPLE QUESTIONS WITH LATEX OR ISSUES:")
    count = 0
    for idx, q in enumerate(data):
        q_text = q.get("question", "")
        exp_text = q.get("explanation", "")
        direction = q.get("direction", "")
        
        has_latex = "\\" in q_text or "$" in q_text or "\\" in exp_text or "$" in exp_text
        has_slash = ">/" in q_text or ">/" in direction or ">/" in exp_text
        
        if has_latex or has_slash:
            count += 1
            print(f"\nQuestion #{q.get('id')} ({q.get('subject')})")
            if direction:
                print(f"  Direction: {repr(direction[:100])}")
            print(f"  Question: {repr(q_text[:200])}")
            for opt in q.get("options", []):
                if "$" in opt.get("text", "") or "\\" in opt.get("text", ""):
                    print(f"    Option {opt.get('id')}: {repr(opt.get('text'))}")
            print(f"  Explanation excerpt: {repr(exp_text[:200])}")
            if count >= 5:
                break
                
if __name__ == "__main__":
    check()
