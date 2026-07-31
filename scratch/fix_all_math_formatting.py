import json
import os
import re

json_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims"

scrambled_replacements = {
    # Test 2 Q32
    (2, 32): {
        "question": "(?)^3 + 12^2 = 656",
        "explanation": "; (?)^3 + 144 = 656 \n ?^3 = 512 \n ? = 8"
    },
    # Test 2 Q34
    (2, 34): {
        "question": "∛1728 ÷ 12 + √121 + ? = 32",
        "explanation": "; ∛1728 ÷ 12 + √121 + ? = 32 \n 12/12 + 11 + ? = 32 \n 1 + 11 + ? = 32 \n ? = 20"
    },
    # Test 2 Q35
    (2, 35): {
        "question": "16^2 + 192 + 6^2 = ?^2",
        "explanation": "; 16^2 + 192 + 6^2 = ?^2 \n 256 + 192 + 36 = ?^2 \n ?^2 = 484 \n ? = 22"
    },
    # Test 2 Q40
    (2, 40): {
        "question": "(1782 ÷ 264) × (2300 ÷ 115) = ? × (27 ÷ 24) × 80",
        "explanation": "; (1782 ÷ 264) × (2300 ÷ 115) = ? × (27 ÷ 24) × 80 \n 6.75 × 20 = ? × 1.125 × 80 \n 135 = ? × 90 \n ? = 135 / 90 = 1.5"
    },
    # Test 3 Q40
    (3, 40): {
        "question": "432 + 9^2 - 3/3 = ?^3",
        "explanation": "; 432 + 9^2 - 3/3 = ?^3 \n 432 + 81 - 1 = ?^3 \n ?^3 = 512 \n ? = 8"
    },
    # Test 4 Q47
    (4, 47): {
        "question": "√(14400) × √(8100) - 60^2 = ? + 80^2",
        "explanation": "; √(14400) × √(8100) - 60^2 = ? + 80^2 \n 120 × 90 – 3600 = ? + 6400 \n 10800 – 10000 = ? \n ? = 800"
    },
    # Test 4 Q48
    (4, 48): {
        "question": "√(1225) × 12 + √(4900) - 19^2 = ?",
        "explanation": "; √(1225) × 12 + √(4900) - 19^2 = ? \n 35 × 12 + 70 – 361 = ? \n ? = 129"
    },
    # Test 4 Q51:
    (4, 51): {
        "question": "20% of 450 + ∛216 - 82 = ?",
        "explanation": "; 20% of 450 + ∛216 - 82 = ? \n 90 + 6 – 82 = ? \n ? = 14"
    },
    # Test 4 Q55:
    (4, 55): {
        "question": "55% of 700 + ∛3375 - 12^2 = ?^2",
        "explanation": "; 55% of 700 + ∛3375 - 12^2 = ?^2 \n 385 + 15 – 144 = ?^2 \n 256 = ?^2 \n ? = 16"
    },
    # Test 4 Q56:
    (4, 56): {
        "question": "486 ÷ 27 + ∛2197 - 6 × 5 = ?",
        "explanation": "; 486 ÷ 27 + ∛2197 - 6 × 5 = ? \n 18 + 13 – 30 = ? \n ? = 1"
    },
    # Test 4 Q60:
    (4, 60): {
        "question": "13^2 - 4^3 - √676 + 4 = ?",
        "explanation": "; 13^2 - 4^3 - √676 + 4 = ? \n 169 – 64 – 26 + 4 = ? \n ? = 83"
    }
}

def clean_fractions(text):
    if not isinstance(text, str) or not text:
        return text
        
    # Replace specific decimals first
    text = text.replace("100 93.75", "100/93.75")
    text = text.replace("273 0.5", "273/0.5")
    
    # 1. Mixed fractions like 4 2 3 -> 4 2/3, 13 1 3 -> 13 1/3, 6 1 4 -> 6 1/4
    text = re.sub(r'\b(\d+)\s+(\d+)\s+(\d+)\b', r'\1 \2/\3', text)
    
    # 2. Fractions where denominator starts with x or y (like 162 x+6)
    text = re.sub(r'\b(\d+)\s+([xy][+\-]\d+)\b(?!/)', r'\1/(\2)', text)
    
    # 3. Expressions with brackets or variables in denominator (like 100 100+x)
    text = re.sub(r'\b(\d+)\s+(100[+\-][a-zA-Z])\b(?!/)', r'\1/(\2)', text)
    text = re.sub(r'\b(\d+)\s+(10000[+\-]x2)\b(?!/)', r'\1/(\2)', text)
    text = re.sub(r'\b(\d+)\s+(\(100\)2\-x2)\b(?!/)', r'\1/(\2)', text)
    text = re.sub(r'\b(4x\+8x−6)\s+(2)\b(?!/)', r'(\1)/\2', text)
    
    # 4. Expressions with large sums/differences in numerator (like 250+370+420+400 4)
    # Require at least one + or − operator to avoid matching single numbers
    text = re.sub(r'\b(\d+(?:\+\d+)+)\s+(\d+)\b(?!/)', r'(\1)/\2', text)
    text = re.sub(r'\b(\d+(?:−\d+)+)\s+(\d+)\b(?!/)', r'(\1)/\2', text)
    text = re.sub(r'\b(\([\d×]+\)−\([\d×]+\))\s+(\d+)\b(?!/)', r'\1/\2', text)
    
    # 5. Simple fractions like 1 2 -> 1/2, 3 5 -> 3/5, 14 3 -> 14/3, 112 30 -> 112/30
    # Avoid years or decimals using negative lookarounds. Also ensure it's not followed by a slash (?!/)
    def repl(match):
        num1 = match.group(1)
        num2 = match.group(2)
        if len(num1) == 4 and len(num2) == 4:
            return match.group(0)  # Keep years separate
        return f"{num1}/{num2}"
        
    text = re.sub(r'(?<!\.)\b(\d+)\s+(\d+)\b(?!\.|/)', repl, text)
    
    # Replace some isolated formatting issues
    text = text.replace("360 ? = 73 + 33", "360 ÷ ? = 73 + 27")
    
    return text

def run():
    print("=== Reconstructing and repairing math questions ===")
    
    for test_idx in range(1, 11):
        json_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{test_idx}.json")
        if not os.path.exists(json_path):
            continue
            
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for q in data:
            q_id = q["id"]
            
            # 1. Apply scrambled question overrides
            if (test_idx, q_id) in scrambled_replacements:
                rep = scrambled_replacements[(test_idx, q_id)]
                q["question"] = rep["question"]
                q["q"] = rep["question"]
                q["explanation"] = rep["explanation"]
                print(f"Test {test_idx} Q{q_id}: Fixed scrambled math equation.")
                continue
                
            # 2. Clean space gaps inside Quantitative Aptitude / Numerical Ability
            if q["subject"] in ["Quantitative Aptitude", "Numerical Ability"]:
                q["question"] = clean_fractions(q["question"])
                q["q"] = q["question"]
                q["explanation"] = clean_fractions(q["explanation"])
                for opt in q["options"]:
                    opt["text"] = clean_fractions(opt["text"])
                    
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
    print("\n=== All Math Formatting Repairs Complete! ===")

if __name__ == "__main__":
    run()
