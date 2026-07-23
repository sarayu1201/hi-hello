import urllib.request
import urllib.parse
import json

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    
    # 1. Check Q#1 of Test 2
    url_t2 = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=Banking&sub_type=SBI%20Clerk%20Prelims%20-%20Test%202&test_id=sbi_clerk_prelims_test2"
    req_t2 = urllib.request.Request(url_t2, headers=headers)
    try:
        print("Fetching Test 2 questions...")
        with urllib.request.urlopen(req_t2) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            if questions:
                q1 = questions[0]
                print("\n--- TEST 2 QUESTION 1 ---")
                print(f"Question: {repr(q1.get('question'))}")
                print(f"Options:  {repr(q1.get('options'))}")
                print(f"Direction: {repr(q1.get('direction'))[:120]}...")
            else:
                print("Test 2 has no questions yet.")
    except Exception as e:
        print(f"Failed to fetch Test 2: {e}")
        
    # 2. Check Q#13 of Test 1
    url_t1 = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=Banking&sub_type=SBI%20Clerk%20Prelims%20-%20Test%201&test_id=sbi_clerk_prelims_test1"
    req_t1 = urllib.request.Request(url_t1, headers=headers)
    try:
        print("\nFetching Test 1 questions...")
        with urllib.request.urlopen(req_t1) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            if len(questions) > 12:
                q13 = questions[12]
                print("\n--- TEST 1 QUESTION 13 (RC PASSAGE) ---")
                print(f"Question: {repr(q13.get('question'))}")
                print(f"Direction (Passage): {repr(q13.get('direction'))[:200]}...")
            else:
                print("Test 1 has fewer than 13 questions.")
    except Exception as e:
        print(f"Failed to fetch Test 1: {e}")

if __name__ == "__main__":
    check()
