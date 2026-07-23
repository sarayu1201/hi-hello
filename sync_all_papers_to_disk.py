import pymongo
import os
import json

MONGO_URI = "mongodb+srv://allampallivinaya_db_user:sarayu%40akhil2509@cluster0.l1t116x.mongodb.net/kr_academy?appName=Cluster0"

FOLDER_MAPPING = {
    'ibps_clerk_prelims': 'ibps_clerk_prelims_test',
    'ibps_po_prelims': 'ibpspo_test_',
    'rrb_clerk': 'rrb_clerk_paper',
    'rrb_po': 'rrb_po_prelims_paper',
    'sbi_clerk_prelims': 'sbi_clerk_test_',
    'ssc_chsl_tier1_papers': 'ssc_chsl_tier1_paper',
    'ssc_chsl_tier2_papers': 'ssc_chsl_tier2_paper',
    'sc_gd': 'ssc_gd_tier1_test',
    'ssc_cgl_prelims': 'sc_cgl_tier1_test',
}

def get_folder_name(filename):
    fname = filename.lower()
    for folder, prefix in FOLDER_MAPPING.items():
        if fname.startswith(prefix):
            return folder
    return None

def sync_data():
    print("Syncing cleaned production database back to local JSON files...")
    client = pymongo.MongoClient(MONGO_URI)
    db = client.kr_academy
    questions_col = db.questions
    
    # Get distinct source_file names
    files = questions_col.distinct("source_file")
    print(f"Found {len(files)} unique mock test JSON files in database.")
    
    synced_count = 0
    for fname in files:
        if not fname:
            continue
            
        folder = get_folder_name(fname)
        if not folder:
            print(f"Skipping sync for unmapped source file: {fname}")
            continue
            
        questions = list(questions_col.find({"source_file": fname}).sort([
            ("display_question_number", 1),
            ("question_number", 1),
            ("id", 1)
        ]))
        
        mapped = []
        for q in questions:
            opts = q.get("options", [])
            mapped_opts = []
            for o_idx, opt in enumerate(opts):
                if isinstance(opt, dict):
                    mapped_opts.append(opt)
                else:
                    mapped_opts.append({
                        "id": chr(65 + o_idx),
                        "text": opt
                    })
                    
            mapped.append({
                "id": q.get("display_question_number") or q.get("question_number") or 1,
                "unique_id": q.get("unique_id", ""),
                "content_hash": q.get("content_hash", ""),
                "display_question_number": q.get("display_question_number") or q.get("question_number") or 1,
                "question_number": q.get("question_number") or 1,
                "course": q.get("course", ""),
                "exam_type": q.get("exam_type", ""),
                "sub_type": q.get("sub_type", ""),
                "paper_name": q.get("paper_name", ""),
                "test_title": q.get("test_title", ""),
                "test_id": q.get("test_id", ""),
                "subject": q.get("subject", ""),
                "section": q.get("section") or q.get("subject", ""),
                "category": q.get("category") or q.get("course", ""),
                "question": q.get("question", ""),
                "q": q.get("q") or q.get("question", ""),
                "options": mapped_opts,
                "correct_option": q.get("correct_option") or q.get("correct_answer", ""),
                "correct_answer": q.get("correct_answer", ""),
                "correct_letter": q.get("correct_letter") or q.get("correct_answer", ""),
                "explanation": q.get("explanation", ""),
                "question_image": q.get("question_image", ""),
                "option_images": q.get("option_images", []),
                "status": q.get("status", "ok"),
                "is_mock_eligible": q.get("is_mock_eligible", True),
                "created_at": str(q.get("created_at", "")),
                "updated_at": str(q.get("updated_at", ""))
            })
            
        json_path = os.path.join("QuestionBank", "json", folder, fname)
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(mapped, f, indent=2, ensure_ascii=False)
            
        synced_count += 1
        
    print(f"Successfully synchronized {synced_count} local JSON paper files on disk.")

if __name__ == "__main__":
    sync_data()
