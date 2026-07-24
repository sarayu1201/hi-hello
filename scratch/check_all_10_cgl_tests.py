import urllib.request
import urllib.parse
import json

def check_all():
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for t_num in range(1, 11):
        url = f"https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=SSC&sub_type=SSC%20CGL%20Prelims%20-%20Test%20{t_num}&test_id=sc_cgl_tier1_test{t_num}"
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                questions = data.get("questions", [])
                
                print(f"Test {t_num}: Count = {len(questions)} questions")
                if questions:
                    q1 = questions[0]
                    print(f"  Q#1: {repr(q1.get('question_text', q1.get('question'))[:120])}...")
                else:
                    print("  No questions returned!")
        except Exception as e:
            print(f"Test {t_num} Error: {e}")

if __name__ == "__main__":
    check_all()
