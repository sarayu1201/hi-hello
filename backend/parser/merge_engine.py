import re

class MergeEngine:
    @staticmethod
    def generate_unique_id(course, exam_type, paper_name, subject, q_num):
        """
        Generates a stable, composite unique identifier.
        Example: SSC_CGL_2026_TIER1_GA_Q38
        """
        def clean(s):
            # Replace non-alphanumeric characters with underscores, uppercase, and collapse multiple underscores
            s_clean = re.sub(r'[^A-Za-z0-9]', '_', str(s)).upper()
            return re.sub(r'_+', '_', s_clean).strip('_')

        clean_course = clean(course)
        clean_exam = clean(exam_type)
        clean_paper = clean(paper_name)
        clean_subject = clean(subject)
        
        raw_uid = f"{clean_course}_{clean_exam}_{clean_paper}_{clean_subject}_Q{q_num}"
        return re.sub(r'_+', '_', raw_uid)

    def merge(self, questions, keys, course, exam_type, paper_name, subject, section_ranges=None):
        """
        Merges parsed questions list and keys list matching strictly on display_question_number.
        Supports dynamic subject mapping based on section_ranges.
        """
        keys_map = { k['display_question_number']: k for k in keys }
        merged_list = []
        missing_keys = []
        missing_questions = []

        # Find questions matching keys strictly
        for q in questions:
            q_num = q['display_question_number']
            
            # Dynamically determine subject/section name if section_ranges exist
            resolved_subject = subject
            if section_ranges:
                for sr in section_ranges:
                    try:
                        start = int(sr.get('start', 0))
                        end = int(sr.get('end', 0))
                        if start <= q_num <= end:
                            resolved_subject = sr.get('name', subject)
                            break
                    except (ValueError, TypeError):
                        pass

            if q_num in keys_map:
                key_data = keys_map[q_num]
                unique_id = self.generate_unique_id(course, exam_type, paper_name, resolved_subject, q_num)
                
                merged_record = {
                    'unique_id': unique_id,
                    'display_question_number': q_num,
                    'course': course,
                    'exam_type': exam_type,
                    'paper_name': paper_name,
                    'subject': resolved_subject,
                    'question': q['question'],
                    'options': q['options'],
                    'correct_option': key_data['correct_option'],
                    'correct_answer': key_data['correct_answer'],
                    'explanation': key_data['explanation']
                }
                merged_list.append(merged_record)
            else:
                missing_keys.append(q_num)

        # Check for keys without matching questions
        q_nums = { q['display_question_number'] for q in questions }
        for q_num in keys_map:
            if q_num not in q_nums:
                missing_questions.append(q_num)

        return merged_list, missing_keys, missing_questions
