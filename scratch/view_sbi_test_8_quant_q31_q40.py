import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_8.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("=== QUANT QUESTIONS 31 TO 35 (Test 8) ===")
    for q in data:
        q_id = q.get("id")
        if 31 <= q_id <= 35:
            print(f"\n=================== Q{q_id} ===================")
            print("Question:")
            print(repr(q.get("question")))
            print("Image:")
            print(repr(q.get("questionImage") or q.get("question_image")))
            print("Options:")
            for opt in q.get("options", []):
                print(f"  {opt.get('id')}: {repr(opt.get('text'))}")
            print("Explanation:")
            print(repr(q.get("explanation")))
            
    print("\n=== QUANT QUESTIONS 36 TO 40 (Test 8) ===")
    # Print the directions of Q36 to Q40
    printed_dirs = set()
    for q in data:
        q_id = q.get("id")
        if 36 <= q_id <= 40:
            print(f"\n=================== Q{q_id} ===================")
            dir_text = q.get("direction")
            if dir_text not in printed_dirs:
                print("Direction:")
                print(repr(dir_text))
                printed_dirs.add(dir_text)
            print("Question:")
            print(repr(q.get("question")))
            print("Explanation:")
            print(repr(q.get("explanation")))

if __name__ == "__main__":
    check()
