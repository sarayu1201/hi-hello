import sys

packages = ["matplotlib", "pandas", "PIL", "numpy"]
print("=== Python Package Check ===")
for p in packages:
    try:
        __import__(p)
        print(f"  - {p}: INSTALLED")
    except ImportError:
        print(f"  - {p}: NOT installed")
print(f"Python version: {sys.version}")
