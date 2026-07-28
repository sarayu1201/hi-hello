import docx
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document(r"C:\Users\Administrator\Downloads\sbi po prelims\SBI-PO-Pre-2025-Memory-Based-Paper-Based-on-4th-August-1st-Shift (1).docx")

print("--- Inspecting all tables in Test 9 ---")
for t_idx, t in enumerate(doc.tables):
    for r_idx, r in enumerate(t.rows):
        for c_idx, c in enumerate(r.cells):
            txt = c.text.strip()
            if any(k in txt for k in ['Q39', 'Q45', 'Q59', 'Q60', 'Q61', 'Q76', 'Q77', 'Q78', 'Syllogism', 'Statements']):
                print(f"Table {t_idx} R{r_idx} C{c_idx}:")
                print(txt)
                print("="*40)

