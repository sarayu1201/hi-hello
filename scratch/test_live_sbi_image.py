import urllib.request
import urllib.error

# Test loading an SBI PO image
url = "https://hi-hello-production.up.railway.app/api/images/sbi_po_prelims/bar_graph_population_1951_1991.png"

print(f"Querying production SBI PO image URL: {url}")
try:
    with urllib.request.urlopen(url) as response:
        print(f"Status Code: {response.status} OK")
        print(f"Content Type: {response.info().get_content_type()}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
except Exception as e:
    print(f"Error connecting: {e}")
