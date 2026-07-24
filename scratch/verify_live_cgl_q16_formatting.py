import urllib.request
import json

def verify():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=SSC&sub_type=SSC%20CGL%20Prelims%20-%20Test%201&test_id=sc_cgl_tier1_test1"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Querying live CGL Test 1 questions to verify formatting...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            
            q16 = None
            for q in questions:
                if q.get("question_number") == 16 or q.get("display_question_number") == 16:
                    q16 = q
                    break
                    
            if q16:
                print("\n--- LIVE QUESTION 16 DETAILS (VERIFIED) ---")
                print("Question:")
                print(repr(q16.get("q", q16.get("question_text"))))
                print("\nExplanation:")
                print(repr(q16.get("explanation")))
            else:
                print("Question 16 not found.")
    except Exception as e:
        print(f"Failed to query live API: {e}")

if __name__ == "__main__":
    verify()
