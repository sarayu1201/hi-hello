import fitz
import os

pdf_dir = "C:\\Users\\LENOVO\\Downloads\\ibps clerk\\ibps clerk"
failing_files = [
    "IBPS_Clerk_Prelims_2019_Memory_Based_Paper_For_Practice.pdf",
    "ibps-clerk-question-paper-2022.pdf",
    "ibps-clerk-question-paper-2023.pdf",
    "IBPS-Clerk-Pre-2024-Memory-Based-Paper-Based-on-24th-August-1st-Shift.pdf",
    "IBPS-Clerk-Pre-2025-Memory-Based-Paper-Based-on-4-Oct-1st-Shift.pdf",
    "ibps-clerk-5-october-english-question-paper.pdf"
]

for filename in failing_files:
    path = os.path.join(pdf_dir, filename)
    if not os.path.exists(path):
        continue
    print(f"\n=================== File: {filename} ===================")
    doc = fitz.open(path)
    print(f"Total Pages: {len(doc)}")
    
    # Extract the last 2 pages to search for section headings
    last_pages_text = []
    start_page = max(0, len(doc) - 3)
    for p_num in range(start_page, len(doc)):
        last_pages_text.append(f"--- PAGE {p_num + 1} ---")
        last_pages_text.append(doc[p_num].get_text())
        
    text_snippet = "\n".join(last_pages_text)
    
    # Look for common header words (case-insensitive)
    for header in ["solution", "answer", "key", "explanation", "hint"]:
        matches = [line for line in text_snippet.split("\n") if header in line.lower()]
        if matches:
            print(f"Potential headers containing '{header}':")
            for m in matches[:10]:
                print(f"  - {m.strip()}")
                
    doc.close()
