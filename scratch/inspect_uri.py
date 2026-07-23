import os
from urllib.parse import urlparse, quote_plus

def inspect():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    if not os.path.exists(env_path):
        print(".env not found")
        return
        
    uri = ""
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI=") or line.startswith("MONGO_URI="):
                uri = line.split("=", 1)[1].strip()
                break
                
    if not uri:
        print("No URI found in .env")
        return
        
    print(f"Raw URI (masked): {uri[:30]}...***...{uri[-15:]}")
    
    # Try parsing
    try:
        # If the password contains special characters, we can extract it and URL-encode it
        if "mongodb+srv://" in uri:
            prefix = "mongodb+srv://"
            rest = uri[len(prefix):]
        else:
            prefix = "mongodb://"
            rest = uri[len(prefix):]
            
        if "@" in rest:
            auth_part, host_part = rest.split("@", 1)
            if ":" in auth_part:
                user, password = auth_part.split(":", 1)
                
                # Check for special characters in raw password
                special_chars = [c for c in password if c in "@:/?#[]+& "]
                print(f"Username: {user}")
                print(f"Password length: {len(password)}")
                print(f"Special characters in password: {special_chars}")
                
                # URL-encode user and password
                encoded_user = quote_plus(user)
                encoded_pass = quote_plus(password)
                
                # Reconstruct clean URI
                escaped_uri = f"{prefix}{encoded_user}:{encoded_pass}@{host_part}"
                print("\nReconstructed escaped URI successfully!")
                
                # Write a temporary script to test connection with reconstructed URI
                import pymongo
                try:
                    print("Testing connection with escaped URI...")
                    client = pymongo.MongoClient(escaped_uri, serverSelectionTimeoutMS=3000)
                    # Trigger a command to test auth
                    client.admin.command('ping')
                    print("SUCCESS! Escaped URI connected and authenticated successfully!")
                    
                    # Overwrite the MONGODB_URI in .env with the escaped one!
                    # This will fix the local connection forever!
                    return escaped_uri
                except Exception as ex:
                    print(f"Connection test failed even with escaping: {ex}")
            else:
                print("No password delimiter found in auth part")
        else:
            print("No @ delimiter found in URI")
    except Exception as e:
        print(f"Error parsing URI: {e}")
        
    return None

if __name__ == "__main__":
    res = inspect()
    if res:
        # Overwrite .env MONGODB_URI
        root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
        env_path = os.path.join(root_dir, "backend", ".env")
        
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            if line.startswith("MONGODB_URI="):
                new_lines.append(f"MONGODB_URI={res}\n")
            else:
                new_lines.append(line)
                
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
            
        print("Updated backend/.env with URL-encoded MongoDB URI!")
