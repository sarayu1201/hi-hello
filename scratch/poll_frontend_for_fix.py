import urllib.request
import re
import ssl
import time

def check_frontend():
    url = "https://hi-hello-w78a.onrender.com"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    # Disable SSL certification checks for local python environment compatibility
    context = ssl._create_unverified_context()
    
    print("Monitoring Render frontend deployment. Looking for our new spelling regexes...")
    
    for i in range(1, 20):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                html = response.read().decode("utf-8")
                
            # Find JS script references in index.html (like /assets/index-xxxxxxxx.js)
            js_files = re.findall(r'src="(/assets/index-[a-zA-Z0-9_-]+\.js)"', html)
            if not js_files:
                # Fallback check for link href or other script tags
                js_files = re.findall(r'href="(/assets/index-[a-zA-Z0-9_-]+\.css)"', html) # css just for check
                # Try finding scripts
                js_files = re.findall(r'script[^>]*src="([^"]+)"', html)
                
            if js_files:
                # We fetch the first javascript script bundle
                js_url = js_files[0]
                if js_url.startswith("/"):
                    js_url = url + js_url
                    
                print(f"[{i*10}s] Found JS bundle: {js_url}")
                
                # Fetch bundle content
                js_req = urllib.request.Request(js_url, headers=headers)
                with urllib.request.urlopen(js_req, context=context) as js_resp:
                    js_content = js_resp.read().decode("utf-8", errors="ignore")
                    
                # Search for our unique word pattern
                if "ABCandtriangle" in js_content:
                    print("\nSUCCESS! Render frontend has completed building and is now serving the spacing/LaTeX fixes live!")
                    return
                else:
                    print(f"[{i*10}s] Still serving old bundle. Waiting for Render build to complete...")
            else:
                print(f"[{i*10}s] Could not locate JS bundle in index HTML yet.")
        except Exception as e:
            print(f"[{i*10}s] Connecting... ({e})")
            
        time.sleep(10)
        
    print("\nTimed out. Please check the website in a minute or two!")

if __name__ == "__main__":
    check_frontend()
