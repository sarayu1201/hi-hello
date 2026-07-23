import os

def search():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    if not os.path.exists(server_js):
        print("server.js not found")
        return
        
    print("Searching server.js for static images routing:")
    with open(server_js, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f):
            if "images" in line or "static" in line or "uploads" in line:
                print(f"  Line {line_num+1}: {line.strip()}")

if __name__ == "__main__":
    search()
