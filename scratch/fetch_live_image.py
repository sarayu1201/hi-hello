import urllib.request

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://hi-hello-production.up.railway.app/api/images/q18.png"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print(f"Requesting live image from: {url}...")
        with urllib.request.urlopen(req) as response:
            status = response.status
            content = response.read()
            print(f"Response Status: {status}")
            print(f"Image Size: {len(content)} bytes")
            print("Image fetched successfully!")
    except Exception as e:
        print(f"Failed to fetch live image: {e}")

if __name__ == "__main__":
    check()
