import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_path = os.path.join(root_dir, "backend", "server.js")
    
    if not os.path.exists(server_path):
        print("server.js not found")
        return
        
    with open(server_path, "rb") as f:
        raw_data = f.read()
        
    print(f"File size in bytes: {len(raw_data)}")
    
    # Try decoding with different encodings
    for enc in ["utf-8", "utf-16", "utf-16-le", "latin-1"]:
        try:
            text = raw_data.decode(enc)
            print(f"Decoded with {enc} successfully!")
            # Search for mapTestIdToSubtype
            if "mapTestIdToSubtype" in text:
                print(f"  FOUND mapTestIdToSubtype using {enc}!")
                # Print lines around it
                lines = text.splitlines()
                for idx, line in enumerate(lines):
                    if "mapTestIdToSubtype" in line:
                        print(f"    Line {idx+1}: {line}")
            else:
                print(f"  NOT found mapTestIdToSubtype using {enc}")
        except Exception as e:
            print(f"  Failed with {enc}: {e}")

if __name__ == "__main__":
    check()
