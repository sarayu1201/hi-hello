import os
import sys
from pymongo import MongoClient

def check_db():
    # Use connection URI from environment or default if not set
    # Let's read connection URI from backend/server.js or local configuration
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    mongo_uri = None
    if os.path.exists(server_js):
        with open(server_js, "r", encoding="utf-8") as f:
            content = f.read()
        match = re.search(r'const\s+MONGO_URI\s*=\s*[\'"]([^\'"]+)[\'"]', content)
        if match:
            mongo_uri = match.group(1)
            
    if not mongo_uri:
        # Fallback to standard environment variable or default URI
        mongo_uri = os.environ.get("MONGO_URI", "mongodb+srv://Rosy:Rosy1201@cluster0.e8s8v.mongodb.net/test?retryWrites=true&w=majority")
        
    try:
        client = MongoClient(mongo_uri)
        db = client.get_default_database()
        
        # Search the questions collection
        questions_col = db["questions"]
        
        print("Connected to MongoDB database successfully.")
        
        # Find all unique sub_type values related to CGL
        pipeline = [
            {"$match": {"$or": [
                {"course": {"$regex": "cgl", "$options": "i"}},
                {"sub_type": {"$regex": "cgl", "$options": "i"}},
                {"paper_name": {"$regex": "cgl", "$options": "i"}}
            ]}},
            {"$group": {
                "_id": {
                    "course": "$course",
                    "sub_type": "$sub_type",
                    "paper_name": "$paper_name",
                    "year": "$year"
                },
                "count": {"$sum": 1}
            }}
        ]
        
        results = list(questions_col.aggregate(pipeline))
        print(f"\nFound {len(results)} groups of CGL questions in database:")
        for r in sorted(results, key=lambda x: str(x["_id"])):
            print(f"  Group: {r['_id']} => Count: {r['count']}")
            
    except Exception as e:
        print(f"Error querying database: {e}")

if __name__ == "__main__":
    import re
    check_db()
