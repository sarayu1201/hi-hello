import os

images_dir = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\images"

keywords = ["function", "hall", "bike", "city", "kiwi", "plum", "book", "mall", "order", "restaurant", "visitor", "resident", "boat", "ship", "house", "sold", "clerk", "prelims"]

found_images = []
for root, dirs, files in os.walk(images_dir):
    for f in files:
        f_lower = f.lower()
        if any(kw in f_lower for kw in keywords) and f_lower.endswith((".png", ".jpg")):
            rel_path = os.path.relpath(os.path.join(root, f), images_dir)
            found_images.append(rel_path)

print(f"Total matching images found: {len(found_images)}")
# Print clerk or prelims related ones first
clerk_related = [x for x in found_images if "clerk" in x.lower() or "prelims" in x.lower() or "ibps" in x.lower()]
print(f"\n--- Clerk/Prelims/IBPS Related ({len(clerk_related)} files) ---")
for x in sorted(clerk_related):
    print(f"  - {x}")

print("\n--- Other potentially matching ones ---")
for x in sorted(found_images):
    if x not in clerk_related:
        print(f"  - {x}")
