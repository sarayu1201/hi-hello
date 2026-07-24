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
            print(f"Total questions returned: {len(questions)}")
            if questions:
                q1 = questions[0]
                print("\n--- FIRST QUESTION RETURNED BY LIVE API ---")
                for k, v in q1.items():
                    if k not in ["options", "explanation"]:
                        print(f"  {k}: {repr(v)}")
                    elif k == "options":
                        print("  options:")
                        for opt in v:
                            print(f"    {repr(opt)}")
            else:
                print("No questions returned.")
    except Exception as e:
        print(f"Failed to query live CGL API: {e}")

if __name__ == "__main__":
    check()
