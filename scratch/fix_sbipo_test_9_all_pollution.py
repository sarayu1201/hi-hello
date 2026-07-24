import os
import re
from pymongo import MongoClient

def run_fix():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
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
    
    # 1. Clean Q1-Q5
    for q_num in range(1, 6):
        q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": q_num})
        if q:
            opts = q.get("options", [])
            if len(opts) > 0 and opts[0] == ".":
                cleaned_opts = opts[1:]
                questions_col.update_one(
                    {"_id": q["_id"]},
                    {"$set": {
                        "options": cleaned_opts,
                        "raw_options": cleaned_opts,
                        "correct": q.get("correct", 0) # Already points to the shifted index!
                    }}
                )
                print(f"Fixed Q{q_num} (removed leading '.')")

    # Helper function to construct mapped options list
    def make_opts(texts):
        return [{"id": chr(65 + idx), "text": t} for idx, t in enumerate(texts)]

    # 2. Clean Q7
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 7})
    if q:
        q_text = (
            "The following sentence has been divided into parts. One of them may contain an error. "
            "Select the part that contains the error.\n\n"
            "Neither the supervisor nor the workers (A) / has received (B) / the updated safety manuals (C) / from the administration yet. (D) / No error (E)"
        )
        opts = ["A", "B", "C", "D", "No error"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 1,
                "correct_option": "B",
                "correct_letter": "B",
                "correct_answer": "B"
            }}
        )
        print("Fixed Q7 sentence correction.")

    # 3. Clean Q8
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 8})
    if q:
        q_text = (
            "The following sentence has been divided into parts. One of them may contain an error. "
            "Select the part that contains the error.\n\n"
            "Had she studied (A) / more attentively, she (B) / will have cleared (C) / the entrance test. (D) / No error (E)"
        )
        opts = ["A", "B", "C", "D", "No error"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 2,
                "correct_option": "C",
                "correct_letter": "C",
                "correct_answer": "C"
            }}
        )
        print("Fixed Q8 sentence correction.")

    # 4. Clean Q9
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 9})
    if q:
        q_text = (
            "The following sentence has been divided into parts. One of them may contain an error. "
            "Select the part that contains the error.\n\n"
            "The manager insisted (A) / that the reports be submitted (B) / before noon, as punctuality (C) / was something he considered to be. (D) / No error (E)"
        )
        opts = ["A", "B", "C", "D", "No error"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 3,
                "correct_option": "D",
                "correct_letter": "D",
                "correct_answer": "D"
            }}
        )
        print("Fixed Q9 sentence correction.")

    # 5. Clean Q10
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 10})
    if q:
        q_text = (
            "The following sentence has been divided into parts. One of them may contain an error. "
            "Select the part that contains the error.\n\n"
            "The officer was unaware (A) / that his assistant had (B) / already submitted the documents (C) / before he reach the office. (D) / No error (E)"
        )
        opts = ["A", "B", "C", "D", "No error"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 3,
                "correct_option": "D",
                "correct_letter": "D",
                "correct_answer": "D"
            }}
        )
        print("Fixed Q10 sentence correction.")

    # 6. Clean Q11
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 11})
    if q:
        q_text = (
            "The following sentence has been divided into parts. One of them may contain an error. "
            "Select the part that contains the error.\n\n"
            "He was neither interested in the opera (A) / nor he wanted (B) / to spend money (C) / on the concert tickets. (D) / No error (E)"
        )
        opts = ["A", "B", "C", "D", "No error"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 1,
                "correct_option": "B",
                "correct_letter": "B",
                "correct_answer": "B"
            }}
        )
        print("Fixed Q11 sentence correction.")

    # 7. Clean Q18
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 18})
    if q:
        q_text = (
            "Which of the following is NOT a factor contributing to national strength as per the passage?\n\n"
            "(A) Investment in human capital such as education and healthcare.\n"
            "(B) Strong governance that ensures consistent and transparent policy-making.\n"
            "(C) High dependence on a single export-oriented sector for economic growth."
        )
        opts = ["Only A", "Both B and C", "Only C", "Both A and B", "All A, B, C"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 2,
                "correct_option": "C",
                "correct_letter": "C",
                "correct_answer": "C"
            }}
        )
        print("Fixed Q18 reading comprehension.")

    # 8. Clean Q19
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 19})
    if q:
        q_text = (
            "Identify the correct statements based on the passage:\n\n"
            "(A) Angola has been attempting to reduce dependence on oil by investing in people.\n"
            "(B) Global uncertainties make social investment in education and health risky and unwise.\n"
            "(C) Healthcare and education play both moral and economic roles in national development."
        )
        opts = ["Only A", "A and C", "B and C", "A and B", "All A, B, C"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 1,
                "correct_option": "B",
                "correct_letter": "B",
                "correct_answer": "B"
            }}
        )
        print("Fixed Q19 reading comprehension.")

    # 9. Clean Q28
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 28})
    if q:
        q_text = (
            "In the following question, a sentence is divided into few parts. Rearrange these parts and identify the correct sequence making the sentence grammatically and contextually correct.\n\n"
            "(A) for improving\n"
            "(B) student discipline\n"
            "(C) announced a new policy\n"
            "(D) the school principal"
        )
        opts = ["BADC", "DABC", "DCAB", "BCAD", "No rearrangement required"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 2,
                "correct_option": "C",
                "correct_letter": "C",
                "correct_answer": "C"
            }}
        )
        print("Fixed Q28 rearrangement.")

    # 10. Clean Q29
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 29})
    if q:
        q_text = (
            "In the following question, a sentence is divided into few parts. Rearrange these parts and identify the correct sequence making the sentence grammatically and contextually correct.\n\n"
            "(A) levels in the city\n"
            "(B) on reducing pollution\n"
            "(C) the new law had\n"
            "(D) a significant effect"
        )
        opts = ["ADBC", "ACBD", "BDAC", "CDBA", "No rearrangement required"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 3,
                "correct_option": "D",
                "correct_letter": "D",
                "correct_answer": "D"
            }}
        )
        print("Fixed Q29 rearrangement.")

    # 11. Clean Q30
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 30})
    if q:
        q_text = (
            "In the following question, a sentence is divided into few parts. Rearrange these parts and identify the correct sequence making the sentence grammatically and contextually correct.\n\n"
            "(A) the teacher's question\n"
            "(B) thoughtful answers\n"
            "(C) was designed to elicit\n"
            "(D) from the students."
        )
        opts = ["ADBC", "ACBD", "BDAC", "CDBA", "No rearrangement required"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 1,
                "correct_option": "B",
                "correct_letter": "B",
                "correct_answer": "B"
            }}
        )
        print("Fixed Q30 rearrangement.")

    # 12. Clean Q36
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 36})
    if q:
        q_text = "The stock sector (A) closed higher today, driven by gains (B) in the banking market (C)."
        opts = ["BAC", "CAB", "ACB", "CBA", "No rearrangement required"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 3,
                "correct_option": "D",
                "correct_letter": "D",
                "correct_answer": "D"
            }}
        )
        print("Fixed Q36 word rearrangement.")

    # 13. Clean Q37
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 37})
    if q:
        q_text = "Heavy rainfall (A) caused delays in several airport (B) departing from the city flights (C)."
        opts = ["BAC", "CAB", "ACB", "CBA", "No rearrangement required"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 2,
                "correct_option": "C",
                "correct_letter": "C",
                "correct_answer": "C"
            }}
        )
        print("Fixed Q37 word rearrangement.")

    # 14. Clean Q38
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 38})
    if q:
        q_text = "The new policy areas (A) to improve (B) traffic congestion and reduce (C) air quality in urban aims (D)."
        opts = ["BDAC", "CABD", "DCBA", "BADC", "No rearrangement required"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 2,
                "correct_option": "C",
                "correct_letter": "C",
                "correct_answer": "C"
            }}
        )
        print("Fixed Q38 word rearrangement.")

    # 15. Clean Q39
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 39})
    if q:
        q_text = (
            "A word has been given in the question and used in the sentences below. Identify the statements where the word has been used in a contextually and grammatically correct manner.\n\n"
            "COUNSEL\n\n"
            "(A) The psychiatrist offered counsel to help the patient cope with anxiety and emotional distress.\n"
            "(B) The municipal counsel session lasted over four hours as members debated the proposed zoning changes.\n"
            "(C) She sought legal counsel before signing the complex contract to ensure her interests were protected."
        )
        opts = ["Only (A)", "Only (B)", "Both (A) and (B)", "All of these", "Both (A) and (C)"]
        questions_col.update_one(
            {"_id": q["_id"]},
            {"$set": {
                "question": q_text,
                "q": q_text,
                "raw_question": q_text,
                "options": opts,
                "raw_options": opts,
                "correct": 4,
                "correct_option": "E",
                "correct_letter": "E",
                "correct_answer": "E"
            }}
        )
        print("Fixed Q39 vocabulary usage.")

    # 16. Clean Q58
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 58})
    if q:
        opts = q.get("options", [])
        if len(opts) > 5:
            cleaned_opts = opts[:5]
            questions_col.update_one(
                {"_id": q["_id"]},
                {"$set": {
                    "options": cleaned_opts,
                    "raw_options": cleaned_opts,
                    "correct": 3,
                    "correct_option": "D",
                    "correct_letter": "D",
                    "correct_answer": "D"
                }}
            )
            print("Fixed Q58 math MCQ options.")

    # 17. Clean Q75
    q = questions_col.find_one({"source_file": "sbipo_test_9.json", "question_number": 75})
    if q:
        opts = q.get("options", [])
        if len(opts) > 5:
            cleaned_opts = opts[:5]
            questions_col.update_one(
                {"_id": q["_id"]},
                {"$set": {
                    "options": cleaned_opts,
                    "raw_options": cleaned_opts,
                    "correct": 1,
                    "correct_option": "B",
                    "correct_letter": "B",
                    "correct_answer": "B"
                }}
            )
            print("Fixed Q75 reasoning MCQ options.")

    print("\nDatabase option pollution fixes completed successfully!")

if __name__ == "__main__":
    run_fix()
