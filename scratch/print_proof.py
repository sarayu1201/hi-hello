import os
import pymongo

def verify():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    # Load the verified URI from .env
    uri = ""
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                uri = line.split("=", 1)[1].strip()
                break
                
    if not uri:
        print("No MONGODB_URI found in .env")
        return
        
    print("Connecting to live MongoDB Atlas...")
    client = pymongo.MongoClient(uri)
    db = client.get_default_database()
    questions_col = db.questions
    
    # Fetch Q#1 of SBI Clerk Prelims - Test 1
    print("\n--- FETCHING Q#1 ---")
    q1 = questions_col.find_one({"sub_type": "SBI Clerk Prelims - Test 1", "question_number": 1})
    if q1:
        print(f"ID: {q1.get('question_number')}")
        print(f"Direction (Cleaned 'usage'):\n  {repr(q1.get('direction'))}")
        print(f"Question text:\n  {repr(q1.get('q'))}")
    else:
        print("Q#1 not found")
        
    # Fetch Q#31 of SBI Clerk Prelims - Test 1
    print("\n--- FETCHING Q#31 ---")
    q31 = questions_col.find_one({"sub_type": "SBI Clerk Prelims - Test 1", "question_number": 31})
    if q31:
        print(f"ID: {q31.get('question_number')}")
        print(f"Question text (Cleaned math block):\n  {repr(q31.get('q'))}")
    else:
        print("Q#31 not found")

if __name__ == "__main__":
    verify()
