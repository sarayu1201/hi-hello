import urllib.request
import json
import urllib.parse

def resolve_srv():
    srv_name = "_mongodb._tcp.cluster0.e8s8v.mongodb.net"
    url = f"https://cloudflare-dns.com/dns-query?name={srv_name}&type=SRV"
    
    headers = {
        "accept": "application/dns-json",
        "User-Agent": "Mozilla/5.0"
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        print(f"Resolving SRV records for {srv_name} via Cloudflare DNS-over-HTTPS...")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            answers = data.get("Answer", [])
            if not answers:
                print("No SRV records found.")
                return None
                
            hosts = []
            for ans in answers:
                # The data field is typically: "priority weight port target"
                # Example: "0 0 27017 cluster0-shard-00-00.e8s8v.mongodb.net."
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
