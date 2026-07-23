class ValidationEngine:
    def validate(self, merged_list, total_questions_found, total_keys_found, missing_keys, missing_questions):
        """
        Validates the merged list under strict, binary rules.
        Raises ValueError to abort the import immediately if any validation check fails.
        """
        # 1. Match Count Validation
        if total_questions_found != total_keys_found:
            raise ValueError(
                f"Validation Failed: Question count ({total_questions_found}) "
                f"does not match Key count ({total_keys_found}). "
                f"Missing keys for questions: {missing_keys}, missing questions for keys: {missing_questions}."
            )

        # 2. Merge Completeness Check
        if len(merged_list) != total_questions_found:
            raise ValueError(
                f"Validation Failed: Merge failure. Only {len(merged_list)} of {total_questions_found} questions merged."
            )

        # 3. Individual Question Content Verification
        validated_list = []
        unique_ids = []
        display_numbers = []

        for q in merged_list:
            q_num = q['display_question_number']
            unique_id = q['unique_id']
            
            # Duplicate checks in current batch
            if q_num in display_numbers:
                raise ValueError(f"Validation Failed: Duplicate display_question_number {q_num} found inside Questions PDF.")
            display_numbers.append(q_num)

            if unique_id in unique_ids:
                raise ValueError(f"Validation Failed: Duplicate unique_id {unique_id} found in merge payload.")
            unique_ids.append(unique_id)

            # Question text check
            if not q.get('question') or not str(q['question']).strip():
                raise ValueError(f"Validation Failed: Question {q_num} has empty question text.")
                
            # Options count and empty text check
            options = q.get('options', [])
            if not options or len(options) != 4:
                raise ValueError(f"Validation Failed: Question {q_num} has {len(options) if options else 0} options, expected exactly 4.")
            for i, opt in enumerate(options):
                if not opt or not str(opt).strip():
                    raise ValueError(f"Validation Failed: Question {q_num} has empty text for Option {chr(65+i)}.")
                    
            # Correct option check
            if not q.get('correct_option') or q['correct_option'].upper() not in ['A', 'B', 'C', 'D']:
                raise ValueError(f"Validation Failed: Question {q_num} has invalid correct option '{q.get('correct_option')}', expected A, B, C, or D.")
                
            # Correct answer check
            if not q.get('correct_answer') or not str(q['correct_answer']).strip():
                raise ValueError(f"Validation Failed: Question {q_num} has empty correct answer text.")
                
            # Explanation check
            if not q.get('explanation') or not str(q['explanation']).strip():
                raise ValueError(f"Validation Failed: Question {q_num} has empty explanation text.")
                
            validated_list.append(q)

        # Returns "PASS" status indicator if no validations failed
        return validated_list, "PASS"
