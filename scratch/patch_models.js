const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "backend", "models.js");
console.log(`Patching ${filePath}...`);

let content = fs.readFileSync(filePath, "utf8");
content = content.replace(/\r\n/g, "\n");

const target = `// Question Pool Schema
const QuestionSchema = new mongoose.Schema({
  unique_id: { type: String, required: true, unique: true },
  display_question_number: { type: Number },
  course: { type: String },
  exam_type: { type: String },
  paper_name: { type: String },
  subject: { type: String },`;

const replacement = `// Question Pool Schema
const QuestionSchema = new mongoose.Schema({
  unique_id: { type: String, required: true, unique: true },
  display_question_number: { type: Number },
  course: { type: String },
  exam_type: { type: String },
  sub_type: { type: String },
  test_id: { type: String },
  test_title: { type: String },
  paper_name: { type: String },
  subject: { type: String },`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Successfully patched backend/models.js!");
} else {
  console.log("Error: Target block not found in models.js!");
}
