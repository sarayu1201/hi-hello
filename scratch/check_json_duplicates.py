import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_1.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Total questions in sbi_clerk_test_1.json: {len(data)}")
    
    q41_entries = []
    for idx, q in enumerate(data):
        if q.get("id") == 41:
            q41_entries.append((idx, q))
            
    print(f"Number of Q#41 entries in JSON: {len(q41_entries)}")
    for idx, entry in q41_entries:
        print(f"\nEntry at index {idx}:")
        print(f"  year:          {entry.get('year')}")
        print(f"  questionImage: {repr(entry.get('questionImage'))}")
        print(f"  question:      {repr(entry.get('question'))[:80]}...")

if __name__ == "__main__":
    check()
