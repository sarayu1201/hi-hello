import os
import re
import json
import pymongo

MONGO_URI = "mongodb+srv://allampallivinaya_db_user:sarayu%40akhil2509@cluster0.l1t116x.mongodb.net/kr_academy?appName=Cluster0"
images_dir = r"c:\Users\veera\Downloads\hi-hello-main\hi-hello-main\QuestionBank\images"
json_dir = r"c:\Users\veera\Downloads\hi-hello-main\hi-hello-main\QuestionBank\json"

def get_db_filter_for_prefix(prefix):
    # Normalize prefix: convert to lowercase and replace hyphens/underscores
    norm = prefix.lower().replace("-", "_").strip()
    
    # E.g. "rrb_clerk_paper1"
    # E.g. "rrb_po_prelims_paper10"
    # E.g. "sbi_clerk_test_1"
    # E.g. "ibps_po_prelims_test_1"
    
    # Extract exam code, paper/test number
    match_paper = re.search(r'(paper|test)_?(\d+)', norm)
    num = match_paper.group(2) if match_paper else ""
    
    exam_filter = {}
    if "rrb_clerk" in norm:
        exam_filter["exam_type"] = "Bank"
        exam_filter["paper_name"] = {"$regex": f"RRB Clerk.*Test {num}", "$options": "i"}
    elif "rrb_po" in norm:
        exam_filter["exam_type"] = "Bank"
        exam_filter["paper_name"] = {"$regex": f"RRB PO.*Test {num}", "$options": "i"}
    elif "sbi_clerk" in norm:
        exam_filter["exam_type"] = "Bank"
        exam_filter["paper_name"] = {"$regex": f"SBI Clerk.*Test {num}", "$options": "i"}
    elif "sbi_po" in norm:
        exam_filter["exam_type"] = "Bank"
        exam_filter["paper_name"] = {"$regex": f"SBI PO.*Test {num}", "$options": "i"}
    elif "ibps_clerk" in norm:
        exam_filter["exam_type"] = "Bank"
        exam_filter["paper_name"] = {"$regex": f"IBPS Clerk.*Test {num}", "$options": "i"}
    elif "ibps_po" in norm:
        exam_filter["exam_type"] = "Bank"
        exam_filter["paper_name"] = {"$regex": f"IBPS PO.*Test {num}", "$options": "i"}
    elif "ssc_gd" in norm:
        exam_filter["exam_type"] = "SSC"
        exam_filter["paper_name"] = {"$regex": f"SSC GD.*Test {num}", "$options": "i"}
    elif "ssc_chsl" in norm:
        exam_filter["exam_type"] = "SSC"
        exam_filter["paper_name"] = {"$regex": f"SSC CHSL.*Test {num}", "$options": "i"}
    elif "ssc_cgl" in norm:
        exam_filter["exam_type"] = "SSC"
        exam_filter["paper_name"] = {"$regex": f"SSC CGL.*Test {num}", "$options": "i"}
        
    return exam_filter, num

def heal_images():
    client = pymongo.MongoClient(MONGO_URI)
    db = client.kr_academy
    col = db.questions
    
    all_files = os.listdir(images_dir)
    matched = []
    
    for f in all_files:
        m1 = re.match(r"^([a-zA-Z0-9_]+)_q(\d+)-(\d+)\.(png|jpg|jpeg)$", f, re.IGNORECASE)
        m2 = re.match(r"^([a-zA-Z0-9_]+)-q_(\d+)_(\d+)\.(png|jpg|jpeg)$", f, re.IGNORECASE)
        m3 = re.match(r"^([a-zA-Z0-9_]+)-dir_(\d+)_(\d+)_diagram\.(png|jpg|jpeg)$", f, re.IGNORECASE)
        
        if m1:
            matched.append((f, m1.group(1), int(m1.group(2)), int(m1.group(3))))
        elif m2:
            matched.append((f, m2.group(1), int(m2.group(2)), int(m2.group(3))))
        elif m3:
            matched.append((f, m3.group(1), int(m3.group(2)), int(m3.group(3))))
            
    print(f"Parsed {len(matched)} pattern-matched images.")
    
    total_db_updates = 0
    total_json_updates = 0
    
    # Map prefix cache
    for filename, prefix, start_q, end_q in matched:
        exam_filter, num = get_db_filter_for_prefix(prefix)
        if not exam_filter or not num:
            continue
            
        # We need to find the database questions matching the exam_filter and display_question_number in [start_q, end_q]
        # Let's perform DB update
        q_filter = exam_filter.copy()
        q_filter["display_question_number"] = {"$gte": start_q, "$lte": end_q}
        
        res = col.update_many(
            q_filter,
            {"$set": {"question_image": filename}}
        )
        if res.modified_count > 0:
            print(f"Updated DB: Associated {filename} with {res.modified_count} questions.")
            total_db_updates += res.modified_count
            
        # Update local JSON files on disk
        # Scan all directories in json_dir
        for root, dirs, files in os.walk(json_dir):
            for f in files:
                if f.endswith(".json"):
                    # Check if the json file path/name matches the prefix
                    # E.g. prefix "rrb_clerk_paper1" and filename "rrb_clerk_paper1.json"
                    normalized_f = f.lower().replace("-", "_")
                    normalized_prefix = prefix.lower().replace("-", "_")
                    
                    # For rrb_clerk_paper1, check if filename matches "rrb_clerk_paper1.json"
                    is_match = False
                    if normalized_prefix in normalized_f:
                        is_match = True
                    elif "sbi_clerk" in normalized_prefix and "sbi_clerk" in normalized_f and f"test_{num}" in normalized_f:
                        is_match = True
                    elif "ibps_po" in normalized_prefix and "ibps_po" in normalized_f and f"test_{num}" in normalized_f:
                        is_match = True
                        
                    if is_match:
                        filepath = os.path.join(root, f)
                        try:
                            with open(filepath, "r", encoding="utf-8") as json_f:
                                data = json.load(json_f)
                                
                            modified = False
                            questions = data.get("questions", []) if isinstance(data, dict) else data
                            for q in questions:
                                q_num = q.get("display_question_number") or q.get("question_number") or q.get("questionNumber")
                                if q_num and start_q <= int(q_num) <= end_q:
                                    q["question_image"] = filename
                                    modified = True
                                    
                            if modified:
                                with open(filepath, "w", encoding="utf-8") as json_f:
                                    json.dump(data, json_f, indent=2, ensure_ascii=False)
                                print(f"  Updated JSON file: {f} for {filename}")
                                total_json_updates += 1
                        except Exception as e:
                            print(f"  Error updating JSON file {f}: {e}")
                            
    print(f"\nHeal Images completed successfully.")
    print(f"Total DB records modified: {total_db_updates}")
    print(f"Total JSON files updated on disk: {total_json_updates}")

if __name__ == "__main__":
    heal_images()
