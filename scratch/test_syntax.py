import subprocess
import os

def test_syntax():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_path = os.path.join(root_dir, "backend", "server.js")
    
    if not os.path.exists(server_path):
        print("server.js not found")
        return
        
    try:
        # Run node --check
        res = subprocess.run(["node", "--check", "backend/server.js"], capture_output=True, text=True, shell=True)
        if res.returncode == 0:
            print("SUCCESS: node --check passed! No syntax errors in server.js.")
        else:
            print("SYNTAX ERROR FOUND in server.js:")
            print(res.stderr)
    except Exception as e:
        print(f"Error executing node check: {e}")

if __name__ == "__main__":
    test_syntax()
