import urllib.request
import re

def check():
    url = "https://hi-hello-w78a.onrender.com/assets/index-B6gTZViX.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Downloading compiled JS from: {url}...")
        with urllib.request.urlopen(req) as response:
            js_code = response.read().decode('utf-8')
            
        print(f"Downloaded JS bundle ({len(js_code)} bytes).")
        
        # Look for "question_text" and trace surroundings
        matches = [m.start() for m in re.finditer(r'question_text\b', js_code)]
        print(f"Found {len(matches)} occurrences of 'question_text' in compiled JS:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 100)
            end = min(len(js_code), m_start + 250)
            snippet = js_code[start:end]
            print(f"\nMatch #{idx+1} snippet:")
            print(repr(snippet))

    except Exception as e:
        print(f"Error fetching/parsing JS build: {e}")

if __name__ == "__main__":
    check()
