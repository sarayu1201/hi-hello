import os
import json

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    t9_path = os.path.join(json_dir, "sc_cgl_tier1_test9.json")
    t10_path = os.path.join(json_dir, "sc_cgl_tier1_test10.json")
    
    with open(t9_path, "r", encoding="utf-8") as f:
        t9_data = json.load(f)
    with open(t10_path, "r", encoding="utf-8") as f:
        t10_data = json.load(f)
        
    print("--- Q#1 in sc_cgl_tier1_test9.json (Disk) ---")
    print(f"Question: {repr(t9_data[0].get('question'))}")
    
    print("\n--- Q#1 in sc_cgl_tier1_test10.json (Disk) ---")
    print(f"Question: {repr(t10_data[0].get('question'))}")

if __name__ == "__main__":
    check()
