const axios = require("../backend/node_modules/axios");

async function run() {
  const url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=RRB%20NTPC%20CBT%202&sub_type=RRB%20NTPC%20CBT%202%20-%20Test%201&test_id=rrb_ntpc_cbt2_test1";
  console.log(`Calling live production API: ${url}...`);
  try {
    const res = await axios.get(url);
    const questions = res.data.questions || [];
    console.log(`\nLive API Response Success! Total questions returned: ${questions.length}`);
    
    const subjectCounts = {};
    for (let q of questions) {
      const s = q.subject || q.section || "No Subject";
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    }
    console.log("Subject Counts in Live API Response:", subjectCounts);
  } catch (err) {
    console.error("Live API Call Failed.");
    console.error("Error:", err.message);
  }
}

run();
