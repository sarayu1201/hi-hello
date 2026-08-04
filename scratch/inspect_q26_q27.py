import os
import json
from pymongo import MongoClient

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi_po_prelims", "sbipo_test_1.json")
    
    out_lines = []
    
    # 1. Inspect JSON
    out_lines.append("--- JSON Question 26 & 27 ---")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for q in data:
            if q.get("unique_id") in ["sbi_po_prelims_test1_26", "sbi_po_prelims_test1_27"]:
                out_lines.append(f"ID: {q.get('unique_id')}")
                out_lines.append(f"Question: {repr(q.get('question'))}")
                out_lines.append("Options:")
                for opt in q.get("options", []):
                    out_lines.append(f"  - {repr(opt)}")
                out_lines.append(f"Correct: {q.get('correct_option')}")
                out_lines.append("-" * 30)
                
    # 2. Inspect DB
    mongo_uri = None
    env_file = os.path.join(root_dir, "backend", ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    mongo_uri = line.split("=", 1)[1].strip()
                    break
    if mongo_uri:
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            db = client.kr_academy
            questions_col = db.questions
            out_lines.append("\n--- DB Question 26 & 27 ---")
            for uid in ["sbi_po_prelims_test1_26", "sbi_po_prelims_test1_27"]:
                q = questions_col.find_one({"unique_id": uid})
                if q:
                    out_lines.append(f"ID: {q.get('unique_id')}")
                    out_lines.append(f"Question: {repr(q.get('question'))}")
                    out_lines.append("Options:")
                    for opt in q.get("options", []):
                        out_lines.append(f"  - {repr(opt)}")
                    out_lines.append("-" * 30)
        except Exception as e:
            out_lines.append(f"DB connect error: {e}")
            
    with open(os.path.join(root_dir, "scratch", "inspect_output.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))

if __name__ == "__main__":
    run()
