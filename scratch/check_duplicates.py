import os
import pymongo

def check():
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
    
    query = {"sub_type": "SBI Clerk Prelims - Test 1", "question_number": 41}
    docs = list(questions_col.find(query))
    
    print(f"Total documents found for Q#41: {len(docs)}")
    for idx, doc in enumerate(docs):
        print(f"\nDocument #{idx+1}:")
        print(f"  _id:            {doc.get('_id')}")
        print(f"  unique_id:      {doc.get('unique_id')}")
        print(f"  question_image: {repr(doc.get('question_image'))}")
        print(f"  is_mock_eligible: {doc.get('is_mock_eligible')}")
        print(f"  source_file:    {doc.get('source_file')}")

if __name__ == "__main__":
    check()
