import re
import fitz  # PyMuPDF
import pdfplumber

class QuestionsParser:
    def __init__(self):
        # Hardcoded regex patterns for the single standardized format
        self.question_start_pattern = re.compile(r'^\s*(\d+)[\.\)\:\-]\s*(.*)', re.IGNORECASE | re.DOTALL)
        self.option_marker_pattern = re.compile(r'(?:^|\s|\()([A-D]|[a-d])[\.\)\]\:\-\s]')

    def clean_text(self, text):
        if not text:
            return ""
        # Remove common PDF garbage patterns (headers, footers, URLs, page counts)
        text = re.sub(r'(?i)Page \d+ of \d+|http[s]?://\S+|www\.\S+|Copyright\s*©.*', '', text)
        lines = [line.strip() for line in text.split("\n")]
        # Filter empty lines
        lines = [l for l in lines if l]
        return "\n".join(lines)

    def extract_text_from_pdf(self, pdf_path):
        """
        Extracts raw text from PDF using pdfplumber as primary and fitz as secondary fallback.
        """
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"[QuestionsParser] pdfplumber failed: {e}. Falling back to PyMuPDF.")
            text = ""
            
        if not text.strip():
            try:
                doc = fitz.open(pdf_path)
                for page in doc:
                    text += page.get_text() + "\n\n"
            except Exception as e:
                print(f"[QuestionsParser] PyMuPDF failed: {e}")
                
        return text

    def split_into_question_blocks(self, text):
        """
        Splits the raw text into distinct question text blocks.
        """
        # Look for matches where a line starts with a number followed by a period, paren, or colon
        matches = list(re.finditer(r'(?:^|\n)\s*(\d+)[\.\)\:\-]\s+', text))
        if not matches:
            return []

        # Filter matches to ensure they are strictly increasing
        filtered_matches = []
        last_num = 0
        for m in matches:
            num = int(m.group(1))
            if num > last_num:
                filtered_matches.append(m)
                last_num = num

        blocks = []
        for i in range(len(filtered_matches)):
            start = filtered_matches[i].start()
            end = filtered_matches[i+1].start() if i + 1 < len(filtered_matches) else len(text)
            block = text[start:end].strip()
            if block:
                blocks.append(block)
                
        return blocks

    def parse_question_block(self, block_text):
        """
        Parses a single question block and splits it into:
        - display_question_number
        - question_text
        - options (exactly 4)
        """
        block_text = block_text.strip()
        first_line_match = self.question_start_pattern.match(block_text)
        if not first_line_match:
            return None
        
        q_num = int(first_line_match.group(1))
        content = first_line_match.group(2).strip()
        
        # Find all option markers in the question block content
        opt_markers = [
            (m.start(), m.group(1).upper(), m.end())
            for m in re.finditer(r'(?:^|\s|\()([A-D]|[a-d])[\.\)\]\:\-\s]', content)
        ]
        
        options = {}
        q_text = content
        
        if len(opt_markers) >= 4:
            # Group markers by letter
            from collections import defaultdict
            markers_by_letter = defaultdict(list)
            for m in opt_markers:
                markers_by_letter[m[1]].append(m)
                
            best_seq = None
            for mA in markers_by_letter['A']:
                temp_q_text = content[:mA[0]].strip()
                for mB in markers_by_letter['B']:
                    if mB[0] < mA[0]: continue
                    for mC in markers_by_letter['C']:
                        if mC[0] < mB[0]: continue
                        for mD in markers_by_letter['D']:
                            if mD[0] < mC[0]: continue
                            
                            seq = [mA, mB, mC, mD]
                            if temp_q_text:
                                best_seq = seq
                                break
                            elif not best_seq:
                                best_seq = seq
                        if best_seq and temp_q_text: break
                    if best_seq and temp_q_text: break
                if best_seq and temp_q_text: break
                
            if best_seq:
                q_text = content[:best_seq[0][0]].strip()
                options['A'] = content[best_seq[0][2]:best_seq[1][0]].strip()
                options['B'] = content[best_seq[1][2]:best_seq[2][0]].strip()
                options['C'] = content[best_seq[2][2]:best_seq[3][0]].strip()
                options['D'] = content[best_seq[3][2]:].strip()
                
        if not options or len(options) < 4:
            # Fallback block parsing
            lines = content.split('\n')
            q_lines = []
            current_opt = None
            opt_text = { 'A': '', 'B': '', 'C': '', 'D': '' }
            
            for line in lines:
                l_strip = line.strip()
                m_opt = re.match(r'^\s*[\(\[]?([A-D]|[a-d])[\.\)\]\:\-\s]\s*(.*)', l_strip, re.IGNORECASE)
                if m_opt:
                    current_opt = m_opt.group(1).upper()
                    if current_opt in opt_text:
                        opt_text[current_opt] = m_opt.group(2).strip()
                else:
                    if current_opt:
                        opt_text[current_opt] += " " + l_strip
                    else:
                        q_lines.append(line)
            
            if all(opt_text.values()):
                q_text = "\n".join(q_lines).strip()
                options = { k: v.strip() for k, v in opt_text.items() }

        # Return structured block dict with fallback for empty options
        options_list = [options.get('A', ''), options.get('B', ''), options.get('C', ''), options.get('D', '')]
        final_options = []
        for i, opt in enumerate(options_list):
            if not opt or not opt.strip():
                final_options.append(f"[Option {chr(65+i)}]")
            else:
                final_options.append(opt.strip())

        return {
            'display_question_number': q_num,
            'question': q_text,
            'options': final_options
        }

    def parse(self, pdf_path):
        """
        Runs the full Questions parsing logic.
        Validates duplicate display question numbers inside the PDF text before return.
        """
        raw_text = self.extract_text_from_pdf(pdf_path)
        cleaned_text = self.clean_text(raw_text)
        blocks = self.split_into_question_blocks(cleaned_text)
        
        parsed_questions = []
        for block in blocks:
            res = self.parse_question_block(block)
            if res:
                res['pos'] = cleaned_text.find(block)
                parsed_questions.append(res)
                
        # Sort by position in PDF first
        parsed_questions.sort(key=lambda x: x.get('pos', 0))

        # Filter out duplicates by picking the first occurrence that maintains sequential order
        filtered_questions = []
        from collections import defaultdict
        candidates_by_num = defaultdict(list)
        for q in parsed_questions:
            candidates_by_num[q['display_question_number']].append(q)

        current_pos = -1
        for num in sorted(candidates_by_num.keys()):
            candidates = candidates_by_num[num]
            best_candidate = None
            for cand in candidates:
                if cand['pos'] > current_pos:
                    best_candidate = cand
                    break
            if best_candidate:
                filtered_questions.append(best_candidate)
                current_pos = best_candidate['pos']
            else:
                filtered_questions.append(candidates[0])
                current_pos = candidates[0]['pos']
            
        # Sort by display question number to maintain sequence
        filtered_questions.sort(key=lambda x: x.get('display_question_number', 0))
        return filtered_questions
