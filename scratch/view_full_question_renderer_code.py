import urllib.request

def check():
    url = "https://hi-hello-w78a.onrender.com/assets/QuestionRenderer-Cmup1qeP.js"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        print("Downloading entire QuestionRenderer code...")
        with urllib.request.urlopen(req) as response:
            js_code = response.read().decode('utf-8')
        print(js_code)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
