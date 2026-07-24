import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_3.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    if len(data) > 0:
        q = data[0]
        print("Question 1 Keys and Values:")
        for k, v in q.items():
            if k in ["question", "direction", "directions", "direction_text", "questionImage", "question_image"]:
                print(f"  {k}: {repr(v)}")

if __name__ == "__main__":
    check()
