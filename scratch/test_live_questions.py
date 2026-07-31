import urllib.request
import json

url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=IBPS%20Clerk%20Prelims&test_id=ibps_clerk_prelims_test1"

print(f"Fetching questions from live API: {url}")
try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        questions = data.get("questions", [])
        print(f"Total questions returned: {len(questions)}")
        
        # Check Q41-45 (which are index 40-44)
        for i in range(40, 45):
            if i < len(questions):
                q = questions[i]
                print(f"Q{q.get('id')} - {q.get('question')[:40]}...")
                print(f"  question_image: {repr(q.get('question_image'))}")
                
except Exception as e:
    print(f"Error: {e}")
