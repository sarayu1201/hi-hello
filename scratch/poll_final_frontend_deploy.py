import urllib.request
import re
import ssl
import time

def check_frontend():
    url = "https://hi-hello-w78a.onrender.com"
    headers = {"User-Agent": "Mozilla/5.0"}
    context = ssl._create_unverified_context()
    
    print("Monitoring Render build deployment (spelling and unwrapped LaTeX font fixes)...")
    
    # Render builds usually take 1-3 minutes to compile Vite bundles
    for i in range(1, 30):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=context) as response:
                html = response.read().decode("utf-8")
                
            js_files = re.findall(r'src="(/assets/index-[a-zA-Z0-9_-]+\.js)"', html)
            if js_files:
                js_url = url + js_files[0]
                print(f"[{i*10}s] Active JS bundle: {js_url}")
                
                # Fetch bundle content
                js_req = urllib.request.Request(js_url, headers=headers)
                with urllib.request.urlopen(js_req, context=context) as js_resp:
                    js_content = js_resp.read().decode("utf-8", errors="ignore")
                    
                if "ABCandtriangle" in js_content:
                    print("\nSUCCESS! Render has successfully deployed the updated frontend!")
                    print("All spacing, bold fonts, and LaTeX formatting fixes are now LIVE on the website!")
                    return
                else:
                    # Print if it's the old Bo9Fjyys bundle
                    if "Bo9Fjyys" in js_url:
                        print(f"[{i*10}s] Still serving old bundle (Bo9Fjyys). Waiting for compilation...")
                    else:
                        print(f"[{i*10}s] Serving bundle {js_url.split('/')[-1]}. Checking for fixes...")
            else:
                print(f"[{i*10}s] Could not locate JS bundle in HTML.")
        except Exception as e:
            print(f"[{i*10}s] Connecting... ({e})")
            
        time.sleep(10)
        
    print("\nTaking a bit longer than expected. Please wait a minute and refresh the browser!")

if __name__ == "__main__":
    check_frontend()
