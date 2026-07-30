const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "exam_parser", "output_json");

try {
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".json"));
  console.log(`Checking ${files.length} JSON files for RRB/NTPC/CBT content...`);
  
  const matches = [];
  
  for (let file of files) {
    const full = path.join(outputDir, file);
    try {
      const content = fs.readFileSync(full, "utf8");
      const data = JSON.parse(content);
      
      let questions = [];
      if (Array.isArray(data)) {
        questions = data;
      } else if (data && Array.isArray(data.questions)) {
        questions = data.questions;
      }
      
      if (questions.length > 0) {
        // Look at the first question to categorize
        const first = questions[0];
        const isNTPC = /ntpc|cbt/i.test(file) || 
                       /ntpc|cbt/i.test(first.sub_type || "") || 
                       /ntpc|cbt/i.test(first.course || "") ||
                       /ntpc|cbt/i.test(first.paper_name || "");
                       
        if (isNTPC) {
          matches.push({
            file: file,
            count: questions.length,
            course: first.course || "",
            sub_type: first.sub_type || "",
            exam_type: first.exam_type || "",
            paper_name: first.paper_name || ""
          });
        }
      }
    } catch (e) {
      // skip
    }
  }
  
  console.log(`\nFound ${matches.length} matching files:`);
  console.log(JSON.stringify(matches, null, 2));
  
} catch (err) {
  console.error("Error:", err.message);
}
