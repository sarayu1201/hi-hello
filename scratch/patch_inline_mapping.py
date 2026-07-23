import os

def patch_server():
    root_dir = r"c:\Users\LENOVO\Downloads\hi-hello-main\hi-hello-main"
    server_path = os.path.join(root_dir, "backend", "server.js")
    
    if not os.path.exists(server_path):
        print("server.js not found!")
        return
        
    with open(server_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Locate target inline block
    target_start = "// Map sub_type slug parameter to clean display title"
    target_end = "querySubType = `IBPS Clerk Prelims - Test ${num}`;\n    }\n  }"
    
    idx_start = content.find(target_start)
    idx_end = content.find(target_end, idx_start)
    
    if idx_start == -1 or idx_end == -1:
        print("Error: Could not find target inline mapping block!")
        return
        
    actual_end = idx_end + len(target_end)
    
    # Replacement block
    new_mapping_code = """// Map sub_type parameter to clean display title supporting mocks, shuffled IDs, and pattern modules
  let querySubType = sub_type;
  if (sub_type) {
    const clean = sub_type.toLowerCase().trim();
    const extractNum = (str) => {
      const match = str.match(/\\d+/);
      return match ? match[0] : "";
    };
    const matchesExam = (keys) => {
      return keys.some(key => clean.includes(key));
    };

    if (matchesExam(["sbi clerk prelims mock", "sbi clerk prelims test", "sbi clerk prelims - test", "sbi_clerk_prelims_test", "sbi_clerk_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `SBI Clerk Prelims - Test ${num}`;
    }
    else if (matchesExam(["sbi po prelims mock", "sbi po prelims test", "sbi po prelims - test", "sbi_po_prelims_test", "sbi_po_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `SBI PO Prelims - Test ${num}`;
    }
    else if (matchesExam(["ibps clerk prelims mock", "ibps clerk prelims test", "ibps clerk prelims - test", "ibps_clerk_prelims_test", "ibps_clerk_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `IBPS Clerk Prelims - Test ${num}`;
    }
    else if (matchesExam(["ibps po prelims mock", "ibps po prelims test", "ibps po prelims - test", "ibps_po_prelims_test", "ibps_po_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `IBPS PO Prelims - Test ${num}`;
    }
    else if (matchesExam(["ibps rrb clerk prelims mock", "ibps rrb clerk prelims test", "ibps rrb clerk prelims - test", "rrb clerk prelims mock", "rrb clerk prelims test", "rrb clerk prelims - test", "rrb_clerk_prelims_test", "rrb_clerk_mock_shuffled", "ibps_rrb_clerk_prelims_test", "ibps_rrb_clerk_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `IBPS RRB Clerk Prelims - Test ${num}`;
    }
    else if (matchesExam(["ibps rrb po prelims mock", "ibps rrb po prelims test", "ibps rrb po prelims - test", "rrb po prelims mock", "rrb po prelims test", "rrb po prelims - test", "rrb_po_prelims_test", "rrb_po_mock_shuffled", "ibps_rrb_po_prelims_test", "ibps_rrb_po_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `IBPS RRB PO Prelims - Test ${num}`;
    }
    else if (matchesExam(["ssc cgl prelims mock", "ssc cgl prelims test", "ssc cgl prelims - test", "ssc cgl tier - i mock", "ssc_cgl_prelims_test", "ssc_cgl_mock_shuffled"]) && !clean.includes("mains") && !clean.includes("tier_2") && !clean.includes("tier - ii")) {
      const num = extractNum(clean);
      if (num) querySubType = `SSC CGL Prelims - Test ${num}`;
    }
    else if (matchesExam(["ssc cgl mains mock", "ssc cgl mains test", "ssc cgl mains - test", "ssc cgl tier - ii mock", "ssc_cgl_mains_test", "ssc_cgl_mains_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `SSC CGL Mains - Test ${num}`;
    }
    else if (matchesExam(["ssc chsl prelims mock", "ssc chsl prelims test", "ssc chsl prelims - test", "ssc chsl tier - i mock", "ssc_chsl_prelims_test", "ssc_chsl_mock_shuffled"]) && !clean.includes("mains") && !clean.includes("tier_2") && !clean.includes("tier - ii")) {
      const num = extractNum(clean);
      if (num) querySubType = `SSC CHSL Prelims - Test ${num}`;
    }
    else if (matchesExam(["ssc chsl mains mock", "ssc chsl mains test", "ssc chsl mains - test", "ssc chsl tier - ii mock", "ssc_chsl_mains_test", "ssc_chsl_mains_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `SSC CHSL Mains - Test ${num}`;
    }
    else if (matchesExam(["ssc gd constable prelims mock", "ssc gd constable prelims test", "ssc gd constable prelims - test", "ssc gd mock", "ssc_gd_constable_prelims_test", "ssc_gd_prelims_test", "ssc_gd_mock_shuffled", "sc_gd_mock_shuffled"])) {
      const num = extractNum(clean);
      if (num) querySubType = `SSC GD Constable Prelims - Test ${num}`;
    }
  }"""
    
    patched_content = content[:idx_start] + new_mapping_code + content[actual_end:]
    
    with open(server_path, "w", encoding="utf-8") as f:
        f.write(patched_content)
        
    print("SUCCESS: server.js inline mapping successfully patched!")

if __name__ == "__main__":
    patch_server()
