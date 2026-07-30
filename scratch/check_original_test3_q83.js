const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCmd(cmd) {
  try {
    return execSync(cmd, { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

runCmd("git show 7462c78:QuestionBank/json/ibps_po_prelims/ibpspo_test_3.json > scratch/temp_test3_original.json");

const tempFile = path.join(__dirname, "..", "scratch", "temp_test3_original.json");
if (fs.existsSync(tempFile)) {
  const questions = JSON.parse(fs.readFileSync(tempFile, "utf8"));
  const q = questions.find(x => x.id === 83);
  if (q) {
    console.log("Original Question 83 Options:");
    console.log(q.options);
  } else {
    console.log("Question 83 not found in original file.");
  }
  fs.unlinkSync(tempFile);
} else {
  console.log("Failed to extract original file.");
}
