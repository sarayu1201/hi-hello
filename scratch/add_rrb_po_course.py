import pymongo

remote_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(remote_uri)
db = client["kr_academy"]
courses_col = db["courses"]

# Document template
new_course = {
    "id": "ibps_rrb_po",
    "title": "IBPS RRB PO",
    "category": "Bank & Insurance",
    "logoType": "ibps",
    "price": 6999,
    "mrp": 10999,
    "duration": "5 Months",
    "facultyName": "V. Prasad",
    "enrolledCount": 240,
    "status": "Trending",
    "image": "/celebration_bg.png",
    "syllabus": [
        {
            "subject": "Quantitative Aptitude",
            "concepts": [
                {"name": "Simplification & Approximation", "weightage": "5 Marks", "difficulty": "Easy"},
                {"name": "Data Interpretation (DI)", "weightage": "15 Marks", "difficulty": "Hard"},
                {"name": "Number Series", "weightage": "5 Marks", "difficulty": "Medium"},
                {"name": "Arithmetic Word Problems", "weightage": "15 Marks", "difficulty": "Hard"}
            ]
        },
        {
            "subject": "Reasoning Ability",
            "concepts": [
                {"name": "Puzzles & Seating Arrangement", "weightage": "20 Marks", "difficulty": "Hard"},
                {"name": "Syllogism & Logical Reasoning", "weightage": "10 Marks", "difficulty": "Medium"},
                {"name": "Coding-Decoding", "weightage": "5 Marks", "difficulty": "Easy"}
            ]
        }
    ]
}

# Insert remote if missing
existing = courses_col.find_one({"id": "ibps_rrb_po"})
if existing is None:
    courses_col.insert_one(new_course)
    print("Remote: Inserted successfully!")
else:
    print("Remote: Already exists.")

# Insert local if missing
try:
    client_local = pymongo.MongoClient("mongodb://localhost:27017/")
    db_local = client_local["kr_academy"]
    existing_local = db_local["courses"].find_one({"id": "ibps_rrb_po"})
    if existing_local is None:
        db_local["courses"].insert_one(new_course)
        print("Local: Inserted successfully!")
    else:
        print("Local: Already exists.")
except Exception as e:
    print("Local error:", e)
