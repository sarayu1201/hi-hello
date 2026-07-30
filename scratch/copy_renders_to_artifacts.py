import os
import shutil
from pathlib import Path

src_dir = Path(__file__).parent / "empty_options_render"
dest_dir = Path("C:/Users/LENOVO/.gemini/antigravity-ide/brain/2c767794-1854-4b5d-9e5f-fcb36b865f91")

dest_dir.mkdir(exist_ok=True, parents=True)

print("Copying rendered PNGs to artifact directory...")
if src_dir.exists():
    for f in os.listdir(src_dir):
        if f.endswith(".png"):
            src_file = src_dir / f
            dest_file = dest_dir / f
            shutil.copy2(src_file, dest_file)
            print(f"  Copied {f} -> {dest_file}")
else:
    print("Source directory empty_options_render not found.")
