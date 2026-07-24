import urllib.request
import re
import ssl
import json

def check():
    url = "https://hi-hello-w78a.onrender.com"
    headers = {"User-Agent": "Mozilla/5.0"}
    context = ssl._create_unverified_context()
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as response:
            html = response.read().decode("utf-8")
            
        js_files = re.findall(r'src="(/assets/index-[a-zA-Z0-9_-]+\.js)"', html)
        if js_files:
            js_url = url + js_files[0]
            print(f"Active JS Bundle URL: {js_url}")
            
            # Fetch JS file
            js_req = urllib.request.Request(js_url, headers=headers)
            with urllib.request.urlopen(js_req, context=context) as js_resp:
                js_content = js_resp.read().decode("utf-8", errors="ignore")
                
            # Search for cleanText additions
            has_fix = "ABCandtriangle" in js_content
            print(f"Contains spacing/LaTeX unwrapper fix: {has_fix}")
        else:
            print("No JS bundle found in index.html.")
    except Exception as e:
        print(f"Failed to query Render frontend: {e}")

if __name__ == "__main__":
    check()
