const { execSync } = require("child_process");

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    return null;
  }
}

console.log("Reading first question of ibpspo_prelims test_1.json from origin/master...");
const content = runCmd('git show "origin/master:sbi po questions/ibpspo_prelims test_1.json"');
if (content) {
  try {
    const data = JSON.parse(content);
    console.log(`Total questions: ${data.length}`);
    console.log("Sample question:");
    console.log(JSON.stringify(data[0], null, 2));
    
    // Find if there are any questions with images
    const imageQuestions = data.filter(q => q.questionImage || q.question_image || q.image);
    console.log(`\nQuestions with images in Test 1: ${imageQuestions.length}`);
    if (imageQuestions.length > 0) {
      console.log("First image question:");
      console.log(JSON.stringify(imageQuestions[0], null, 2));
    }
  } catch (e) {
    console.error("JSON Parse error:", e.message);
  }
} else {
  console.log("Failed to read file.");
}
