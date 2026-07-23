import sys
import time
from pymongo import MongoClient, errors
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern

class DatabaseImporter:
    def __init__(self, mongo_uri, db_name="kr_academy"):
        self.mongo_uri = mongo_uri
        self.db_name = db_name

    def get_legacy_category(self, exam_type):
        exam_lower = str(exam_type).lower()
        if "ssc" in exam_lower:
            return "SSC Exams"
        elif "rrb" in exam_lower or "rail" in exam_lower:
            return "RRB & Railways"
        elif "appsc" in exam_lower or "tspsc" in exam_lower or "state" in exam_lower:
            return "State Exams"
        elif "neet" in exam_lower or "jee" in exam_lower:
            return "NEET / JEE"
        elif "upsc" in exam_lower or "civil" in exam_lower:
            return "UPSC / Civil"
        else:
            return "Bank & Insurance"

    def import_questions(self, validated_list, import_mode="skip_duplicates", uploaded_by="system"):
        """
        Imports validated questions into the MongoDB Question Bank.
        Supports:
        - skip_duplicates (skips insert if unique_id exists)
        - replace_existing (replaces existing unique_id document)
        - create_new_version (adds a version suffix to unique_id to allow versioning)
        
        Runs the operation inside a MongoDB session transaction if supported.
        """
        client = MongoClient(self.mongo_uri)
        db = client[self.db_name]
        questions_col = db["questions"]

        # Ensure index exists on unique_id
        questions_col.create_index("unique_id", unique=True)

        inserted_count = 0
        duplicates_count = 0
        rejected_count = 0
        
        # Determine if we can use a transaction (only replica sets support transactions)
        use_transaction = False
        try:
            # Check replica set status
            ismaster = db.command("ismaster")
            if "setName" in ismaster:
                use_transaction = True
        except Exception:
            pass

        def perform_import(session=None):
            nonlocal inserted_count, duplicates_count, rejected_count
            inserted_count = 0
            duplicates_count = 0
            rejected_count = 0

            for q in validated_list:
                unique_id = q['unique_id']
                existing = questions_col.find_one({"unique_id": unique_id}, session=session)
                
                # Option letter index
                opt_letter = q['correct_option'].upper()
                correct_idx = 0
                if opt_letter == 'B': correct_idx = 1
                elif opt_letter == 'C': correct_idx = 2
                elif opt_letter == 'D': correct_idx = 3

                # Calculate content_hash to satisfy unique index
                import hashlib
                raw_options = "".join([str(o) for o in q['options']])
                raw_content = (q['question'] or "") + raw_options
                content_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()[:16]

                # Prepare legacy and new fields
                doc = {
                    'unique_id': unique_id,
                    'content_hash': content_hash,
                    'display_question_number': q['display_question_number'],
                    'course': q['course'],
                    'exam_type': q['exam_type'],
                    'paper_name': q['paper_name'],
                    'subject': q['subject'],
                    'chapter': q.get('chapter', ''),
                    'topic': q.get('topic', ''),
                    'difficulty': q.get('difficulty', 'Medium'),
                    'question_type': q.get('question_type', 'multiple_choice'),
                    'question': q['question'],
                    'options': q['options'],
                    'correct_option': opt_letter,
                    'correct_answer': q['correct_answer'],
                    'explanation': q['explanation'],
                    'question_image': q.get('question_image', ''),
                    'option_images': q.get('option_images', []),
                    'created_at': q.get('created_at') or time.strftime("%Y-%m-%d %H:%M:%S"),
                    'updated_at': time.strftime("%Y-%m-%d %H:%M:%S"),
                    
                    # Legacy fields mapped for backward compatibility
                    'category': self.get_legacy_category(q['exam_type']),
                    'section': q['subject'],
                    'q': q['question'],
                    'correct': correct_idx,
                    'question_number': q['display_question_number'],
                    'source_file': q['paper_name'],
                    'correct_letter': opt_letter,
                    'status': 'ok',
                    'is_mock_eligible': True
                }

                if existing:
                    if import_mode == "skip_duplicates":
                        duplicates_count += 1
                        continue
                    elif import_mode == "replace_existing":
                        questions_col.delete_one({"unique_id": unique_id}, session=session)
                        questions_col.insert_one(doc, session=session)
                        inserted_count += 1
                    elif import_mode == "create_new_version":
                        # Append a _V2, _V3 suffix to make it unique
                        v = 2
                        new_uid = f"{unique_id}_V{v}"
                        while questions_col.find_one({"unique_id": new_uid}, session=session):
                            v += 1
                            new_uid = f"{unique_id}_V{v}"
                        doc['unique_id'] = new_uid
                        questions_col.insert_one(doc, session=session)
                        inserted_count += 1
                else:
                    questions_col.insert_one(doc, session=session)
                    inserted_count += 1

        if use_transaction:
            # Run transaction with retry logic
            with client.start_session() as session:
                def run_transaction_with_retry(txn_func):
                    while True:
                        try:
                            # Start transaction
                            session.start_transaction(
                                read_concern=ReadConcern("local"),
                                write_concern=WriteConcern("majority"),
                            )
                            txn_func(session)
                            session.commit_transaction()
                            break
                        except errors.ConnectionFailure:
                            # Connection failures during commit are safe to retry
                            continue
                        except errors.CommandError as e:
                            # If transient transaction error, retry
                            if e.has_error_label("TransientTransactionError"):
                                continue
                            else:
                                session.abort_transaction()
                                raise e
                        except Exception as e:
                            session.abort_transaction()
                            raise e
                run_transaction_with_retry(perform_import)
        else:
            # Fallback to non-transactional import
            perform_import()

        return inserted_count, duplicates_count, rejected_count
