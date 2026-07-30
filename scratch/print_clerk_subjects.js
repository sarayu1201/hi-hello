const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "QuestionBank", "json", "ibps_clerk_prelims", "ibps_clerk_prelims_test1.json");
const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));

console.log("Subject and Question Details for Test 1:");
questions.forEach(q => {
  const qId = q.id || q.question_number;
  const qText = (q.question || q.q || "").replace(/\n/g, " ");
  const truncatedText = qText.length > 80 ? qText.substring(0, 80) + "..." : qText;
  console.log(`Q${qId} | Subject: ${q.subject} | Topic: ${q.topic || q.chapter || "N/A"} | Text: ${truncatedText}`);
});
