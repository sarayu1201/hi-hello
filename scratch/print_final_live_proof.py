import urllib.request
import re

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    index_url = "https://hi-hello-w78a.onrender.com/assets/index-BhJifdTI.js"
    
    try:
        print("Downloading new live entry bundle...")
        with urllib.request.urlopen(urllib.request.Request(index_url, headers=headers)) as res:
            index_code = res.read().decode('utf-8')
            
        chunk_match = re.search(r'"assets/(MockTests-[A-Za-z0-9_\-]+\.js)"', index_code)
        if not chunk_match:
            print("Failed to find MockTests chunk name in the new bundle.")
            return
            
        mock_tests_chunk = chunk_match.group(1)
        print(f"New live MockTests chunk is: {mock_tests_chunk}")
        
        chunk_url = f"https://hi-hello-w78a.onrender.com/assets/{mock_tests_chunk}"
        with urllib.request.urlopen(urllib.request.Request(chunk_url, headers=headers)) as res:
            chunk_code = res.read().decode('utf-8')
            
        matches = [m.start() for m in re.finditer(r'direction\b', chunk_code)]
        print(f"\n--- PROOF OF DEPLOYED CODE ON RENDER ---")
        print(f"Found {len(matches)} occurrences of 'direction' in MockTests chunk:")
        for idx, m_start in enumerate(matches):
            start = max(0, m_start - 80)
            end = min(len(chunk_code), m_start + 180)
            snippet = chunk_code[start:end]
            print(f"\nOccurrence #{idx+1}:")
            print(snippet)
            
    except Exception as e:
        print(f"Error checking live code: {e}")

if __name__ == "__main__":
    check()
