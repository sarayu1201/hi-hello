import urllib.request
import json

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/debug-images"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Querying debug images list from: {url}...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            files = data.get("files", [])
            print(f"Total files in uploads/images: {len(files)}")
            
            # Find and print any files matching q18.png or similar
            matches = [f for f in files if "q18.png" in f.lower() or "test2_q16" in f.lower() or "q19.png" in f.lower()]
            print("\nMatching files found on server:")
            for m in matches:
                print(f"  {m}")
    except Exception as e:
        print(f"Failed to query debug-images: {e}")

if __name__ == "__main__":
    check()
