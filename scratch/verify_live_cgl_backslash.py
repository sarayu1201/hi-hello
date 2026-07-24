import urllib.request
import urllib.parse
import json

def verify():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=SSC&sub_type=SSC%20CGL%20Prelims%20-%20Test%206&test_id=sc_cgl_tier1_test6"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Querying live CGL Test 6 Q1...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            if questions:
                q1 = questions[0]
                print("\n--- LIVE MATH DEPLOYED ON RAILWAY ---")
                print(f"Question:      {repr(q1.get('question_text', q1.get('question')))}")
                print(f"Explanation:   {repr(q1.get('explanation'))}")
            else:
                print("No questions returned.")
    except Exception as e:
        print(f"Failed to query live CGL API: {e}")

if __name__ == "__main__":
    verify()
