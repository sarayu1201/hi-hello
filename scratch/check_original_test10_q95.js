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

// Checkout original file to a temp path
runCmd("git show 7462c78:QuestionBank/json/ibps_po_prelims/ibpspo_test_10.json > scratch/temp_test10_original.json");

const tempFile = path.join(__dirname, "..", "scratch", "temp_test10_original.json");
if (fs.existsSync(tempFile)) {
  const questions = JSON.parse(fs.readFileSync(tempFile, "utf8"));
  const q = questions.find(x => x.id === 95);
  if (q) {
    console.log("Original Question 95 Options:");
    console.log(q.options);
  } else {
    console.log("Question 95 not found in original file.");
  }
  // Cleanup
  fs.unlinkSync(tempFile);
} else {
  console.log("Failed to extract original file.");
}
