import os
import json
import glob

exam_parser_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\exam_parser\output_json"
files = sorted(set(glob.glob(os.path.join(exam_parser_dir, "*SBI*.json")) + glob.glob(os.path.join(exam_parser_dir, "*sbi*.json"))))

print(f"Total SBI JSON files in exam_parser\\output_json: {len(files)}")
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    qs = data.get('questions', []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
    print(f"  {fname}: {len(qs)} questions")
