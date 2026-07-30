import os
import re

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

for i in range(1, 11):
    file_path = os.path.join(dumps_dir, f"test{i}_text.txt")
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    print(f"\n=================== Test {i} ===================")
    
    # Check common headers (case-insensitive)
    for term in ["solutions", "answers & explanations", "answers", "detailed solutions", "hints & solutions", "hints"]:
        idx = text.lower().find(term)
        if idx != -1:
            line_num = text[:idx].count("\n") + 1
            print(f"Found candidate header: '{term}' on line {line_num}")
            
    # Sample last 500 chars to see what it ends like
    print("End snippet:")
    lines = text.split("\n")
    for line in lines[-15:]:
        if line.strip():
            print(f"  {line.strip()}")
            
    # Try finding question markers in the last 2000 chars of the file to see how answers look
    end_text = "\n".join(lines[-100:])
    ans_markers = re.findall(r'(\d+)\.\s*\(([a-e])\)', end_text)
    if ans_markers:
        print("Detected answer key markers (e.g. 95. (b)):", ans_markers[:5])
    else:
        # Try other format like "95. Ans.(b)" or "95. Ans (b)"
        ans_markers_ans = re.findall(r'(\d+)\.\s*Ans\.?\s*\(([a-e])\)', end_text, re.IGNORECASE)
        if ans_markers_ans:
            print("Detected answer key markers (e.g. 95. Ans.(b)):", ans_markers_ans[:5])
        else:
            # Try simple letter "95. b" or "95. (b)"
            ans_markers_simple = re.findall(r'(\d+)\.\s*\b([a-e])\b', end_text)
            if ans_markers_simple:
                print("Detected answer key markers (e.g. 95. b):", ans_markers_simple[:5])
