import json
import os
import fitz
from parse_all_clerk_pdfs_final import parse_pdf_text

pdf_dir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk"
pdf_path = os.path.join(pdf_dir, "IBPS_Clerk_Prelims_2019_Memory_Based_Paper_For_Practice.pdf")

doc = fitz.open(pdf_path)
full_text = [page.get_text() for page in doc]
doc.close()

parsed_questions, _ = parse_pdf_text("\n".join(full_text), 1)

# Display Q36 is parsed ID 36
parsed_q36 = next(q for q in parsed_questions if q["id"] == 36)

print("=== PARSED QUESTION 36 ===")
print("Question Text:", repr(parsed_q36["question"]))
print("Explanation:", repr(parsed_q36["explanation"]))
