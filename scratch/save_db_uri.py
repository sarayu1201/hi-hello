import os
import pymongo

def save():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    env_path = os.path.join(root_dir, "backend", ".env")
    
    correct_uri = "mongodb+srv://allampallivinaya_db_user:6lbDyU6GocG8JxLY@cluster0.l1t116x.mongodb.net/kr_academy?retryWrites=true&w=majority&appName=Cluster0"
    
    # Test connection
    try:
        print("Testing connection to MongoDB with the copied URI...")
        client = pymongo.MongoClient(correct_uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        print("SUCCESS! Connected and authenticated successfully with this URI!")
        
        # Write to .env
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            if line.startswith("MONGODB_URI="):
                new_lines.append(f"MONGODB_URI={correct_uri}\n")
            elif line.startswith("MONGO_URI="):
                new_lines.append(f"MONGO_URI={correct_uri}\n")
            else:
                new_lines.append(line)
                
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
            
        print("Successfully updated backend/.env with the working URI!")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    save()
