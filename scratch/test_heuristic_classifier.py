import re
import os

dumps_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\scratch\\clerk_text_dumps"

def classify_question(q_num, q_text, options, explanation):
    q_text_l = q_text.lower()
    exp_l = explanation.lower()
    opt_text_l = " ".join([o["text"].lower() for o in options])
    
    # 1. Quantitative Aptitude indicators
    math_words = [
        "interest", "compound", "simple", "upstream", "downstream", "boat", "stream", 
        "speed", "train", "km/hr", "ratio", "mixture", "vessel", "milk", "water", 
        "alcohol", "spirit", "average", "profit", "loss", "discount", "marked price", 
        "cost price", "selling price", "partnership", "invested", "investment", "share", 
        "perimeter", "area", "circumference", "radius", "length", "breadth", "height", 
        "work", "men", "women", "days", "hours", "efficiency", "probability", "bag", 
        "balls", "red", "blue", "green", "ball", "card", "cards", "dice", "number series", 
        "series", "missing number", "wrong number", "quadratic", "equation", "x2", "y2", 
        "simplification", "approximate", "approximation", "sum", "difference", "product", 
        "percentage", "fraction", "%", "divided by", "multiplied by", "remainder", 
        "age", "years", "year", "p.a.", "rs.", "rs", "rupees", "cm", "m", "litres", "litre",
        "kiwi", "plum", "kiwis", "plums", "visiting", "visited", "resident", "residents", 
        "sold", "sales", "books", "book", "cost", "price", "income", "expenditure", 
        "population", "pollution"
    ]
    
    # 2. Reasoning Ability indicators
    reasoning_words = [
        "seating", "circular", "linear", "row", "facing", "north", "south", "east", 
        "west", "floor", "box", "boxes", "puzzle", "blood relation", "mother", "father", 
        "son", "daughter", "brother", "sister", "wife", "husband", "grandfather", 
        "grandmother", "uncle", "aunt", "nephew", "niece", "cousin", "born", "month", 
        "date", "year of birth", "syllogism", "conclusion", "conclusions", "statements", 
        "statement", "follows", "does not follow", "inequality", "relations", "relationship", 
        "coded", "code", "coding", "decoding", "series", "alphanumeric", "symbol", 
        "preceded", "followed", "vowel", "consonant", "digit", "digits", "numbers", 
        "letters", "alphabetical", "meaningful word", "direction", "distance", "turns", 
        "left", "right", "degree", "shadow", "rank", "ranking", "queue"
    ]
    
    # 3. English Language indicators
    english_words = [
        "passage", "comprehension", "author", "according to", "writer", "view", 
        "grammatical", "error", "grammatically", "correct", "incorrect", "spelling", 
        "misspelt", "synonym", "antonym", "meaning", "suitable word", "phrase", "idiom", 
        "cloze test", "blank", "blanks", "fit in", "rearrangement", "rearrange", 
        "sentences", "sentence", "paragraph", "highlighted", "bold", "postponing", 
        "delaying", "sleep deprivation", "insomnia", "adage", "agrarian", "hunter-gatherer",
        "nomadic", "wanderer", "itinerant", "accompany", "abundant", "coarse", "diligent",
        "obstacle", "obsolete", "candid", "frugal", "replenish", "glucose", "beta-amyloid"
    ]
    
    # Check Math / Greek characters or symbols
    if re.search(r'[\u03c5-\u03c9÷×√∛?]', q_text) or "%" in q_text or "=" in q_text or "+" in q_text or "-" in q_text or "/" in q_text or "𝑥" in q_text or "𝑦" in q_text:
        return "Quantitative Aptitude"
        
    # Inequality characters
    if "≥" in q_text or "≤" in q_text or ">" in q_text or "<" in q_text or "≠" in q_text:
        return "Reasoning Ability"
        
    # Count occurrences
    math_score = sum(1 for w in math_words if w in q_text_l or w in exp_l or w in opt_text_l)
    reason_score = sum(1 for w in reasoning_words if w in q_text_l or w in exp_l or w in opt_text_l)
    eng_score = sum(1 for w in english_words if w in q_text_l or w in exp_l or w in opt_text_l)
    
    # Bias weights based on features
    # If the options are extremely short and contain single numbers, it's Quantitative Aptitude
    if len(options) > 0 and all(re.match(r'^\s*\d+(\.\d+)?\s*$', o["text"]) for o in options if o["text"].strip()):
        math_score += 10
        
    # If options are English words (like verbs or adjectives), it's English
    if len(options) > 0 and all(re.match(r'^\s*[a-zA-Z]+\s*$', o["text"]) for o in options if o["text"].strip()) and len(options[0]["text"]) > 2:
        eng_score += 5

    # Resolve
    scores = {"English Language": eng_score, "Quantitative Aptitude": math_score, "Reasoning Ability": reason_score}
    max_subj = max(scores, key=scores.get)
    if scores[max_subj] > 0:
        return max_subj
    return "Unknown"

def test_classification():
    for test_idx in range(1, 11):
        file_path = os.path.join(dumps_dir, f"test{test_idx}_text.txt")
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
            
        sol_idx = -1
        header_match = re.search(r'^\s*(SOLUTIONS|ANSWERS & EXPLANATIONS|ANSWERS|DETAILED SOLUTIONS|HINTS & SOLUTIONS|HINTS)\s*$', text, re.MULTILINE | re.IGNORECASE)
        if header_match:
            sol_idx = header_match.start()
        else:
            first_sol_match = re.search(r'^\s*S?1\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', text, re.MULTILINE | re.IGNORECASE)
            if not first_sol_match:
                first_sol_match = re.search(r'^\s*S?1\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', text, re.MULTILINE | re.IGNORECASE)
            if first_sol_match:
                sol_idx = first_sol_match.start()
                
        questions_text = text[:sol_idx]
        solutions_text = text[sol_idx:]
        
        # Parse Questions
        pattern = r'(?:^\s*(?:Q\s*\.?\s*)?([1-9]\d*)\s*\.\s*(?!\d)|(?<=[a-zA-Z])Q([1-9]\d*)\s*\.\s*(?!\d))'
        q_matches = list(re.finditer(pattern, questions_text, re.MULTILINE | re.IGNORECASE))
        
        seen_nums = set()
        filtered_q_matches = []
        for m in q_matches:
            num_str = m.group(1) or m.group(2)
            num = int(num_str)
            if 1 <= num <= 100 and num not in seen_nums:
                seen_nums.add(num)
                filtered_q_matches.append((num, m))
                
        filtered_q_matches.sort(key=lambda x: x[1].start())
        
        questions = {}
        for idx, (q_num, match) in enumerate(filtered_q_matches):
            start_pos = match.end()
            end_pos = filtered_q_matches[idx + 1][1].start() if idx + 1 < len(filtered_q_matches) else len(questions_text)
            
            q_body_raw = questions_text[start_pos:end_pos].strip()
            
            options = []
            q_text = q_body_raw
            
            opt_matches = list(re.finditer(r'\(([a-e])\)\s*', q_body_raw))
            if opt_matches:
                q_text = q_body_raw[:opt_matches[0].start()].strip()
                for o_idx, opt_match in enumerate(opt_matches):
                    opt_letter = opt_match.group(1).upper()
                    opt_start = opt_match.end()
                    opt_end = opt_matches[o_idx + 1].start() if o_idx + 1 < len(opt_matches) else len(q_body_raw)
                    opt_val = q_body_raw[opt_start:opt_end].strip()
                    options.append({"id": opt_letter, "text": opt_val})
                    
            questions[q_num] = {"question": q_text, "options": options}
            
        # Parse Solutions
        sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\(([a-e])\)', solutions_text, re.MULTILINE | re.IGNORECASE))
        if len(sol_matches) < 20:
            sol_matches = list(re.finditer(r'^\s*S?(\d+)\s*\.\s*(?:Ans\.?\s*)?\s*([a-e])\b', solutions_text, re.MULTILINE | re.IGNORECASE))
            
        solutions = {}
        for idx, match in enumerate(sol_matches):
            s_num = int(match.group(1))
            start_pos = match.end()
            end_pos = sol_matches[idx + 1].start() if idx + 1 < len(sol_matches) else len(solutions_text)
            solutions[s_num] = solutions_text[start_pos:end_pos].strip()
            
        # Majority voting
        def get_majority(nums):
            votes = {"English Language": 0, "Quantitative Aptitude": 0, "Reasoning Ability": 0}
            for q_num in nums:
                q = questions.get(q_num, {"question": "", "options": []})
                sol_exp = solutions.get(q_num, "")
                subj = classify_question(q_num, q["question"], q["options"], sol_exp)
                if subj in votes:
                    votes[subj] += 1
            return max(votes, key=votes.get)
            
        subj1 = get_majority([5, 10, 15, 20, 25])
        subj2 = get_majority([40, 45, 50, 55, 60])
        subj3 = get_majority([75, 80, 85, 90, 95])
        
        print(f"Test {test_idx} Sections: 1 -> {subj1} | 2 -> {subj2} | 3 -> {subj3}")

test_classification()
