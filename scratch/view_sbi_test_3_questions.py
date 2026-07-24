import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_3.json")
    
    if not os.path.exists(path):
        print(f"Error: {path} not found!")
        return
        
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} questions from {os.path.basename(path)}")
    
    # 1. Search for the coding-decoding question with the pie chart
    found_coding = False
    for idx, q in enumerate(data):
        q_text = q.get("question") or q.get("question_text") or ""
        if "Best Efforts" in q_text or "W in Hard" in q_text:
            print(f"\nFOUND Coding Question at index {idx} (ID: {q.get('id')}):")
            print(f"  Question: {repr(q_text[:120])}...")
            print(f"  Image: {repr(q.get('questionImage') or q.get('question_image'))}")
            print(f"  Directions: {repr(q.get('direction') or q.get('directions') or q.get('direction_text'))}")
            found_coding = True
            
    # 2. Check all questions in Test 3 that have direction texts
    print("\nQuestions in Test 3 containing direction text:")
    dir_count = 0
    for idx, q in enumerate(data):
        d_text = q.get("direction") or q.get("directions") or q.get("direction_text") or ""
        if d_text:
            dir_count += 1
            if dir_count <= 15:
                print(f"  Index {idx} (ID {q.get('id')}, Subject: {q.get('subject')}): Direction prefix: {repr(d_text[:80])}...")
    print(f"Total questions with directions in Test 3: {dir_count}")

if __name__ == "__main__":
    check()
