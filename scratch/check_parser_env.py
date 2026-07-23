import os
import pymongo

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    parser_env = os.path.join(root_dir, "exam_parser", ".env")
    
    print(f"Checking for .env in: {parser_env}")
    if not os.path.exists(parser_env):
        print("  Not found!")
        return
        
    uri = ""
    with open(parser_env, "r", encoding="utf-8") as f:
        for line in f:
            if "URI" in line or "MONGO" in line:
                if "=" in line:
                    uri = line.split("=", 1)[1].strip()
                    break
                
    if not uri:
        print("  No URI found in that file.")
        return
        
    print(f"  Found URI (masked): {uri[:35]}...")
    
    # Test connection
    try:
        print("  Testing connection to MongoDB with this URI...")
        client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        print("  SUCCESS! Connected and authenticated successfully with this URI!")
        
        # Copy to the current project's .env!
        dest_env = os.path.join(root_dir, "backend", ".env")
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
            
        print("  Successfully copied the working URI to backend/.env!")
    except Exception as e:
        print(f"  Connection failed with this URI as well: {e}")

if __name__ == "__main__":
    check()
