import os
import sys
import argparse
import json
import time
from pymongo import MongoClient

# Add parent dir to path to import local packages
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parser.questions_parser import QuestionsParser
from parser.keys_parser import KeysParser
from parser.merge_engine import MergeEngine
from parser.validation_engine import ValidationEngine
from parser.database_importer import DatabaseImporter
from parser.report_generator import ReportGenerator

def parse_args():
    parser = argparse.ArgumentParser(description="Centralized Ingestion Engine Refinement")
    parser.add_argument("--action", required=True, choices=["parse", "import"], help="Pipeline action stage")
    parser.add_argument("--import_id", required=True, help="Unique import session ID")
    parser.add_argument("--course", required=True, help="Course / Tier name")
    parser.add_argument("--exam_type", required=True, help="Exam category type")
    parser.add_argument("--paper_name", required=True, help="Shift / Paper name")
    parser.add_argument("--subject", required=True, help="Section / Subject name")
    parser.add_argument("--questions_pdf", help="Absolute path to Questions PDF")
    parser.add_argument("--keys_pdf", help="Absolute path to Keys & Explanations PDF")
    parser.add_argument("--import_mode", default="skip_duplicates", help="Duplicate handling mode")
    parser.add_argument("--mongo_uri", required=True, help="MongoDB connection string")
    parser.add_argument("--uploaded_by", default="system", help="Uploader profile username")
    parser.add_argument("--section_ranges", help="JSON string of dynamic section question ranges")
    return parser.parse_args()

def main():
    args = parse_args()
    start_time = time.time()
    
    # Establish permanent imports directory for session
    imports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "imports", args.import_id)
    os.makedirs(imports_dir, exist_ok=True)
    
    questions_json_path = os.path.join(imports_dir, "questions.json")
    keys_json_path = os.path.join(imports_dir, "keys.json")
    merged_json_path = os.path.join(imports_dir, "merged.json")
    validated_json_path = os.path.join(imports_dir, "validated.json")
    report_json_path = os.path.join(imports_dir, "import_report.json")

    if args.action == "parse":
        if not args.questions_pdf or not args.keys_pdf:
            print("Error: Both --questions_pdf and --keys_pdf are required for action 'parse'", file=sys.stderr)
            sys.exit(1)
            
        try:
            # 1. Questions Parser (without templates)
            q_parser = QuestionsParser()
            questions = q_parser.parse(args.questions_pdf)
            with open(questions_json_path, "w", encoding="utf-8") as f:
                json.dump(questions, f, indent=2, ensure_ascii=False)
                
            # 2. Keys Parser (without templates)
            k_parser = KeysParser()
            keys = k_parser.parse(args.keys_pdf)
            with open(keys_json_path, "w", encoding="utf-8") as f:
                json.dump(keys, f, indent=2, ensure_ascii=False)
                
            # 3. Merge Engine
            section_ranges = None
            if args.section_ranges:
                try:
                    section_ranges = json.loads(args.section_ranges)
                except Exception as e:
                    print(f"Warning: Failed to parse section_ranges JSON: {e}", file=sys.stderr)

            merger = MergeEngine()
            merged_list, missing_keys, missing_questions = merger.merge(
                questions, keys, args.course, args.exam_type, args.paper_name, args.subject, section_ranges
            )
            with open(merged_json_path, "w", encoding="utf-8") as f:
                json.dump(merged_list, f, indent=2, ensure_ascii=False)
                
            # 4. Validation Engine (strict binary PASS/FAIL)
            validator = ValidationEngine()
            validated_list, status = validator.validate(
                merged_list, len(questions), len(keys), missing_keys, missing_questions
            )
            with open(validated_json_path, "w", encoding="utf-8") as f:
                json.dump(validated_list, f, indent=2, ensure_ascii=False)
                
            # 5. Report Generation
            duration = time.time() - start_time
            report = ReportGenerator.generate_report(
                import_id=args.import_id,
                course=args.course,
                exam_type=args.exam_type,
                paper_name=args.paper_name,
                subject=args.subject,
                questions_found=len(questions),
                questions_validated=len(validated_list),
                questions_imported=0,
                duplicates=0,
                rejected=0,
                elapsed_time=duration,
                status=status,
                uploaded_by=args.uploaded_by,
                mongo_uri=args.mongo_uri
            )
            with open(report_json_path, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
                
            # Output preview info to stdout
            print(json.dumps({
                'report': report,
                'preview': validated_list[:10]
            }))
            
        except Exception as e:
            duration = time.time() - start_time
            error_report = ReportGenerator.generate_report(
                import_id=args.import_id,
                course=args.course,
                exam_type=args.exam_type,
                paper_name=args.paper_name,
                subject=args.subject,
                questions_found=0,
                questions_validated=0,
                questions_imported=0,
                duplicates=0,
                rejected=0,
                elapsed_time=duration,
                status="FAIL",
                uploaded_by=args.uploaded_by,
                error_msg=str(e),
                mongo_uri=args.mongo_uri
            )
            with open(report_json_path, "w", encoding="utf-8") as f:
                json.dump(error_report, f, indent=2, ensure_ascii=False)
                
            print(f"[FATAL PARSER EXCEPTION] Intermediate debug logs retained at: {imports_dir}", file=sys.stderr)
            print(json.dumps({
                'report': error_report,
                'preview': []
            }), file=sys.stderr)
            sys.exit(1)

    elif args.action == "import":
        # Confirm import stage (commit to database)
        try:
            if not os.path.exists(validated_json_path) or not os.path.exists(report_json_path):
                raise FileNotFoundError("Missing validated questions or report schema from imports folder.")
                
            with open(validated_json_path, "r", encoding="utf-8") as f:
                validated_list = json.load(f)
                
            with open(report_json_path, "r", encoding="utf-8") as f:
                report = json.load(f)

            # 6. Database Importer
            importer = DatabaseImporter(args.mongo_uri)
            inserted, duplicates, rejected = importer.import_questions(
                validated_list, import_mode=args.import_mode, uploaded_by=args.uploaded_by
            )

            duration = time.time() - start_time
            
            # Save import history in MongoDB
            client = MongoClient(args.mongo_uri)
            db = client["kr_academy"]
            history_col = db["importhistories"]
            
            history_doc = {
                'import_id': args.import_id,
                'parser_version': 'v1.0',
                'uploaded_at': time.strftime("%Y-%m-%d %H:%M:%S"),
                'uploaded_by': args.uploaded_by,
                'course': args.course,
                'exam_type': args.exam_type,
                'paper_name': args.paper_name,
                'subject': args.subject,
                'questions_found': report['questions_found'],
                'questions_validated': report['questions_validated'],
                'questions_imported': inserted,
                'duplicates': duplicates,
                'rejected': rejected,
                'elapsed_time': f"{duration:.2f}s",
                'status': 'PASS'
            }
            history_col.insert_one(history_doc)
            
            # Update final report
            final_report = ReportGenerator.generate_report(
                import_id=args.import_id,
                course=args.course,
                exam_type=args.exam_type,
                paper_name=args.paper_name,
                subject=args.subject,
                questions_found=report['questions_found'],
                questions_validated=report['questions_validated'],
                questions_imported=inserted,
                duplicates=duplicates,
                rejected=rejected,
                elapsed_time=duration,
                status="PASS",
                uploaded_by=args.uploaded_by,
                mongo_uri=args.mongo_uri
            )
            
            # Write final report (do NOT delete intermediate files or imports directory)
            with open(report_json_path, "w", encoding="utf-8") as f:
                json.dump(final_report, f, indent=2, ensure_ascii=False)
                
            print(json.dumps(final_report))

        except Exception as e:
            duration = time.time() - start_time
            print(json.dumps({
                'import_id': args.import_id,
                'status': 'FAIL',
                'error_message': f"DB Transaction Commit Failed: {str(e)}",
                'elapsed_time': f"{duration:.2f}s"
            }), file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
