import urllib.request
import re

def check():
    url = "https://hi-hello-w78a.onrender.com/assets/index-B6gTZViX.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            js_code = response.read().decode('utf-8')
            
        print("Searching index JS for MockTestScreen chunk references...")
        
        # Search for any chunk filenames containing MockTestScreen or MockTests
        matches = re.findall(r'"assets/[A-Za-z0-9_\-]+\.js"', js_code)
        print(f"Found {len(matches)} chunk references:")
        for m in matches[:25]:
            print(f"  {m}")
            
        # Let's search for "MockTestScreen" in the entire JS code to see where it references it
        word_matches = [m.start() for m in re.finditer(r'MockTestScreen', js_code)]
        print(f"\nFound {len(word_matches)} occurrences of 'MockTestScreen' in index JS:")
        for idx, m_start in enumerate(word_matches):
            start = max(0, m_start - 100)
            end = min(len(js_code), m_start + 250)
            snippet = js_code[start:end]
            print(f"  Match #{idx+1}: {repr(snippet)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
