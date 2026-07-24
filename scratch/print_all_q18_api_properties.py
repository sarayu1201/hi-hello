import urllib.request
import urllib.parse
import json

def check():
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
                q_text = q.get("question_text", q.get("question", "")) or ""
                if "Rajiv is a boy" in q_text:
                    q18 = q
                    break
                    
            if q18:
                print("\n--- ALL PROPERTIES OF QUESTION 18 IN DB ---")
                for k, v in q18.items():
                    print(f"  {k}: {repr(v)}")
            else:
                print("Question containing 'Rajiv is a boy' not found.")
    except Exception as e:
        print(f"Failed to query live CGL API: {e}")

if __name__ == "__main__":
    check()
