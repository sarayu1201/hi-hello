import json
import os
import re
import docx
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

orig_dir = r"C:\Users\Administrator\Downloads\question papers\json_output\sbi_po_prelims"
target_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"
docx_dir = r"C:\Users\Administrator\Downloads\sbi po prelims"

docx_files = [
    "SBI-PO-Pre-2022-19th-Dec-Shift-Wise-Previous-Year-Paper-Mock-5.docx",
    "SBI-PO-Pre-2022-20th-Dec-Shift-Wise-Previous-Year-Paper-Mock-6.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-16-Mar-2025-1st-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-24-Mar-2025-1st-shift-1.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-Mar-2025-1st-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-March-2025-3rd-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Paper-8-March-2025-4th-shift.docx",
    "SBI-PO-Pre-2024-25-Memory-Based-Question-Paper-8-Mar-2025-2nd-shift-1.docx",
    "SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift (1).docx",
    "SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift.docx"
]

def clean_corrupted_string(s):
    if not isinstance(s, str):
        return s
    # If string is corrupted like "'W'h'i'c'h'"
    if "' '" in s or (s.startswith("'") and s.endswith("'") and s.count("'") > 5):
        # strip quote wrapping per char
        tokens = re.findall(r"'([^']*)'", s)
        if tokens:
            return "".join(tokens)
        s = s.replace("'", "")
    return s.strip()

def format_latex_math(text):
    if not isinstance(text, str) or not text:
        return text
    
    # Don't touch if already has LaTeX math dollars or image tags
    if '$' in text or '![' in text or 'text not found' in text:
        return text
    
    # Simple mathematical conversions
    # Equations like x^2 - 20x + 91 = 0
    t = text
    t = re.sub(r'\b([xyzPQRABC])\^2\b', r'$\1^2$', t)
    t = re.sub(r'\b([xyzPQRABC])\b\s*([\+\-\*\/=])\s*', r'$\1 \2 ', t)
    
    return t

def fix_test_file(test_num):
    fname = f"sbipo_test_{test_num}.json"
    p_orig = os.path.join(orig_dir, fname)
    p_target = os.path.join(target_dir, fname)
    docx_path = os.path.join(docx_dir, docx_files[test_num - 1])
    
    with open(p_orig, 'r', encoding='utf-8') as f:
        d_orig = json.load(f)
    with open(p_target, 'r', encoding='utf-8') as f:
        d_target = json.load(f)
        
    orig_map = {q['id']: q for q in d_orig}
    target_map = {q['id']: q for q in d_target}
    
    # Load docx text as backup
    doc = docx.Document(docx_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    
    final_questions = []
    
    for qid in range(1, 101):
        q_orig = orig_map.get(qid, {})
        q_target = target_map.get(qid, {})
        
        # Start with base object structure from q_orig or q_target
        base_q = dict(q_orig) if q_orig else dict(q_target)
        base_q['id'] = qid
        
        # Determine Question Text
        t_text = clean_corrupted_string(q_target.get('question', ''))
        o_text = clean_corrupted_string(q_orig.get('question', ''))
        
        if t_text and not t_text.startswith("[Question") and "not found" not in t_text.lower():
            final_q_text = t_text
        elif o_text and not o_text.startswith("[Question") and "not found" not in o_text.lower():
            final_q_text = o_text
        else:
            # Search DOCX for Q{qid}
            q_found = ""
            pat = rf'^\s*Q\s*\.?\s*{qid}\b'
            for idx, p in enumerate(paragraphs):
                if re.search(pat, p, re.IGNORECASE):
                    q_found = p
                    break
            final_q_text = q_found if q_found else f"Question {qid}"

        base_q['question'] = final_q_text
        
        # Determine Options
        opts_target = q_target.get('options', [])
        opts_orig = q_orig.get('options', [])
        
        opts_t_dict = {o['id']: clean_corrupted_string(o.get('text', '')) for o in opts_target if 'id' in o}
        opts_o_dict = {o['id']: clean_corrupted_string(o.get('text', '')) for o in opts_orig if 'id' in o}
        
        final_options = []
        for opt_char in ['A', 'B', 'C', 'D', 'E']:
            val_t = opts_t_dict.get(opt_char, '')
            val_o = opts_o_dict.get(opt_char, '')
            
            # Prefer val_t if valid latex and not empty/placeholder
            if val_t and val_t != "" and "[Option" not in val_t:
                final_val = val_t
            elif val_o and val_o != "" and "[Option" not in val_o:
                final_val = val_o
            else:
                # Search DOCX for Q{qid} options
                final_val = f"[Option {opt_char}]"
                pat = rf'^\s*Q\s*\.?\s*{qid}\b'
                for idx, p in enumerate(paragraphs):
                    if re.search(pat, p, re.IGNORECASE):
                        # check next lines for (a), (b), etc.
                        block = "\n".join(paragraphs[idx:min(len(paragraphs), idx+8)])
                        opt_m = re.search(rf'\({opt_char.lower()}\)\s*(.*?)(?=\([a-e]\)|Q\d+|$)', block, re.DOTALL | re.IGNORECASE)
                        if opt_m:
                            final_val = opt_m.group(1).strip()
                        break
            
            # Check img in opt
            opt_img = None
            for opt_obj in opts_target:
                if opt_obj.get('id') == opt_char and opt_obj.get('image'):
                    opt_img = opt_obj.get('image')
                    break
            if not opt_img:
                for opt_obj in opts_orig:
                    if opt_obj.get('id') == opt_char and opt_obj.get('image'):
                        opt_img = opt_obj.get('image')
                        break

            final_options.append({
                "id": opt_char,
                "text": final_val,
                "image": opt_img
            })
            
        base_q['options'] = final_options
        
        # Ensure correctAnswer
        ca_t = q_target.get('correctAnswer')
        ca_o = q_orig.get('correctAnswer')
        base_q['correctAnswer'] = ca_t if ca_t in ['A','B','C','D','E'] else (ca_o if ca_o in ['A','B','C','D','E'] else "A")
        
        # Explanation
        exp_t = q_target.get('explanation')
        exp_o = q_orig.get('explanation')
        base_q['explanation'] = exp_t if exp_t else (exp_o if exp_o else "")
        
        # Direction
        dir_t = q_target.get('direction')
        dir_o = q_orig.get('direction')
        base_q['direction'] = dir_t if dir_t else dir_o
        
        # Other metadata fields
        base_q['exam'] = q_target.get('exam') or q_orig.get('exam') or "SBI PO Prelims"
        base_q['year'] = q_target.get('year') or q_orig.get('year') or 2024
        base_q['subject'] = q_target.get('subject') or q_orig.get('subject') or ""
        base_q['topic'] = q_target.get('topic') or q_orig.get('topic') or ""
        base_q['difficulty'] = q_target.get('difficulty') or q_orig.get('difficulty') or "Medium"
        base_q['marks'] = q_target.get('marks') or q_orig.get('marks') or 1
        base_q['negativeMarks'] = q_target.get('negativeMarks') or q_orig.get('negativeMarks') or 0.25
        base_q['questionImage'] = q_target.get('questionImage') or q_orig.get('questionImage')
        
        final_questions.append(base_q)
        
    return final_questions

print("Testing repair logic...")
for test_num in range(1, 11):
    qs = fix_test_file(test_num)
    print(f"Test {test_num}: Repaired {len(qs)} questions.")

