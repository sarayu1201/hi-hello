const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..", "QuestionBank", "json", "rrb_ntpc_cbt_2");
console.log("Balancing RRB NTPC CBT-2 subject distribution to exactly 50 GA, 35 Math, 35 Reasoning...");

const files = fs.readdirSync(rootDir).filter(f => f.endsWith(".json"));

for (let file of files) {
  const filePath = path.join(rootDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  
  // Count current subjects
  let ga = [];
  let math = [];
  let reasoning = [];
  
  for (let q of data) {
    if (q.subject === "General Awareness") ga.push(q);
    else if (q.subject === "Mathematics") math.push(q);
    else if (q.subject === "General Intelligence and Reasoning") reasoning.push(q);
  }
  
  console.log(`\nBefore - ${file}: GA=${ga.length}, Math=${math.length}, Reasoning=${reasoning.length}`);
  
  const targetMath = 35;
  const targetReasoning = 35;
  
  if (math.length > targetMath) {
    const excessCount = math.length - targetMath;
    console.log(`  Excess math questions: ${excessCount}. Re-labeling them as Reasoning...`);
    
    // Relabel the last 'excessCount' math questions
    let relabeled = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].subject === "Mathematics") {
        data[i].subject = "General Intelligence and Reasoning";
        relabeled++;
        if (relabeled === excessCount) break;
      }
    }
  }
  
  // Verify new counts
  let newGa = 0, newMath = 0, newReasoning = 0;
  for (let q of data) {
    if (q.subject === "General Awareness") newGa++;
    else if (q.subject === "Mathematics") newMath++;
    else if (q.subject === "General Intelligence and Reasoning") newReasoning++;
  }
  
  console.log(`After  - ${file}: GA=${newGa}, Math=${newMath}, Reasoning=${newReasoning}`);
  
  // Save back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

console.log("\nSubject distribution balancing complete!");
