import os
import json

def view_errors():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    targets = [
        ("sc_cgl_tier1_test2.json", 54, "explanation"),
        ("sc_cgl_tier1_test2.json", 65, "explanation"),
        ("sc_cgl_tier1_test2.json", 67, "explanation"),
        ("sc_cgl_tier1_test2.json", 69, "question"),
        ("sc_cgl_tier1_test2.json", 69, "explanation"),
        ("sc_cgl_tier1_test2.json", 71, "explanation"),
        ("sc_cgl_tier1_test4.json", 51, "explanation"),
        ("sc_cgl_tier1_test4.json", 64, "explanation"),
        ("sc_cgl_tier1_test4.json", 70, "explanation"),
        ("sc_cgl_tier1_test4.json", 71, "explanation"),
        ("sc_cgl_tier1_test5.json", 68, "question"),
        ("sc_cgl_tier1_test6.json", 2, "explanation"),
        ("sc_cgl_tier1_test6.json", 8, "explanation"),
        ("sc_cgl_tier1_test7.json", 55, "explanation"),
        ("sc_cgl_tier1_test7.json", 60, "explanation"),
        ("sc_cgl_tier1_test7.json", 64, "explanation"),
        ("sc_cgl_tier1_test7.json", 67, "explanation"),
        ("sc_cgl_tier1_test8.json", 33, "explanation"),
        ("sc_cgl_tier1_test8.json", 38, "explanation"),
        ("sc_cgl_tier1_test9.json", 62, "explanation"),
        ("sc_cgl_tier1_test9.json", 70, "explanation"),
        ("sc_cgl_tier1_test10.json", 62, "explanation"),
        ("sc_cgl_tier1_test10.json", 70, "explanation")
    ]
    
    for filename, q_id, field in targets:
        path = os.path.join(cgl_dir, filename)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            if q.get("id") == q_id:
                print(f"=== {filename} Q{q_id} ({field}) ===")
                print(repr(q.get(field)))
                print("-" * 60)
                break

if __name__ == "__main__":
    view_errors()
