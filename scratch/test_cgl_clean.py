import re

def clean_latex_field(text):
    if not text:
        return text
        
    original = text
    
    # 0. Pre-clean common typos and merged variables/commands
    # Fix merged variables like bex -> be x, hencex -> hence x, ofx -> of x
    words_to_split = [
        "If", "if", "Given", "given", "Then", "then", "is", "of", "be", "and", 
        "to", "the", "a", "such", "that", "hence", "Therefore", "therefore", 
        "where", "will", "obtain", "obtained", "find", "Simplify", "simplify", 
        "Let", "let", "complete", "remaining", "occupies", "by", "for", "with"
    ]
    for w in words_to_split:
        # Split word from math variable x, y, z, a, b, c
        text = re.compile(r'\b' + w + r'([x-za-c])\b').sub(w + r' \1', text)
        # Split word from math variable x, y, z, a, b, c inside math blocks
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

# Test samples from the scan output
samples = [
    # Q51 Test 1 Exp
    "A and B together $complete\\frac{7}{11}of$ the work. Therefore, C completes the $remaining\\frac{4}{11}of$ the work. Hence, C's share $=\\frac{4}{11}$ $\\times$ $550$ $=$ $200$.",
    # Q54 Test 1 Exp
    'Let the cost price bex. $Then\\frac{78-x}{x}=2\\times\\frac{69-x}{x}.$ Solving gives $78-x=138-2$ x, $hencex=60.$ Therefore, the cost price is Rs. $60$.',
    # Q52 Test 4 Quest
    'In triangle ABC,DE $\\parallel$ BC such $that\\dfrac{AD}{BD}=\\d\\frac{3}{5}.$',
    # Q56 Test 4 Exp
    'Let the selling price be$5 x. $Profit=x$. Therefore,$text{Cost Price}=5 x-x=4 x Hence,text{SP:CP}=$5: 4$.',
    # Q60 Test 4 Quest
    '$If\\dfrac{1}{a}-\\d\\frac{1}{b}=0,$ then the value $of\\dfrac{1}{a}+\\d\\frac{1}{b}is:$',
    # Q26 Test 8 Quest
    'The value $of\\sqrt{9$ $-$ $2\\sqrt{16}$ $+$ $3\\sqrt[3]{512}$ $}is:$'
]

print("=== REFINE TEST RUN 2 ===")
for s in samples:
    print(f"Original: {repr(s)}")
    print(f"Cleaned:  {repr(clean_latex_field(s))}")
    print("-" * 50)
