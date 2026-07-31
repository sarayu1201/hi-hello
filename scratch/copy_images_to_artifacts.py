import os
import shutil

src_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images"
dest_dir = "C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\2c767794-1854-4b5d-9e5f-fcb36b865f91"

os.makedirs(dest_dir, exist_ok=True)

# Files to copy
files_to_copy = [
    ("sbi_po_prelims", "ibps_clerk_prelims_test5_bar_graph_residents.png", "test1_residents.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test1_line_chart_houses_sold.png", "test2_houses.png"),
    ("sbi_po_prelims", "ibps_clerk_prelims_test3_line_graph_boats_ships.png", "test4_boats.png"),
    ("ibps test 1", "ibps_prelims-q_31_35.png", "ibps_test1_q31_35.png"),
    ("ibps test 1", "ibps_prelims-q_51_55.png", "ibps_test1_q51_55.png"),
]

for sub, filename, new_name in files_to_copy:
    src_file = os.path.join(src_dir, sub, filename)
    if os.path.exists(src_file):
        dest_file = os.path.join(dest_dir, new_name)
        shutil.copy(src_file, dest_file)
        print(f"Copied {filename} to {new_name} (Size: {os.path.getsize(dest_file)} bytes)")
    else:
        print(f"Not found: {src_file}")
