import os
import json
import re

def clean_option_prefix(text, index):
    if not text:
        return ""
    text_str = str(text).strip()
    
    label_char = chr(65 + index) # 'A', 'B', etc.
    patterns = [
        r'^\(' + label_char + r'\)\s*',
        r'^\(' + label_char.lower() + r'\)\s*',
        r'^\[?' + label_char + r'\]\s*',
        r'^\[?' + label_char.lower() + r'\]\s*',
        r'^Option\s+' + label_char + r'\b\s*[\.\:\-\s]*\s*',
        r'^Option\s+' + label_char.lower() + r'\b\s*[\.\:\-\s]*\s*',
        r'^' + label_char + r'\s*[\.\)\]\-]\s*',
        r'^' + label_char.lower() + r'\s*[\.\)\]\-]\s*',
        r'^' + label_char + r'\s+',
        r'^' + label_char.lower() + r'\s+',
    ]
    for pattern in patterns:
        cleaned = re.sub(pattern, '', text_str)
        if cleaned != text_str:
            return cleaned.strip()
    return text_str

def parse_option_leaks(opt_text):
    lines = str(opt_text).splitlines()
    statement_lines = []
    choices = {}
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Match labels like "(a) Only B" or "(e) None of these" or "a) B-D"
        match = re.match(r'^\s*[\(\[]?([a-eA-E])[\)\]\.\s]\s*(.*)$', line_stripped)
        if match:
            label = match.group(1).upper() # 'A', 'B', 'C', 'D', 'E'
            choice_text = match.group(2).strip()
            choices[label] = choice_text
        else:
            statement_lines.append(line)
            
    statement = "\n".join(statement_lines).strip()
    return statement, choices

def fix_all_papers(dry_run=True):
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk")
    
    modified_files_count = 0
    fixed_questions_count = 0
    
    for file in sorted(os.listdir(json_dir)):
        if not file.endswith(".json"):
            continue
        filepath = os.path.join(json_dir, file)
        
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error parsing {file}: {e}")
                continue
                
        file_modified = False
        print(f"\nScanning {file}...")
        
        for q in data:
            qid = q.get("id")
            question_text = q.get("question", "") or ""
            options = q.get("options", [])
            
            # --- 1. Strip leaked next question numbers ---
            if options:
                last_opt = options[-1]
                last_text = last_opt.get("text", "") if isinstance(last_opt, dict) else last_opt
                last_text = str(last_text)
                
                # Match trailing newlines followed by a number
                match = re.search(r'[\r\n]+\s*(\d+)\s*$', last_text)
                if match:
                    num = int(match.group(1))
                    if num < 100:
                        cleaned_last = last_text[:match.start()].strip()
                        if isinstance(last_opt, dict):
                            last_opt["text"] = cleaned_last
                        else:
                            options[-1] = cleaned_last
                        file_modified = True
                        print(f"  Q#{qid}: Stripped trailing leaked question number '{num}' from last option.")
            
            # --- 2. Fix leaked choices lists ---
            leak_idx = -1
            parsed_statement = ""
            parsed_choices = {}
            
            for opt_idx, opt in enumerate(options):
                opt_text = opt.get("text", "") if isinstance(opt, dict) else opt
                opt_text = str(opt_text)
                
                # If option text contains at least two choice labels (e.g. (a) and (b))
                if len(re.findall(r'\([a-e]\)', opt_text.lower())) >= 2 or len(re.findall(r'\b[a-e]\b\s*[\)\.]', opt_text.lower())) >= 3:
                    leak_idx = opt_idx
                    parsed_statement, parsed_choices = parse_option_leaks(opt_text)
                    break
                    
            if leak_idx != -1 and len(parsed_choices) >= 3:
                # We have a confirmed leaked list! Reconstruct the question.
                print(f"  Q#{qid}: Found leaked list in Option {chr(65+leak_idx)}")
                
                # Construct new question text containing all statement segments
                segments = []
                for idx in range(leak_idx):
                    opt_val = options[idx].get("text", "") if isinstance(options[idx], dict) else options[idx]
                    segments.append(f"({chr(65+idx)}) {str(opt_val).strip()}")
                if parsed_statement:
                    segments.append(f"({chr(65+leak_idx)}) {parsed_statement}")
                    
                # Only prepend/append segments if they actually contain statements
                if segments:
                    new_q_suffix = "\n" + "\n".join(segments)
                    if new_q_suffix not in question_text:
                        question_text = question_text.strip() + "\n" + "\n".join(segments)
                        q["question"] = question_text
                        
                # Create the clean options array
                new_options = []
                # Map A, B, C from parsed_choices, and D, E from original options if not in choices
                for idx in range(5):
                    char = chr(65 + idx) # 'A', 'B', 'C', 'D', 'E'
                    choice_text = parsed_choices.get(char)
                    
                    if not choice_text:
                        # Fallback to the original options at this index if they exist and are not the leaked one
                        if idx < len(options) and idx != leak_idx:
                            orig_opt = options[idx]
                            choice_text = orig_opt.get("text", "") if isinstance(orig_opt, dict) else orig_opt
                            
                    if choice_text:
                        # Strip label char prefix if present (e.g. "a) BDCA" -> "BDCA")
                        choice_text = clean_option_prefix(choice_text, idx)
                        new_options.append({
                            "id": char,
                            "text": choice_text,
                            "image": None
                        })
                        
                q["options"] = new_options
                file_modified = True
                fixed_questions_count += 1
                print(f"    New Question Text: {repr(question_text[:120])}...")
                print(f"    New Options: {[o['text'] for o in new_options]}")
                
            # --- 3. Clean remaining simple options text ---
            # Make sure we clean standard prefixes like (a), (b) from all standard options
            for opt_idx, opt in enumerate(q.get("options", [])):
                if isinstance(opt, dict):
                    opt_text = opt.get("text", "") or ""
                    cleaned = clean_option_prefix(opt_text, opt_idx)
                    if cleaned != opt_text:
                        opt["text"] = cleaned
                        file_modified = True
                        
        if file_modified:
            modified_files_count += 1
            if not dry_run:
                with open(filepath, "w", encoding="utf-8") as fw:
                    json.dump(data, fw, indent=2, ensure_ascii=False)
                print(f"  [SAVED] Modified {file} saved successfully.")
            else:
                print(f"  [DRY RUN] Would save modifications to {file}.")
                
    print(f"\nCleanup complete!")
    print(f"Total modified files: {modified_files_count}")
    print(f"Total fixed questions: {fixed_questions_count}")

if __name__ == "__main__":
    # Run in WRITE mode to apply the fixes
    fix_all_papers(dry_run=False)
