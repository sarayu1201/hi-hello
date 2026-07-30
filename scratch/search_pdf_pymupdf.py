import os
import fitz  # PyMuPDF

pdf_dir = os.path.join(os.path.dirname(__file__), "..", "sbi po questions")
search_terms = [
    "working from Office",
    "working from Home",
    "selling price of article S",
    "more or less than selling price of article S",
    "find the cost price of article R"
]

print("Scanning PDFs for target questions...\n")

pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]

for pdf_file in pdf_files:
    pdf_path = os.path.join(pdf_dir, pdf_file)
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            for term in search_terms:
                if term.lower() in text.lower():
                    print(f"FOUND MATCH in {pdf_file} on Page {page_num + 1}:")
                    print(f"  Matched term: '{term}'")
                    # Print context around matching line
                    lines = text.split("\n")
                    for idx, line in enumerate(lines):
                        if term.lower() in line.lower():
                            start = max(0, idx - 5)
                            end = min(len(lines) - 1, idx + 10)
                            print(f"\n--- Context (Lines {start}-{end}) ---")
                            for j in range(start, end + 1):
                                print(f"  Line {j}: {lines[j]}")
                            print("------------------------------------\n")
                    doc.close()
                    break
    except Exception as e:
        print(f"Error reading {pdf_file}: {e}")
