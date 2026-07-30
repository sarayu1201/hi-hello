import os
import fitz

pdf_path = os.path.join(os.path.dirname(__file__), "..", "sbi po questions", "IBPS-PO-Pre-2022-15th-October-Shift-Wise-Previous-Year-Papers-Mock-03.pdf")

doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

# Search for solution of Q31
found = False
for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    if "S31. Ans." in text or "Ans.(b)" in text or "Ans.(c)" in text:
        if "Sol." in text or "S31." in text:
            print(f"\nFOUND SOLUTION PAGE: {page_num + 1}")
            lines = text.split("\n")
            for idx, line in enumerate(lines):
                if "S31." in line or "Ans." in line:
                    start = max(0, idx - 2)
                    end = min(len(lines) - 1, idx + 15)
                    print(f"\n--- Solution Context (Lines {start}-{end}) ---")
                    for j in range(start, end + 1):
                        print(f"  Line {j}: {lines[j]}")
                    print("------------------------------------\n")
            found = True

if not found:
    print("Could not find explanation page automatically.")
doc.close()
