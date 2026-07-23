import os
import sys
import json
import hashlib
import shutil
import re
from pymongo import MongoClient

def get_legacy_category(exam_type):
    exam_lower = str(exam_type).lower()
    if "ssc" in exam_lower:
        return "SSC Exams"
    elif "rrb" in exam_lower or "rail" in exam_lower:
        return "RRB & Railways"
    elif "appsc" in exam_lower or "tspsc" in exam_lower or "state" in exam_lower:
        return "State Exams"
    elif "neet" in exam_lower or "jee" in exam_lower:
        return "NEET / JEE"
    elif "upsc" in exam_lower or "civil" in exam_lower:
        return "UPSC / Civil"
    else:
        return "Bank & Insurance"

def get_cbt_exam_type(category):
    if category == "SSC Exams":
        return "SSC"
    elif category == "RRB & Railways":
        return "RRB"
    elif category == "State Exams":
        return "APPSC Groups"
    elif category == "UPSC / Civil":
        return "UPSC"
    elif category == "NEET / JEE":
        return "NEET / JEE"
    else:
        return "Banking"

def map_filename_to_subtype(filename):
    name = os.path.splitext(filename)[0]
    
    m = re.match(r'sbi_?po_test_(\d+)', name, re.IGNORECASE)
    if m: return f"SBI PO Prelims - Test {m.group(1)}"
    
    m = re.match(r'sbi_?clerk_test_(\d+)', name, re.IGNORECASE)
    if m: return f"SBI Clerk Prelims - Test {m.group(1)}"
    
    m = re.match(r'ibps_?po_test_(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS PO Prelims - Test {m.group(1)}"
    
    m = re.match(r'ibps_?clerk_(?:prelims_)?test_?(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS Clerk Prelims - Test {m.group(1)}"

    
    m = re.match(r'sc_cgl_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CGL Prelims - Test {m.group(1)}"
    
    m = re.match(r'ssc_cgl_mains_test(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CGL Mains - Test {m.group(1)}"
    
    m = re.match(r'ssc_chsl_tier1_paper(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CHSL Prelims - Test {m.group(1)}"
    
    m = re.match(r'ssc_chsl_tier2_paper(\d+)', name, re.IGNORECASE)
    if m: return f"SSC CHSL Mains - Test {m.group(1)}"
    
    m = re.match(r'rrb_ntpc_cbt2_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"RRB NTPC CBT 2 - Test {m.group(1)}"
    
    m = re.match(r'rrb_gd_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"RRB GD - Test {m.group(1)}"
    
    m = re.match(r'rrb_clerk_paper(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS RRB Clerk Prelims - Test {m.group(1)}"
    
    m = re.match(r'rrb_po_prelims_paper(\d+)', name, re.IGNORECASE)
    if m: return f"IBPS RRB PO Prelims - Test {m.group(1)}"
    
    m = re.match(r'ssc_gd_tier1_test(\d+)', name, re.IGNORECASE)
    if m: return f"SSC GD Constable Prelims - Test {m.group(1)}"
    
    if name.lower() == "rrb-cbt-test-1":
        return "RRB CBT - Test 1"
        
    m = re.match(r'RRB-NTPC-UG-Question-Paper-(.*?)-Shift-(\d+)-exam', name, re.IGNORECASE)
    if m:
        date_part = m.group(1).replace('-', ' ')
        return f"RRB NTPC UG - {date_part} Shift {m.group(2)}"
        
    return name.replace('_', ' ').replace('-', ' ').title()


def get_standardized_subject(exam_type, sub_type_val, q_id, original_subject):
    exam_lower = str(exam_type).lower()
    sub_lower = str(sub_type_val).lower()
    try:
        q_num = int(q_id)
    except:
        q_num = 1
    
    # 1. Standard Banking Prelims mock tests (100 questions)
    if "bank" in exam_lower or "sbi" in sub_lower or "ibps" in sub_lower:
        if "mains" not in sub_lower and "main" not in sub_lower:
            if "sbi po" in sub_lower:
                if q_num <= 40:
                    return "English Language"
                elif q_num <= 70:
                    return "Quantitative Aptitude"
                else:
                    return "Reasoning Ability"
            else:
                if q_num <= 30:
                    return "English Language"
                elif q_num <= 65:
                    return "Quantitative Aptitude"
                else:
                    return "Reasoning Ability"
                
    # 2. Standard SSC Prelims/Tier 1 mock tests (100 questions)
    if "ssc" in exam_lower or "cgl prelims" in sub_lower or "chsl prelims" in sub_lower or "chsl tier 1" in sub_lower:
        if "mains" not in sub_lower and "tier 2" not in sub_lower:
            if q_num <= 25:
                return "Reasoning Ability"
            elif q_num <= 50:
                return "General Awareness"
            elif q_num <= 75:
                return "Quantitative Aptitude"
            else:
                return "English Language"
                
    # Otherwise return original subject (cleaned)
    if original_subject:
        subj = str(original_subject).strip()
        subj_lower = subj.lower()
        if "math" in subj_lower or "quant" in subj_lower or "arithmetic" in subj_lower:
            return "Quantitative Aptitude"
        if "reason" in subj_lower or "intelligence" in subj_lower or "mental" in subj_lower:
            return "Reasoning Ability"
        if "english" in subj_lower or "verbal" in subj_lower or "comprehension" in subj_lower or "lang" in subj_lower:
            return "English Language"
        if "aware" in subj_lower or "general" in subj_lower or "science" in subj_lower:
            return "General Awareness"
        return subj
        
    return "General"

def to_latex(text):
    if not text:
        return text
        
    text = str(text)
    if "$" in text:
        return text
    
    # 1. Mixed fractions like "11 1 9%" or "11 1/9%" or "33 1/3%"
    # e.g., "11 1 9%" -> "$11 \frac{1}{9}\%$"
    text = re.sub(r'\b(\d+)\s+(\d+)\s+(\d+)%', r'$\1 \\frac{\2}{\3}\%$', text)
    text = re.sub(r'\b(\d+)\s+(\d+)/(\d+)%', r'$\1 \\frac{\2}{\3}\%$', text)
    
    # 2. Standalone fractions like "7/5" or "3/2"
    # e.g., "7/5" -> "$\frac{7}{5}$"
    # Note: Make sure it's not part of a date or a URL (e.g., 2026/07/18)
    text = re.sub(r'(?<![\d/])(\d+)/(\d+)(?![\d/])', r'$\\frac{\1}{\2}$', text)
    
    # 3. Simple equations/expressions containing × or ÷
    # e.g., "(10.22×9.94) ÷4.98-?=6.97" -> "$(10.22 \times 9.94) \div 4.98 - ? = 6.97$"
    def replace_equation(match):
        eq = match.group(0)
        if "$" in eq:
            return eq
        eq_clean = eq.replace("×", " \\times ").replace("÷", " \\div ")
        eq_clean = re.sub(r'\s+', ' ', eq_clean).strip()
        return f"${eq_clean}$"
        
    text = re.sub(r'\(?[\d.]+\s*[+\-*×÷/]\s*[\d.]+\)?(?:\s*[+\-*×÷/=<>?]+\s*[\d.?\(\)]+)*', replace_equation, text)
    
    # 4. Number series: "12,     48,     24,       96,        ?,        192"
    text = re.sub(r'\b\??\d+\??\s*,\s*(?:\??\d+\??\s*,\s*){2,}\??\d+\??', lambda m: f"${m.group(0).replace(' ', '')}$", text)
    
    # 5. Ratios like "5 : 4" or "2:1" or "5:6"
    text = re.sub(r'\b(\d+)\s*:\s*(\d+)\b', r'$\1:\2$', text)
    
    # 6. Single variables like "Rs x" or "Rs (x + 4000)" or "value of x"
    text = re.sub(r'\bRs\s+([a-zA-Z])\b', r'Rs. $\1$', text)
    text = re.sub(r'\bRs\s*\(\s*([a-zA-Z])\s*([+\-*])\s*(\d+)\s*\)', r'Rs. $(\1 \2 \3)$', text)
    text = re.sub(r'\bvalue of\s+([a-zA-Z])\b', r'value of $\1$', text)
    text = re.sub(r'\bin\s+‘([a-zA-Z])’\s+days\b', r'in $\1$ days', text)
    text = re.sub(r'\bfind\s+‘([a-zA-Z])’\b', r'find $\1$', text)
    
    return text

def find_actual_image_path(ref_path, base_images_dir):
    if not ref_path:
        return ""
    
    ref_path = ref_path.replace('\\', '/')
    parts = ref_path.split('/')
    filename = parts[-1]
    folder = parts[-2] if len(parts) > 1 else ""
    
    # Direct match check
    target_absolute = os.path.join(base_images_dir, ref_path)
    if os.path.exists(target_absolute):
        return ref_path
        
    # Search recursively for smart matching
    for root, dirs, files in os.walk(base_images_dir):
        root_clean = os.path.basename(root)
        if folder and root_clean.lower() != folder.lower():
            continue
            
        for f in files:
            if f.lower() == filename.lower():
                return os.path.relpath(os.path.join(root, f), base_images_dir).replace('\\', '/')
            
            # diagram / table fallback
            alt_f = filename.replace('diagram', 'table').replace('table', 'diagram').replace('image', 'diagram')
            if f.lower() == alt_f.lower():
                return os.path.relpath(os.path.join(root, f), base_images_dir).replace('\\', '/')
                
            # prefix fallback (e.g. dir_36_40)
            stem = os.path.splitext(filename)[0]
            if '_' in stem:
                parts_stem = stem.split('_')
                if len(parts_stem) > 2 and parts_stem[0] == 'dir':
                    prefix = '_'.join(parts_stem[:3])
                    if f.lower().startswith(prefix.lower()):
                        return os.path.relpath(os.path.join(root, f), base_images_dir).replace('\\', '/')
                        
    return ref_path

def copy_images(src_dir, dest_dir):
    print(f"Copying images from {src_dir} to {dest_dir}...")
    if not os.path.exists(src_dir):
        print(f"Source uploads images directory not found at {src_dir}")
        return
        
    os.makedirs(dest_dir, exist_ok=True)
    
    for item in os.listdir(src_dir):
        s = os.path.join(src_dir, item)
        d = os.path.join(dest_dir, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
            print(f" Copied folder: {item}")
        else:
            shutil.copy2(s, d)
            print(f" Copied file: {item}")

def import_all_papers(json_dir, images_dir, mongo_uri, db_name="kr_academy"):
    if not os.path.exists(json_dir):
        print(f"Error: JSON directory not found at {json_dir}")
        sys.exit(1)

    print("Connecting to MongoDB...")
    try:
        client = MongoClient(mongo_uri)
        db = client[db_name]
        questions_col = db["questions"]
        print("Clearing questions collection for a clean import...")
        questions_col.delete_many({})
        
        # Drop existing indexes to prevent IndexKeySpecsConflict
        try:
            questions_col.drop_index("unique_id_1")
        except Exception:
            pass
        try:
            questions_col.drop_index("content_hash_1")
        except Exception:
            pass
            
        questions_col.create_index("unique_id", unique=True)
        questions_col.create_index("content_hash")
    except Exception as e:
        print(f"Database connection error: {e}")
        sys.exit(1)

    all_json_files = []
    for root, dirs, files in os.walk(json_dir):
        for file in files:
            if file.endswith(".json"):
                all_json_files.append(os.path.join(root, file))

    print(f"Found {len(all_json_files)} JSON files to process.")

    total_success = 0
    total_duplicate = 0
    total_error = 0
    docs_to_insert = []

    for filepath in all_json_files:
        filename = os.path.basename(filepath)
        sub_type_val = map_filename_to_subtype(filename)
        print(f"\nProcessing {filename} -> mapped to subtype: '{sub_type_val}'")
        
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                questions_list = json.load(f)
            except Exception as e:
                print(f"  Error parsing {filename}: {e}")
                total_error += 1
                continue

        if not isinstance(questions_list, list):
            print(f"  Skipping {filename}: Root is not a list")
            total_error += 1
            continue

        # Apply LaTeX conversions and save back to disk
        modified = False
        for q in questions_list:
            # Check question
            old_q = q.get("question", "") or ""
            new_q = to_latex(old_q)
            if old_q != new_q:
                q["question"] = new_q
                modified = True
                
            # Check explanation
            old_exp = q.get("explanation", "") or ""
            new_exp = to_latex(old_exp)
            if old_exp != new_exp:
                q["explanation"] = new_exp
                modified = True
                
            # Check options
            options = q.get("options", [])
            for opt in options:
                if isinstance(opt, dict):
                    old_text = opt.get("text", "") or ""
                    new_text = to_latex(old_text)
                    if old_text != new_text:
                        opt["text"] = new_text
                        modified = True

        if modified:
            try:
                with open(filepath, "w", encoding="utf-8") as fw:
                    json.dump(questions_list, fw, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"  Warning: failed to write updated JSON back to disk: {e}")

        for idx, q in enumerate(questions_list):
            try:
                q_id = q.get("id")
                exam = q.get("exam", "General")
                year = q.get("year", 2025)
                original_subject = q.get("subject")
                subject = get_standardized_subject(exam, sub_type_val, q_id, original_subject)
                question_text = q.get("question", "") or ""
                direction = q.get("direction", "") or ""
                question_image_ref = q.get("questionImage", "") or ""
                correct_ans = q.get("correctAnswer") or q.get("correct_answer")
                options = q.get("options", [])

                has_question_content = bool(str(question_text).strip() or str(direction).strip() or str(question_image_ref).strip())

                # Validation checks
                if not q_id or not subject or not has_question_content or not correct_ans or len(options) < 2:
                    print(f"  Skipping Q index {idx}: Missing critical fields (id: {q_id}, subject: {subject}, has_content: {has_question_content}, correct_ans: {correct_ans}, options: {len(options)})")
                    total_error += 1
                    continue

                # Prepend direction (passage) to question text to display it on screen
                full_question_text = str(question_text).strip()
                direction_str = str(direction).strip()
                if direction_str:
                    if full_question_text:
                        full_question_text = f"{direction_str}\n\n{full_question_text}"
                    else:
                        full_question_text = direction_str

                # Uniqueness enhancement: include sub_type (test name) to prevent collision
                clean_exam = "".join(c for c in str(exam) if c.isalnum()).upper()
                clean_subject = "".join(c for c in str(subject) if c.isalnum()).upper()
                clean_sub_type = "".join(c for c in str(sub_type_val) if c.isalnum()).upper()
                unique_id = f"{clean_exam}_{clean_sub_type}_{year}_{clean_subject}_Q{q_id}"

                # Option mapping and content hashing
                mapped_options = [opt.get("text", "") or "" for opt in options]
                raw_options = "".join([str(opt.get("text", "") or "") for opt in options])
                raw_content = (full_question_text or "") + raw_options
                content_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()[:16]

                # Correct option index mapping
                opt_letter = str(correct_ans).strip().upper()
                correct_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
                correct_idx = correct_map.get(opt_letter, 0)

                legacy_category = get_legacy_category(exam)
                cbt_exam_type = get_cbt_exam_type(legacy_category)

                # Smart image matching on disk
                resolved_question_image = find_actual_image_path(question_image_ref, images_dir)
                
                resolved_option_images = []
                for opt in options:
                    opt_image_ref = opt.get("image", "") or ""
                    resolved_opt_img = find_actual_image_path(opt_image_ref, images_dir)
                    resolved_option_images.append(resolved_opt_img)

                # Format Explanation Images to resolve correctly
                explanation = q.get("explanation", "") or ""
                def replace_md_image(match):
                    title = match.group(1)
                    img_path = match.group(2)
                    resolved = find_actual_image_path(img_path, images_dir)
                    return f"![{title}]({resolved})"
                
                explanation = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_md_image, explanation)

                doc = {
                    'unique_id': unique_id,
                    'content_hash': content_hash,
                    'display_question_number': q_id,
                    'course': exam,
                    'exam_type': cbt_exam_type,
                    'sub_type': sub_type_val,
                    'paper_name': sub_type_val,
                    'subject': subject,
                    'chapter': q.get('topic', ''),
                    'topic': q.get('topic', ''),
                    'difficulty': q.get('difficulty', 'Medium'),
                    'question_type': 'multiple_choice',
                    'question': full_question_text,
                    'options': mapped_options,
                    'correct_option': opt_letter,
                    'correct_answer': opt_letter,
                    'explanation': explanation,
                    'question_image': resolved_question_image,
                    'option_images': resolved_option_images,
                    'created_at': "2026-07-18 22:30:00",
                    'updated_at': "2026-07-18 22:30:00",
                    
                    # Legacy compatibility
                    'category': legacy_category,
                    'section': subject,
                    'q': full_question_text,
                    'correct': correct_idx,
                    'question_number': q_id,
                    'source_file': filename,
                    'correct_letter': opt_letter,
                    'status': 'ok',
                    'is_mock_eligible': True
                }

                docs_to_insert.append(doc)
                total_success += 1

            except Exception as e:
                print(f"  Error processing question index {idx} in {filename}: {e}")
                total_error += 1

    if docs_to_insert:
        print(f"Bulk inserting {len(docs_to_insert)} questions into MongoDB...")
        try:
            questions_col.insert_many(docs_to_insert, ordered=False)
        except Exception as e:
            print(f"Error during bulk insertion: {e}")

    print("\n=== OVERALL IMPORT SUMMARY ===")
    print(f"Total Processed JSON Files: {len(all_json_files)}")
    print(f"Total Successfully Imported: {total_success}")
    print(f"Total Overwritten Duplicates: {total_duplicate}")
    print(f"Total Errors / Skips:         {total_error}")
    print("==============================")

if __name__ == "__main__":
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    json_folder = os.path.join(workspace_root, "QuestionBank", "json")
    images_folder = os.path.join(workspace_root, "QuestionBank", "images")
    uploads_images_folder = os.path.join(workspace_root, "backend", "uploads", "images")
    
    # 1. Copy images from backend uploads folder to QuestionBank images folder
    copy_images(uploads_images_folder, images_folder)
    
    # Try to load MONGODB_URI from backend/.env
    mongo_uri = "mongodb://localhost:27017/kr_academy"
    env_file = os.path.join(workspace_root, "backend", ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    mongo_uri = line.split("=", 1)[1].strip()
                    break
    
    print(f"Using MongoDB URI: {mongo_uri[:35]}...")
    
    # 2. Run MongoDB Ingestion
    import_all_papers(
        json_dir=json_folder,
        images_dir=images_folder,
        mongo_uri=mongo_uri
    )
