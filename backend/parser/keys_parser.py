import re
import fitz
import pdfplumber

class KeysParser:
    def __init__(self):
        # Hardcoded pattern for keys/explanations
        self.key_pattern = re.compile(
            r'^\s*(\d+)[\.\)\:\-]?\s+([A-D]|[a-d]|[1-4])(?:\s*[\.\)\:\-\,\—\–\-\s]+(.*))?$', 
            re.IGNORECASE | re.MULTILINE
        )

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
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"[KeysParser] pdfplumber failed: {e}. Falling back to PyMuPDF.")
            text = ""
            
        if not text.strip():
            try:
                doc = fitz.open(pdf_path)
                for page in doc:
                    text += page.get_text() + "\n\n"
            except Exception as e:
                print(f"[KeysParser] PyMuPDF failed: {e}")
                
        return text

    def split_into_key_blocks(self, text):
        """
        Splits the raw text into distinct key/explanation blocks.
        Matches a line that starts with a number followed by correct option label or spaces and period.
        """
        matches = list(re.finditer(r'(?:^|\n)\s*(\d+)[\.\)\:\-]?\s+([A-D]|[a-d]|[1-4])\b', text, re.IGNORECASE))
        if not matches:
            return []

        blocks = []
        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(text)
            block = text[start:end].strip()
            if block:
                blocks.append(block)
                
        return blocks

    def parse_key_block(self, block_text):
        """
        Parses a single key block and returns:
        - display_question_number
        - correct_option (A/B/C/D)
        - correct_answer
        - explanation
        """
        block_text = block_text.strip()
        match = self.key_pattern.match(block_text)
        if not match:
            match = self.key_pattern.search(block_text)
            if not match:
                return None
            
        q_num = int(match.group(1))
        opt = match.group(2).upper()
        
        # Convert numeric options like 1 -> A, 2 -> B, etc.
        if opt == '1': opt = 'A'
        elif opt == '2': opt = 'B'
        elif opt == '3': opt = 'C'
        elif opt == '4': opt = 'D'
        
        desc = match.group(3).strip() if match.group(3) else ""
        
        # Separate correct answer from explanation
        explanation = desc
        correct_answer = ""
        
        parts = re.split(r'(?i)\b(?:explanation|exp|sol|solution|detail[s]?|reason)\b[:\-]?\s*', desc, maxsplit=1)
        if len(parts) == 2:
            correct_answer = parts[0].strip()
            explanation = parts[1].strip()
        else:
            lines = desc.split('\n')
            if len(lines) > 1:
                correct_answer = lines[0].strip()
                explanation = "\n".join(lines[1:]).strip()
            else:
                correct_answer = desc
                explanation = "No detailed explanation provided."

        if not explanation:
            explanation = "No detailed explanation provided."
            
        return {
            'display_question_number': q_num,
            'correct_option': opt,
            'correct_answer': correct_answer,
            'explanation': explanation
        }

    def parse(self, pdf_path):
        raw_text = self.extract_text_from_pdf(pdf_path)
        cleaned_text = self.clean_text(raw_text)
        
        # Match all key starts in the text using lookahead (?=\s|\n|$)
        pattern = re.compile(
            r'(?:^|\n)\s*(\d+)[\.\)\:\-]?\s*(?:(?:answer|ans|option|correct|key)\b[:\-\s\.]*)?\(?([A-D]|[a-d]|[1-4])\)?(?=\s|\n|$)',
            re.IGNORECASE
        )
        
        matches = list(re.finditer(pattern, cleaned_text))
        if not matches:
            return []
            
        parsed_keys = []
        for i in range(len(matches)):
            m = matches[i]
            q_num = int(m.group(1))
            opt = m.group(2).upper()
            
            # Convert numeric options like 1 -> A, 2 -> B, etc.
            if opt == '1': opt = 'A'
            elif opt == '2': opt = 'B'
            elif opt == '3': opt = 'C'
            elif opt == '4': opt = 'D'
            
            # The explanation/details start after the match ends
            start_desc = m.end()
            end_desc = matches[i+1].start() if i + 1 < len(matches) else len(cleaned_text)
            desc = cleaned_text[start_desc:end_desc].strip()
            
            # Separate correct answer from explanation
            explanation = desc
            correct_answer = ""
            
            parts = re.split(r'(?i)\b(?:explanation|exp|sol|solution|detail[s]?|reason)\b[:\-]?\s*', desc, maxsplit=1)
            if len(parts) == 2:
                correct_answer = parts[0].strip()
                explanation = parts[1].strip()
            else:
                lines = desc.split('\n')
                if len(lines) > 1:
                    correct_answer = lines[0].strip()
                    explanation = "\n".join(lines[1:]).strip()
                else:
                    correct_answer = desc
                    explanation = "No detailed explanation provided."

            if not correct_answer:
                correct_answer = opt

            if not explanation:
                explanation = "No detailed explanation provided."
                
            parsed_keys.append({
                'display_question_number': q_num,
                'correct_option': opt,
                'correct_answer': correct_answer,
                'explanation': explanation,
                'pos': m.start()
            })
            
        # Sort by position in PDF first
        parsed_keys.sort(key=lambda x: x.get('pos', 0))

        # Filter out duplicates by picking the first occurrence that maintains sequential order
        filtered_keys = []
        from collections import defaultdict
        candidates_by_num = defaultdict(list)
        for k in parsed_keys:
            candidates_by_num[k['display_question_number']].append(k)

        current_pos = -1
        for num in sorted(candidates_by_num.keys()):
            candidates = candidates_by_num[num]
            best_candidate = None
            for cand in candidates:
                if cand['pos'] > current_pos:
                    best_candidate = cand
                    break
            if best_candidate:
                filtered_keys.append(best_candidate)
                current_pos = best_candidate['pos']
            else:
                filtered_keys.append(candidates[0])
                current_pos = candidates[0]['pos']
                
        # Sort by display question number to maintain sequence
        filtered_keys.sort(key=lambda x: x.get('display_question_number', 0))
        return filtered_keys
