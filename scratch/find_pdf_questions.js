const fs = require("fs");
const path = require("path");

const textPath = path.join(__dirname, "..", "scratch", "clerk_2020_pdf_text.txt");
const text = fs.readFileSync(textPath, "utf8");

console.log("Scanning clerk_2020_pdf_text.txt for question markers...");

const lines = text.split("\n");
const found = [];

for (let i = 1; i <= 100; i++) {
  // Look for a line containing the question number like "\t 1.\t" or " 1. " or similar
  const regex1 = new RegExp(`^\\s*${i}\\.\\s+`, "i");
  const regex2 = new RegExp(`\\b${i}\\.\\s+`, "i");
  
  let matchLine = null;
  for (let line of lines) {
    if (regex1.test(line) || (line.includes("\t") && regex2.test(line))) {
      matchLine = line;
      break;
    }
  }
  
  if (matchLine) {
    found.push(i);
  }
}

console.log(`Found ${found.length} questions out of 100:`);
console.log(found.join(", "));
