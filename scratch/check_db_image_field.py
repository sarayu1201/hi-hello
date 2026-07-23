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
        
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(uri)
    db = client.get_default_database()
    questions_col = db.questions
    
    # Fetch Q#41 of SBI Clerk Prelims - Test 1
    q41 = questions_col.find_one({"sub_type": "SBI Clerk Prelims - Test 1", "question_number": 41})
    if q41:
        print("\n--- DATABASE VERIFICATION FOR Q#41 ---")
        print(f"Question Number: {q41.get('question_number')}")
        print(f"question_image:   {repr(q41.get('question_image'))}")
        
        # Check options
        options = q41.get("options", [])
        print("Options structure in DB:")
        for opt in options:
            print(f"  Option {opt.get('id')}: text={repr(opt.get('text'))}, image={repr(opt.get('image'))}")
    else:
        print("Q#41 not found in database!")

if __name__ == "__main__":
    verify()
