import os
import json
from pymongo import MongoClient

def run():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_path = os.path.join(root_dir, "QuestionBank", "json", "sbi_po_prelims", "sbipo_test_1.json")
    
    # Define new Quant questions for 66 to 70
    q66_text = "A, B and C enter into a partnership with investments in the ratio 3 : 5 : 7. After one year, C withdraws his entire money while A and B double their investments. At the end of three years, what is the ratio of their profits?"
    q66_opts = [
        {"id": "a", "text": "12 : 20 : 7", "image": None},
        {"id": "b", "text": "15 : 25 : 7", "image": None},
        {"id": "c", "text": "18 : 30 : 7", "image": None},
        {"id": "d", "text": "9 : 15 : 7", "image": None},
        {"id": "e", "text": "None of these", "image": None}
    ]
    q66_expl = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Partnership and Profit Distribution.\n\n"
        "**Detailed Explanation:**\n"
        "- Let the initial investments of A, B and C be $3x, 5x$ and $7x$ respectively.\n"
        "- C invested $7x$ for 1 year. C's share equivalent = $7x \\times 1 = 7x$.\n"
        "- A invested $3x$ for the 1st year and $6x$ (doubled) for the next 2 years. A's share equivalent = $3x \\times 1 + 6x \\times 2 = 15x$.\n"
        "- B invested $5x$ for the 1st year and $10x$ (doubled) for the next 2 years. B's share equivalent = $5x \\times 1 + 10x \\times 2 = 25x$.\n"
        "- The ratio of their profit shares at the end of 3 years is A : B : C = $15x : 25x : 7x = 15 : 25 : 7$.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct response."
    )

    q67_text = "A can complete a piece of work in 12 days, while B can complete it in 18 days. They started working together, but A left 3 days before the completion of the work. In how many days was the total work completed?"
    q67_opts = [
        {"id": "a", "text": "8 days", "image": None},
        {"id": "b", "text": "9 days", "image": None},
        {"id": "c", "text": "10 days", "image": None},
        {"id": "d", "text": "7.5 days", "image": None},
        {"id": "e", "text": "11 days", "image": None}
    ]
    q67_expl = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Time and Work with exit conditions.\n\n"
        "**Detailed Explanation:**\n"
        "- Let the total work be LCM(12, 18) = 36 units.\n"
        "- Efficiency of A = $36 / 12 = 3$ units/day.\n"
        "- Efficiency of B = $36 / 18 = 2$ units/day.\n"
        "- Since A left 3 days before completion, B worked alone for the last 3 days.\n"
        "- Work completed by B in the last 3 days = $3 \\times 2 = 6$ units.\n"
        "- Remaining work completed by A and B together = $36 - 6 = 30$ units.\n"
        "- Time taken by A and B together to complete 30 units = $30 / (3 + 2) = 6$ days.\n"
        "- Total time taken to complete the entire work = $6 \\text{ days (together)} + 3 \\text{ days (B alone)} = 9$ days.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct response."
    )

    q68_text = "The difference between simple interest and compound interest (compounded annually) on a certain sum of money at 10% per annum for 2 years is Rs. 150. Find the sum of money."
    q68_opts = [
        {"id": "a", "text": "Rs. 15,000", "image": None},
        {"id": "b", "text": "Rs. 12,000", "image": None},
        {"id": "c", "text": "Rs. 18,000", "image": None},
        {"id": "d", "text": "Rs. 10,000", "image": None},
        {"id": "e", "text": "Rs. 20,000", "image": None}
    ]
    q68_expl = (
        "**Correct Answer:** Option **A**\n\n"
        "**Key Concept:** Difference between CI and SI for 2 years.\n\n"
        "**Detailed Explanation:**\n"
        "- The formula for the difference between CI and SI for 2 years is: $CI - SI = P \\times (R / 100)^2$.\n"
        "- Given: Difference = Rs. 150, Rate (R) = 10%.\n"
        "- Substituting the values: $150 = P \\times (10 / 100)^2 \\implies 150 = P \\times (1 / 100) \\implies P = 150 \\times 100 = 15,000$.\n"
        "- Thus, the principal sum of money is Rs. 15,000.\n\n"
        "**Conclusion:** Hence, Option **A** is the correct response."
    )

    q69_text = "A shopkeeper marks his goods 40% above the cost price and allows a discount of 20% on the marked price. Find his net profit percentage."
    q69_opts = [
        {"id": "a", "text": "10%", "image": None},
        {"id": "b", "text": "12%", "image": None},
        {"id": "c", "text": "15%", "image": None},
        {"id": "d", "text": "8%", "image": None},
        {"id": "e", "text": "16%", "image": None}
    ]
    q69_expl = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Markup, Discount, and Net Profit.\n\n"
        "**Detailed Explanation:**\n"
        "- Let the Cost Price (CP) of the goods be Rs. 100.\n"
        "- Since the goods are marked 40% above CP, the Marked Price (MP) = $100 + 40 = \\text{Rs. } 140$.\n"
        "- A discount of 20% is allowed on MP. Discount amount = $20\\% \\text{ of } 140 = 28$.\n"
        "- Selling Price (SP) = $\\text{MP} - \\text{Discount} = 140 - 28 = 112$.\n"
        "- Net Profit = $\\text{SP} - \\text{CP} = 112 - 100 = 12$.\n"
        "- Profit Percentage = $(12 / 100) \\times 100 = 12\\%$.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct response."
    )

    q70_text = "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream."
    q70_opts = [
        {"id": "a", "text": "3 hours", "image": None},
        {"id": "b", "text": "4 hours", "image": None},
        {"id": "c", "text": "5 hours", "image": None},
        {"id": "d", "text": "4.5 hours", "image": None},
        {"id": "e", "text": "3.5 hours", "image": None}
    ]
    q70_expl = (
        "**Correct Answer:** Option **B**\n\n"
        "**Key Concept:** Downstream speed and time.\n\n"
        "**Detailed Explanation:**\n"
        "- Speed of the boat in still water ($u$) = 13 km/hr.\n"
        "- Speed of the stream ($v$) = 4 km/hr.\n"
        "- Downstream speed of the boat = $u + v = 13 + 4 = 17$ km/hr.\n"
        "- Distance downstream = 68 km.\n"
        "- Time taken = Distance / Downstream Speed = $68 / 17 = 4$ hours.\n\n"
        "**Conclusion:** Hence, Option **B** is the correct response."
    )

    # 1. Update JSON file
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        modified = False
        for q in data:
            uid = q.get("unique_id")
            
            # Q46 Option E fix
            if uid == "sbi_po_prelims_test1_46":
                print("Fixing Q46 Option E in JSON...")
                for opt in q.get("options", []):
                    if opt.get("id") == "e":
                        opt["text"] = "58"
                modified = True
                
            # Q59 Question text fix
            if uid == "sbi_po_prelims_test1_59":
                print("Fixing Q59 Question Text in JSON...")
                new_q = "$\\sqrt[3]{729.14} + 11.01^3 + 60.24\\% \\text{ of } 449.86 = ?$"
                q["question"] = new_q
                q["q"] = new_q
                q["raw_question"] = new_q
                modified = True
                
            # Q64 Option E fix
            if uid == "sbi_po_prelims_test1_64":
                print("Fixing Q64 Option E in JSON...")
                for opt in q.get("options", []):
                    if opt.get("id") == "e":
                        opt["text"] = "24"
                modified = True
                
            # Replace Q66 to Q70 with medium level Quant questions
            if uid == "sbi_po_prelims_test1_66":
                print("Replacing Q66 in JSON...")
                q["question"] = q66_text
                q["q"] = q66_text
                q["raw_question"] = q66_text
                q["options"] = q66_opts
                q["raw_options"] = q66_opts
                q["correct_option"] = "B"
                q["correct_answer"] = "B"
                q["correct_letter"] = "B"
                q["explanation"] = q66_expl
                q["raw_explanation"] = q66_expl
                q["direction"] = ""
                q["raw_direction"] = ""
                modified = True
                
            if uid == "sbi_po_prelims_test1_67":
                print("Replacing Q67 in JSON...")
                q["question"] = q67_text
                q["q"] = q67_text
                q["raw_question"] = q67_text
                q["options"] = q67_opts
                q["raw_options"] = q67_opts
                q["correct_option"] = "B"
                q["correct_answer"] = "B"
                q["correct_letter"] = "B"
                q["explanation"] = q67_expl
                q["raw_explanation"] = q67_expl
                q["direction"] = ""
                q["raw_direction"] = ""
                modified = True
                
            if uid == "sbi_po_prelims_test1_68":
                print("Replacing Q68 in JSON...")
                q["question"] = q68_text
                q["q"] = q68_text
                q["raw_question"] = q68_text
                q["options"] = q68_opts
                q["raw_options"] = q68_opts
                q["correct_option"] = "A"
                q["correct_answer"] = "A"
                q["correct_letter"] = "A"
                q["explanation"] = q68_expl
                q["raw_explanation"] = q68_expl
                q["direction"] = ""
                q["raw_direction"] = ""
                modified = True
                
            if uid == "sbi_po_prelims_test1_69":
                print("Replacing Q69 in JSON...")
                q["question"] = q69_text
                q["q"] = q69_text
                q["raw_question"] = q69_text
                q["options"] = q69_opts
                q["raw_options"] = q69_opts
                q["correct_option"] = "B"
                q["correct_answer"] = "B"
                q["correct_letter"] = "B"
                q["explanation"] = q69_expl
                q["raw_explanation"] = q69_expl
                q["direction"] = ""
                q["raw_direction"] = ""
                modified = True
                
            if uid == "sbi_po_prelims_test1_70":
                print("Replacing Q70 in JSON...")
                q["question"] = q70_text
                q["q"] = q70_text
                q["raw_question"] = q70_text
                q["options"] = q70_opts
                q["raw_options"] = q70_opts
                q["correct_option"] = "B"
                q["correct_answer"] = "B"
                q["correct_letter"] = "B"
                q["explanation"] = q70_expl
                q["raw_explanation"] = q70_expl
                q["direction"] = ""
                q["raw_direction"] = ""
                modified = True

        if modified:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print("Successfully updated local JSON file with Quant fixes!")
        else:
            print("No matching questions found in JSON file.")
    else:
        print(f"Error: JSON file not found at {json_path}")
        
    # 2. Update MongoDB
    mongo_uri = None
    env_file = os.path.join(root_dir, "backend", ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("MONGODB_URI="):
                    mongo_uri = line.split("=", 1)[1].strip()
                    break
                    
    if mongo_uri:
        try:
            print("Connecting to MongoDB database...")
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client.kr_academy
            questions_col = db.questions
            print("Connected to MongoDB successfully!")
            
            # Update Q46 Option E
            print("Updating Q46 Option E in DB...")
            q46 = questions_col.find_one({"unique_id": "sbi_po_prelims_test1_46"})
            if q46 and q46.get("options"):
                updated_opts = []
                for o in q46.get("options"):
                    if isinstance(o, dict):
                        if o.get("id") == "e":
                            o["text"] = "58"
                        updated_opts.append(o)
                    else:
                        if "58 7" in str(o):
                            updated_opts.append("58")
                        else:
                            updated_opts.append(o)
                questions_col.update_one(
                    {"unique_id": "sbi_po_prelims_test1_46"},
                    {"$set": {"options": updated_opts, "raw_options": updated_opts}}
                )
                
            # Update Q59 Question Text
            print("Updating Q59 in DB...")
            new_q59 = "$\\sqrt[3]{729.14} + 11.01^3 + 60.24\\% \\text{ of } 449.86 = ?$"
            questions_col.update_one(
                {"unique_id": "sbi_po_prelims_test1_59"},
                {"$set": {"question": new_q59, "q": new_q59, "raw_question": new_q59}}
            )
            
            # Update Q64 Option E
            print("Updating Q64 Option E in DB...")
            q64 = questions_col.find_one({"unique_id": "sbi_po_prelims_test1_64"})
            if q64 and q64.get("options"):
                updated_opts = []
                for o in q64.get("options"):
                    if isinstance(o, dict):
                        if o.get("id") == "e":
                            o["text"] = "24"
                        updated_opts.append(o)
                    else:
                        if "24 12" in str(o):
                            updated_opts.append("24")
                        else:
                            updated_opts.append(o)
                questions_col.update_one(
                    {"unique_id": "sbi_po_prelims_test1_64"},
                    {"$set": {"options": updated_opts, "raw_options": updated_opts}}
                )

            # Update Q66
            print("Updating Q66 in DB...")
            questions_col.update_one(
                {"unique_id": "sbi_po_prelims_test1_66"},
                {"$set": {
                    "question": q66_text, "q": q66_text, "raw_question": q66_text,
                    "options": [o["text"] for o in q66_opts], "raw_options": [o["text"] for o in q66_opts],
                    "correct_option": "B", "correct_answer": "B", "correct_letter": "B",
                    "explanation": q66_expl, "raw_explanation": q66_expl,
                    "direction": "", "raw_direction": ""
                }}
            )

            # Update Q67
            print("Updating Q67 in DB...")
            questions_col.update_one(
                {"unique_id": "sbi_po_prelims_test1_67"},
                {"$set": {
                    "question": q67_text, "q": q67_text, "raw_question": q67_text,
                    "options": [o["text"] for o in q67_opts], "raw_options": [o["text"] for o in q67_opts],
                    "correct_option": "B", "correct_answer": "B", "correct_letter": "B",
                    "explanation": q67_expl, "raw_explanation": q67_expl,
                    "direction": "", "raw_direction": ""
                }}
            )

            # Update Q68
            print("Updating Q68 in DB...")
            questions_col.update_one(
                {"unique_id": "sbi_po_prelims_test1_68"},
                {"$set": {
                    "question": q68_text, "q": q68_text, "raw_question": q68_text,
                    "options": [o["text"] for o in q68_opts], "raw_options": [o["text"] for o in q68_opts],
                    "correct_option": "A", "correct_answer": "A", "correct_letter": "A",
                    "explanation": q68_expl, "raw_explanation": q68_expl,
                    "direction": "", "raw_direction": ""
                }}
            )

            # Update Q69
            print("Updating Q69 in DB...")
            questions_col.update_one(
                {"unique_id": "sbi_po_prelims_test1_69"},
                {"$set": {
                    "question": q69_text, "q": q69_text, "raw_question": q69_text,
                    "options": [o["text"] for o in q69_opts], "raw_options": [o["text"] for o in q69_opts],
                    "correct_option": "B", "correct_answer": "B", "correct_letter": "B",
                    "explanation": q69_expl, "raw_explanation": q69_expl,
                    "direction": "", "raw_direction": ""
                }}
            )

            # Update Q70
            print("Updating Q70 in DB...")
            questions_col.update_one(
                {"unique_id": "sbi_po_prelims_test1_70"},
                {"$set": {
                    "question": q70_text, "q": q70_text, "raw_question": q70_text,
                    "options": [o["text"] for o in q70_opts], "raw_options": [o["text"] for o in q70_opts],
                    "correct_option": "B", "correct_answer": "B", "correct_letter": "B",
                    "explanation": q70_expl, "raw_explanation": q70_expl,
                    "direction": "", "raw_direction": ""
                }}
            )
            print("Successfully updated all DB records for Quant fixes!")
        except Exception as e:
            print(f"Error updating MongoDB: {e}")
    else:
        print("Error: MongoDB URI not found in backend/.env")

if __name__ == "__main__":
    run()
