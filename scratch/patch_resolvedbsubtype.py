import os

def patch_resolve():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_path = os.path.join(root_dir, "backend", "server.js")
    
    if not os.path.exists(server_path):
        print("server.js not found!")
        return
        
    with open(server_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    target = """  if (
    queryStr.includes("prelims - test") ||
    queryStr.includes("mains - test") ||
    queryStr.includes("ug - ")
  ) {
    return testId || subType;
  }"""
  
    replacement = """  if (
    (queryStr.includes("prelims - test") || queryStr.includes("mains - test") || queryStr.includes("ug - ")) &&
    !queryStr.includes("pattern module") &&
    !queryStr.includes("mock_shuffled") &&
    !queryStr.includes("shuffled")
  ) {
    return testId || subType;
  }"""
  
    if target in content:
        patched = content.replace(target, replacement)
        with open(server_path, "w", encoding="utf-8") as f:
            f.write(patched)
        print("SUCCESS: resolveDbSubType successfully patched!")
    else:
        # Try finding with carriage returns
        target_cr = target.replace("\n", "\r\n")
        replacement_cr = replacement.replace("\n", "\r\n")
        if target_cr in content:
            patched = content.replace(target_cr, replacement_cr)
            with open(server_path, "w", encoding="utf-8") as f:
                f.write(patched)
            print("SUCCESS: resolveDbSubType successfully patched (CRLF)!")
        else:
            print("Error: Could not find target pattern in server.js")

if __name__ == "__main__":
    patch_resolve()
