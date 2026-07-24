import os

def check():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    models_js = os.path.join(root_dir, "backend", "models.js")
    
    with open(models_js, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    print("Printing lines 91 to 160 of models.js:")
    for idx in range(90, min(160, len(lines))):
        print(f"  Line {idx+1}: {lines[idx]}", end="")

if __name__ == "__main__":
    check()
