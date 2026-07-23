import urllib.request
import urllib.parse
import json

def check():
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=Banking&sub_type=SBI%20Clerk%20Prelims%20-%20Test%201&test_id=sbi_clerk_prelims_test1"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Fetching questions from live backend API...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            print(f"Fetched {len(questions)} questions successfully.")
            
            # Let's inspect Q#41 (which is index 40)
            if len(questions) > 40:
                q41 = questions[40]
                print("\n--- API RESPONSE FOR Q#41 ---")
                for k, v in q41.items():
                    # Print only metadata and image fields to keep it clean
                    if k in ("question_number", "question_image", "questionImage", "options", "option_images"):
                        print(f"  {k}: {repr(v)}")
            else:
                print("Index 40 is out of bounds in fetched list!")
    except Exception as e:
        print(f"Failed to fetch API response: {e}")

if __name__ == "__main__":
    check()
