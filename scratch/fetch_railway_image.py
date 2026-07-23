import urllib.request
import urllib.error

def check():
    url1 = "https://hi-hello-production.up.railway.app/api/images/sbi%20clerk%20test%201/sbi_clerk-q_41_45.png"
    url2 = "https://hi-hello-production.up.railway.app/api/images/sbi_clerk-q_41_45.png"
    
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for url in (url1, url2):
        print(f"Requesting: {url}")
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                print(f"  SUCCESS! Status code: {response.status}")
                print(f"  Content length: {len(response.read())} bytes")
        except urllib.error.HTTPError as e:
            print(f"  FAILED: HTTP Error {e.code}: {e.reason}")
        except Exception as e:
            print(f"  FAILED: {e}")

if __name__ == "__main__":
    check()
