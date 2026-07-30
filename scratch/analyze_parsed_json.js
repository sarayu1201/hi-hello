const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "exam_parser", "output_json");
console.log(`Analyzing JSON files in ${outputDir}...`);

try {
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".json"));
  console.log(`Found ${files.length} JSON files.`);
  
  const categories = {};
  
  for (let file of files) {
    const full = path.join(outputDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      let questions = [];
      if (Array.isArray(data)) {
        questions = data;
      } else if (data && Array.isArray(data.questions)) {
        questions = data.questions;
      }
      
      if (questions.length > 0) {
        const first = questions[0];
        const key = `${first.course || "unknown"} | ${first.sub_type || "unknown"} | ${first.exam_type || "unknown"}`;
        if (!categories[key]) {
          categories[key] = [];
        }
        categories[key].push({
          file: file,
          count: questions.length
        });
      } else {
        console.log(`Empty or invalid array in ${file}`);
      }
    } catch (e) {
      console.error(`Error reading/parsing ${file}:`, e.message);
    }
  }
  
  console.log("\nSummary of groups found in parsed JSON files:");
  for (let key in categories) {
    console.log(`\nGroup: ${key}`);
    console.log(`Total files: ${categories[key].length}`);
    console.log("Sample files:");
    console.log(categories[key].slice(0, 5).map(x => `  - ${x.file} (${x.count} questions)`).join("\n"));
  }
  
} catch (err) {
  console.error("Error reading output_json:", err.message);
}
