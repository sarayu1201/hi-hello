const axios = require("../backend/node_modules/axios");

async function run() {
  const url = "http://localhost:5000/api/exam/questions?exam_type=RRB%20NTPC%20CBT%202&sub_type=RRB%20NTPC%20CBT%202%20-%20Test%201&test_id=rrb_ntpc_cbt2_test1";
  console.log(`Calling API: ${url}...`);
  try {
    const res = await axios.get(url);
    const questions = res.data.questions || [];
    console.log(`\nAPI Response Success! Total questions returned: ${questions.length}`);
    
    const subjectCounts = {};
    for (let q of questions) {
      const s = q.subject || q.section || "No Subject";
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    }
    console.log("Subject Counts in API Response:", subjectCounts);
  } catch (err) {
    console.error("API Call Failed. Make sure your backend node server is running locally on port 5000.");
    console.error("Error:", err.message);
  }
}

run();
