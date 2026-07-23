import urllib.request
import re

def check():
    url = "https://hi-hello-w78a.onrender.com/assets/QuestionRenderer-Cmup1qeP.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Downloading compiled QuestionRenderer chunk from: {url}...")
        with urllib.request.urlopen(req) as response:
            js_code = response.read().decode('utf-8')
            
        print(f"Downloaded QuestionRenderer chunk ({len(js_code)} bytes).")
        
        # Check occurrences of "direction"
        matches = [m.start() for m in re.finditer(r'direction\b', js_code)]
        print(f"Found {len(matches)} occurrences of 'direction' in QuestionRenderer chunk:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 100)
            end = min(len(js_code), m_start + 250)
            snippet = js_code[start:end]
            print(f"  Match #{idx+1}: {repr(snippet)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
