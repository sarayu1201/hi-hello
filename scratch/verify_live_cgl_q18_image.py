import urllib.request
import urllib.parse
import json

def verify():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=SSC&sub_type=SSC%20CGL%20Prelims%20-%20Test%201&test_id=sc_cgl_tier1_test1"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Querying live CGL Test 1 questions...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            
            q18 = None
            for q in questions:
                if q.get("id") == 18 or q.get("question_number") == 18 or q.get("display_question_number") == 18:
                    q18 = q
                    break
                    
            if q18:
                print("\n--- LIVE QUESTION 18 DETAILS (POST-MIGRATION) ---")
                print(f"Question text:  {repr(q18.get('question_text', q18.get('question'))[:120])}...")
                print(f"Question Image: {repr(q18.get('question_image'))}")
                print(f"Option Images:  {repr(q18.get('option_images'))}")
            else:
                print("Question 18 not found.")
    except Exception as e:
        print(f"Failed to query live CGL API: {e}")

if __name__ == "__main__":
    verify()
