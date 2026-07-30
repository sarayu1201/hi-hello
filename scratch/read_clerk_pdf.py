import fitz  # PyMuPDF
import os

pdf_path = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk\\IBPS CLERK PRELIMS SOLVED PAPER-2020.pdf"
out_txt_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_2020_pdf_text.txt"

if not os.path.exists(pdf_path):
    print("PDF not found at:", pdf_path)
else:
    print("Extracting text from:", pdf_path)
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    full_text = []
    for i, page in enumerate(doc):
        full_text.append(f"=== PAGE {i+1} ===")
        full_text.append(page.get_text())
        
    with open(out_txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(full_text))
        
    print("Text successfully extracted and saved to:", out_txt_path)
    doc.close()
