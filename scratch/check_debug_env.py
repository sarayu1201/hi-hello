import urllib.request
import json

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/debug-env"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Querying debug env at: {url}...")
        with urllib.request.urlopen(req) as response:
            status = response.status
            data = json.loads(response.read().decode())
            print(f"Response Status: {status}")
            print("\nServer Env Info:")
            for k, v in data.items():
                print(f"  {k}: {repr(v)}")
    except Exception as e:
        print(f"Failed to query debug-env: {e}")

if __name__ == "__main__":
    check()
