import os
import json
import sys
import re

def validate_file(filepath):
    errors = []
    
    if not os.path.exists(filepath):
        return [f"File not found: {filepath}"]
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return [f"Invalid JSON format: {e}"]
        
    filename = os.path.basename(filepath).lower()
    
    # 1. Total Count Verification
    total_qs = len(data)
    expected_count = 100
    
    if "rrb_po" in filename or "rrb_clerk" in filename:
        expected_count = 80
    elif "ssc_gd" in filename or "sc_gd" in filename:
        expected_count = 80 if total_qs == 80 else 100
    elif "cbt2" in filename or "cbt_2" in filename:
        expected_count = 120
    elif "ssc_cgl_mains" in filename:
        expected_count = 150 # approx or custom
        
    if "ssc_cgl_mains" not in filename and total_qs != expected_count:
        errors.append(f"Expected {expected_count} questions, but found {total_qs}.")
        
    # 2. Section Count Verification and Normalization
    section_counts = {}
    for idx, q in enumerate(data):
        subj = q.get("subject") or q.get("section") or ""
        subj_clean = str(subj).strip()
        if subj_clean == "English" or subj_clean == "English Language":
            subj_norm = "English Language"
        elif subj_clean == "Mathematics" or subj_clean == "Quantitative Aptitude" or subj_clean == "Quant" or subj_clean == "Numerical Ability":
            subj_norm = "Quantitative Aptitude"
        elif subj_clean == "Reasoning" or subj_clean == "Reasoning Ability" or subj_clean == "General Intelligence":
            subj_norm = "Reasoning Ability"
        else:
            subj_norm = subj_clean
        
        if subj_norm:
            section_counts[subj_norm] = section_counts.get(subj_norm, 0) + 1
            
    if "ssc_cgl_mains" not in filename:
        if "ssc_chsl_tier2" in filename:
            expected_sec_counts = {
                "Quantitative Aptitude": 30,
                "Reasoning Ability": 30,
                "English Language": 40
            }
            for sec, count in section_counts.items():
                exp = expected_sec_counts.get(sec, 0)
                if count != exp:
                    errors.append(f"Section '{sec}' has {count} questions (expected {exp}).")
        elif "sbi_" in filename or "ibps_" in filename or "ibpspo" in filename:
            expected_sec_counts = {
                "English Language": 30,
                "Quantitative Aptitude": 35,
                "Reasoning Ability": 35
            }
            for sec, count in section_counts.items():
                exp = expected_sec_counts.get(sec, 0)
                if count != exp:
                    errors.append(f"Section '{sec}' has {count} questions (expected {exp}).")
        else:
            expected_sec_size = 25
            if "rrb_po" in filename or "rrb_clerk" in filename:
                expected_sec_size = 40
            elif "sc_gd" in filename or "ssc_gd" in filename:
                expected_sec_size = 20 if total_qs == 80 else 25
                
            for sec, count in section_counts.items():
                if "sc_gd" in filename or "ssc_gd" in filename:
                    if count not in [20, 25, 40]:
                        errors.append(f"Section '{sec}' has {count} questions (expected 20, 25, or 40).")
                else:
                    if count != expected_sec_size:
                        errors.append(f"Section '{sec}' has {count} questions (expected {expected_sec_size}).")

    # 3. Question-level validation
    for idx, q in enumerate(data):
        q_num = q.get("id") or (idx + 1)
        q_text = q.get("question") or q.get("q") or ""
        options = q.get("options") or []
        correct_ans = q.get("correctAnswer") or q.get("correct_answer") or ""
        explanation = q.get("explanation") or ""
        
        # Check empty options
        if not options or len(options) < 2 or len(options) > 5:
            errors.append(f"Q{q_num}: Invalid number of options ({len(options)}).")
            
        empty_opts = []
        opt_ids = []
        opt_texts = []
        for opt in options:
            o_id = str(opt.get("id") or "").strip().upper()
            o_text = str(opt.get("text") or "").strip()
            o_img = opt.get("image") or ""
            if o_id:
                opt_ids.append(o_id)
            if o_text:
                opt_texts.append(o_text)
            # Option is invalid if it has no text and no image
            if not o_text and not o_img:
                empty_opts.append(opt.get("id") or "unknown")
                
        if empty_opts:
            errors.append(f"Q{q_num}: Option(s) {empty_opts} have no text and no image.")
            
        # Check duplicate option IDs or texts
        if len(opt_ids) != len(set(opt_ids)):
            errors.append(f"Q{q_num}: Duplicate option IDs found: {opt_ids}")
        if len(opt_texts) != len(set(opt_texts)):
            print(f"Warning [Q{q_num}]: Duplicate option texts found (will be standardized by seeder): {opt_texts}")
            
        # Check correct answer mapping
        valid_ids = [str(opt.get("id")).upper() for opt in options if opt.get("id")]
        if not correct_ans:
            errors.append(f"Q{q_num}: Missing correct answer.")
        elif str(correct_ans).upper() not in valid_ids:
            errors.append(f"Q{q_num}: Correct answer '{correct_ans}' is not a valid option ID: {valid_ids}.")
            
        # Check missing explanation
        if not explanation or len(explanation.strip()) < 10:
            errors.append(f"Q{q_num}: Explanation is missing or too short (length: {len(explanation.strip()) if explanation else 0}).")
            
        # Check LaTeX delimiters and format issues
        unescaped_q_dollars = len(re.findall(r'(?<!\\)\$', q_text))
        unescaped_exp_dollars = len(re.findall(r'(?<!\\)\$', explanation))
        if unescaped_q_dollars % 2 != 0:
            print(f"Warning [Q{q_num}]: Question text contains unclosed LaTeX '$' delimiters (will be auto-closed by seeder).")
        if unescaped_exp_dollars % 2 != 0:
            print(f"Warning [Q{q_num}]: Explanation text contains unclosed LaTeX '$' delimiters (will be auto-closed by seeder).")
            
        # Check for unformatted sqrt issues
        for field, val in [("question", q_text), ("explanation", explanation)]:
            if val:
                bad_sqrts = re.findall(r'\bsqrt\d+|\bsqrt\?|(?<!\\)sqrt{', str(val))
                if bad_sqrts:
                    print(f"Warning [Q{q_num}]: Field '{field}' contains unformatted square root (will be auto-formatted by seeder): {bad_sqrts}")
                    
    return errors

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    folders_to_scan = []
    json_root = os.path.join(base_dir, "QuestionBank", "json")
    if os.path.exists(json_root):
        for name in os.listdir(json_root):
            if os.path.isdir(os.path.join(json_root, name)):
                folders_to_scan.append(f"QuestionBank/json/{name}")
    
    all_errors = {}
    
    for f_rel in folders_to_scan:
        f_dir = os.path.join(base_dir, f_rel)
        if not os.path.exists(f_dir):
            continue
            
        for root, dirs, files in os.walk(f_dir):
            for file in files:
                if file.endswith(".json"):
                    filepath = os.path.join(root, file)
                    errors = validate_file(filepath)
                    if errors:
                        all_errors[os.path.relpath(filepath, base_dir)] = errors
                        
    if all_errors:
        print("\n=== VALIDATION FAILED ===")
        for file, errs in all_errors.items():
            print(f"\nFile: {file}")
            for e in errs[:10]:
                print(f"  - {e}")
            if len(errs) > 10:
                print(f"  ... and {len(errs) - 10} more errors.")
        print("\nDeployment aborted due to validation errors.")
        sys.exit(1)
    else:
        print("\n=== VALIDATION PASSED ===")
        print("All JSON question banks are clean and ready for deployment.")
        sys.exit(0)

if __name__ == "__main__":
    main()
