import os

env_path = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\backend\\.env"

if os.path.exists(env_path):
    print("Reading backend/.env file...")
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if "mongodb" in line.lower() or "mongo" in line.lower() or "uri" in line.lower():
                print(line.strip())
else:
    print("backend/.env file not found!")
