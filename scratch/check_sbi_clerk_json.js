const fs = require("fs");
const path = require("path");

const filePath = "C:\\Users\\LENOVO\\Downloads\\pdf to word\\sbi_clerk_test_1.json";
if (fs.existsSync(filePath)) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`Total questions in ${filePath}: ${data.length}`);
  if (data.length > 0) {
    console.log("First question:");
    console.log(JSON.stringify(data[0], null, 2));
    console.log("\nSecond question:");
    console.log(JSON.stringify(data[1], null, 2));
  }
} else {
  console.log("File not found:", filePath);
}
