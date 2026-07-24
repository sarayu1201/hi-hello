import os
import json
from collections import Counter

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_10.json")
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Total questions in sbi_clerk_test_10.json: {len(data)}")
    
    # 1. Check for duplicate questions based on question text
    q_texts = {}
    duplicates = []
    for idx, q in enumerate(data):
        text = q.get("question", "").strip()
        if text and len(text) > 10:
            if text in q_texts:
                duplicates.append((q_texts[text], q.get("id"), text))
            else:
                q_texts[text] = q.get("id")
                
    if duplicates:
        print(f"\nFound duplicate questions:")
        for first_id, second_id, text in duplicates:
            print(f"  Question ID {second_id} is a duplicate of ID {first_id}!")
            print(f"  Text snippet: {repr(text[:150])}")
    else:
        print("\nNo duplicate question texts found.")
        
    # 2. Check for duplicate option text within each question
    opt_duplicates = []
    for idx, q in enumerate(data):
        opts = [o.get("text", "").strip() for o in q.get("options", []) if o.get("text")]
        counts = Counter(opts)
        dups = [item for item, count in counts.items() if count > 1]
        if dups:
            opt_duplicates.append((q.get("id"), dups, q.get("options")))
            
    if opt_duplicates:
        print(f"\nFound questions with duplicate options:")
        for q_id, dups, options in opt_duplicates:
            print(f"  Question ID {q_id} has duplicate options: {dups}")
            print("  Full Options:")
            for o in options:
                print(f"    {o.get('id')}: {repr(o.get('text'))}")
    else:
        print("\nNo questions with duplicate options found.")

if __name__ == "__main__":
    check()
