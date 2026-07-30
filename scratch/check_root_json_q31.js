const fs = require("fs");
const path = require("path");

const rootFile = path.join(__dirname, "..", "ibpspo_prelims test_2.json");

if (fs.existsSync(rootFile)) {
  console.log("Root JSON file found!");
  const questions = JSON.parse(fs.readFileSync(rootFile, "utf8"));
  const q = questions.find(x => x.id === 31);
  if (q) {
    console.log("Question 31 in root JSON:");
    console.log("Question:", q.question);
    console.log("Options:", q.options);
  } else {
    console.log("Question 31 not found in root JSON.");
  }
} else {
  console.log("Root JSON file not found.");
}
