import urllib.request
import json

def trigger():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/run-image-migration"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Triggering migration now at: {url}...")
        with urllib.request.urlopen(req) as response:
            status = response.status
            data = json.loads(response.read().decode())
            print(f"Response Status: {status}")
            print(f"Success: {data.get('success')}")
            print(f"Total Updated Questions in Database: {data.get('totalUpdated')}")
            print("\nLogs:")
            for log in data.get("logs", []):
                print(f"  {log}")
    except Exception as e:
        print(f"Failed to query migration route: {e}")

if __name__ == "__main__":
    trigger()
