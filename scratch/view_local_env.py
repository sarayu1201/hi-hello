import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    if os.path.exists(env_path):
        print("FOUND backend/.env content:")
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                # Print everything but mask the password to be secure
                line_str = line.strip()
                if "mongodb" in line_str.lower() or "uri" in line_str.lower():
                    # Mask username/password
                    if "@" in line_str:
                        prefix = line_str.split("@")[0]
                        suffix = line_str.split("@")[1]
                        # Mask credentials inside prefix
                        # e.g. "MONGODB_URI=mongodb+srv://Rosy:password"
                        if "://" in prefix:
                            pre_url = prefix.split("://")[0]
                            auth = prefix.split("://")[1]
                            masked_auth = auth.split(":")[0] + ":*****"
                            print(f"  {pre_url}://{masked_auth}@{suffix}")
                        else:
                            print(f"  [MASKED CONNECTION STRING]")
                    else:
                        print(f"  {line_str}")
                else:
                    print(f"  {line_str}")
    else:
        print("backend/.env not found")

if __name__ == "__main__":
    check()
