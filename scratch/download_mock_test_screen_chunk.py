import urllib.request
import re

def check():
    # Let's try downloading the chunk referenced in the console logs: MockTestScreen-CMtJCzqY.js
    url = "https://hi-hello-w78a.onrender.com/assets/MockTestScreen-CMtJCzqY.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Downloading compiled MockTestScreen chunk from: {url}...")
        with urllib.request.urlopen(req) as response:
            js_code = response.read().decode('utf-8')
            
        print(f"Downloaded MockTestScreen chunk ({len(js_code)} bytes).")
        
        # Check if the text "renderLaTeX" or "direction" is inside
        matches = [m.start() for m in re.finditer(r'direction\b', js_code)]
        print(f"Found {len(matches)} occurrences of 'direction' in MockTestScreen chunk:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 100)
            end = min(len(js_code), m_start + 250)
            snippet = js_code[start:end]
            print(f"\nMatch #{idx+1} snippet:")
            print(repr(snippet))

    except Exception as e:
        print(f"Error fetching MockTestScreen chunk: {e}")

if __name__ == "__main__":
    check()
