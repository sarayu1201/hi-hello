import urllib.request
import json

def verify():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=Banking&sub_type=SBI%20Clerk%20Prelims%20-%20Test%206&test_id=sbi_clerk_test_6"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Querying live Banking Test 6 questions from Railway...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            
            q90 = None
            for q in questions:
                if q.get("question_number") == 90 or q.get("id") == 90:
                    q90 = q
                    break
                    
            if q90:
                print("\n--- LIVE QUESTION 90 DETAILS ---")
                print("Direction:")
                print(repr(q90.get("direction")))
                print("Options:")
                print(q90.get("options"))
            else:
                print("Question 90 not found in API response.")
    except Exception as e:
        print(f"Failed to query live API: {e}")

if __name__ == "__main__":
    verify()
