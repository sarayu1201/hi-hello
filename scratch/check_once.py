import urllib.request
import re

def check():
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        req = urllib.request.Request("https://hi-hello-w78a.onrender.com/", headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
        js_match = re.search(r'src="/assets/(index-[A-Za-z0-9_\-]+\.js)"', html)
        if js_match:
            current_js = js_match.group(1)
            print(f"Current live bundle filename: {current_js}")
            if current_js != "index-B6gTZViX.js":
                print("Deploy is complete!")
            else:
                print("Render is still compiling the deploy. Please wait a bit more...")
        else:
            print("Could not find index.js script tag.")
    except Exception as e:
        print(f"Error checking site: {e}")

if __name__ == "__main__":
    check()
