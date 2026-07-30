const fs = require("fs");
const path = require("path");

const pathsToCheck = [
  "c:\\Users\\LENOVO\\QuestionBank\\json\\rrb_ntpc_cbt_1",
  "c:\\Users\\LENOVO\\QuestionBank\\json\\rrb_ntpc_cbt_2",
  "c:\\Users\\LENOVO\\QuestionBank\\json\\rrb_cbt_1",
  "c:\\Users\\LENOVO\\QuestionBank\\json\\rrb_cbt_2",
  "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\json\\rrb_ntpc_cbt_1",
  "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\json\\rrb_ntpc_cbt_2",
  "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\json\\rrb_cbt_1",
  "c:\\Users\\LENOVO\\Downloads\\akhil-website\\hi-hello\\QuestionBank\\json\\rrb_cbt_2",
  "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\rrb_ntpc_cbt_1",
  "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\rrb_ntpc_cbt_2",
  "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\rrb_cbt_1",
  "c:\\Users\\LENOVO\\Downloads\\hi-hello-main\\hi-hello-main\\QuestionBank\\json\\rrb_cbt_2",
];

console.log("Checking if any of the target directories exist on disk...");
for (let p of pathsToCheck) {
  if (fs.existsSync(p)) {
    try {
      const files = fs.readdirSync(p);
      console.log(`[FOUND]: ${p}`);
      console.log(`  Contains ${files.length} files:`, files.slice(0, 10));
    } catch (e) {
      console.log(`[FOUND (Error listing)]: ${p} - ${e.message}`);
    }
  } else {
    // console.log(`[NOT FOUND]: ${p}`);
  }
}
