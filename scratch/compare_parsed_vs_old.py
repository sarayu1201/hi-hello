import json
import os
import fitz # PyMuPDF
import re

# Temporary parser logic for Test 1
from parse_all_clerk_pdfs_final import parse_pdf_text

pdf_dir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk"
pdf_path = os.path.join(pdf_dir, "IBPS_Clerk_Prelims_2019_Memory_Based_Paper_For_Practice.pdf")

doc = fitz.open(pdf_path)
full_text = [page.get_text() for page in doc]
doc.close()

parsed_questions, _ = parse_pdf_text("\n".join(full_text), 1)

# Find Q32 in parsed
parsed_q32 = next(q for q in parsed_questions if q["id"] == 32)

# Load old JSON Q32
old_json_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims\\ibps_clerk_prelims_test1.json"
with open(old_json_path, "r", encoding="utf-8") as f:
    old_data = json.load(f)
old_q32 = next(q for q in old_data if q["id"] == 32)

print("=== QUESTION 32 COMPARISON ===")
print("\n--- FROM YOUR OLD JSON FILE ---")
print("Question Text:", repr(old_q32["question"]))
print("Explanation:", repr(old_q32["explanation"]))

print("\n--- REGENERATED FROM PDF USING OUR UPDATED PARSER ---")
print("Question Text:", repr(parsed_q32["question"]))
print("Explanation:", repr(parsed_q32["explanation"]))
