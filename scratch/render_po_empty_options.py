import os
import json
import fitz  # PyMuPDF
from pathlib import Path

# 1. Identify the 10 questions with empty options
json_dir = Path(__file__).parent.parent / "QuestionBank" / "json" / "ibps_po_prelims"
pdf_dir = Path(__file__).parent.parent / "sbi po questions"

# Map JSON tests to PDF files
pdf_mapping = {
    1: "IBPS-PO-Pre-2022-15th-October-Shift-Wise-Previous-Year-Papers-Mock-02.pdf",
    2: "IBPS-PO-Pre-2022-15th-October-Shift-Wise-Previous-Year-Papers-Mock-03.pdf",
    3: "IBPS-PO-Pre-2022-15th-October-Shift-Wise-Previous-Year-Papers-Mock-04.pdf",
    4: "IBPS-PO-Pre-2022-16th-October-Shift-Wise-Previous-Year-Papers-Mock-05-1.pdf",
    5: "IBPS-PO-Pre-2022-16th-October-Shift-Wise-Previous-Year-Papers-Mock-06-1.pdf",
    6: "IBPS-PO-Pre-2022-16th-October-Shift-Wise-Previous-Year-Papers-Mock-07.pdf",
    7: "IBPS-PO-Pre-2022-16th-October-Shift-Wise-Previous-Year-Papers-Mock-08.pdf",
    8: "IBPS-PO-Pre-2023-23rd-September-Shift-Wise-Previous-Year-Paper-Mock-03.pdf",
    9: "IBPS-PO-Pre-2023-23rd-September-Shift-Wise-Previous-Year-Paper-Mock-04-562160-1.pdf",
    10: "IBPS-PO-Pre-2023-30th-September-Shift-Wise-Previous-Year-Paper-Mock-01-562159-1.pdf"
}

print("=== Scanning current local JSON files on disk ===")
empty_questions = []
for test_num in range(1, 11):
    json_path = json_dir / f"ibpspo_test_{test_num}.json"
    if not json_path.exists():
        continue
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
    for q in questions:
        if not q.get("options"):
            continue
        # We replaced empty options with "None of these" in our previous run
        # So we look for questions where all 5 options are "None of these"
        all_none = all(opt.get("text") == "None of these" for opt in q["options"])
        if all_none:
            empty_questions.append({
                "test": test_num,
                "q_id": q["id"],
                "subject": q["subject"],
                "pdf": pdf_mapping[test_num]
            })

print(f"Found {len(empty_questions)} questions with empty options:")
for eq in empty_questions:
    print(f"  Test {eq['test']} Q{eq['q_id']} ({eq['subject']}) -> PDF: {eq['pdf']}")

# 2. Render pages from PDFs to find the text
output_img_dir = Path(__file__).parent / "empty_options_render"
output_img_dir.mkdir(exist_ok=True)

print("\n=== Rendering PDF pages to PNG ===")
for eq in empty_questions:
    pdf_path = pdf_dir / eq["pdf"]
    if not pdf_path.exists():
        print(f"PDF {eq['pdf']} not found.")
        continue
        
    doc = fitz.open(pdf_path)
    # Search for "Q" + ID + "." on pages
    q_str = f"Q{eq['q_id']}."
    target_page = -1
    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        if q_str in text:
            target_page = page_num
            break
            
    if target_page != -1:
        print(f"Found Q{eq['q_id']} on page {target_page + 1} of {eq['pdf']}. Rendering page...")
        page = doc[target_page]
        pix = page.get_pixmap(dpi=150)
        img_name = f"test_{eq['test']}_q_{eq['q_id']}.png"
        pix.save(output_img_dir / img_name)
        print(f"  Saved page to {output_img_dir / img_name}")
    else:
        print(f"Could not locate Q{eq['q_id']}. in {eq['pdf']}.")
    doc.close()
