import os
import re
import json

workspace_root = r"c:\Users\veera\Downloads\hi-hello-main\hi-hello-main"
json_base = os.path.join(workspace_root, "QuestionBank", "json")
images_base = os.path.join(workspace_root, "QuestionBank", "images")
uploads_base = os.path.join(workspace_root, "backend", "uploads", "images")

print("Initializing Image Healer Script...")

# Collect all image files recursively from images_base and uploads_base
# We want their relative path to images_base (or uploads_base) using forward slashes.
def collect_image_files():
    images = {} # rel_path_normalized: (filename, actual_rel_path, source)
    
    # Scan QuestionBank/images
    if os.path.exists(images_base):
        for root, dirs, files in os.walk(images_base):
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, images_base).replace('\\', '/')
                    images[rel_path.lower()] = (f, rel_path, "qb")
                    
    # Scan backend/uploads/images (in case some are only there)
    if os.path.exists(uploads_base):
        for root, dirs, files in os.walk(uploads_base):
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, uploads_base).replace('\\', '/')
                    if rel_path.lower() not in images:
                        images[rel_path.lower()] = (f, rel_path, "uploads")
                        
    return list(images.values())

image_files = collect_image_files()
print(f"Collected {len(image_files)} unique image files from disk.")

# Map filename patterns to paper info
# E.g. "ibps_po_prelims-test_1-q_31_35.png" -> test/paper: 1, questions: 31-35
# E.g. "rrb_clerk_paper10_q41-45.png" -> test/paper: 10, questions: 41-45
# E.g. "sbi_clerk-test_1-dir_41_45_diagram.png" -> test/paper: 1, questions: 41-45
# E.g. "ssc_gd_cbt_paper1_q10.png" -> test/paper: 1, questions: 10
# E.g. "rrb_gd_tier1_paper10_q34.png" -> test/paper: 10, questions: 34
# E.g. "ssc_chsl_tier1_paper9_q6.png" -> test/paper: 9, questions: 6
# E.g. "sbi_clerk-test_1-q_45_opt_E.png" -> test/paper: 1, question: 45, option: E
# E.g. "sbi_clerk-test_1-sol_q34_diagram_1.png" -> test/paper: 1, question: 34, solution: True

def parse_filename(filename):
    name = os.path.splitext(filename)[0].lower()
    
    # 1. Option indicator
    # Match: "option_a", "optiona", "opt_a", "opta", "opt-a", "_a" (at the end), "_optA", "_optionA"
    option_letter = None
    opt_match = re.search(r'(?:option|opt)[_-]?([a-e])(?![a-z])', name, re.IGNORECASE)
    if opt_match:
        option_letter = opt_match.group(1).upper()
        # Clean the matched option part so it doesn't interfere with question number matching
        name = name.replace(opt_match.group(0), "")
    else:
        # Check if it ends with _[a-e] (e.g. q18_a)
        opt_end_match = re.search(r'_([a-e])$', name, re.IGNORECASE)
        if opt_end_match:
            option_letter = opt_end_match.group(1).upper()
            name = name[:-2] # strip the _a from the name
            
    # 2. Solution/Explanation indicator
    is_solution = "sol" in name or "explanation" in name
    
    # 3. Test/Paper number
    test_match = re.search(r'(?:test|paper)_?(\d+)', name, re.IGNORECASE)
    test_num = int(test_match.group(1)) if test_match else None
    
    # 4. Question number or range
    # Match q_31_35 or q31-35 or q17to20 or dir_41_45 or q_45 or q45
    q_match = re.search(r'(?:q|dir)_?(\d+)(?:[-_to]+(\d+))?', name, re.IGNORECASE)
    q_start = int(q_match.group(1)) if q_match else None
    q_end = int(q_match.group(2)) if q_match and q_match.group(2) else q_start
    
    # Extra check if question number is not found but there is a number at the end
    if q_start is None:
        end_match = re.search(r'_(\d+)$', name)
        if end_match:
            q_start = int(end_match.group(1))
            q_end = q_start
            
    return {
        "test_num": test_num,
        "q_start": q_start,
        "q_end": q_end,
        "option": option_letter,
        "is_solution": is_solution
    }

# Normalize exam names to folder mappings
# We want to match an image's exam prefix to the correct JSON folder name
def get_possible_folders(filename):
    name = filename.lower()
    folders = []
    
    if "sbi_clerk" in name or "sbiclerk" in name:
        folders.append("sbi_clerk_prelims")
    elif "sbi_po" in name or "sbipo" in name:
        folders.append("sbi_po_prelims")
    elif "ibps_clerk" in name or "ibpsclerk" in name:
        folders.append("ibps_clerk_prelims")
    elif "ibps_po" in name or "ibpspo" in name:
        folders.append("ibps_po_prelims")
    elif "rrb_clerk" in name or "rrbclerk" in name:
        folders.append("rrb_clerk")
    elif "rrb_po" in name or "rrbpo" in name:
        folders.append("rrb_po")
    elif "ssc_chsl_tier1" in name or "ssc_chsl_teir1" in name:
        folders.append("ssc_chsl_tier1_papers")
    elif "ssc_chsl_tier2" in name:
        folders.append("ssc_chsl_tier2_papers")
    elif "ssc_cgl" in name or "sc_cgl" in name:
        folders.append("ssc_cgl_prelims")
    elif "ssc_gd" in name or "sc_gd" in name:
        folders.append("sc_gd")
    elif "rrb_gd" in name or "rrbgd" in name:
        folders.append("rrb_groupd")
    elif "rrb_ntpc" in name:
        # RRB NTPC has various subfolders or is RRB CBT
        folders.append("rrb_cbt_1")
        folders.append("rrb_cbt_2")
    elif "rrb" in name or "railway" in name:
        folders.append("rrb_clerk")
        folders.append("rrb_po")
        folders.append("rrb_groupd")
        
    return folders

# Map each image file to a set of matching JSON files and question IDs
matches_to_apply = {} # filepath -> list of updates

for filename, rel_path, source in image_files:
    # Skip temporary files
    if "temp_" in filename or "untitled" in filename.lower():
        continue
        
    info = parse_filename(filename)
    if info["test_num"] is None:
        # Try to extract test number from parent folder if it exists
        # E.g. parent folder "sbi clerk test 1" -> test_num = 1
        parent_folder = os.path.basename(os.path.dirname(rel_path))
        parent_match = re.search(r'(?:test|paper)_?(\d+)', parent_folder, re.IGNORECASE)
        if parent_match:
            info["test_num"] = int(parent_match.group(1))
        else:
            # Generic image file like q72.png or q23_a.png - default to Test 1 (Paper 1)
            info["test_num"] = 1
            
    if info["q_start"] is None:
        continue
            
    folders = get_possible_folders(rel_path)
    if not folders:
        continue
        
    for folder in folders:
        folder_path = os.path.join(json_base, folder)
        if not os.path.exists(folder_path):
            continue
            
        # Find JSON files in this folder that match the test/paper number
        # E.g. test_num = 1 matches "ssc_gd_tier1_test1.json" or "sbi_clerk_test_1.json" or "rrb_clerk_paper1.json"
        for f in os.listdir(folder_path):
            if f.endswith(".json"):
                f_name = f.lower()
                # Find number in the JSON filename
                num_match = re.search(r'(?:test|paper|paper_?|test_?)(\d+)\.json$', f_name, re.IGNORECASE)
                if not num_match:
                    # Alternative pattern: match any digits in filename
                    num_match = re.search(r'(\d+)\.json$', f_name)
                    
                if num_match and int(num_match.group(1)) == info["test_num"]:
                    json_path = os.path.join(folder_path, f)
                    if json_path not in matches_to_apply:
                        matches_to_apply[json_path] = []
                        
                    matches_to_apply[json_path].append({
                        "rel_path": rel_path,
                        "info": info
                    })

print(f"Identified image mapping candidates for {len(matches_to_apply)} JSON files.")

# Apply updates to JSON files
total_updated_questions = 0

for json_path, updates in matches_to_apply.items():
    if not os.path.exists(json_path):
        continue
        
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        questions = data.get("questions", []) if isinstance(data, dict) else data
        if not isinstance(questions, list):
            continue
            
        for q_idx, q in enumerate(questions):
            q_num = q.get("display_question_number") or q.get("question_number") or (q_idx + 1)
            try:
                q_num = int(q_num)
            except:
                continue
                
            # Clear incorrectly matched option images from question_image field
            q_img = q.get("question_image", "")
            if q_img:
                q_img_lower = q_img.lower()
                # If the question image ends with _a, _b, _c, _d, _e (with or without extension) or has opt
                if re.search(r'opt[_-]?([a-e])|_[a-e](\.(png|jpg|jpeg))?$', q_img_lower):
                    q["question_image"] = ""
                    modified = True
                    
            # Find any updates that apply to this question
            for up in updates:
                info = up["info"]
                rel_path = up["rel_path"]
                
                if info["q_start"] <= q_num <= info["q_end"]:
                    # Found match!
                    if info["option"]:
                        # Option Image
                        opt_idx = ord(info["option"]) - 65 # 0 for A, 1 for B...
                        
                        # 1. Update top-level option_images array
                        opt_imgs = q.get("option_images", [])
                        while len(opt_imgs) < len(q.get("options", [])):
                            opt_imgs.append("")
                        if opt_idx < len(opt_imgs) and opt_imgs[opt_idx] != rel_path:
                            opt_imgs[opt_idx] = rel_path
                            q["option_images"] = opt_imgs
                            modified = True
                            
                        # 2. Update options array of dicts
                        opts = q.get("options", [])
                        if opt_idx < len(opts):
                            opt_item = opts[opt_idx]
                            if isinstance(opt_item, dict):
                                if opt_item.get("image") != rel_path:
                                    opt_item["image"] = rel_path
                                    modified = True
                            else:
                                # Convert to dict if string
                                opts[opt_idx] = {"id": chr(65 + opt_idx), "text": str(opt_item), "image": rel_path}
                                modified = True
                                
                    elif info["is_solution"]:
                        # Explanation Image
                        exp = q.get("explanation", "")
                        if rel_path not in exp:
                            # Append image tag to explanation
                            q["explanation"] = exp + f"\n\n![Explanation Diagram]({rel_path})"
                            modified = True
                    else:
                        # Main Question Image
                        if q.get("question_image") != rel_path:
                            q["question_image"] = rel_path
                            modified = True
                            total_updated_questions += 1
                            
        if modified:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Successfully updated JSON file: {os.path.basename(json_path)}")
            
    except Exception as e:
        print(f"Error processing JSON file {os.path.basename(json_path)}: {e}")

print(f"\nHealer script executed successfully. Associated {total_updated_questions} question images.")
