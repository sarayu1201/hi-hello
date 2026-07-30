const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "QuestionBank", "json", "ibps_po_prelims", "ibpspo_test_1.json");
if (!fs.existsSync(filePath)) {
  console.log("File not found!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
console.log("Image Questions in IBPS PO Prelims - Test 1:\n");

data.forEach(q => {
  if (q.questionImage) {
    console.log(`  - Question No. ${q.id} (Image: "${q.questionImage}")`);
  }
});
