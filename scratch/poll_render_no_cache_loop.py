import urllib.request
import re
import ssl
import time

def check_loop():
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    }
    context = ssl._create_unverified_context()
    
    print("Watching live Render server with cache-busters (polling every 15s)...")
    print("This will auto-detect the build success. Just watch this terminal...")
    
    # Poll for up to 20 minutes (80 iterations)
    for i in range(1, 81):
        url = f"https://hi-hello-w78a.onrender.com/?t={int(time.time())}"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                html = response.read().decode("utf-8")
                
            js_files = re.findall(r'src="(/assets/index-[a-zA-Z0-9_-]+\.js)"', html)
            if js_files:
                js_url = url.split("/?")[0] + js_files[0]
                
                # Fetch JS file
                js_req_url = f"{js_url}?t={int(time.time())}"
                js_req = urllib.request.Request(js_req_url, headers=headers)
                with urllib.request.urlopen(js_req, context=context) as js_resp:
                    js_content = js_resp.read().decode("utf-8", errors="ignore")
                    
                if "ABCandtriangle" in js_content:
                    print(f"\n[{i*15}s] SUCCESS! Render build has finished and is now serving the spacing/LaTeX fixes LIVE!")
                    print(f"Active JS Bundle: {js_url.split('/')[-1]}")
                    return
                else:
                    print(f"[{i*15}s] Still serving old bundle ({js_url.split('/')[-1]}). Render build is likely in progress...")
            else:
                print(f"[{i*15}s] JS bundle not found in index HTML yet.")
        except Exception as e:
            print(f"[{i*15}s] Connecting... ({e})")
            
        time.sleep(15)
        
    print("\nTimeout. Please verify the build status on your Render Dashboard!")

if __name__ == "__main__":
    check_loop()
