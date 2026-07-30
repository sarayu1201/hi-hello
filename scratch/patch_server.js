const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "backend", "server.js");
console.log(`Patching ${filePath}...`);

let content = fs.readFileSync(filePath, "utf8");
// Normalize CRLF to LF for reliable matching
content = content.replace(/\r\n/g, "\n");

// Patch resolveDbSubType
const targetSubType = `  if (normalized.includes("sscchsl") || normalized.includes("sschsl") || normalized.includes("schsl")) {\n    return \`SSC CHSL Prelims - Test \${mockNumber}\`;\n  }`;

const replacementSubType = `  if (normalized.includes("sscchsl") || normalized.includes("sschsl") || normalized.includes("schsl")) {\n    return \`SSC CHSL Prelims - Test \${mockNumber}\`;\n  }\n  if (normalized.includes("rrbntpccbt1")) {\n    return \`RRB NTPC CBT 1 - Test \${mockNumber}\`;\n  }\n  if (normalized.includes("rrbntpccbt2")) {\n    return \`RRB NTPC CBT 2 - Test \${mockNumber}\`;\n  }`;

if (content.includes(targetSubType)) {
  content = content.replace(targetSubType, replacementSubType);
  console.log("Successfully patched resolveDbSubType.");
} else {
  console.log("Error: Target for resolveDbSubType not found!");
}

// Patch resolveDbCourse
const targetCourse = `  if (lower.includes("ssc gd") || lower.includes("ssc_gd") || lower.includes("sc_gd") || lower.includes("sc gd")) {\n    return "sc_gd";\n  }`;

const replacementCourse = `  if (lower.includes("ssc gd") || lower.includes("ssc_gd") || lower.includes("sc_gd") || lower.includes("sc gd")) {\n    return "sc_gd";\n  }\n  if (lower.includes("rrb ntpc cbt 1") || lower.includes("rrb_ntpc_cbt_1") || lower.includes("rrb_ntpc_cbt1")) {\n    return "RRB NTPC CBT 1";\n  }\n  if (lower.includes("rrb ntpc cbt 2") || lower.includes("rrb_ntpc_cbt_2") || lower.includes("rrb_ntpc_cbt2")) {\n    return "RRB NTPC CBT 2";\n  }`;

if (content.includes(targetCourse)) {
  content = content.replace(targetCourse, replacementCourse);
  console.log("Successfully patched resolveDbCourse.");
} else {
  console.log("Error: Target for resolveDbCourse not found!");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Finished patching backend/server.js!");
