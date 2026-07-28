import json
import os
import glob

exam_parser_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\exam_parser\output_json"
all_json_files = glob.glob(os.path.join(exam_parser_dir, "*.json"))

print(f"Total JSON files in exam_parser\\output_json: {len(all_json_files)}")

bad_files = []

for fpath in sorted(all_json_files):
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error loading {fname}: {e}")
            continue

    questions = data.get('questions', []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
    
    empty_opts = 0
    placeholder_opts = 0
    total_opts = 0
    
    for q_idx, q in enumerate(questions):
        if not isinstance(q, dict): continue
        opts = q.get('options', [])
        for opt in opts:
            if not isinstance(opt, dict): continue
            total_opts += 1
            txt = opt.get('text', '')
            if txt == '' or txt is None:
                empty_opts += 1
            elif '[Option' in txt:
                placeholder_opts += 1
                
    if empty_opts > 0 or placeholder_opts > 0:
        bad_files.append((fname, len(questions), empty_opts, placeholder_opts, total_opts))
        print(f"BAD: {fname} | Qs: {len(questions)} | Empty opts: {empty_opts} | Placeholder opts: {placeholder_opts} | Total opts: {total_opts}")

print(f"\nFound {len(bad_files)} files with bad options in exam_parser\\output_json.")
