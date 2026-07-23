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
    
    if "rrb_po" in filename or "rrb_clerk" in filename or "ssc_gd" in filename or "sc_gd" in filename:
        expected_count = 80
    elif "cbt2" in filename or "cbt_2" in filename:
        expected_count = 120
    elif "ssc_cgl_mains" in filename:
        expected_count = 150 # approx or custom
        
    if "ssc_cgl_mains" not in filename and total_qs != expected_count:
        errors.append(f"Expected {expected_count} questions, but found {total_qs}.")
        
    # 2. Section Count Verification
    section_counts = {}
    for idx, q in enumerate(data):
        subj = q.get("subject") or q.get("section") or ""
        if subj:
            section_counts[subj] = section_counts.get(subj, 0) + 1
            
    expected_sec_size = 25
    if "rrb_po" in filename or "rrb_clerk" in filename:
        expected_sec_size = 40
    elif "sc_gd" in filename or "ssc_gd" in filename:
        expected_sec_size = 20
        
    if "ssc_cgl_mains" not in filename:
        for sec, count in section_counts.items():
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
        empty_opts = []
        for opt in options:
            o_text = str(opt.get("text") or "").strip()
            o_img = opt.get("image") or ""
            # Option is invalid if it has no text and no image
            if not o_text and not o_img:
                empty_opts.append(opt.get("id"))
        if empty_opts:
            errors.append(f"Q{q_num}: Option(s) {empty_opts} have no text and no image.")
            
        # Check correct answer mapping
        valid_ids = [str(opt.get("id")).upper() for opt in options if opt.get("id")]
        if str(correct_ans).upper() not in valid_ids:
            errors.append(f"Q{q_num}: Correct answer '{correct_ans}' is not a valid option ID: {valid_ids}.")
            
        # Check missing explanation
        if not explanation or len(explanation.strip()) < 10:
            errors.append(f"Q{q_num}: Explanation is missing or too short.")
            
        # Check LaTeX delimiters
        if q_text.count("$") % 2 != 0:
            print(f"Warning [Q{q_num}]: Question text contains unclosed LaTeX '$' delimiters.")
        if explanation.count("$") % 2 != 0:
            print(f"Warning [Q{q_num}]: Explanation text contains unclosed LaTeX '$' delimiters.")
            
    return errors

def main():
    folders_to_scan = [
        "QuestionBank/json/ssc_cgl_prelims"
    ]
    
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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
