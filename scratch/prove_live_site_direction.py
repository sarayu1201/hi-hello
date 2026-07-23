import urllib.request
import re
import time

def prove():
    old_index_js = "index-B6gTZViX.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    print("Waiting for Render to finish compiling and deploy the new build...")
    print(f"Current live entry bundle is: {old_index_js}")
    
    max_retries = 20
    new_index_js = None
    
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request("https://hi-hello-w78a.onrender.com/", headers=headers)
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
                
            js_match = re.search(r'src="/assets/(index-[A-Za-z0-9_\-]+\.js)"', html)
            if js_match:
                current_js = js_match.group(1)
                if current_js != old_index_js:
                    new_index_js = current_js
                    print(f"\nSUCCESS! Render build is LIVE! New bundle: {new_index_js}")
                    break
                else:
                    print(f"[{attempt+1}/{max_retries}] Still on old build... waiting 15s...")
            else:
                print("Could not locate entry script tag in index HTML.")
        except Exception as e:
            print(f"Error checking site: {e}")
            
        time.sleep(15)
        
    if not new_index_js:
        print("\nTimed out waiting for new build, checking current live chunks anyway...")
        # Get whatever index JS is current
        try:
            req = urllib.request.Request("https://hi-hello-w78a.onrender.com/", headers=headers)
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
            js_match = re.search(r'src="/assets/(index-[A-Za-z0-9_\-]+\.js)"', html)
            if js_match:
                new_index_js = js_match.group(1)
        except:
            pass
            
    if not new_index_js:
        print("Could not find any index JS bundle. Exiting.")
        return
        
    # Download the index JS to find the new MockTests chunk name
    index_url = f"https://hi-hello-w78a.onrender.com/assets/{new_index_js}"
    try:
        req = urllib.request.Request(index_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            index_code = response.read().decode('utf-8')
            
        # Find MockTests-*.js chunk reference
        chunk_match = re.search(r'"assets/(MockTests-[A-Za-z0-9_\-]+\.js)"', index_code)
        if not chunk_match:
            print("Failed to find MockTests chunk name in index JS.")
            return
            
        mock_tests_chunk = chunk_match.group(1)
        print(f"Found new live MockTests chunk: {mock_tests_chunk}")
        
        # Download MockTests chunk
        chunk_url = f"https://hi-hello-w78a.onrender.com/assets/{mock_tests_chunk}"
        req_chunk = urllib.request.Request(chunk_url, headers=headers)
        with urllib.request.urlopen(req_chunk) as response:
            chunk_code = response.read().decode('utf-8')
            
        # Check occurrences of "direction"
        matches = [m.start() for m in re.finditer(r'direction\b', chunk_code)]
        print(f"\n--- LIVE PROOF FROM SERVED CODE ({mock_tests_chunk}) ---")
        print(f"Found {len(matches)} occurrences of 'direction' in MockTests chunk:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 80)
            end = min(len(chunk_code), m_start + 180)
            snippet = chunk_code[start:end]
            print(f"\nOccurrence #{idx+1}:")
            print(snippet)
            
    except Exception as e:
        print(f"Error during proof verification: {e}")

if __name__ == "__main__":
    prove()
