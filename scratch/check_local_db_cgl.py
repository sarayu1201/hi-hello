import os
import re
from pymongo import MongoClient

def check_db():
    mongo_uri = "mongodb://localhost:27017/kr_academy"
        
    try:
        client = MongoClient(mongo_uri)
        db = client.get_default_database()
        
        # Search the questions collection
        questions_col = db["questions"]
        
        print(f"Connected to local MongoDB ({mongo_uri}) successfully.")
        
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
    check_db()
