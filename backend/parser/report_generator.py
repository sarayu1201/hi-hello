import json
import time
from pymongo import MongoClient

class ReportGenerator:
    @staticmethod
    def generate_report(
        import_id,
        course,
        exam_type,
        paper_name,
        subject,
        questions_found,
        questions_validated,
        questions_imported,
        duplicates,
        rejected,
        elapsed_time,
        status,
        uploaded_by="system",
        error_msg=None,
        mongo_uri=None,
        db_name="kr_academy"
    ):
        """
        Compiles the strict, production-grade Import History Report.
        """
        # Fetch current total questions in DB for reference
        db_total_questions = 0
        if mongo_uri:
            try:
                client = MongoClient(mongo_uri)
                db = client[db_name]
                db_total_questions = db["questions"].count_documents({})
            except Exception:
                pass

        report = {
            'import_id': import_id,
            'parser_version': 'v1.0',
            'uploaded_by': uploaded_by,
            'uploaded_at': time.strftime("%Y-%m-%d %H:%M:%S"),
            'course': course,
            'exam_type': exam_type,
            'paper_name': paper_name,
            'subject': subject,
            'questions_found': questions_found,
            'questions_validated': questions_validated,
            'questions_imported': questions_imported,
            'duplicates': duplicates,
            'rejected': rejected,
            'elapsed_time': f"{elapsed_time:.2f}s",
            'status': status,
            'db_total_questions': db_total_questions,
            'error_message': error_msg
        }
        return report
