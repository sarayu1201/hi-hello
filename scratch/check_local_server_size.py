import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_js = os.path.join(root_dir, "backend", "server.js")
    
    if os.path.exists(server_js):
        size = os.path.getsize(server_js)
        print(f"Local backend/server.js size: {size} bytes")
    else:
        print("Local backend/server.js not found!")

if __name__ == "__main__":
    check()
