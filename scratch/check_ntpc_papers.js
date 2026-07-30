const fs = require("fs");
const path = require("path");

function checkField(str, paperName, qId, fieldName, report) {
  if (!str) return;

  // Check for math block boundaries
  if (str.includes("$")) {
    // Extract math blocks
    const mathBlocks = str.match(/\$([^\$]+)\$/g) || [];
    for (let math of mathBlocks) {
      if (math.includes("√")) {
        report.latexIssues.push(`[LATEX ISSUE - raw root inside math] Q${qId} (${fieldName}): "${str}"`);
      }
      if (math.includes("∛")) {
        report.latexIssues.push(`[LATEX ISSUE - raw cube root inside math] Q${qId} (${fieldName}): "${str}"`);
      }
      if (math.includes("÷") || math.includes("-÷")) {
        report.latexIssues.push(`[LATEX ISSUE - raw divide inside math] Q${qId} (${fieldName}): "${str}"`);
      }
      if (math.includes("×") || math.includes("-×")) {
        report.latexIssues.push(`[LATEX ISSUE - raw multiply inside math] Q${qId} (${fieldName}): "${str}"`);
      }
      if (math.includes("*-") || math.includes("-*")) {
        report.latexIssues.push(`[LATEX ISSUE - raw multiply symbol inside math] Q${qId} (${fieldName}): "${str}"`);
      }
      if (math.includes("\\\\ ")) {
        report.latexIssues.push(`[LATEX ISSUE - double backslash space inside math] Q${qId} (${fieldName}): "${str}"`);
      }
    }
  }
}

function run() {
  console.log("Analyzing RRB NTPC CBT-1 & CBT-2 JSON papers...");
  
  const folders = ["rrb_ntpc_cbt_1", "rrb_ntpc_cbt_2"];
  const rootDir = path.join(__dirname, "..", "QuestionBank", "json");
  
  for (let folder of folders) {
    const dirPath = path.join(rootDir, folder);
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory not found: ${dirPath}`);
      continue;
    }
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
    console.log(`\n=========================================`);
    console.log(`FOLDER: ${folder} (${files.length} files)`);
    console.log(`=========================================`);
    
    for (let file of files) {
      const filePath = path.join(dirPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      const report = {
        latexIssues: []
      };
      
      for (let q of data) {
        const qId = q.question_number || q.id;
        checkField(q.question, file, qId, "question", report);
        checkField(q.q, file, qId, "q", report);
        checkField(q.explanation, file, qId, "explanation", report);
        if (q.options) {
          for (let i = 0; i < q.options.length; i++) {
            const opt = q.options[i];
            const optText = typeof opt === "string" ? opt : (opt.text || "");
            checkField(optText, file, qId, `options[${i}]`, report);
          }
        }
      }
      
      console.log(`${file}: Count = ${data.length}, LaTeX Issues = ${report.latexIssues.length}`);
      if (report.latexIssues.length > 0) {
        console.log(report.latexIssues.slice(0, 10).join("\n"));
        if (report.latexIssues.length > 10) {
          console.log(`  ... and ${report.latexIssues.length - 10} more issues.`);
        }
      }
    }
  }
}

run();
