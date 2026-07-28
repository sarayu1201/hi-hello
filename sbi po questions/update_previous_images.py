import json
import os

def update_images(file_path):
    print(f"Updating image fields in {os.path.basename(file_path)}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Find all question IDs with manual images
    manual_ids = sorted([q['id'] for q in data if q.get('imageStatus') == 'MANUAL_REQUIRED'])
    
    if not manual_ids:
        print(f"No manual images found in {os.path.basename(file_path)}.")
        return
        
    # Group contiguous IDs
    groups = []
    current_group = []
    for qid in manual_ids:
        if not current_group:
            current_group.append(qid)
        elif qid == current_group[-1] + 1:
            current_group.append(qid)
        else:
            groups.append(current_group)
            current_group = [qid]
    if current_group:
        groups.append(current_group)
        
    # Build a map of qid -> image_filename
    img_map = {}
    for g in groups:
        if len(g) > 1:
            img_name = f"q_{g[0]}_{g[-1]}.png"
        else:
            img_name = f"q_{g[0]}.png"
        for qid in g:
            img_map[qid] = img_name
            
    # Update questionImage and imageNote fields
    updated_count = 0
    for q in data:
        qid = q['id']
        if qid in img_map:
            img_name = img_map[qid]
            q['questionImage'] = img_name
            
            # Format the note to match the new convention
            orig_note = q.get('imageNote', '')
            # Update the note text to mention the new filename
            # e.g., Replace 'q41_table.png' with 'q_41_45.png'
            if orig_note:
                # Find any pattern like 'q\d+_\w+\.png' or 'q\d+\.png' and replace it with img_name
                new_note = re.sub(r'as\s+q\d+(?:_\w+)?\.png', f"as {img_name}", orig_note)
                q['imageNote'] = new_note
            else:
                q['imageNote'] = f"Attach the required diagram/table from the source PDF as {img_name}."
                
            updated_count += 1
            
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {os.path.basename(file_path)}. Updated {updated_count} questionImage values.")

import re
if __name__ == '__main__':
    for i in range(1, 8):
        fpath = f"c:/Users/Administrator/Downloads/sbi po questions/sbi_po_prelims test _{i}.json"
        if os.path.exists(fpath):
            update_images(fpath)
        else:
            print(f"File not found: {fpath}")
