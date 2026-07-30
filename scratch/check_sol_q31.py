import os
import fitz

pdf_path = os.path.join(os.path.dirname(__file__), "..", "sbi po questions", "IBPS-PO-Pre-2022-15th-October-Shift-Wise-Previous-Year-Papers-Mock-03.pdf")
doc = fitz.open(pdf_path)

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    if "S31. Ans." in text:
        print(f"Page {page_num + 1}:")
        idx = text.find("S31. Ans.")
        # Print 500 characters after the match
        print(text[idx:idx+800])
        print("="*40)
doc.close()
