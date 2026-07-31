import urllib.request
import urllib.error

url = "https://hi-hello-production.up.railway.app/api/images/ibps_clerk_prelims/ibps_clerk_prelims_test1_bar_graph_residents.png"

print(f"Querying production image URL: {url}")
try:
    with urllib.request.urlopen(url) as response:
        status = response.status
        info = response.info()
        print(f"Status Code: {status} OK")
        print(f"Content Type: {info.get_content_type()}")
        print(f"Content Length: {info.get('Content-Length')} bytes")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
except Exception as e:
    print(f"Error connecting: {e}")
