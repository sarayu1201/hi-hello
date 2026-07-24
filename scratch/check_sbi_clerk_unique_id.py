import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    sbi_file = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", "sbi_clerk_test_1.json")
    
    if os.path.exists(sbi_file):
        with open(sbi_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        if data:
            print("First question keys in sbi_clerk_test_1.json:")
            for k in data[0].keys():
                print(f"  {k}")
            print(f"Unique ID value: {repr(data[0].get('unique_id'))}")
    else:
        print("SBI Clerk file not found")

if __name__ == "__main__":
    check()
