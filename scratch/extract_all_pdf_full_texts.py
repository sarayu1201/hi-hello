import fitz
import os

pdf_dir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk"
out_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"
os.makedirs(out_dir, exist_ok=True)

pdf_files = [
    "IBPS_Clerk_Prelims_2019_Memory_Based_Paper_For_Practice.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2020.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2021.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2022.pdf",
    "IBPS CLERK PRELIMS SOLVED PAPER-2023.pdf",
    "ibps-clerk-question-paper-2022.pdf",
    "ibps-clerk-question-paper-2023.pdf",
    "IBPS-Clerk-Pre-2024-Memory-Based-Paper-Based-on-24th-August-1st-Shift.pdf",
    "IBPS-Clerk-Pre-2025-Memory-Based-Paper-Based-on-4-Oct-1st-Shift.pdf",
    "ibps-clerk-5-october-english-question-paper.pdf"
]

for idx, filename in enumerate(pdf_files, 1):
    path = os.path.join(pdf_dir, filename)
    if not os.path.exists(path):
        print(f"Skipping (not found): {filename}")
        continue
    print(f"Extracting Test {idx}: {filename}...")
    try:
        doc = fitz.open(path)
        full_text = []
        for p in doc:
            full_text.append(p.get_text())
        doc.close()
        
        out_path = os.path.join(out_dir, f"test{idx}_text.txt")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(full_text))
        print(f"  Saved to: {out_path}")
    except Exception as e:
        print(f"  Error: {e}")
