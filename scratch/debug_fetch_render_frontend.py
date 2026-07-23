import urllib.request
import re

def check():
    url = "https://hi-hello-w78a.onrender.com/"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Fetching index HTML from {url}...")
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
        # Find JS bundles in the HTML
        js_files = re.findall(r'src="([^"]+/assets/index-[^"]+\.js)"', html)
        if not js_files:
            js_files = re.findall(r'href="([^"]+/assets/index-[^"]+\.js)"', html)
            
        if not js_files:
            print("No JS bundles found in HTML index. Let's print index.html:")
            print(html[:1000])
            return
            
        js_url = urllib.parse.urljoin(url, js_files[0])
        print(f"Found compiled JS bundle at: {js_url}")
        
        js_req = urllib.request.Request(js_url, headers=headers)
        with urllib.request.urlopen(js_req) as js_res:
            js_code = js_res.read().decode('utf-8')
            
        print(f"Downloaded JS bundle ({len(js_code)} bytes). Checking for mapped fields...")
        
        # Look for mapping of questions inside mockData
        # e.g., question_text: q.q || q.question_text || ""
        # Let's search for "question_text" and see what keys are mapped around it!
        matches = [m.start() for m in re.finditer(r'question_text\b', js_code)]
        print(f"Found {len(matches)} occurrences of 'question_text' in compiled JS:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 100)
            end = min(len(js_code), m_start + 250)
            snippet = js_code[start:end]
            print(f"\nMatch #{idx+1} snippet:")
            print(repr(snippet))

    except Exception as e:
        print(f"Error fetching/parsing live site: {e}")

if __name__ == "__main__":
    check()
