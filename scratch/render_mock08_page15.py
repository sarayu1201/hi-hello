import os
import fitz
from pathlib import Path

pdf_path = Path(__file__).parent.parent / "sbi po questions" / "IBPS-PO-Pre-2022-16th-October-Shift-Wise-Previous-Year-Papers-Mock-08.pdf"
dest_dir = Path("C:/Users/LENOVO/.gemini/antigravity-ide/brain/2c767794-1854-4b5d-9e5f-fcb36b865f91")

doc = fitz.open(pdf_path)
page = doc[14] # Page 15
pix = page.get_pixmap(dpi=150)
img_name = "test_7_q_50_options.png"
pix.save(dest_dir / img_name)
print(f"Rendered Page 15 and saved to {dest_dir / img_name}")
doc.close()
