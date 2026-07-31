import os
import json
import shutil
import matplotlib.pyplot as plt

# Paths
workspace_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main"
json_dir = os.path.join(workspace_dir, "QuestionBank", "json", "ibps_clerk_prelims")
images_dir = os.path.join(workspace_dir, "QuestionBank", "images")
clerk_images_dir = os.path.join(images_dir, "ibps_clerk_prelims")

os.makedirs(clerk_images_dir, exist_ok=True)

# 1. Helper to generate a styled table image
def generate_table_image(data, title, filename):
    fig, ax = plt.subplots(figsize=(6, 2.5), dpi=300)
    ax.axis('off')
    
    table = ax.table(cellText=data, loc='center', cellLoc='center')
    
    # Custom styling
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.2, 1.8)
    
    # Color scheme: Classic premium banking colors (Deep Blue header, Light Gray accents)
    for (row, col), cell in table.get_celld().items():
        # Set text properties
        cell.set_text_props(fontname="DejaVu Sans")
        if row == 0:
            cell.set_text_props(weight='bold', color='white')
            cell.set_facecolor('#1E3A8A')  # Navy Blue header
        else:
            if row % 2 == 0:
                cell.set_facecolor('#F3F4F6')  # Light Gray alternating row
            else:
                cell.set_facecolor('white')
                
    output_path = os.path.join(clerk_images_dir, filename)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    print(f"Generated Table Image: {filename}")

# 2. Generate the missing tables
# Test 3 functions table
t3_data = [
    ["Months", "Hall P", "Hall Q", "Hall R"],
    ["January", "96", "144", "150"],
    ["February", "120", "112", "128"],
    ["March", "90", "80", "60"],
    ["April", "72", "84", "140"]
]
generate_table_image(t3_data, "Number of Functions Organized", "ibps_clerk_prelims_test3_table_functions.png")

# Test 5 bikes table
t5_data = [
    ["Company", "2021", "2022"],
    ["Company A", "230", "240"],
    ["Company B", "350", "380"],
    ["Company C", "310", "390"],
    ["Company D", "270", "310"]
]
generate_table_image(t5_data, "Number of Bikes Sold", "ibps_clerk_prelims_test5_table_bikes.png")


# 3. Copy and organize existing assets
copies = [
    # (Source folder, Source filename, Target filename)
    ("sbi_po_prelims", "ibps_clerk_prelims_test5_bar_graph_residents.png", "ibps_clerk_prelims_test1_bar_graph_residents.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test1_line_chart_houses_sold.png", "ibps_clerk_prelims_test2_line_chart_houses_sold.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test3_line_graph_boats_ships.png", "ibps_clerk_prelims_test4_line_graph_boats_ships.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test9_line_graph_boats_ships.png", "ibps_clerk_prelims_test6_line_graph_boats_ships.png"),
    ("ibps test 7", "ibps_prelims-q_41_45.png", "ibps_clerk_prelims_test7_table_bikes.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test7_line_graph_restaurant_orders.png", "ibps_clerk_prelims_test8_line_graph_restaurant_orders.png"),
    ("ibps test 9", "ibps_prelims-q_31_35.png", "ibps_clerk_prelims_test9_table_books.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test8_line_graph_mall_visitors.png", "ibps_clerk_prelims_test9_line_graph_mall_visitors.png"),
    ("ibps test 10", "ibps_prelims-q_31_35.png", "ibps_clerk_prelims_test10_table_kiwi.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test6_bar_graph_city_visitors.png", "ibps_clerk_prelims_test10_bar_graph_city_visitors.png"),
]

for src_sub, src_file, dest_file in copies:
    src_path = os.path.join(images_dir, src_sub, src_file)
    dest_path = os.path.join(clerk_images_dir, dest_file)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Copied Asset: {src_file} -> {dest_file}")
    else:
        print(f"WARNING: Source asset not found: {src_path}")


# 4. Map questions to images in JSON
mapping = {
    # (test_idx, start_q, end_q): filename
    (1, 41, 45): "ibps_clerk_prelims/ibps_clerk_prelims_test1_bar_graph_residents.png",
    (2, 61, 65): "ibps_clerk_prelims/ibps_clerk_prelims_test2_line_chart_houses_sold.png",
    (3, 61, 65): "ibps_clerk_prelims/ibps_clerk_prelims_test3_table_functions.png",
    (4, 31, 35): "ibps_clerk_prelims/ibps_clerk_prelims_test4_line_graph_boats_ships.png",
    (5, 36, 40): "ibps_clerk_prelims/ibps_clerk_prelims_test5_table_bikes.png",
    (6, 36, 40): "ibps_clerk_prelims/ibps_clerk_prelims_test6_line_graph_boats_ships.png",
    (7, 36, 40): "ibps_clerk_prelims/ibps_clerk_prelims_test7_table_bikes.png",
    (8, 31, 35): "ibps_clerk_prelims/ibps_clerk_prelims_test8_line_graph_restaurant_orders.png",
    (9, 31, 35): "ibps_clerk_prelims/ibps_clerk_prelims_test9_table_books.png",
    (9, 36, 40): "ibps_clerk_prelims/ibps_clerk_prelims_test9_line_graph_mall_visitors.png",
    (10, 31, 35): "ibps_clerk_prelims/ibps_clerk_prelims_test10_table_kiwi.png",
    (10, 36, 40): "ibps_clerk_prelims/ibps_clerk_prelims_test10_bar_graph_city_visitors.png",
}

for test_idx in range(1, 11):
    file_path = os.path.join(json_dir, f"ibps_clerk_prelims_test{test_idx}.json")
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    updated = False
    for q in data:
        q_id = q["id"]
        # Find if this question falls into any mapped range
        for (t_idx, start_q, end_q), filename in mapping.items():
            if t_idx == test_idx and start_q <= q_id <= end_q:
                q["question_image"] = filename
                updated = True
                break
                
    if updated:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated JSON images mapping for Test {test_idx}")

print("\n=== Image Generation & Mapping Complete! ===")
