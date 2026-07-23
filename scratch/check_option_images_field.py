import os
import pymongo

def verify():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    uri = ""
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                uri = line.split("=", 1)[1].strip()
                break
                
    client = pymongo.MongoClient(uri)
    db = client.get_default_database()
    questions_col = db.questions
    
    q41 = questions_col.find_one({"sub_type": "SBI Clerk Prelims - Test 1", "question_number": 41})
    if q41:
        print("\n--- FULL DOCUMENT FOR Q#41 ---")
        for k, v in q41.items():
            print(f"  {k}: {repr(v)}")
    else:
        print("Q#41 not found!")

if __name__ == "__main__":
    verify()
