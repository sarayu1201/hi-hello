import urllib.request
import re

def check():
    url = "https://hi-hello-w78a.onrender.com/assets/MockTestScreen-Bzee2ovn.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Downloading compiled MockTestScreen chunk from: {url}...")
        with urllib.request.urlopen(req) as response:
            js_code = response.read().decode('utf-8')
            
        print(f"Downloaded MockTestScreen chunk ({len(js_code)} bytes).")
        
        # Check if the word "direction" is inside
        # Let's find occurrences of "direction" and display snippets
        matches = [m.start() for m in re.finditer(r'direction\b', js_code)]
        print(f"Found {len(matches)} occurrences of 'direction' in MockTestScreen chunk:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 80)
            end = min(len(js_code), m_start + 180)
            snippet = js_code[start:end]
            print(f"  Match #{idx+1}: {repr(snippet)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
