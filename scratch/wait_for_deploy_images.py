import urllib.request
import urllib.parse
import json
import time

def monitor():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=SSC&sub_type=SSC%20CGL%20Prelims%20-%20Test%201&test_id=sc_cgl_tier1_test1"
    req = urllib.request.Request(url, headers=headers)
    
    print("Monitoring redeploy. Waiting for Question 18 to receive its 'q18.png' image link...")
    
    for i in range(1, 13): # Poll for up to 2 minutes
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                questions = data.get("questions", [])
                
                q18 = None
                for q in questions:
                    if q.get("id") == 18 or q.get("question_number") == 18 or q.get("display_question_number") == 18:
                        q18 = q
                        break
                        
                if q18:
                    img = q18.get("question_image")
                    if img == "q18.png":
                        print(f"\nSUCCESS! Deploy is complete and database has been migrated!")
                        print(f"Question 18 Question Image: {repr(img)}")
                        return
                    else:
                        print(f"[{i*10}s] Still empty. Waiting for restart...")
                else:
                    print(f"[{i*10}s] Question 18 not found in response.")
        except Exception as e:
            print(f"[{i*10}s] Server is rebuilding/restarting... ({e})")
            
        time.sleep(10)
        
    print("\nPolling timed out. Please check again in a minute.")

if __name__ == "__main__":
    monitor()
