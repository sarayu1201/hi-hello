import os
import json
import re
from pymongo import MongoClient

def clean_latex_field(text):
    if not text:
        return text
        
    # 0. Pre-clean common typos and merged variables/commands
    words_to_split = [
        "If", "if", "Given", "given", "Then", "then", "is", "of", "be", "and", 
        "to", "the", "a", "such", "that", "hence", "Therefore", "therefore", 
        "where", "will", "obtain", "obtained", "find", "Simplify", "simplify", 
        "Let", "let", "complete", "remaining", "occupies", "by", "for", "with"
    ]
    for w in words_to_split:
        text = re.compile(r'\b' + w + r'([x-za-c])\b').sub(w + r' \1', text)
        text = re.compile(r'(?<=\$)' + w + r'([x-za-c])\b').sub(w + r' \1', text)

    # Specific common fixes
    text = text.replace("ifsin", "if \\sin").replace("ofsin", "of \\sin")
    text = text.replace("circandsin", "circ and \\sin")
    text = text.replace("obtaina\\times", "obtain a \\times")
    text = text.replace("obtaina\\", "obtain a \\")
    text = text.replace("obtain\\", "obtain \\")
    text = text.replace("geta\\", "get a \\")
    text = text.replace("be\\frac", "be \\frac")
    text = text.replace("an\\dfrac", "and \\dfrac")
    text = text.replace("an\\frac", "and \\frac")
    text = text.replace("that\\dfrac", "that \\dfrac")
    text = text.replace("that\\frac", "that \\frac")
    
    # 1. Fix \d\frac, \d\dfrac, and stray \d
    text = re.sub(r'\\d\\frac', r'\\frac', text)
    text = re.sub(r'\\d\\dfrac', r'\\dfrac', text)
    text = re.sub(r'\\d(?=\\frac|\\dfrac)', '', text)
    text = re.sub(r'(?<!\\)d\\frac', r'\\frac', text)
    text = re.sub(r'(?<!\\)d\\dfrac', r'\\dfrac', text)
    
    # 2. Fix text{...} without backslash
    text = re.sub(r'(?<!\\)text\s*\{', r'\\text{', text)
    
    # 3. Clean up words directly followed by backslash commands using regex
    valid_commands = ["sin", "cos", "tan", "cot", "sec", "csc", "log", "ln", "deg", "div", "lim"]
    def insert_space_before_command(match):
        word = match.group(1)
        cmd = match.group(2)
        if word.lower() in valid_commands:
            return match.group(0)
        return f"{word} \\{cmd}"
    text = re.sub(r'\b([a-zA-Z]+)\\(sin|cos|tan|cot|sec|csc|log|ln|frac|dfrac|sqrt|le|ge|div|times|parallel|propto|left|right)\b', insert_space_before_command, text)

    # 4. Pull out leading common words from math blocks
    for word in words_to_split:
        text = re.sub(r'\$(?:' + word + r')\b\s*(\\(?:frac|dfrac|sqrt|sin|cos|tan|cot|sec|csc|log|ln|le|ge|div|times|parallel|propto|left|right))', r' ' + word + r' $\1', text)
        text = re.sub(r'\$(?:' + word + r')\b\s+([a-zA-Z\d\^_\+\-\*\/=<>~]+)\$', r' ' + word + r' $\1$', text)
        text = re.sub(r'\$(?:' + word + r')\b\$', r' ' + word + r' ', text)

    # 5. Pull out trailing common words/units from math blocks using word boundary
    words_to_pull_end = [
        "of", "is", "are", "then", "to", "the", "a", "and", "an", "radians", 
        "cm", "m", "m/s", "km/h", "km/hr"
    ]
    for word in words_to_pull_end:
        text = re.sub(r'(\\(?:frac|dfrac|sqrt|sin|cos|tan|cot)\{[^}]*\}\{[^}]*\})\s*\b(?:' + word + r')\b([:\.,\?]?)\$', r'\1$ ' + word + r'\2 ', text)
        text = re.sub(r'(\\(?:frac|dfrac|sqrt|sin|cos|tan|cot)\{[^}]*\})\s*\b(?:' + word + r')\b([:\.,\?]?)\$', r'\1$ ' + word + r'\2 ', text)
        text = re.sub(r'\$([^$]*?)\b(?:' + word + r')\b([:\.,\?]?)\$', r'$\1$ ' + word + r'\2 ', text)

    # 6. Move punctuation outside math blocks at the end of the block
    text = re.sub(r'(?<!\\)\$([^$]*?)([\.,\?!:;])\$', r'$\1$\2', text)

    # 7. Merge consecutive math blocks separated ONLY by operators, spaces, commas, or points
    while True:
        new_text = re.sub(r'\$([^$]*?)\$\s*([+\-*/=<>~,\s\.]*)\s*\$([^$]*?)\$', r'$\1 \2 \3$', text)
        if new_text == text:
            break
        text = new_text

    # 8. Correct spaces around $ and normalise spaces
    text = re.sub(r'\s{2,}', ' ', text)
    text = text.replace(" $", " $").replace("$ ", "$ ")
    # Clean up empty math blocks like $$
    text = text.replace("$$", "")
    
    return text.strip()

def run_fix():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    cgl_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    env_path = os.path.join(root_dir, "backend", ".env")
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                mongo_uri = line.split("MONGODB_URI=")[1].strip()
                break
                
    match = re.match(r'mongodb\+srv://([^:]+):([^@]+)@cluster0\.l1t116x\.mongodb.net/([^?]+)\?(.*)', mongo_uri)
    user = match.group(1)
    password = match.group(2)
    dbname = match.group(3)
    params = match.group(4)
    
    nodes = [
        "ac-sdbi3ps-shard-00-00.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-01.l1t116x.mongodb.net:27017",
        "ac-sdbi3ps-shard-00-02.l1t116x.mongodb.net:27017"
    ]
    nodes_str = ",".join(nodes)
    direct_uri = f"mongodb://{user}:{password}@{nodes_str}/{dbname}?ssl=true&authSource=admin&{params}"
    
    client = MongoClient(direct_uri)
    db = client[dbname]
    questions_col = db["questions"]
    
    # 1. Surgical overrides for the 23 complex edge cases
    overrides = {
        ("sc_cgl_tier1_test2.json", 54, "explanation"): (
            "Let the parts be $\\frac{x}{2}$, $\\frac{2x}{3}$ and $\\frac{4x}{5}$. "
            "Then $\\frac{x}{2} + \\frac{2x}{3} + \\frac{4x}{5} = 177$. Solving gives $x = 90$. "
            "Therefore, the second part is $\\frac{2}{3} \\times 90 = 60$."
        ),
        ("sc_cgl_tier1_test2.json", 65, "explanation"): (
            "Using the given relation $a + \\frac{1}{a} = 3$, we obtain $a \\times \\frac{1}{a} = 1$ "
            "and simplify the required expression using standard identities. The expression evaluates to $0$."
        ),
        ("sc_cgl_tier1_test2.json", 67, "explanation"): (
            "For similar triangles, the ratio of corresponding sides equals the ratio of their perimeters. "
            "$\\frac{AB}{PQ} = \\frac{36}{24} = \\frac{3}{2}$. Therefore, $AB = 10 \\times \\frac{3}{2} = 15$ cm."
        ),
        ("sc_cgl_tier1_test2.json", 69, "question"): (
            "In triangle ABC, if $\\sin\\left(\\frac{A+B}{2}\\right) = \\frac{\\sqrt{3}}{2}$, "
            "then the value of $\\sin\\left(\\frac{C}{2}\\right)$ is:"
        ),
        ("sc_cgl_tier1_test2.json", 69, "explanation"): (
            "Since $A + B + C = 180^\\circ$, we have $\\frac{A+B}{2} = 90^\\circ - \\frac{C}{2}$. "
            "Therefore, $\\sin\\left(90^\\circ - \\frac{C}{2}\\right) = \\cos\\left(\\frac{C}{2}\\right) = \\frac{\\sqrt{3}}{2}$. "
            "Hence, $\\frac{C}{2} = 30^\\circ$ and $\\sin\\left(\\frac{C}{2}\\right) = \\sin 30^\\circ = \\frac{1}{2}$."
        ),
        ("sc_cgl_tier1_test2.json", 71, "explanation"): (
            "Let the horizontal distance between the building and the temple be $x$ m. "
            "Using $\\tan 60^\\circ$ and $\\tan 30^\\circ$ in the two right triangles, "
            "$\\tan 60^\\circ = \\frac{x+30}{y}$ and $\\tan 30^\\circ = \\frac{x}{y}$. "
            "Substituting the second equation into the first gives $2x = 30$, so $x = 15$ m. "
            "Therefore, the height of the temple is $15 + 30 = 45$ m."
        ),
        ("sc_cgl_tier1_test4.json", 51, "explanation"): (
            "Let $M$ be the number of mice killed, $C$ the number of cats, $D$ the number of days, "
            "and $e$ the number of mice killed by one cat in one day. Since $M \\propto C \\times D$, "
            "$M = C \\times D \\times e$. Given, $100 = 100 \\times 100 \\times e \\implies e = \\frac{1}{100}$. "
            "Now, $4 = 4 \\times D \\times \\frac{1}{100} \\implies D = 100$ days."
        ),
        ("sc_cgl_tier1_test4.json", 64, "question"): (
            "If $\\tan\\alpha = 2$, then the value of $\\dfrac{\\sin\\alpha}{\\sin^3\\alpha + \\cos^3\\alpha}$ is:"
        ),
        ("sc_cgl_tier1_test4.json", 64, "explanation"): (
            "**Correct Answer:** Option **C**\n\n"
            "**Key Concept:** Trigonometric Identities\n\n"
            "**Step 1 (Problem Setup):** Given $\\tan\\alpha = 2$. In a right-angled triangle, if opposite side = $2$ and adjacent side = $1$, then hypotenuse = $\\sqrt{2^2 + 1^2} = \\sqrt{5}$.\n\n"
            "**Step 2 (Detailed Solution):**\n"
            "- Determine $\\sin\\alpha = \\frac{2}{\\sqrt{5}}$ and $\\cos\\alpha = \\frac{1}{\\sqrt{5}}$.\n"
            "- Substitute these values into the expression:\n"
            "  $$\\frac{\\sin\\alpha}{\\sin^3\\alpha + \\cos^3\\alpha} = \\frac{\\frac{2}{\\sqrt{5}}}{\\left(\\frac{2}{\\sqrt{5}}\\right)^3 + \\left(\\frac{1}{\\sqrt{5}}\\right)^3} = \\frac{\\frac{2}{\\sqrt{5}}}{\\frac{8}{5\\sqrt{5}} + \\frac{1}{5\\sqrt{5}}} = \\frac{\\frac{2}{\\sqrt{5}}}{\\frac{9}{5\\sqrt{5}}} = \\frac{2}{\\sqrt{5}} \\times \\frac{5\\sqrt{5}}{9} = \\frac{10}{9}.$$\n\n"
            "**Step 3 (Verification):** The calculated value matches Option **C**.\n\n"
            "**Conclusion:** The evaluated result confirms Option **C** as the correct answer."
        ),
        ("sc_cgl_tier1_test4.json", 70, "explanation"): (
            "Let the radius of the smaller sphere be $r$ cm. Then the radius of the first sphere is $2r$ cm. Given:\n"
            "$$4\\pi (2r)^2 = \\frac{4}{3}\\pi r^3$$\n"
            "$$16\\pi r^2 = \\frac{4}{3}\\pi r^3 \\implies r = 12\\text{ cm}.$$\n"
            "Therefore, the radius of the first sphere is $2r = 24$ cm."
        ),
        ("sc_cgl_tier1_test4.json", 71, "explanation"): (
            "Let the thread be the hypotenuse of a right triangle. Given $AC = 80$ m and $\\angle C = 60^\\circ$. Using:\n"
            "$$\\sin 60^\\circ = \\frac{AB}{AC}$$\n"
            "$$\\frac{\\sqrt{3}}{2} = \\frac{h}{80} \\implies h = 80 \\times \\frac{\\sqrt{3}}{2} = 40\\sqrt{3}\\text{ m}.$$"
        ),
        ("sc_cgl_tier1_test5.json", 68, "question"): (
            "In triangle ABC, if median $AD = \\frac{1}{2}BC$, then angle $BAC$ is:"
        ),
        ("sc_cgl_tier1_test6.json", 2, "explanation"): (
            "Marked Price $= 546 + 109 = 655$. Discount $\%$ $= \\frac{109}{655} \\times 100 \\approx 16.64\\% \\approx 16\\%$."
        ),
        ("sc_cgl_tier1_test6.json", 8, "explanation"): (
            "$P \\left(\\frac{11}{10}\\right)^3 = 6655 \\implies P \\times \\frac{1331}{1000} = 6655 \\implies P = 5000$."
        ),
        ("sc_cgl_tier1_test7.json", 55, "explanation"): (
            "Let the two numbers be $x$ and $y$. Given $x + y = 3(x - y) \\implies x + y = 3x - 3y \\implies 2x = 4y \\implies \\frac{x}{y} = \\frac{4}{2} = \\frac{2}{1}$. Hence, the ratio of the numbers is $2 : 1$."
        ),
        ("sc_cgl_tier1_test7.json", 60, "explanation"): (
            "Given:\n"
            "- Principal $P = \\text{Rs. } 1$\n"
            "- Time $T = 1\\text{ month} = \\frac{1}{12}\\text{ year}$\n"
            "- Simple Interest $SI = 1\\text{ paisa} = \\text{Rs. } 0.01 = \\text{Rs. } \\frac{1}{100}$\n\n"
            "Using the Simple Interest formula:\n"
            "$$SI = \\frac{P \\times R \\times T}{100}$$\n"
            "$$\\frac{1}{100} = \\frac{1 \\times R \\times \\frac{1}{12}}{100}$$\n"
            "$$1 = R \\times \\frac{1}{12} \\implies R = 12\\%.$$"
        ),
        ("sc_cgl_tier1_test7.json", 64, "explanation"): (
            "Rearranging the equation:\n"
            "$$\\frac{x}{a+b} - \\frac{x}{a-b} = \\frac{a-b}{a+b} - 1$$\n"
            "$$x \\left(\\frac{a-b - (a+b)}{(a+b)(a-b)}\\right) = \\frac{a-b - (a+b)}{a+b}$$\n"
            "$$x \\left(\\frac{-2b}{(a+b)(a-b)}\\right) = \\frac{-2b}{a+b}$$\n"
            "Dividing both sides by $\\frac{-2b}{a+b}$ gives:\n"
            "$$\\frac{x}{a-b} = 1 \\implies x = a - b.$$"
        ),
        ("sc_cgl_tier1_test7.json", 67, "explanation"): (
            "Since D and E are midpoints of AB and AC respectively, by midpoint theorem, $DE \\parallel BC$ and $DE = \\frac{1}{2}BC$. "
            "Thus, $\\triangle ADE \\sim \\triangle ABC$ with a similarity ratio of $1 : 2$. The ratio of their areas is:\n"
            "$$\\frac{\\text{Area}(\\triangle ADE)}{\\text{Area}(\\triangle ABC)} = \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$$\n"
            "If the area of $\\triangle ABC$ is $4x$, then the area of $\\triangle ADE$ is $x$. The area of trapezium $BDEC$ is:\n"
            "$$\\text{Area}(BDEC) = \\text{Area}(\\triangle ABC) - \\text{Area}(\\triangle ADE) = 4x - x = 3x.$$\n"
            "Reflecting the ratio:\n"
            "$$\\frac{\\text{Area}(\\triangle ABC)}{\\text{Area}(BDEC)} = \\frac{4x}{3x} = \\frac{4}{3} \\implies 4 : 3.$$"
        ),
        ("sc_cgl_tier1_test8.json", 33, "explanation"): (
            "Let the speed of the car be $s$ km/h and the speed of the man be $4$ km/h. Relative speed $= (s - 4)$ km/h. "
            "The man can see the car for $3$ minutes $\\left(\\frac{3}{60} = \\frac{1}{20}\\text{ hours}\\right)$ up to a distance of $130$ meters ($0.13$ km):\n"
            "$$\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}$$\n"
            "$$s - 4 = \\frac{0.13}{\\frac{1}{20}}$$\n"
            "$$s - 4 = 2.6 \\implies s = 6.6 = 6\\frac{3}{5}\\text{ km/h}.$$"
        ),
        ("sc_cgl_tier1_test8.json", 38, "explanation"): (
            "Given: $\\sin(\\theta + 18^\\circ) = \\frac{1}{2} \\implies \\sin(\\theta + 18^\\circ) = \\sin 30^\\circ \\implies \\theta + 18^\\circ = 30^\\circ \\implies \\theta = 12^\\circ$. "
            "Converting $\\theta$ to radians:\n"
            "$$\\theta = 12^\\circ \\times \\frac{\\pi}{180^\\circ} = \\frac{\\pi}{15}\\text{ radians}.$$"
        ),
        ("sc_cgl_tier1_test9.json", 62, "explanation"): (
            "We know that:\n"
            "- $\\sec^2 45^\\circ = (\\sqrt{2})^2 = 2$\n"
            "- $\\cot^2 45^\\circ = 1^2 = 1$\n"
            "- $\\sin^2 30^\\circ = \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$\n"
            "- $\\sin^2 60^\\circ = \\left(\\frac{\\sqrt{3}}{2}\\right)^2 = \\frac{3}{4}$\n\n"
            "Substituting these values:\n"
            "$$(\\sec^2 45^\\circ - \\cot^2 45^\\circ) - (\\sin^2 30^\\circ + \\sin^2 60^\\circ) = (2 - 1) - \\left(\\frac{1}{4} + \\frac{3}{4}\\right) = 1 - 1 = 0.$$"
        ),
        ("sc_cgl_tier1_test9.json", 70, "explanation"): (
            "For $2$ years, the difference between compound and simple interest is given by:\n"
            "$$D = P \\left(\\frac{r}{100}\\right)^2$$\n"
            "$$1 = P \\left(\\frac{4}{100}\\right)^2$$\n"
            "$$1 = P \\left(\\frac{1}{25}\\right)^2 = \\frac{P}{625} \\implies P = 625.$$\n"
            "Therefore, the sum is Rs. $625$."
        ),
        ("sc_cgl_tier1_test10.json", 62, "explanation"): (
            "We know that:\n"
            "- $\\sec^2 45^\\circ = (\\sqrt{2})^2 = 2$\n"
            "- $\\cot^2 45^\\circ = 1^2 = 1$\n"
            "- $\\sin^2 30^\\circ = \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$\n"
            "- $\\sin^2 60^\\circ = \\left(\\frac{\\sqrt{3}}{2}\\right)^2 = \\frac{3}{4}$\n\n"
            "Substituting these values:\n"
            "$$(\\sec^2 45^\\circ - \\cot^2 45^\\circ) - (\\sin^2 30^\\circ + \\sin^2 60^\\circ) = (2 - 1) - \\left(\\frac{1}{4} + \\frac{3}{4}\\right) = 1 - 1 = 0.$$"
        ),
        ("sc_cgl_tier1_test10.json", 70, "explanation"): (
            "For $2$ years, the difference between compound and simple interest is given by:\n"
            "$$D = P \\left(\\frac{r}{100}\\right)^2$$\n"
            "$$1 = P \\left(\\frac{4}{100}\\right)^2$$\n"
            "$$1 = P \\left(\\frac{1}{25}\\right)^2 = \\frac{P}{625} \\implies P = 625.$$\n"
            "Therefore, the sum is Rs. $625$."
        )
    }
    
    files = [f"sc_cgl_tier1_test{i}.json" for i in range(1, 11)]
    
    for filename in files:
        filepath = os.path.join(cgl_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f"\nProcessing {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        modified_count = 0
        for q in data:
            q_id = q.get("id")
            
            # Check for overrides
            override_q = overrides.get((filename, q_id, "question"))
            if override_q is not None:
                q["question"] = override_q
                q["q"] = override_q
                
            override_exp = overrides.get((filename, q_id, "explanation"))
            if override_exp is not None:
                q["explanation"] = override_exp
                
            # Perform general cleaning if no override
            if override_q is None:
                old_q = q.get("question", "") or ""
                new_q = clean_latex_field(old_q)
                if old_q != new_q:
                    q["question"] = new_q
                    q["q"] = new_q
                    
            if override_exp is None:
                old_exp = q.get("explanation", "") or ""
                new_exp = clean_latex_field(old_exp)
                if old_exp != new_exp:
                    q["explanation"] = new_exp
                    
            # Check options
            options = q.get("options", [])
            for opt in options:
                if isinstance(opt, dict):
                    old_text = opt.get("text", "") or ""
                    new_text = clean_latex_field(old_text)
                    if old_text != new_text:
                        opt["text"] = new_text
                        
            # Update database
            res = questions_col.update_many(
                {"source_file": filename, "question_number": q_id},
                {"$set": {
                    "question": q["question"],
                    "q": q["question"],
                    "explanation": q["explanation"],
                    "direction": q.get("direction", ""),
                    "options": q["options"],
                    "raw_question": q["question"],
                    "raw_explanation": q["explanation"],
                    "raw_direction": q.get("direction", ""),
                    "raw_options": [opt.get("text", "") if isinstance(opt, dict) else opt for opt in q["options"]]
                }}
            )
            modified_count += 1
            
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  Successfully saved {modified_count} questions locally and in DB.")

if __name__ == "__main__":
    run_fix()
