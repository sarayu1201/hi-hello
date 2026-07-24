import os
import json

def inspect():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    json_dir = os.path.join(root_dir, "QuestionBank", "json", "ssc_cgl_prelims")
    
    if not os.path.exists(json_dir):
        print(f"Directory {json_dir} does not exist!")
        # Let's search under QuestionBank/json/ for anything containing cgl
        qb_json_dir = os.path.join(root_dir, "QuestionBank", "json")
        for f in os.listdir(qb_json_dir):
            if os.path.isdir(os.path.join(qb_json_dir, f)) and "cgl" in f.lower():
                print(f"Found folder: {f}")
        return
        
    print(f"Inspecting files in {json_dir}:")
    files = sorted(os.listdir(json_dir))
    for file in files:
        if not file.endswith(".json"):
            continue
        filepath = os.path.join(json_dir, file)
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                print(f"  {file}: {len(data)} questions")
                if data:
                    print(f"    First Q ID: {data[0].get('id')}, Unique ID: {data[0].get('unique_id')}")
            except Exception as e:
                print(f"  {file}: Error parsing: {e}")

if __name__ == "__main__":
    inspect()
