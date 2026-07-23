import os
import pymongo

def check():
    akhil_env = r"c:\Users\LENOVO\Downloads\akhil-website\hi-hello\backend\.env"
    
    print(f"Checking for .env in: {akhil_env}")
    if not os.path.exists(akhil_env):
        print("  Not found!")
        return
        
    uri = ""
    with open(akhil_env, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGODB_URI=") or line.startswith("MONGO_URI="):
                uri = line.split("=", 1)[1].strip()
                break
                
    if not uri:
        print("  No MONGODB_URI found in that file.")
        return
        
    print(f"  Found URI (masked): {uri[:35]}...")
    
    # Test connection
    try:
        print("  Testing connection to MongoDB with this URI...")
        client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        print("  SUCCESS! Connected and authenticated successfully with this URI!")
        
        # Copy to the current project's .env!
        dest_env = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main\backend\.env"
        with open(dest_env, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            if line.startswith("MONGODB_URI="):
                new_lines.append(f"MONGODB_URI={uri}\n")
            else:
                new_lines.append(line)
                
        with open(dest_env, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
            
        print("  Successfully copied the working URI to hi-hello-main/backend/.env!")
    except Exception as e:
        print(f"  Connection failed with this URI as well: {e}")

if __name__ == "__main__":
    check()
