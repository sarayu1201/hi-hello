from pymongo import MongoClient
import json
import os

mongo_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
db_name = "kr_academy"
json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

try:
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    questions_col = db["questions"]
    
    # Delete existing questions for IBPS Clerk Prelims
    print("Deleting existing IBPS Clerk Prelims questions from DB...")
    res = questions_col.delete_many({"sub_type": {"$regex": "^IBPS Clerk Prelims - Test"}})
    print(f"Deleted {res.deleted_count} questions.")
    
    # Read and prepare new questions
    docs_to_insert = []
    for i in range(1, 11):
        file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            correct_idx = ord(q["correctAnswer"].upper()) - ord("A")
            
            doc = {
                'unique_id': q["unique_id"],
                'display_question_number': q["display_question_number"],
                'question_number': q["question_number"],
                'course': q["course"],
                'exam_type': q["exam_type"],
                'sub_type': q["sub_type"],
                'paper_name': q["paper_name"],
                'test_title': q["test_title"],
                'test_id': q["test_id"],
                'subject': q["subject"],
                'section': q["section"],
                'category': q["category"],
                'question': q["question"],
                'q': q["q"],
                'options': q["options"],
                'correctAnswer': q["correctAnswer"],
                'correct_answer': q["correct_answer"],
                'correct_option': q["correct_option"],
                'correct_letter': q["correct_letter"],
                'correct': correct_idx,
                'explanation': q["explanation"],
                'question_image': q["question_image"],
                'option_images': q["option_images"],
                'direction': q["direction"],
                'status': q["status"],
                'is_mock_eligible': q["is_mock_eligible"],
                'source_file': f"ibps_clerk_prelims_test{i}.json"
            }
            docs_to_insert.append(doc)
            
    if docs_to_insert:
        print(f"Inserting {len(docs_to_insert)} questions into MongoDB...")
        res = questions_col.insert_many(docs_to_insert, ordered=False)
        print(f"Successfully inserted {len(res.inserted_ids)} questions.")
    else:
        print("No questions to insert.")

except Exception as e:
    print(f"An error occurred: {e}")
