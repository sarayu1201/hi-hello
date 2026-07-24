import urllib.request
import json
import ssl

def resolve_srv():
    srv_name = "_mongodb._tcp.cluster0.l1t116x.mongodb.net"
    url = f"https://dns.google/resolve?name={srv_name}&type=SRV"
    
    # Disable SSL certification checks
    context = ssl._create_unverified_context()
    
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        print(f"Resolving SRV records for {srv_name} via Google DNS (SSL disabled)...")
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode())
            answers = data.get("Answer", [])
            if not answers:
                print("Google DNS: No SRV records found.")
                return None
                
            hosts = []
            for ans in answers:
                parts = ans.get("data", "").split()
                if len(parts) >= 4:
                    port = parts[2]
                    target = parts[3].rstrip(".")
                    hosts.append(f"{target}:{port}")
            
            print(f"Resolved hosts: {hosts}")
            return hosts
    except Exception as e:
        print(f"DNS lookup failed: {e}")
        return None

if __name__ == "__main__":
    resolve_srv()
