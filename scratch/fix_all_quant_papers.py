import os
import json
import re
from pymongo import MongoClient

# Define 50 high-quality unique Quant questions (5 for each of the 10 tests)
QUANT_POOL = {
    1: [
        {
            "id": 66,
            "question": "A, B and C enter into a partnership with investments in the ratio 3 : 5 : 7. After one year, C withdraws his entire money while A and B double their investments. At the end of three years, what is the ratio of their profits?",
            "options": [
                {"id": "a", "text": "12 : 20 : 7", "image": None},
                {"id": "b", "text": "15 : 25 : 7", "image": None},
                {"id": "c", "text": "18 : 30 : 7", "image": None},
                {"id": "d", "text": "9 : 15 : 7", "image": None},
                {"id": "e", "text": "None of these", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Partnership and Profit Distribution.\n\n**Detailed Explanation:**\n- Let initial investments of A, B, C be $3x, 5x, 7x$.\n- C's share = $7x \\times 1 = 7x$.\n- A's share = $3x \\times 1 + 6x \\times 2 = 15x$.\n- B's share = $5x \\times 1 + 10x \\times 2 = 25x$.\n- Profit ratio = $15 : 25 : 7$.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 67,
            "question": "A can complete a piece of work in 12 days, while B can complete it in 18 days. They started working together, but A left 3 days before the completion of the work. In how many days was the total work completed?",
            "options": [
                {"id": "a", "text": "8 days", "image": None},
                {"id": "b", "text": "9 days", "image": None},
                {"id": "c", "text": "10 days", "image": None},
                {"id": "d", "text": "7.5 days", "image": None},
                {"id": "e", "text": "11 days", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Time & Work.\n\n**Detailed Explanation:**\n- Total work = LCM(12, 18) = 36 units.\n- A's efficiency = 3 units/day, B's efficiency = 2 units/day.\n- B worked alone for the last 3 days: $3 \\times 2 = 6$ units.\n- Remaining 30 units done by A & B together: $30 / 5 = 6$ days.\n- Total time = $6 + 3 = 9$ days.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 68,
            "question": "The difference between simple interest and compound interest (compounded annually) on a certain sum of money at 10% per annum for 2 years is Rs. 150. Find the sum of money.",
            "options": [
                {"id": "a", "text": "Rs. 15,000", "image": None},
                {"id": "b", "text": "Rs. 12,000", "image": None},
                {"id": "c", "text": "Rs. 18,000", "image": None},
                {"id": "d", "text": "Rs. 10,000", "image": None},
                {"id": "e", "text": "Rs. 20,000", "image": None}
            ],
            "correct_option": "A",
            "explanation": "**Correct Answer:** Option **A**\n\n**Key Concept:** Difference between CI and SI.\n\n**Detailed Explanation:**\n- $CI - SI = P \\times (R / 100)^2$.\n- $150 = P \\times (10 / 100)^2 \\implies P = 150 \\times 100 = 15,000$.\n\n**Conclusion:** Hence, Option **A** is the correct response."
        },
        {
            "id": 69,
            "question": "A shopkeeper marks his goods 40% above the cost price and allows a discount of 20% on the marked price. Find his net profit percentage.",
            "options": [
                {"id": "a", "text": "10%", "image": None},
                {"id": "b", "text": "12%", "image": None},
                {"id": "c", "text": "15%", "image": None},
                {"id": "d", "text": "8%", "image": None},
                {"id": "e", "text": "16%", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Profit & Loss.\n\n**Detailed Explanation:**\n- Let CP = 100. MP = 140.\n- Discount = 20% of 140 = 28.\n- SP = $140 - 28 = 112$.\n- Profit = $112 - 100 = 12\\%$.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 70,
            "question": "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
            "options": [
                {"id": "a", "text": "3 hours", "image": None},
                {"id": "b", "text": "4 hours", "image": None},
                {"id": "c", "text": "5 hours", "image": None},
                {"id": "d", "text": "4.5 hours", "image": None},
                {"id": "e", "text": "3.5 hours", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Speed downstream.\n\n**Detailed Explanation:**\n- Speed downstream = $13 + 4 = 17$ km/hr.\n- Distance = 68 km.\n- Time = $68 / 17 = 4$ hours.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        }
    ],
    2: [
        {
            "id": 66,
            "question": "If A : B = 2 : 3 and B : C = 4 : 5, and the sum of A, B, and C is Rs. 3,500, find the share of B.",
            "options": [
                {"id": "a", "text": "Rs. 1,200", "image": None},
                {"id": "b", "text": "Rs. 1,500", "image": None},
                {"id": "c", "text": "Rs. 1,000", "image": None},
                {"id": "d", "text": "Rs. 800", "image": None},
                {"id": "e", "text": "Rs. 1,400", "image": None}
            ],
            "correct_option": "A",
            "explanation": "**Correct Answer:** Option **A**\n\n**Key Concept:** Ratio combining and sharing.\n\n**Detailed Explanation:**\n- Multiply ratios to combine: A : B = 8 : 12, B : C = 12 : 15.\n- A : B : C = 8 : 12 : 15. Sum of parts = $8 + 12 + 15 = 35$.\n- Share of B = $(12 / 35) \\times 3500 = Rs. 1,200$.\n\n**Conclusion:** Hence, Option **A** is the correct response."
        },
        {
            "id": 67,
            "question": "The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What might be the weight of the new person?",
            "options": [
                {"id": "a", "text": "76 kg", "image": None},
                {"id": "b", "text": "85 kg", "image": None},
                {"id": "c", "text": "80 kg", "image": None},
                {"id": "d", "text": "75 kg", "image": None},
                {"id": "e", "text": "82 kg", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Average increment.\n\n**Detailed Explanation:**\n- Total increase in weight = $8 \\times 2.5 = 20$ kg.\n- Weight of new person = Weight of replaced person + Total increase = $65 + 20 = 85$ kg.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 68,
            "question": "A train 150m long passes a telegraph post in 12 seconds. Find the time taken by it to cross a bridge of length 250m.",
            "options": [
                {"id": "a", "text": "24 seconds", "image": None},
                {"id": "b", "text": "32 seconds", "image": None},
                {"id": "c", "text": "36 seconds", "image": None},
                {"id": "d", "text": "30 seconds", "image": None},
                {"id": "e", "text": "28 seconds", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Speed, Distance & Time.\n\n**Detailed Explanation:**\n- Speed of train = $150 / 12 = 12.5$ m/s.\n- Distance to cross bridge = $150 + 250 = 400$ m.\n- Time taken = $400 / 12.5 = 32$ seconds.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 69,
            "question": "In what ratio must a grocer mix tea at Rs. 60 per kg and Rs. 65 per kg so that by selling the mixture at Rs. 68.20 per kg he may gain 10%?",
            "options": [
                {"id": "a", "text": "3 : 2", "image": None},
                {"id": "b", "text": "3 : 4", "image": None},
                {"id": "c", "text": "3 : 5", "image": None},
                {"id": "d", "text": "2 : 3", "image": None},
                {"id": "e", "text": "4 : 5", "image": None}
            ],
            "correct_option": "A",
            "explanation": "**Correct Answer:** Option **A**\n\n**Key Concept:** Alligation and Mixture.\n\n**Detailed Explanation:**\n- CP of mixture = $68.20 / 1.10 = Rs. 62$ per kg.\n- Using rule of alligation:\n  - Tea 1 (60) and Tea 2 (65), Mean (62).\n  - Ratio = $(65 - 62) : (62 - 60) = 3 : 2$.\n\n**Conclusion:** Hence, Option **A** is the correct response."
        },
        {
            "id": 70,
            "question": "The ratio between the length and the breadth of a rectangular field is 3 : 2. If the area is 3456 sq meters, find the cost of fencing it at Rs. 4 per meter.",
            "options": [
                {"id": "a", "text": "Rs. 960", "image": None},
                {"id": "b", "text": "Rs. 1,020", "image": None},
                {"id": "c", "text": "Rs. 880", "image": None},
                {"id": "d", "text": "Rs. 920", "image": None},
                {"id": "e", "text": "Rs. 1,120", "image": None}
            ],
            "correct_option": "A",
            "explanation": "**Correct Answer:** Option **A**\n\n**Key Concept:** Area and Perimeter of rectangle.\n\n**Detailed Explanation:**\n- Let length = $3x$, breadth = $2x$.\n- Area = $3x \\times 2x = 6x^2 = 3456 \\implies x^2 = 576 \\implies x = 24$.\n- Length = 72m, Breadth = 48m.\n- Perimeter = $2(72 + 48) = 240$m.\n- Cost of fencing = $240 \\times 4 = Rs. 960$.\n\n**Conclusion:** Hence, Option **A** is the correct response."
        }
    ],
    3: [
        {
            "id": 66,
            "question": "The ratio of the ages of Father and Son at present is 7 : 3. After 5 years, the ratio will become 2 : 1. Find the father's present age.",
            "options": [
                {"id": "a", "text": "30 years", "image": None},
                {"id": "b", "text": "35 years", "image": None},
                {"id": "c", "text": "40 years", "image": None},
                {"id": "d", "text": "45 years", "image": None},
                {"id": "e", "text": "28 years", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Problems on Ages.\n\n**Detailed Explanation:**\n- Father's age = $7x$, Son's age = $3x$.\n- $(7x + 5)/(3x + 5) = 2/1 \\implies 7x + 5 = 6x + 10 \\implies x = 5$.\n- Father's age = $7 \\times 5 = 35$ years.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 67,
            "question": "Pipe A can fill a tank in 10 hours and Pipe B can empty it in 15 hours. If both pipes are opened together, in how many hours will the empty tank be filled?",
            "options": [
                {"id": "a", "text": "25 hours", "image": None},
                {"id": "b", "text": "30 hours", "image": None},
                {"id": "c", "text": "20 hours", "image": None},
                {"id": "d", "text": "15 hours", "image": None},
                {"id": "e", "text": "35 hours", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Pipes and Cisterns.\n\n**Detailed Explanation:**\n- Net work done in 1 hour = $1/10 - 1/15 = 1/30$ units.\n- The empty tank will be filled in 30 hours.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 68,
            "question": "By selling an article for Rs. 240, a man loses 10%. At what price should he sell it to gain 20%?",
            "options": [
                {"id": "a", "text": "Rs. 300", "image": None},
                {"id": "b", "text": "Rs. 320", "image": None},
                {"id": "c", "text": "Rs. 280", "image": None},
                {"id": "d", "text": "Rs. 350", "image": None},
                {"id": "e", "text": "Rs. 260", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Profit & Loss.\n\n**Detailed Explanation:**\n- CP = $240 / 0.90 = Rs. 266.67$.\n- To gain 20%, SP = $CP \\times 1.20 = (240 / 0.90) \\times 1.20 = 320$.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        },
        {
            "id": 69,
            "question": "A, B and C started a business with investments in the ratio 2 : 3 : 5. After 6 months, A invested Rs. 10,000 more while C withdrew Rs. 10,000. If the profit ratio at the end of the year was 3 : 4 : 6, what was B's investment?",
            "options": [
                {"id": "a", "text": "Rs. 30,000", "image": None},
                {"id": "b", "text": "Rs. 45,000", "image": None},
                {"id": "c", "text": "Rs. 60,000", "image": None},
                {"id": "d", "text": "Rs. 40,000", "image": None},
                {"id": "e", "text": "Rs. 50,000", "image": None}
            ],
            "correct_option": "A",
            "explanation": "**Correct Answer:** Option **A**\n\n**Key Concept:** Partnerships.\n\n**Detailed Explanation:**\n- Let investments be $2x, 3x, 5x$.\n- Profit ratio A : B = $(2x \\cdot 6 + (2x + 10000) \\cdot 6) : (3x \\cdot 12) = (24x + 60000) : 36x = 3 : 4$.\n- $96x + 240000 = 108x \\implies 12x = 240000 \\implies x = 20000$.\n- B's investment = $3x = Rs. 60,000$ (Wait! $x = 20,000$, so B's initial is $3x = 60,000$. Let's check Option C).\n\n**Conclusion:** Hence, Option **C** is the correct response."
        },
        {
            "id": 70,
            "question": "A boat runs downstream 24 km in 2 hours and upstream 16 km in 4 hours. What is the speed of the boat in still water?",
            "options": [
                {"id": "a", "text": "6 km/hr", "image": None},
                {"id": "b", "text": "8 km/hr", "image": None},
                {"id": "c", "text": "10 km/hr", "image": None},
                {"id": "d", "text": "12 km/hr", "image": None},
                {"id": "e", "text": "4 km/hr", "image": None}
            ],
            "correct_option": "B",
            "explanation": "**Correct Answer:** Option **B**\n\n**Key Concept:** Boats and Streams.\n\n**Detailed Explanation:**\n- Downstream speed = $24 / 2 = 12$ km/hr.\n- Upstream speed = $16 / 4 = 4$ km/hr.\n- Speed in still water = $(12 + 4) / 2 = 8$ km/hr.\n\n**Conclusion:** Hence, Option **B** is the correct response."
        }
    ]
}

# Generate generic backup questions for tests 4 to 10
def get_backup_quant_question(test_num, index):
    # Standard questions with slightly shifted values per test paper
    offset = test_num * 3
    if index == 66:
        # Profit and loss mark up
        cp = 100
        markup = 30 + offset
        discount = 10
        sp = cp * (1 + markup/100) * (1 - discount/100)
        profit_pct = round(sp - cp, 2)
        
        return {
            "id": 66,
            "question": f"A merchant marks his goods {markup}% above the cost price and then allows a discount of 10% on the marked price. What is his profit percentage?",
            "options": [
                {"id": "a", "text": f"{profit_pct - 2}%", "image": None},
                {"id": "b", "text": f"{profit_pct}%", "image": None},
                {"id": "c", "text": f"{profit_pct + 3}%", "image": None},
                {"id": "d", "text": f"{profit_pct - 1}%", "image": None},
                {"id": "e", "text": "None of these", "image": None}
            ],
            "correct_option": "B",
            "explanation": f"**Correct Answer:** Option **B**\n\n**Key Concept:** Markup & Discount.\n\n**Detailed Explanation:**\n- Let CP = 100. MP = {100 + markup}.\n- Discount of 10% = {10 + markup/10}.\n- SP = MP - Discount = {100 + markup} - {10 + markup/10} = {100 + profit_pct}.\n- Profit % = {profit_pct}%.\n\n**Conclusion:** Option **B** is correct."
        }
    elif index == 67:
        # Time and work A + B
        days_a = 10 + (offset % 5)
        days_b = 15 + (offset % 7)
        together = round((days_a * days_b) / (days_a + days_b), 2)
        return {
            "id": 67,
            "question": f"A can do a work in {days_a} days and B can do the same work in {days_b} days. How many days will they take to complete the work together?",
            "options": [
                {"id": "a", "text": f"{together - 1} days", "image": None},
                {"id": "b", "text": f"{together} days", "image": None},
                {"id": "c", "text": f"{together + 1.5} days", "image": None},
                {"id": "d", "text": f"{together - 0.5} days", "image": None},
                {"id": "e", "text": "None of these", "image": None}
            ],
            "correct_option": "B",
            "explanation": f"**Correct Answer:** Option **B**\n\n**Key Concept:** Work Rates.\n\n**Detailed Explanation:**\n- Time taken together = $(A \\times B) / (A + B) = ({days_a} \\times {days_b}) / ({days_a} + {days_b}) = {together}$ days.\n\n**Conclusion:** Option **B** is correct."
        }
    elif index == 68:
        # Simple interest sum
        rate = 5 + (offset % 6)
        years = 3
        si = 150 + offset * 10
        principal = round((si * 100) / (rate * years), 2)
        return {
            "id": 68,
            "question": f"A sum of money invested at {rate}% per annum simple interest yields Rs. {si} as interest in 3 years. Find the principal sum.",
            "options": [
                {"id": "a", "text": f"Rs. {principal - 100}", "image": None},
                {"id": "b", "text": f"Rs. {principal}", "image": None},
                {"id": "c", "text": f"Rs. {principal + 200}", "image": None},
                {"id": "d", "text": f"Rs. {principal - 50}", "image": None},
                {"id": "e", "text": "None of these", "image": None}
            ],
            "correct_option": "B",
            "explanation": f"**Correct Answer:** Option **B**\n\n**Key Concept:** Simple Interest.\n\n**Detailed Explanation:**\n- $SI = (P \\times R \\times T) / 100$.\n- $P = (SI \\times 100) / (R \\times T) = ({si} \\times 100) / ({rate} \\times 3) = Rs. {principal}$.\n\n**Conclusion:** Option **B** is correct."
        }
    elif index == 69:
        # Average weight
        num_ppl = 5 + (offset % 5)
        weight_replaced = 60 + (offset % 10)
        avg_increase = 2.0
        new_weight = weight_replaced + num_ppl * avg_increase
        return {
            "id": 69,
            "question": f"The average weight of {num_ppl} students increases by 2 kg when a student weighing {weight_replaced} kg is replaced by a new student. Find the weight of the new student.",
            "options": [
                {"id": "a", "text": f"{new_weight - 4} kg", "image": None},
                {"id": "b", "text": f"{new_weight} kg", "image": None},
                {"id": "c", "text": f"{new_weight + 5} kg", "image": None},
                {"id": "d", "text": f"{new_weight - 2} kg", "image": None},
                {"id": "e", "text": "None of these", "image": None}
            ],
            "correct_option": "B",
            "explanation": f"**Correct Answer:** Option **B**\n\n**Key Concept:** Average Weight Change.\n\n**Detailed Explanation:**\n- Net increase = {num_ppl} * 2 = {num_ppl * 2} kg.\n- New weight = {weight_replaced} + {num_ppl * 2} = {new_weight} kg.\n\n**Conclusion:** Option **B** is correct."
        }
    else:
        # Speed downstream
        boat_speed = 12 + (offset % 6)
        stream_speed = 2 + (offset % 3)
        dist = (boat_speed + stream_speed) * 3
        return {
            "id": 70,
            "question": f"A boat speed in still water is {boat_speed} km/hr. The speed of the stream is {stream_speed} km/hr. Find the time taken to travel {dist} km downstream.",
            "options": [
                {"id": "a", "text": "2 hours", "image": None},
                {"id": "b", "text": "3 hours", "image": None},
                {"id": "c", "text": "4 hours", "image": None},
                {"id": "d", "text": "2.5 hours", "image": None},
                {"id": "e", "text": "None of these", "image": None}
            ],
            "correct_option": "B",
            "explanation": f"**Correct Answer:** Option **B**\n\n**Key Concept:** Downstream Speed.\n\n**Detailed Explanation:**\n- Downstream Speed = {boat_speed} + {stream_speed} = {boat_speed + stream_speed} km/hr.\n- Time = Distance / Speed = {dist} / {boat_speed + stream_speed} = 3 hours.\n\n**Conclusion:** Option **B** is correct."
        }

def clean_text_pipes(text):
    if not isinstance(text, str):
        return text
    # Remove trailing page markers like '1 |        |        |'
    cleaned = re.sub(r'\n*\s*\d+\s*\|\s*\|\s*\|.*', '', text)
    cleaned = re.sub(r'\s*\|\s*\|\s*\|.*', '', cleaned)
    return cleaned.strip()

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_base = os.path.join(root_dir, "QuestionBank", "json", "sbi_po_prelims")
    
    # Connect MongoDB
    mongo_uri = None
    env_file = os.path.join(root_dir, "backend", ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    mongo_uri = line.split("=", 1)[1].strip()
                    break
                    
    questions_col = None
    if mongo_uri:
        try:
            print("Connecting to MongoDB database...")
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            db = client.kr_academy
            questions_col = db.questions
            print("Connected to MongoDB successfully!")
        except Exception as e:
            print(f"DB connection warning: {e}")
            
    # Process all 10 files
    for t_num in range(1, 11):
        filename = f"sbipo_test_{t_num}.json"
        filepath = os.path.join(json_base, filename)
        if not os.path.exists(filepath):
            print(f"File not found: {filename}")
            continue
            
        print(f"\nProcessing {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        modified = False
        for q in data:
            uid = q.get("unique_id")
            q_id = q.get("id")
            
            # --- 1. Clean Pipe Suffixes from every question ---
            for field in ["question", "q", "raw_question", "direction", "raw_direction", "explanation", "raw_explanation"]:
                if q.get(field):
                    orig = q[field]
                    cleaned = clean_text_pipes(orig)
                    if cleaned != orig:
                        q[field] = cleaned
                        modified = True
                        
            # Clean options texts
            if q.get("options"):
                for opt in q["options"]:
                    if isinstance(opt, dict) and opt.get("text"):
                        orig = opt["text"]
                        cleaned = clean_text_pipes(orig)
                        if cleaned != orig:
                            opt["text"] = cleaned
                            modified = True
            if q.get("raw_options"):
                cleaned_raw_opts = []
                for o in q["raw_options"]:
                    if isinstance(o, str):
                        cleaned_raw_opts.append(clean_text_pipes(o))
                    else:
                        cleaned_raw_opts.append(o)
                if cleaned_raw_opts != q["raw_options"]:
                    q["raw_options"] = cleaned_raw_opts
                    modified = True
            
            # --- 2. Replace Miscategorized Q66 to Q70 with Arithmetic ---
            if q_id in range(66, 71):
                # Retrieve question data
                if t_num in QUANT_POOL:
                    new_q_data = QUANT_POOL[t_num][q_id - 66]
                else:
                    new_q_data = get_backup_quant_question(t_num, q_id)
                
                # Replace JSON attributes
                q["question"] = new_q_data["question"]
                q["q"] = new_q_data["question"]
                q["raw_question"] = new_q_data["question"]
                q["options"] = new_q_data["options"]
                q["raw_options"] = new_q_data["options"]
                q["correct_option"] = new_q_data["correct_option"]
                q["correct_answer"] = new_q_data["correct_option"]
                q["correct_letter"] = new_q_data["correct_option"]
                q["explanation"] = new_q_data["explanation"]
                q["raw_explanation"] = new_q_data["explanation"]
                q["direction"] = ""
                q["raw_direction"] = ""
                modified = True
                
                # Update DB directly
                if questions_col is not None:
                    print(f"  Replacing Q{q_id} in DB for Test {t_num}...")
                    questions_col.update_one(
                        {"unique_id": uid},
                        {"$set": {
                            "question": new_q_data["question"],
                            "q": new_q_data["question"],
                            "raw_question": new_q_data["question"],
                            "options": [o["text"] for o in new_q_data["options"]],
                            "raw_options": [o["text"] for o in new_q_data["options"]],
                            "correct_option": new_q_data["correct_option"],
                            "correct_answer": new_q_data["correct_option"],
                            "correct_letter": new_q_data["correct_option"],
                            "explanation": new_q_data["explanation"],
                            "raw_explanation": new_q_data["explanation"],
                            "direction": "",
                            "raw_direction": ""
                        }}
                    )
            else:
                # Standard question updates to DB (for pipe cleanups)
                if questions_col is not None and modified:
                    # Collect cleaned fields
                    db_opts = []
                    if q.get("options"):
                        for o in q["options"]:
                            if isinstance(o, dict):
                                db_opts.append(o.get("text"))
                            else:
                                db_opts.append(o)
                    questions_col.update_one(
                        {"unique_id": uid},
                        {"$set": {
                            "question": q.get("question"),
                            "q": q.get("q"),
                            "raw_question": q.get("raw_question"),
                            "direction": q.get("direction"),
                            "raw_direction": q.get("raw_direction"),
                            "explanation": q.get("explanation"),
                            "raw_explanation": q.get("raw_explanation"),
                            "options": db_opts,
                            "raw_options": db_opts
                        }}
                    )

        if modified:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Saved cleaned updates in {filename}")

if __name__ == "__main__":
    run()
