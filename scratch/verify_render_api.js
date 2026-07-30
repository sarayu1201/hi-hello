const https = require("https");
const BASE_URL = "https://hi-hello-production.up.railway.app";

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(encodeURI(url), (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON (Length: ${data.length}). Preview: ${data.substring(0, 200)}`));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function verifyTest(testIdx) {
  const testId = `ibps_clerk_prelims_test${testIdx}`;
  const url = `${BASE_URL}/api/exam/questions?exam_type=IBPS Clerk Prelims&test_id=${testId}`;
  
  try {
    const res = await httpGet(url);
    const questions = res.questions || [];
    
    // Count subjects
    let englishCount = 0;
    let quantCount = 0;
    let reasoningCount = 0;
    
    questions.forEach(q => {
      const subject = q.subject || q.section || "";
      if (subject === "English Language") englishCount++;
      else if (subject === "Quantitative Aptitude") quantCount++;
      else if (subject === "Reasoning Ability") reasoningCount++;
    });
    
    console.log(`Test ${testIdx}: Total Questions = ${questions.length}`);
    console.log(`  - English Language: ${englishCount}`);
    console.log(`  - Quantitative Aptitude: ${quantCount}`);
    console.log(`  - Reasoning Ability: ${reasoningCount}`);
    if (questions.length === 100 && englishCount === 30 && quantCount === 35 && reasoningCount === 35) {
      console.log(`  => Status: 100% PERFECT PROOF\n`);
    } else {
      console.log(`  => Status: WARNING: NOT CORRECT YET (Render is probably still deploying the build, please wait a minute and re-run)\n`);
    }
  } catch (err) {
    console.log(`Test ${testIdx}: Error fetching from API: ${err.message}\n`);
  }
}

async function run() {
  console.log("Querying Render Live API for all 10 mock exams...\n");
  for (let i = 1; i <= 10; i++) {
    await verifyTest(i);
  }
}

run();
