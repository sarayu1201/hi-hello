import urllib.request
import urllib.parse
import json

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=Banking&sub_type=SBI%20Clerk%20Prelims%20-%20Test%201&test_id=sbi_clerk_prelims_test1"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Fetching Test 1 questions...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            if questions:
                q1 = questions[0]
                print("\n--- TEST 1 QUESTION 1 FROM API ---")
                print(f"Question:   {repr(q1.get('question'))}")
                print(f"Direction:  {repr(q1.get('direction'))}")
                print(f"Raw Dir:    {repr(q1.get('raw_direction'))}")
            else:
                print("No questions found.")
    except Exception as e:
        print(f"Failed to fetch Test 1: {e}")

if __name__ == "__main__":
    check()
