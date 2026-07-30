const fs = require("fs");
const path = require("path");

const dirPath = path.join(__dirname, "..", "QuestionBank", "json", "ibps_clerk_prelims");

function checkDuplicates() {
  if (!fs.existsSync(dirPath)) {
    console.error("Directory not found:", dirPath);
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));

  for (let file of files) {
    const filePath = path.join(dirPath, file);
    const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const seen = new Set();
    const duplicates = [];

    for (let q of questions) {
      // Create a unique key using the question body (or the last 200 chars to ignore the common passage) and the options
      const body = q.question || q.q || "";
      const qPart = body.length > 200 ? body.substring(body.length - 200) : body;
      
      const optStr = (q.options || []).map(o => o.text).sort().join("|");
      const key = `${qPart.trim()} === OPTIONS === ${optStr}`;

      if (seen.has(key)) {
        duplicates.push({
          id: q.id,
          question: qPart.trim()
        });
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      console.log(`\nFound ${duplicates.length} duplicate questions in ${file}:`);
      duplicates.forEach(d => {
        console.log(`  - Q${d.id}: "${d.question.substring(0, 100)}..."`);
      });
    } else {
      console.log(`No duplicate questions in ${file}.`);
    }
  }
}

checkDuplicates();
