import os
import fitz

pdf_path = os.path.join(os.path.dirname(__file__), "..", "sbi po questions", "IBPS-PO-Pre-2022-15th-October-Shift-Wise-Previous-Year-Papers-Mock-03.pdf")
doc = fitz.open(pdf_path)
page = doc[9]  # Page 10

blocks = page.get_text("rawdict")["blocks"]
for b in blocks:
    if "lines" not in b:
        continue
    for line in b["lines"]:
        line_text = ""
        for span in line["spans"]:
            for char in span["chars"]:
                line_text += char["c"]
        if "(a)" in line_text or "(b)" in line_text or "(c)" in line_text or "(d)" in line_text or "(e)" in line_text:
            print(f"Line: {line_text}")
            print(f"  Spans: {[{'font': s['font'], 'text': ''.join(c['c'] for c in s['chars'])} for s in line['spans']]}")

doc.close()
