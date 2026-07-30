import json
import re
import os

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

def clean_watermarks_from_text(t):
    if not t:
        return ""
    # Standardize spaces first
    t = re.sub(r'\s+', ' ', t).strip()
    
    # List of known PDF watermarks, headers, and footer lines to remove
    patterns = [
        r'IBPS Clerk Prelims Solved Paper[-–—]?\s*\d+',
        r'IBPS Clerk Prelims Previous Year Paper[-–—]?\s*\d+',
        r'IBPS Clerk Prelims Memory Based Paper.*',
        r'IBPS-Clerk-Pre-\d+.*',
        r'ibps-clerk-5-october-english-question-paper',
        r'ibps-clerk-question-paper-\d+',
        r'Adda247 \| No\.\s*1\s*APP.*',
        r'Website:\s*\S+',
        r'Email:\s*\S+',
        r'store\.adda247\S*',
        r'bankersadda\S*',
        r'sscadda\S*',
        r'ENGLISH LANGUAGE',
        r'QUANTITATIVE APTITUDE',
        r'REASONING ABILITY',
        r'NUMERICAL ABILITY'
    ]
    for pat in patterns:
        t = re.sub(pat, '', t, flags=re.IGNORECASE).strip()
        
    # Remove trailing page numbers (e.g. " 7 " or " 8 ")
    t = re.sub(r'\s+\d+\s*$', '', t).strip()
    # Remove duplicate spaces again
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def cleanup_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    extracted_directions = [] # list of {start, end, text}
    
    # First pass: clean watermarks and extract misplaced directions from options
    for q in data:
        # Clean question text
        q["question"] = clean_watermarks_from_text(q["question"])
        q["q"] = q["question"]
        
        # Check options for misplaced directions
        for opt in q["options"]:
            opt_text = opt["text"]
            # Look for Directions (X-Y) inside option text
            match = re.search(r'(Directions?\s*\(\s*(?:Q\s*s?\.?\s*)?(\d+)\s*[-–—]\s*(?:Q\s*s?\.?\s*)?(\d+)\s*\)[:\s.]*(.*))', opt_text, re.IGNORECASE)
            if match:
                full_dir_block = match.group(1)
                start_q = int(match.group(2))
                end_q = int(match.group(3))
                dir_content = match.group(4).strip()
                
                # Extract direction text
                extracted_directions.append({
                    "start": start_q,
                    "end": end_q,
                    "text": clean_watermarks_from_text(dir_content)
                })
                
                # Clean option text by removing the direction block
                opt["text"] = opt_text[:match.start()].strip()
                
            # Strip watermarks from the option text
            opt["text"] = clean_watermarks_from_text(opt["text"])
            
        # Clean explanation
        q["explanation"] = clean_watermarks_from_text(q["explanation"])
        # Clean direction
        q["direction"] = clean_watermarks_from_text(q["direction"])
        
    # Second pass: assign extracted directions to target range (nested directions override general)
    assigned_count = 0
    for dr in extracted_directions:
        for q in data:
            if dr["start"] <= q["id"] <= dr["end"]:
                q["direction"] = dr["text"]
                assigned_count += 1
                    
    # Third pass: expand bare questions using direction context
    expanded_count = 0
    for q in data:
        q_text = q["question"]
        # If question is just a single word (all-caps or 1-2 words)
        if len(q_text.split()) <= 3 and q_text.isupper() and q["direction"]:
            dir_text = q["direction"].strip()
            if dir_text.endswith("."):
                dir_text = dir_text[:-1]
            # Replace question text with meaningful sentence
            new_q = f"{dir_text} of the word '{q_text}':"
            q["question"] = new_q
            q["q"] = new_q
            expanded_count += 1
            
    # Save back
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    return len(extracted_directions), assigned_count, expanded_count

def run():
    print("=== Cleaning up all 10 JSON Mock files on disk ===")
    for i in range(1, 11):
        file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{i}.json")
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        dirs_found, dirs_assigned, expanded = cleanup_json_file(file_path)
        print(f"Test {i}: Extracted {dirs_found} directions from options, assigned {dirs_assigned} to missing questions, expanded {expanded} bare questions.")

    print("\n=== Cleanup Complete! ===")

if __name__ == "__main__":
    run()
