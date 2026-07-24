import os
import re
from pymongo import MongoClient
import json

def run_enrich():
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
    
    # Define detailed explanations for all 22 questions
    explanations = {
        # Test 8
        ("sbi_clerk_test_8.json", 85): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Odd One Out (Alphabet Series) - Analyze the letter-to-letter gap pattern.\n\n"
            "**Step 1 (Problem Setup):** Study the letter transitions for all options:\n"
            "1. STQ: S (+1) -> T (-3) -> Q\n"
            "2. FGD: F (+1) -> G (-3) -> D\n"
            "3. WXU: W (+1) -> X (-3) -> U\n"
            "4. KLJ: K (+1) -> L (-2) -> J\n"
            "5. EFC: E (+1) -> F (-3) -> C\n\n"
            "**Step 2 (Detailed Solution):** All groups except KLJ follow the sequence pattern where the second letter is +1 step from the first, and the third letter is -3 steps from the second. KLJ violates this pattern because L (-2) is J (instead of L (-3) = I).\n\n"
            "**Step 3 (Verification & Calculation):** Since KLJ is the only group not conforming to the general (+1, -3) spacing rule, it is the odd one out.\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        # Test 9
        ("sbi_clerk_test_9.json", 69): (
            "**Correct Answer:** Option **B**\n\n"
            "**Key Concept:** Floor Puzzle - Logical sequence and floor assignments.\n\n"
            "**Step 1 (Problem Setup):** Establish the 8 floors (1 to 8) and solve according to the clues:\n"
            "- G is on a prime floor (2, 3, 5, 7) two floors above A. This yields three sub-cases: (G=3, A=1), (G=5, A=3), or (G=7, A=5).\n"
            "- Four floors exist between A and E. If A=1, E=6. If A=3, E=8.\n"
            "- As many floors are above A as below H. If A=1, H=8. If A=3, H=6.\n\n"
            "**Step 2 (Detailed Solution):** Testing Case 2 (A=3, G=5, E=8, H=6): More than 3 floors between H and D requires D=1. Remaining spots for C > F > B are 7, 4, 2. This places B on floor 2 and D on 1, violating the clue that B is not immediately above D. Thus, Case 1 (A=1, G=3, E=6, H=8) is correct. Placing D on 2, and C > F > B on 7, 5, 4, we get: Floor 8: H, Floor 7: C, Floor 6: E, Floor 5: F, Floor 4: B, Floor 3: G, Floor 2: D, Floor 1: A.\n\n"
            "**Step 3 (Verification & Calculation):** Based on the derived table, E lives on the sixth floor.\n\n"
            "**Conclusion:** The evaluated result confirms Option **B** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 70): (
            "**Correct Answer:** Option **B**\n\n"
            "**Key Concept:** Floor Puzzle - Finding gaps between floors.\n\n"
            "**Step 1 (Problem Setup):** Use the solved floor grid layout:\n"
            "- Floor 8: H, Floor 7: C, Floor 6: E, Floor 5: F, Floor 4: B, Floor 3: G, Floor 2: D, Floor 1: A.\n\n"
            "**Step 2 (Detailed Solution):** Check the gap of one floor between the options:\n"
            "- C (7) and E (6): Adjacent floors (0 gap).\n"
            "- A (1) and G (3): Floor 2 (D) lies between them, meaning there is a gap of exactly one floor.\n"
            "- F (5) and D (2): Two floors between them (gap of 2).\n\n"
            "**Step 3 (Verification & Calculation):** A and G live on floors 1 and 3 respectively, creating a gap of one floor between them.\n\n"
            "**Conclusion:** The evaluated result confirms Option **B** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 71): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Floor Puzzle - Distance between floor positions.\n\n"
            "**Step 1 (Problem Setup):** Refer to the finalized floor arrangement:\n"
            "- Floor 8: H, Floor 7: C, Floor 6: E, Floor 5: F, Floor 4: B, Floor 3: G, Floor 2: D, Floor 1: A.\n\n"
            "**Step 2 (Detailed Solution):** Locate the floors of H and F:\n"
            "- H lives on Floor 8.\n"
            "- F lives on Floor 5.\n"
            "The floors between them are Floor 7 (C) and Floor 6 (E).\n\n"
            "**Step 3 (Verification & Calculation):** Counting the floors between Floor 8 and Floor 5 gives exactly two floors (Floor 6 and Floor 7).\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 72): (
            "**Correct Answer:** Option **B**\n\n"
            "**Key Concept:** Floor Puzzle - Verifying statements against the final arrangement.\n\n"
            "**Step 1 (Problem Setup):** Use the completed floor sequence:\n"
            "- Floor 8: H, Floor 7: C, Floor 6: E, Floor 5: F, Floor 4: B, Floor 3: G, Floor 2: D, Floor 1: A.\n\n"
            "**Step 2 (Detailed Solution):** Evaluate each statement:\n"
            "- I. H lives on a floor above E: H (8) is above E (6) - True.\n"
            "- II. D lives on the bottommost floor: D (2) is on the second floor, not bottommost (1) - False.\n"
            "- III. F lives on the fourth floor: F (5) is on the fifth floor, not fourth (4) - False.\n"
            "Therefore, statements II and III are false.\n\n"
            "**Step 3 (Verification & Calculation):** Since only statement I is true, the false statements are II and III.\n\n"
            "**Conclusion:** The evaluated result confirms Option **B** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 74): (
            "**Correct Answer:** Option **E**\n\n"
            "**Key Concept:** Direction Sense - Plotting coordinate paths.\n\n"
            "**Step 1 (Problem Setup):** Establish a 2D coordinate system placing Q at (0, 0):\n"
            "- Q = (0, 0)\n"
            "- F = (13, 0) (13m east of Q)\n"
            "- T = (13, 6) (6m north of F)\n"
            "- P = (23, 6) (T is 10m west of P)\n"
            "- R = (23, 1) (5m south of P)\n"
            "- S = (15, 1) (8m west of R)\n"
            "- J = (15, -11) (12m south of S)\n"
            "- M = (13, -11) (2m west of J)\n"
            "- N = (0, -11) (11m south of Q)\n\n"
            "**Step 2 (Detailed Solution):** Compare the coordinates of T (13, 6) and M (13, -11). Both have the same X-coordinate (13). Since T's Y-coordinate (+6) is greater than M's (-11), T lies directly north of M.\n\n"
            "**Step 3 (Verification & Calculation):** Point T is directly north of Point M.\n\n"
            "**Conclusion:** The evaluated result confirms Option **E** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 75): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Direction Sense - Shortest distance using Pythagoras' theorem.\n\n"
            "**Step 1 (Problem Setup):** Use coordinates of R and M from the solved system:\n"
            "- R = (23, 1)\n"
            "- M = (13, -11)\n\n"
            "**Step 2 (Detailed Solution):** Compute the horizontal and vertical distances:\n"
            "- Delta X = 23 - 13 = 10 m\n"
            "- Delta Y = 1 - (-11) = 12 m\n"
            "Using Pythagoras' theorem: Shortest Distance = sqrt(Delta X^2 + Delta Y^2) = sqrt(10^2 + 12^2) = sqrt(100 + 144) = sqrt(244) m.\n\n"
            "**Step 3 (Verification & Calculation):** The exact shortest distance between R and M is sqrt(244) meters.\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 76): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Direction Sense - Cumulative path calculation.\n\n"
            "**Step 1 (Problem Setup):** Use the coordinates:\n"
            "- M = (13, -11)\n"
            "- G = (13, -7) (4m north of M)\n"
            "- Q = (0, 0)\n\n"
            "**Step 2 (Detailed Solution):** Compute the path distance from G to Q along the established point sequence: G (13, -7) -> M (13, -11) -> J (15, -11) -> S (15, 1) -> R (23, 1) -> P (23, 6) -> T (13, 6) -> F (13, 0) -> Q (0, 0).\n"
            "Path segments: G to M (4m) + M to J (2m) + J to S (12m) + S to R (8m) + R to P (5m) + P to T (10m) + T to F (6m) + F to Q (13m).\n"
            "Total distance = 4 + 2 + 12 + 8 + 5 + 10 + 6 + 13 = 60 m.\n\n"
            "**Step 3 (Verification & Calculation):** Summing all individual line segments of the path gives exactly 60 meters.\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 98): (
            "**Correct Answer:** Option **C**\n\n"
            "**Key Concept:** Linear Row Puzzle (North Facing) - Finding seat numbers.\n\n"
            "**Step 1 (Problem Setup):** Let positions start from 1 at the extreme left end:\n"
            "- P = 1 (leftmost position)\n"
            "- N is 5th to the right of P, so N = 6.\n"
            "- Two persons between N and G: G can be 3 or 9. Since G is 3rd to the left of K (K = G + 3), G=3 yields K=6 (overlapping with N). Thus, G = 9 and K = 12.\n"
            "- K (12) is second from the extreme end, which means the extreme right end is 13 (total 13 seats).\n"
            "- One person sits between K and Q, so Q = 10.\n"
            "- Persons between N (6) and Q (10) is 3. Since P (1) to R must also contain 3 persons, R = 5.\n\n"
            "**Step 2 (Detailed Solution):** With R = 5, finding the person 7th to the right of R:\n"
            "Position = 5 + 7 = 12. Since K is at position 12, K is 7th to the right of R.\n\n"
            "**Step 3 (Verification & Calculation):** 5 + 7 = 12, which corresponds to the seat of K.\n\n"
            "**Conclusion:** The evaluated result confirms Option **C** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 99): (
            "**Correct Answer:** Option **E**\n\n"
            "**Key Concept:** Linear Row Puzzle (North Facing) - Finding element positions.\n\n"
            "**Step 1 (Problem Setup):** Establish the row coordinate sequence:\n"
            "P(1) - _(2) - _(3) - _(4) - R(5) - N(6) - _(7) - _(8) - G(9) - Q(10) - _(11) - K(12) - _(13)\n"
            "Total elements in row = 13.\n\n"
            "**Step 2 (Detailed Solution):** Locate N's position in this 13-person row:\n"
            "- N is at position 6, which is 6th from the left end.\n"
            "- From the right end, N's position is: (Total - Left_Position + 1) = 13 - 6 + 1 = 8th from the right end.\n\n"
            "**Step 3 (Verification & Calculation):** Counting seats from the right end (13, 12, 11, 10, 9, 8, 7, 6) confirms N is the 8th person from the right end.\n\n"
            "**Conclusion:** The evaluated result confirms Option **E** as the correct answer."
        ),
        ("sbi_clerk_test_9.json", 100): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Linear Row Puzzle (North Facing) - Total count calculation.\n\n"
            "**Step 1 (Problem Setup):** Follow the step-by-step seat assignments:\n"
            "- P = 1 (extreme left end)\n"
            "- N = 6 (5th to the right of P)\n"
            "- G = 9 (2 persons between N and G, right side since left side G=3 yields K=6 which overlaps with N)\n"
            "- K = 12 (G is 3rd to the left of K)\n\n"
            "**Step 2 (Detailed Solution):** Since K sits second from an extreme end of the row, and the left end is already occupied by P (1), K must be second from the extreme right end. This places the extreme right end at position 13.\n\n"
            "**Step 3 (Verification & Calculation):** The total number of positions from 1 (P) to the end (13) is 13.\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        # Test 10
        ("sbi_clerk_test_10.json", 75): (
            "**Correct Answer:** Option **B**\n\n"
            "**Key Concept:** Scheduling Puzzle - Determining weekly schedule.\n\n"
            "**Step 1 (Problem Setup):** Schedule 7 persons (A-G) from Monday to Sunday:\n"
            "- G goes 3 days after A (A _ _ G). So if A = Mon, G = Thu. If A = Tue, G = Fri. If A = Wed, G = Sat.\n"
            "- G is before B and after C (C > G > B). B is before E (B > E).\n"
            "- Two persons go between E and D. C is after F (F > C).\n\n"
            "**Step 2 (Detailed Solution):** Test the case A = Tue, G = Fri:\n"
            "- Since G=Fri and B > E, B must be Sat and E must be Sun.\n"
            "- With E = Sun, two days between E and D requires D = Thu.\n"
            "- Remaining slots for F and C are Mon and Wed. Since F > C, F = Mon and C = Wed.\n"
            "- Verify: Mon: F, Tue: A, Wed: C, Thu: D, Fri: G, Sat: B, Sun: E. All clues match.\n\n"
            "**Step 3 (Verification & Calculation):** Looking at the finalized schedule, D watches the show on Thursday.\n\n"
            "**Conclusion:** The evaluated result confirms Option **B** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 76): (
            "**Correct Answer:** Option **C**\n\n"
            "**Key Concept:** Scheduling Puzzle - Gap between scheduled days.\n\n"
            "**Step 1 (Problem Setup):** Use the solved show schedule:\n"
            "- Mon: F, Tue: A, Wed: C, Thu: D, Fri: G, Sat: B, Sun: E.\n\n"
            "**Step 2 (Detailed Solution):** Locate F and G in the schedule:\n"
            "- F watches the show on Monday.\n"
            "- G watches the show on Friday.\n"
            "The persons between them are A (Tuesday), C (Wednesday), and D (Thursday).\n\n"
            "**Step 3 (Verification & Calculation):** Counting the persons between Monday and Friday gives exactly three persons (A, C, and D).\n\n"
            "**Conclusion:** The evaluated result confirms Option **C** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 77): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Scheduling Puzzle - Evaluating statements.\n\n"
            "**Step 1 (Problem Setup):** Refer to the finalized week schedule:\n"
            "- Mon: F, Tue: A, Wed: C, Thu: D, Fri: G, Sat: B, Sun: E.\n\n"
            "**Step 2 (Detailed Solution):** Check each statement:\n"
            "- A. C goes on Tuesday: False (C goes on Wednesday).\n"
            "- B. D goes immediately before B: False (D goes on Thursday, B on Saturday).\n"
            "- C. F doesn't go on Monday: False (F goes on Monday).\n"
            "- D. E goes two days after G: True (G goes on Friday, E goes on Sunday, which is two days later).\n\n"
            "**Step 3 (Verification & Calculation):** Only statement D is correct according to the weekly schedule.\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 78): (
            "**Correct Answer:** Option **E**\n\n"
            "**Key Concept:** Scheduling Puzzle - Identifying schedule days.\n\n"
            "**Step 1 (Problem Setup):** Use the completed scheduling order:\n"
            "- Mon: F, Tue: A, Wed: C, Thu: D, Fri: G, Sat: B, Sun: E.\n\n"
            "**Step 2 (Detailed Solution):** Look up Saturday in the schedule:\n"
            "- Saturday is assigned to B.\n\n"
            "**Step 3 (Verification & Calculation):** The person who goes on Saturday is B.\n\n"
            "**Conclusion:** The evaluated result confirms Option **E** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 79): (
            "**Correct Answer:** Option **D**\n\n"
            "**Key Concept:** Scheduling Puzzle - Matching preceding/succeeding counts.\n\n"
            "**Step 1 (Problem Setup):** Refer to the solved schedule:\n"
            "- Mon: F, Tue: A, Wed: C, Thu: D, Fri: G, Sat: B, Sun: E.\n\n"
            "**Step 2 (Detailed Solution):** Calculate the number of persons before A:\n"
            "- A goes on Tuesday, so there is exactly 1 person before A (F).\n"
            "Now look for the person who has exactly 1 person going after them:\n"
            "- B goes on Saturday, so only E (Sunday) goes after B (exactly 1 person).\n\n"
            "**Step 3 (Verification & Calculation):** The count of 1 person before A matches the count of 1 person after B.\n\n"
            "**Conclusion:** The evaluated result confirms Option **D** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 93): (
            "**Correct Answer:** Option **A**\n\n"
            "**Key Concept:** Day/Market Puzzle - Finding sequence relationships.\n\n"
            "**Step 1 (Problem Setup):** Solve the market puzzle sequence for 8 persons (P-W):\n"
            "- P goes 3 spots before T (P _ _ T).\n"
            "- Two persons go between T and V. If P=1, T=4, and V=7.\n"
            "- W goes immediately before Q (WQ consecutive).\n"
            "- One person goes between W and R (R _ W Q or W Q _ R). S is after R who is after U (U > R > S).\n\n"
            "**Step 2 (Detailed Solution):** Placing R=3, W=5, Q=6: S=8 (after R) and U=2 (before R) perfectly satisfies all rules. The final sequence is:\n"
            "1: P, 2: U, 3: R, 4: T, 5: W, 6: Q, 7: V, 8: S.\n"
            "Count persons before T (4) = 3 (P, U, R).\n"
            "Find who has 3 persons between them and R (3): Position = 3 + 3 + 1 = 7, which is V.\n\n"
            "**Step 3 (Verification & Calculation):** Three persons go before T, and three persons go between R and V.\n\n"
            "**Conclusion:** The evaluated result confirms Option **A** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 94): (
            "**Correct Answer:** Option **C**\n\n"
            "**Key Concept:** Day/Market Puzzle - Checking statement veracity.\n\n"
            "**Step 1 (Problem Setup):** Refer to the finalized sequence:\n"
            "1: P, 2: U, 3: R, 4: T, 5: W, 6: Q, 7: V, 8: S.\n\n"
            "**Step 2 (Detailed Solution):** Evaluate each statement:\n"
            "- A. W went after T: W (5) is after T (4) - True.\n"
            "- B. S was the last person: S (8) is last - True.\n"
            "- C. Three persons went between U and S: U (2) and S (8) have 5 persons between them - False.\n"
            "- D. Q went after P: Q (6) is after P (1) - True.\n\n"
            "**Step 3 (Verification & Calculation):** Only statement C is false according to the schedule.\n\n"
            "**Conclusion:** The evaluated result confirms Option **C** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 95): (
            "**Correct Answer:** Option **A**\n\n"
            "**Key Concept:** Day/Market Puzzle - Count between two positions.\n\n"
            "**Step 1 (Problem Setup):** Refer to the solved sequence:\n"
            "1: P, 2: U, 3: R, 4: T, 5: W, 6: Q, 7: V, 8: S.\n\n"
            "**Step 2 (Detailed Solution):** Find the positions of R and T:\n"
            "- R goes 3rd.\n"
            "- T goes 4th.\n"
            "They are consecutive, so there are zero (None) persons between them.\n\n"
            "**Step 3 (Verification & Calculation):** No positions exist between 3 and 4, so the count is 0.\n\n"
            "**Conclusion:** The evaluated result confirms Option **A** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 97): (
            "**Correct Answer:** Option **A**\n\n"
            "**Key Concept:** Blood Relation - Solving family trees.\n\n"
            "**Step 1 (Problem Setup):** Analyze the given relation clues:\n"
            "- A is daughter of C and D. D is father of I.\n"
            "- O is son of F. E is niece of O.\n"
            "- H is grandson of F. G is one of the members. A is married. Only 2 married couples.\n\n"
            "**Step 2 (Detailed Solution):** Since there are only 2 married couples and A is married, one couple is C & D. Since H is grandson of F, and O (son of F) has no child, the other couple must be G & A (with G being son of F and brother of O). Their children are H and E. Since G is married to D's daughter A, G is the son-in-law of D.\n\n"
            "**Step 3 (Verification & Calculation):** G is married to A (daughter of D), making G the son-in-law of D.\n\n"
            "**Conclusion:** The evaluated result confirms Option **A** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 98): (
            "**Correct Answer:** Option **E**\n\n"
            "**Key Concept:** Blood Relation - Verifying statements against the family tree.\n\n"
            "**Step 1 (Problem Setup):** Establish the solved family structure:\n"
            "- Couple 1: D (Male) & C (Female) -> Children: A (Female), I (Female).\n"
            "- Couple 2: G (Male) & A (Female) -> Children: H (Male), E (Female).\n"
            "- F (Female) -> Children: G (Male), O (Male).\n\n"
            "**Step 2 (Detailed Solution):** Evaluate each statement:\n"
            "- A. H is the father of E: False (H is E's brother).\n"
            "- B. A is the father of E: False (A is E's mother).\n"
            "- C. O is the brother of I: False (O is brother of G, not I).\n"
            "- D. A is the niece of F: False (A is F's daughter-in-law).\n"
            "Thus, none of the statements is true.\n\n"
            "**Step 3 (Verification & Calculation):** All statements A-D are incorrect, making 'None is true' the correct choice.\n\n"
            "**Conclusion:** The evaluated result confirms Option **E** as the correct answer."
        ),
        ("sbi_clerk_test_10.json", 99): (
            "**Correct Answer:** Option **C**\n\n"
            "**Key Concept:** Blood Relation - Determining relationships from the tree.\n\n"
            "**Step 1 (Problem Setup):** Refer to the solved family tree:\n"
            "- Parents of H: G (Male) and A (Female).\n"
            "- G's brother: O (Male).\n\n"
            "**Step 2 (Detailed Solution):** Since H is the son of G, and O is G's brother, H is the nephew of O.\n\n"
            "**Step 3 (Verification & Calculation):** The son of a person's brother is their nephew.\n\n"
            "**Conclusion:** The evaluated result confirms Option **C** as the correct answer."
        )
    }
    
    # 1. Update on disk
    for (filename, q_id), new_expl in explanations.items():
        disk_path = os.path.join(root_dir, "QuestionBank", "json", "sbi clerk", filename)
        if not os.path.exists(disk_path):
            continue
            
        with open(disk_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        modified = False
        for q in data:
            if q.get("id") == q_id:
                # For Q100 in Test 9, we also update correct index to 3 and option letter to D
                if filename == "sbi_clerk_test_9.json" and q_id == 100:
                    q["correct"] = 3
                    # Update correct letter in explanation block
                    new_expl = new_expl.replace("Option **A**", "Option **D**").replace("Option **A** as", "Option **D** as")
                q["explanation"] = new_expl
                modified = True
                break
                
        if modified:
            with open(disk_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            print(f"Updated {filename} Q{q_id} explanation on local disk.")

    # 2. Update live database
    try:
        client = MongoClient(direct_uri)
        db = client[dbname]
        questions_col = db["questions"]
        
        for (filename, q_id), new_expl in explanations.items():
            # For Q100 in Test 9, update correct index to 3 and option to D
            if filename == "sbi_clerk_test_9.json" and q_id == 100:
                new_expl = new_expl.replace("Option **A**", "Option **D**").replace("Option **A** as", "Option **D** as")
                res = questions_col.update_many(
                    {"source_file": filename, "question_number": q_id},
                    {"$set": {
                        "explanation": new_expl,
                        "raw_explanation": new_expl,
                        "correct": 3,
                        "correct_option": "D",
                        "correct_letter": "D",
                        "correct_answer": "D"
                    }}
                )
            else:
                res = questions_col.update_many(
                    {"source_file": filename, "question_number": q_id},
                    {"$set": {
                        "explanation": new_expl,
                        "raw_explanation": new_expl
                    }}
                )
            print(f"Updated DB for {filename} Q{q_id} (Matched: {res.matched_count}, Modified: {res.modified_count}).")
            
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    run_enrich()
