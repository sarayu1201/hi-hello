import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    src_dir = os.path.join(root_dir, "frontend", "src")
    
    found = []
    if os.path.exists(src_dir):
        for root, dirs, files in os.walk(src_dir):
            for f in files:
                if f.endswith(".js") or f.endswith(".jsx"):
                    path = os.path.join(root, f)
                    with open(path, "r", encoding="utf-8") as file:
                        try:
                            content = file.read()
                        except Exception:
                            continue
                    if "baseURL" in content or "http" in content or "API_URL" in content:
                        # Find matching lines
                        for line in content.splitlines():
                            if "http" in line or "baseURL" in line or "API_URL" in line:
                                found.append((f, line.strip()))
                                
    print("Found API / URL config lines:")
    for name, line in found[:20]:
        print(f"  [{name}]: {line}")

if __name__ == "__main__":
    check()
