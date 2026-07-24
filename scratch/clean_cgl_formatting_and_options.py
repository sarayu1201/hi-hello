import os
import json
import re
from pymongo import MongoClient

def clean_segment(s):
    s = s.strip()
    s = re.sub(r'^[\s/\-.,;:]+', '', s)
    s = re.sub(r'[\s/\-.,;:]+$', '', s)
    return s.strip()

def parse_question_data(question_text):
    # Find positions of (A), (B), (C), (D) or (a), (b), (c), (d)
    pos_a = re.search(r'\(\s*[Aa]\s*\)?', question_text)
    pos_b = re.search(r'\(\s*[Bb]\s*\)?', question_text)
    pos_c = re.search(r'\(\s*[Cc]\s*\)?', question_text)
    pos_d = re.search(r'\(\s*[Dd]\s*\)?', question_text)
    
    if not (pos_a and pos_b and pos_c and pos_d):
        return None
        
    idx_a = pos_a.start()
    idx_b = pos_b.start()
    idx_c = pos_c.start()
    idx_d = pos_d.start()
    
    part_before_a = question_text[:idx_a]
    part_a_b = question_text[pos_a.end():idx_b]
    part_b_c = question_text[pos_b.end():idx_c]
    part_c_d = question_text[pos_c.end():idx_d]
    part_after_d = question_text[pos_d.end():]
    
    is_label_before = False
    
    last_punc = -1
    for i in range(len(part_before_a) - 1, -1, -1):
        if part_before_a[i] in ['.', ':', '?', '!']:
            last_punc = i
            break
            
    if last_punc != -1:
        clean_instr = part_before_a[:last_punc + 1].strip()
        sentence_start = part_before_a[last_punc + 1:].strip()
    else:
        clean_instr = ""
        sentence_start = part_before_a.strip()
        
    if not clean_segment(sentence_start):
        is_label_before = True
        
    if is_label_before:
        # Case 2: (A) OptA (B) OptB (C) OptC (D) OptD
        opt_a = clean_segment(part_a_b)
        opt_b = clean_segment(part_b_c)
        opt_c = clean_segment(part_c_d)
        opt_d = clean_segment(part_after_d)
        new_q = clean_instr if clean_instr else "Identify the correct option."
    else:
        # Case 1: OptA (A) / OptB (B) / OptC (C) / OptD (D)
        opt_a = clean_segment(sentence_start)
        opt_b = clean_segment(part_a_b)
        opt_c = clean_segment(part_b_c)
        opt_d = clean_segment(part_c_d)
        
        opt_d_clean = re.sub(r'\.+$', '', opt_d).strip()
        clean_sentence = f"{opt_a} / {opt_b} / {opt_c} / {opt_d_clean}"
        
        if "no error" in clean_instr.lower() or "free from error" in clean_instr.lower():
            instr_part = "Identify the part of the sentence that contains an error. If the sentence is free from error, choose 'No Error'."
        else:
            instr_part = "Identify the part of the sentence that contains an error."
        new_q = f"{instr_part}\n\n{clean_sentence}"
        
    return {
        "question": new_q,
        "options": [
            {"id": "A", "text": opt_a},
            {"id": "B", "text": opt_b},
            {"id": "C", "text": opt_c},
            {"id": "D", "text": opt_d}
        ]
    }

def clean_ocr_spaces(text):
    if not isinstance(text, str):
        return text
    
    replacements = {
        r'\bh\s+is\b': 'his',
        r'\bh\s+im\b': 'him',
        r'\bh\s+er\b': 'her',
        r'\bt\s+he\b': 'the',
        r'\bt\s+he\s+y\b': 'they',
        r'\bthe\s+y\b': 'they',
        r'\bt\s+hey\b': 'they',
        r'\bt\s+hem\b': 'them',
        r'\bt\s+heir\b': 'their',
        r'\bl\s+and\b': 'land',
        r'\bh\s+ence\b': 'hence',
        r'\bdo\s+the\s+y\b': 'do they',
        r'\bdon\'t\s+the\s+y\b': "don't they",
        r'\bdidn\'t\s+the\s+y\b': "didn't they",
        r'\bare\s+the\s+y\b': 'are they',
        r'\bwere\s+the\s+y\b': 'were they',
        r'\bwas\s+the\s+y\b': 'was they',
        r'\bcan\s+the\s+y\b': 'can they',
        r'\bcould\s+the\s+y\b': 'could they',
        r'\bshould\s+the\s+y\b': 'should they',
        r'\bwould\s+the\s+y\b': 'would they',
        r'\bwill\s+the\s+y\b': 'will they',
        r'\bha\s+ve\b': 'have',
        r'\breache\s+d\b': 'reached',
        r'\bspic\s+e\b': 'spice',
        r'\bha\s+rm\b': 'harm',
        r'\bcro\s+ps\b': 'crops',
        r'\babsen\s+ted\b': 'absented',
        r'\bsel\s+ect\b': 'select',
        r'\balterna\s+tives\b': 'alternatives',
        r'\bpossib\s+le\b': 'possible',
        r'\bhealt\s+h\b': 'health',
        r'\bco\s+ward\b': 'coward',
        r'\bpi\s+pe\b': 'pipe',
        r'\bpipeli\s+ne\b': 'pipeline',
        r'\bAlas\s+ka\b': 'Alaska',
        r'\bconstruc\s+tion\b': 'construction',
        r'\bcompani\s+es\b': 'companies',
        r'\bdaili\s+es\b': 'dailies',
        r'\bcircula\s+tion\b': 'circulation',
        r'\bprecede\s+nt\b': 'precedent',
        r'\bpreceden\s+t\b': 'precedent',
        r'\bsuppo\s+rt\b': 'support',
        r'\bpreposit\s+ion\b': 'preposition',
        r'\bdiscuss\s+ing\b': 'discussing',
        r'\blabour\s+ers\b': 'labourers',
        r'\boppone\s+nt\b': 'opponent',
        r'\boppone\s+nts\b': 'opponents',
        r'\bkilomet\s+res\b': 'kilometres',
        r'\bseizu\s+re\b': 'seizure',
        r'\bcocai\s+ne\b': 'cocaine',
        r'\bsubstant\s+ial\b': 'substantial',
        r'\bsuffe\s+ring\b': 'suffering',
        r'\bconceivab\s+le\b': 'conceivable',
        r'\bnationali\s+ty\b': 'nationality',
        r'\bnationalit\s+ies\b': 'nationalities',
        r'\bconsecut\s+ive\b': 'consecutive',
        r'\bdeafne\s+ss\b': 'deafness',
        r'\bdecisi\s+on\b': 'decision',
        r'\bdecisi\s+ons\b': 'decisions',
        r'\bte\s+st\b': 'test',
        r'\bmoc\s+ks\b': 'mocks',
        r'\bque\s+stion\b': 'question',
        r'\bque\s+stions\b': 'questions',
        r'\bexplana\s+tion\b': 'explanation',
        r'\bexplana\s+tions\b': 'explanations',
        r'\bopti\s+on\b': 'option',
        r'\bopti\s+ons\b': 'options',
        r'\bcorrec\s+t\b': 'correct',
        r'\bansw\s+er\b': 'answer',
        r'\bansw\s+ers\b': 'answers'
    }
    
    res = text
    for pattern, rep in replacements.items():
        # Clean case matches
        res = re.sub(pattern, rep, res)
        res = re.sub(pattern.title(), rep.title(), res)
        res = re.sub(pattern.upper(), rep.upper(), res)
        
    res = re.sub(r' +', ' ', res)
    return res

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    env_path = os.path.join(root_dir, "backend", ".env")
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                mongo_uri = line.split("MONGODB_URI=")[1].strip()
                break
                
    match = re.match(r'mongodb\+srv://([^:]+):([^@]+)@cluster0\.l1t116x\.mongodb.net/([^?]+)\?(.*)', mongo_uri)
    user = match.group(1)
    password = match.group(2)
    dbname = match.group(3)
    params = match.group(4)
    
    nodes = [
        "ac-sdbi3ps-shard-00-00.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-01.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-02.l1t116x.mongodb.net:27017"
    ]
    nodes_str = ",".join(nodes)
    direct_uri = f"mongodb://{user}:{password}@{nodes_str}/{dbname}?ssl=true&authSource=admin&{params}"
    
    client = MongoClient(direct_uri)
    db = client[dbname]
    questions_col = db["questions"]
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    pattern_marks = r'\(A\).*?\(B\).*?\(C\).*?\(D\)?'
    
    for filename in files:
        filepath = os.path.join(cgl_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f"\nCleaning and formatting {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        updated_count = 0
        for q in data:
            q_id = q.get("id")
            original_q = q.get("question", "")
            
            # Step 1: Check if it contains (A)...(D) pattern and needs segment parsing
            has_parsed_updates = False
            parsed_data = None
            if re.search(pattern_marks, original_q, re.IGNORECASE):
                parsed_data = parse_question_data(original_q)
                if parsed_data:
                    q["question"] = parsed_data["question"]
                    q["q"] = parsed_data["question"]
                    q["options"] = parsed_data["options"]
                    has_parsed_updates = True
            
            # Step 2: Clean spacing & OCR issues in question, q, options, explanation
            q["question"] = clean_ocr_spaces(q.get("question", ""))
            q["q"] = clean_ocr_spaces(q.get("q", ""))
            
            options_list = q.get("options", [])
            new_options = []
            for opt in options_list:
                if isinstance(opt, dict):
                    opt["text"] = clean_ocr_spaces(opt.get("text", ""))
                    new_options.append(opt)
                else:
                    new_options.append(clean_ocr_spaces(str(opt)))
            q["options"] = new_options
            
            q["explanation"] = clean_ocr_spaces(q.get("explanation", ""))
            
            # Synchronize to Database
            db_opts = []
            for o in q["options"]:
                if isinstance(o, dict):
                    db_opts.append(o)
                else:
                    db_opts.append({"id": "A", "text": o}) # fallback
            
            questions_col.update_many(
                {"source_file": filename, "question_number": q_id},
                {"$set": {
                    "question": q["question"],
                    "q": q["q"],
                    "options": db_opts,
                    "raw_options": db_opts,
                    "explanation": q["explanation"],
                    "raw_explanation": q["explanation"]
                }}
            )
            updated_count += 1
            
        # Save back the local JSON file
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"  Successfully standardized all {updated_count} questions locally and in DB.")

if __name__ == "__main__":
    run()
