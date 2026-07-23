import urllib.request

def check():
    url = "https://hi-hello-w78a.onrender.com/"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
        print(html)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
