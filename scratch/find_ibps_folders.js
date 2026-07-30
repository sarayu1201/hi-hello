const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "QuestionBank", "json");
const folders = fs.readdirSync(root);

console.log("Subdirectories in QuestionBank/json/:\n");
for (let f of folders) {
  if (fs.statSync(path.join(root, f)).isDirectory()) {
    console.log(`  - ${f}`);
  }
}
