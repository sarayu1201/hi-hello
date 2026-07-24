import urllib.request
import re
import ssl
import time

def check():
    # Cache-busting URL using current timestamp
    url = f"https://hi-hello-w78a.onrender.com/?t={int(time.time())}"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    }
    context = ssl._create_unverified_context()
    
    try:
        print(f"Querying live Render with cache-buster: {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            html = response.read().decode("utf-8")
            
        js_files = re.findall(r'src="(/assets/index-[a-zA-Z0-9_-]+\.js)"', html)
        if js_files:
            js_url = url.split("/?")[0] + js_files[0]
            print(f"Active JS Bundle: {js_url.split('/')[-1]}")
            
            # Fetch JS file content with cache-buster
            js_req_url = f"{js_url}?t={int(time.time())}"
            js_req = urllib.request.Request(js_req_url, headers=headers)
            with urllib.request.urlopen(js_req, context=context) as js_resp:
                js_content = js_resp.read().decode("utf-8", errors="ignore")
                
            has_fix = "ABCandtriangle" in js_content
            print(f"Fix is Live on Origin: {has_fix}")
        else:
            print("No JS bundle found in index.html.")
    except Exception as e:
        print(f"Failed to query Render: {e}")

if __name__ == "__main__":
    check()
