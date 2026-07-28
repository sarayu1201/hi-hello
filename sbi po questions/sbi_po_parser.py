import docx
from docx.oxml.ns import qn
import os
import re
import json
import zipfile
import shutil
import sys

# Set up utf-8 printing for console output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Directories
sbi_docx_dir = r"C:\Users\Administrator\Downloads\sbi po prelims"
output_json_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\QuestionBank\json\sbi_po_prelims"
uploads_images_dir = r"C:\Users\Administrator\Downloads\hi-hello-main (1)\hi-hello-main\backend\uploads\images"

os.makedirs(output_json_dir, exist_ok=True)
os.makedirs(uploads_images_dir, exist_ok=True)

def iter_block_items(parent):
    """
    Recursively iterate through document elements (paragraphs and tables)
    preserving their block level ordering.
    """
    if isinstance(parent, docx.document.Document):
        parent_elm = parent.element.body
    elif isinstance(parent, docx.table._Cell):
        parent_elm = parent._tc
    else:
        raise ValueError("Unsupported parent type")
        
    for child in parent_elm.iterchildren():
        tag = child.tag.split('}')[-1]
        if tag == 'p':
            yield docx.text.paragraph.Paragraph(child, parent)
        elif tag == 'tbl':
            yield docx.table.Table(child, parent)

def get_rel_map(doc):
    """Map relation IDs to media file paths."""
    rel_map = {}
    for rel_id, rel in doc.part.rels.items():
        if "image" in rel.target_ref:
            rel_map[rel_id] = rel.target_ref
    return rel_map

def save_image_from_docx(doc_path, img_name, out_path):
    """Extract image directly from DOCX zip file."""
    zip_path = "word/media/" + img_name
    try:
        with zipfile.ZipFile(doc_path) as z:
            data = z.read(zip_path)
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "wb") as f:
                f.write(data)
            return True
    except Exception as e:
        print(f"Error extracting image {img_name}: {e}")
        return False

def is_watermark_or_banner(doc_path, img_name):
    """Check if the image is a logo, banner or watermark based on file size (>100KB)."""
    zip_path = "word/media/" + img_name
    try:
        with zipfile.ZipFile(doc_path) as z:
            size = len(z.read(zip_path))
            if size > 100000: # 100KB
                return True
    except Exception:
        pass
    return False

def get_paragraph_text_with_images(p, rel_map):
    """Extract text of a paragraph and append inline image placeholders."""
    text = p.text.strip()
    blips = p._p.xpath('.//a:blip')
    p_img_placeholders = []
    for blip in blips:
        embed_id = blip.get(qn('r:embed'))
        if embed_id in rel_map:
            img_name = os.path.basename(rel_map[embed_id])
            p_img_placeholders.append(f"[IMAGE:{img_name}]")
    if p_img_placeholders:
        # Separate inline image placeholders by space
        if text:
            text += " " + " ".join(p_img_placeholders)
        else:
            text = " ".join(p_img_placeholders)
    return text

def format_data_table_as_markdown(table, rel_map):
    """Format a standard data table as a markdown table with inline image support."""
    rows_data = []
    for row in table.rows:
        row_cells = []
        for cell in row.cells:
            cell_paras = []
            for p in cell.paragraphs:
                p_txt = get_paragraph_text_with_images(p, rel_map)
                if p_txt:
                    cell_paras.append(p_txt)
            row_cells.append(" ".join(cell_paras).strip())
        rows_data.append(row_cells)
        
    if not rows_data or len(rows_data[0]) == 0:
        return ""
        
    # Build markdown table
    md_lines = []
    header = rows_data[0]
    md_lines.append("| " + " | ".join(header) + " |")
    md_lines.append("| " + " | ".join(["---"] * len(header)) + " |")
    for row in rows_data[1:]:
        # Ensure row cell counts match header
        if len(row) < len(header):
            row.extend([""] * (len(header) - len(row)))
        elif len(row) > len(header):
            row = row[:len(header)]
        md_lines.append("| " + " | ".join(row) + " |")
    return "\n" + "\n".join(md_lines) + "\n"

def is_layout_table(table):
    if len(table.rows) == 1:
        return True
    for row in table.rows:
        for cell in row.cells:
            txt = cell.text.strip()
            if re.search(r'\bQ\d+\b', txt) or re.search(r'\bS\d+\s*\.\s*Ans', txt, re.IGNORECASE):
                return True
    return False

def extract_content_blocks(parent, rel_map):
    """
    Recursively extract paragraphs and table data, formatting page-layout tables 
    column-by-column to preserve correct two-column reading order.
    """
    blocks = []
    for item in iter_block_items(parent):
        if isinstance(item, docx.text.paragraph.Paragraph):
            txt = get_paragraph_text_with_images(item, rel_map)
            if txt:
                blocks.append(txt)
        elif isinstance(item, docx.table.Table):
            if is_layout_table(item):
                # Traverse column-by-column (vertical reading order)
                for col_idx in range(len(item.columns)):
                    for row_idx in range(len(item.rows)):
                        cell = item.cell(row_idx, col_idx)
                        blocks.extend(extract_content_blocks(cell, rel_map))
            else:
                # Content/Data table
                md_table = format_data_table_as_markdown(item, rel_map)
                if md_table:
                    blocks.append(md_table)
    return blocks

def find_option_matches(matches):
    """Find the sequential option group (e.g. A, B, C, D, E) starting from the end of the text."""
    n = len(matches)
    if n < 4:
        return None
    for end_idx in [n - 1, n - 2, n - 3]:
        if end_idx < 3:
            continue
        expected = ['E', 'D', 'C', 'B', 'A']
        found_indices = []
        curr_exp_idx = 0
        
        scan_idx = end_idx
        while scan_idx >= 0 and curr_exp_idx < 5:
            m_char = matches[scan_idx].group(1).upper()
            if m_char == expected[curr_exp_idx]:
                found_indices.append(scan_idx)
                curr_exp_idx += 1
            scan_idx -= 1
            
        if len(found_indices) >= 4: # Found at least A, B, C, D
            found_indices.reverse()
            return found_indices
            
    if n >= 5:
        return list(range(n-5, n))
    elif n == 4:
        return list(range(n-4, n))
    return None

def parse_question_block(q_block_text, test_num, q_num, media_out_dir, relative_media_prefix, doc_path):
    """Parse question text, option choices, and diagrams from raw question text."""
    m_num = re.match(r'^\s*Q(\d+)[\.\s]*', q_block_text, re.IGNORECASE)
    if m_num:
        q_body = q_block_text[m_num.end():].strip()
    else:
        q_body = q_block_text.strip()
        
    opt_pattern = r'\(([a-eA-E])\)'
    matches = list(re.finditer(opt_pattern, q_body))
    
    question_text = q_body
    options_raw = {}
    option_matches = find_option_matches(matches)
    
    if option_matches:
        first_opt_idx = option_matches[0]
        question_text = q_body[:matches[first_opt_idx].start()].strip()
        
        for idx, match_idx in enumerate(option_matches):
            opt_char = matches[match_idx].group(1).upper()
            start = matches[match_idx].end()
            if idx + 1 < len(option_matches):
                end = matches[option_matches[idx+1]].start()
            else:
                end = len(q_body)
            opt_val = q_body[start:end].strip()
            options_raw[opt_char] = opt_val
    else:
        options_raw = {c: "" for c in ["A", "B", "C", "D", "E"]}
        
    # Extract questionImage
    q_img_path = None
    q_imgs = re.findall(r'\[IMAGE:(.*?)\]', question_text)
    for img in q_imgs:
        if is_watermark_or_banner(doc_path, img):
            continue
        img_out_name = f"q_{q_num}_diagram.png"
        save_path = os.path.join(media_out_dir, img_out_name)
        if save_image_from_docx(doc_path, img, save_path):
            q_img_path = relative_media_prefix + "/" + img_out_name
            break # Use first valid image as questionImage
            
    # Clean placeholders from question text
    question_text_clean = re.sub(r'\[IMAGE:.*?\]', '', question_text).strip()
    
    # Process options
    options_list = []
    for char in ["A", "B", "C", "D", "E"]:
        opt_val = options_raw.get(char, "")
        opt_img_path = None
        opt_imgs = re.findall(r'\[IMAGE:(.*?)\]', opt_val)
        for img in opt_imgs:
            if is_watermark_or_banner(doc_path, img):
                continue
            img_out_name = f"q_{q_num}_opt_{char}.png"
            save_path = os.path.join(media_out_dir, img_out_name)
            if save_image_from_docx(doc_path, img, save_path):
                opt_img_path = relative_media_prefix + "/" + img_out_name
                break
        
        opt_val_clean = re.sub(r'\[IMAGE:.*?\]', '', opt_val).strip()
        options_list.append({
            "id": char,
            "text": opt_val_clean if opt_val_clean else f"[Option {char}]",
            "image": opt_img_path
        })
        
    return question_text_clean, options_list, q_img_path

def process_explanation(exp_text, q_num, test_num, media_out_dir, relative_media_prefix, doc_path):
    """Process solution explanation text and extract inline formulas or diagrams."""
    img_placeholders = re.findall(r'\[IMAGE:(.*?)\]', exp_text)
    exp_text_clean = exp_text
    
    img_counter = 1
    for img in img_placeholders:
        if is_watermark_or_banner(doc_path, img):
            exp_text_clean = exp_text_clean.replace(f"[IMAGE:{img}]", "")
            continue
            
        img_out_name = f"sol_q{q_num}_diagram_{img_counter}.png"
        save_path = os.path.join(media_out_dir, img_out_name)
        if save_image_from_docx(doc_path, img, save_path):
            rel_path = relative_media_prefix + "/" + img_out_name
            exp_text_clean = exp_text_clean.replace(f"[IMAGE:{img}]", f"\n\n![Explanation Diagram]({rel_path})")
            img_counter += 1
        else:
            exp_text_clean = exp_text_clean.replace(f"[IMAGE:{img}]", "")
            
    exp_text_clean = re.sub(r'^\s*Sol\s*\.\s*', '', exp_text_clean)
    return exp_text_clean.strip()

def parse_docx_file(file_path, test_num):
    """Parse entire DOCX file and generate list of 100 questions."""
    doc = docx.Document(file_path)
    rel_map = get_rel_map(doc)
    
    media_out_dir = os.path.join(uploads_images_dir, f"sbipo_test_{test_num}")
    relative_media_prefix = f"sbipo_test_{test_num}"
    
    if os.path.exists(media_out_dir):
        shutil.rmtree(media_out_dir)
    os.makedirs(media_out_dir, exist_ok=True)
    
    # 1. Flatten into content blocks
    blocks = extract_content_blocks(doc, rel_map)
    print(f"  Extracted {len(blocks)} raw content blocks.")
    
    # 2. Split into Questions and Solutions
    sol_start_idx = None
    for idx, b in enumerate(blocks):
        txt = b.strip()
        if re.match(r'^S1\s*\.\s*Ans', txt, re.IGNORECASE) or txt.lower() in ["solutions", "answers", "detailed solutions"]:
            sol_start_idx = idx
            break
            
    if sol_start_idx is None:
        for idx, b in enumerate(blocks):
            if re.search(r'\bS1\s*\.\s*Ans', b, re.IGNORECASE):
                sol_start_idx = idx
                break
                
    if sol_start_idx is None:
        sol_start_idx = len(blocks)
        
    print(f"  Split position for solutions: block index {sol_start_idx} out of {len(blocks)}")
    
    questions_blocks = blocks[:sol_start_idx]
    solutions_blocks = blocks[sol_start_idx:]
    
    questions_text = "\n\n".join(questions_blocks)
    solutions_text = "\n\n".join(solutions_blocks)
    
    # 3. Parse Directions
    directions_map = {} # Maps q_num -> (dir_text, dir_img_path)
    improved_dir_pattern = r'Directions?\s*\(\s*(?:Q\s*\.\s*)?(\d+)\s*[^0-9]+?\s*(\d+)\s*\)\s*:?\s*(.*?)(?=\bQ\d+|\bDirections?\b|$)'
    dir_matches = list(re.finditer(improved_dir_pattern, questions_text, re.IGNORECASE | re.DOTALL))
    
    for m_dir in dir_matches:
        start_q = int(m_dir.group(1))
        end_q = int(m_dir.group(2))
        dir_text = m_dir.group(3).strip()
        
        # Extract image from directions block
        dir_img_path = None
        img_placeholders = re.findall(r'\[IMAGE:(.*?)\]', dir_text)
        for img in img_placeholders:
            if is_watermark_or_banner(file_path, img):
                continue
            img_out_name = f"dir_{start_q}_{end_q}_diagram.png"
            save_path = os.path.join(media_out_dir, img_out_name)
            if save_image_from_docx(file_path, img, save_path):
                dir_img_path = relative_media_prefix + "/" + img_out_name
                break
                
        # Clean placeholders from direction text
        dir_text_clean = re.sub(r'\[IMAGE:.*?\]', '', dir_text).strip()
        for q_num in range(start_q, end_q + 1):
            directions_map[q_num] = (dir_text_clean, dir_img_path)
            
    # Clean directions from questions_text to prevent option E leakage
    cleaned_chars = list(questions_text)
    for m_dir in dir_matches:
        start_idx, end_idx = m_dir.span()
        for pos in range(start_idx, end_idx):
            if cleaned_chars[pos] != '\n':
                cleaned_chars[pos] = ' '
    questions_text = "".join(cleaned_chars)
            
    # 4. Parse Questions
    parsed_questions = {}
    q_matches = list(re.finditer(r'\bQ(\d+)\b', questions_text, re.IGNORECASE))
    
    # Keep first unique match for each question number
    unique_q_matches = {}
    for m in q_matches:
        num = int(m.group(1))
        if num not in unique_q_matches:
            unique_q_matches[num] = m
            
    sorted_q_nums = sorted(list(unique_q_matches.keys()))
    
    for idx_q, q_num in enumerate(sorted_q_nums):
        m_start = unique_q_matches[q_num]
        start_idx = m_start.start()
        if idx_q + 1 < len(sorted_q_nums):
            end_idx = unique_q_matches[sorted_q_nums[idx_q + 1]].start()
        else:
            end_idx = len(questions_text)
            
        q_block = questions_text[start_idx:end_idx].strip()
        q_text, options_list, q_image = parse_question_block(
            q_block, test_num, q_num, media_out_dir, relative_media_prefix, file_path
        )
        
        parsed_questions[q_num] = {
            "question": q_text,
            "options": options_list,
            "image": q_image
        }
        
    # 5. Parse Solutions
    parsed_solutions = {}
    sol_pattern = r'\bS(\d+)\s*\.\s*Ans\s*\.?\s*\(?([A-Ea-e])\)?'
    sol_matches = list(re.finditer(sol_pattern, solutions_text, re.IGNORECASE))
    
    unique_sol_matches = {}
    for m in sol_matches:
        num = int(m.group(1))
        if num not in unique_sol_matches:
            unique_sol_matches[num] = m
            
    sorted_sol_nums = sorted(list(unique_sol_matches.keys()))
    
    for idx_s, q_num in enumerate(sorted_sol_nums):
        m_start = unique_sol_matches[q_num]
        ans_char = m_start.group(2).upper()
        start_idx = m_start.end()
        
        if idx_s + 1 < len(sorted_sol_nums):
            end_idx = unique_sol_matches[sorted_sol_nums[idx_s + 1]].start()
        else:
            end_idx = len(solutions_text)
            
        exp_raw = solutions_text[start_idx:end_idx].strip()
        exp_clean = process_explanation(
            exp_raw, q_num, test_num, media_out_dir, relative_media_prefix, file_path
        )
        
        parsed_solutions[q_num] = {
            "answer": ans_char,
            "explanation": exp_clean
        }
        
    # 6. Assemble the 100 questions
    final_questions = []
    
    # Extract Year from name
    year_match = re.search(r'\d{4}', os.path.basename(file_path))
    year = int(year_match.group(0)) if year_match else 2025
    
    for q_num in range(1, 101):
        # Override subject according to 40-30-30 layout
        if 1 <= q_num <= 40:
            subject = "English Language"
        elif 41 <= q_num <= 70:
            subject = "Quantitative Aptitude"
        else:
            subject = "Reasoning Ability"
            
        # Direction
        direction_text = None
        direction_image = None
        if q_num in directions_map:
            direction_text, direction_image = directions_map[q_num]
            
        # Question Details
        raw_q = parsed_questions.get(q_num)
        if raw_q:
            q_text = raw_q["question"]
            options = raw_q["options"]
            q_image = raw_q["image"]
            if not q_image:
                q_image = direction_image
        else:
            q_text = f"[Question Q{q_num} text not found in document]"
            options = [{
                "id": c,
                "text": f"[Option {c}]",
                "image": None
            } for c in ["A", "B", "C", "D", "E"]]
            q_image = None
            
        # Solution Details
        raw_sol = parsed_solutions.get(q_num)
        if raw_sol:
            correct_ans = raw_sol["answer"]
            explanation = raw_sol["explanation"]
        else:
            correct_ans = "A"
            explanation = ""
            
        final_questions.append({
            "id": q_num,
            "exam": "SBI PO Prelims",
            "year": year,
            "subject": subject,
            "topic": "",
            "difficulty": "Medium",
            "question": q_text,
            "questionImage": q_image,
            "options": options,
            "correctAnswer": correct_ans,
            "explanation": explanation,
            "marks": 1,
            "negativeMarks": 0.25,
            "direction": direction_text
        })
        
    # Post-process contiguous questions with null/empty directions that share a common prefix
    def get_longest_common_prefix(s1, s2):
        min_len = min(len(s1), len(s2))
        for i in range(min_len):
            if s1[i] != s2[i]:
                return s1[:i]
        return s1[:min_len]

    def clean_instruction_prefix(prefix):
        match = list(re.finditer(r'[\.:\?]\s*', prefix))
        if match:
            last_match = match[-1]
            return prefix[:last_match.end()].strip()
        return ""

    n_q = len(final_questions)
    idx_g = 0
    while idx_g < n_q:
        if final_questions[idx_g].get("direction"):
            idx_g += 1
            continue
            
        j_g = idx_g
        while j_g < n_q and not final_questions[j_g].get("direction"):
            j_g += 1
            
        # Contiguous range of null directions from idx_g to j_g-1
        group_start = idx_g
        while group_start < j_g - 1:
            best_prefix = ""
            best_end = group_start
            
            for group_end in range(group_start + 1, j_g):
                texts = [final_questions[k]["question"] for k in range(group_start, group_end + 1)]
                lcp = texts[0]
                for t in texts[1:]:
                    lcp = get_longest_common_prefix(lcp, t)
                    
                cleaned_prefix = clean_instruction_prefix(lcp)
                if len(cleaned_prefix) >= 30:
                    best_prefix = cleaned_prefix
                    best_end = group_end
            
            if best_end > group_start:
                # We found a group! Assign the prefix as direction, and remove from questions
                for k in range(group_start, best_end + 1):
                    final_questions[k]["direction"] = best_prefix
                    original_q = final_questions[k]["question"]
                    cleaned_q = original_q[len(best_prefix):].strip()
                    final_questions[k]["question"] = cleaned_q
                group_start = best_end + 1
            else:
                group_start += 1
                
        idx_g = j_g
        
    return final_questions


def run_conversion():
    files = sorted([f for f in os.listdir(sbi_docx_dir) if f.lower().endswith('.docx')])
    print(f"Found {len(files)} files to convert.")
    
    for idx, file_name in enumerate(files):
        test_num = idx + 1
        print(f"\n" + "=" * 50)
        print(f"Processing File {test_num}/10: {file_name}")
        file_path = os.path.join(sbi_docx_dir, file_name)
        
        json_out_path = os.path.join(output_json_dir, f"sbipo_test_{test_num}.json")
        
        try:
            questions_json = parse_docx_file(file_path, test_num)
            
            with open(json_out_path, "w", encoding="utf-8") as f:
                json.dump(questions_json, f, indent=2, ensure_ascii=False)
            print(f"SUCCESS: Saved JSON to {json_out_path}")
        except Exception as e:
            print(f"FAILED to process {file_name}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    run_conversion()
