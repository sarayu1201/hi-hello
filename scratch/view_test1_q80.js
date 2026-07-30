const fs = require("fs");
const path = require("path");

const filePath = "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\ibps_clerk_prelims\\ibps_clerk_prelims_test1.json";
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

console.log("Inspecting Test 1 questions 79 to 85:");
for (let i = 78; i <= 84; i++) {
  console.log(`\n=================== Q${data[i].id} ===================`);
  console.log("Question:", JSON.stringify(data[i].question));
  console.log("Options:", JSON.stringify(data[i].options));
  console.log("Correct Answer:", data[i].correctAnswer);
  console.log("Direction:", JSON.stringify(data[i].direction));
}
