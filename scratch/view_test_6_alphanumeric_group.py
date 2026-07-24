import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_6.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print("Alphanumeric Series Questions (IDs 90 to 94):")
    for q in data:
        q_id = q.get("id")
        if 90 <= q_id <= 94:
            print(f"\n=================== Q{q_id} ===================")
            print("Question:")
            print(repr(q.get("question") or q.get("question_text")))
            print("Options:")
            for opt in q.get("options", []):
                print(f"  {opt.get('id')}: {repr(opt.get('text'))}")
            print("Explanation:")
            print(repr(q.get("explanation")))
            
    # Also check Q47 (Quant Q17) details
    print("\n=================== Q47 (Quant Q17) ===================")
    for q in data:
        if q.get("id") == 47:
            print("Question:")
            print(repr(q.get("question") or q.get("question_text")))
            print("Image:")
            print(repr(q.get("questionImage") or q.get("question_image")))

if __name__ == "__main__":
    check()
