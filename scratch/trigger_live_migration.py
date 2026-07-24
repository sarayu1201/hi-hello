import urllib.request
import json
import time

def trigger():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/run-image-migration"
    req = urllib.request.Request(url, headers=headers)
    
    print("Waiting for Railway deploy to complete and triggering image migration...")
    
    for i in range(1, 15):
        try:
            with urllib.request.urlopen(req) as response:
                status = response.status
                data = json.loads(response.read().decode())
                
                print(f"\nResponse Status: {status}")
                print(f"Migration Success: {data.get('success')}")
                print(f"Total Database Documents Updated: {data.get('totalUpdated')}")
                print("\nDetailed Logs:")
                for log in data.get("logs", []):
                    print(f"  {log}")
                return
        except Exception as e:
            # Check if it returned a 404 (meaning the route is not deployed yet)
            err_msg = str(e)
            if "404" in err_msg:
                print(f"[{i*10}s] Received 404. New endpoint is not deployed yet. Retrying...")
            else:
                print(f"[{i*10}s] Waiting for server restart... ({err_msg})")
                
        time.sleep(10)
        
    print("\nTimed out. Please run the script again in a minute.")

if __name__ == "__main__":
    trigger()
