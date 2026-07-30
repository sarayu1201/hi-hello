const axios = require("../backend/node_modules/axios");

async function run() {
  const url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=IBPS%20PO%20Prelims&sub_type=IBPS%20PO%20Prelims%20-%20Test%201&test_id=ibps_po_prelims_test1";
  console.log(`Calling live production API: ${url}...`);
  try {
    const res = await axios.get(url);
    const questions = res.data.questions || [];
    console.log(`\nLive API Response Success! Total questions returned: ${questions.length}`);
    const q1 = questions.find(q => q.display_question_number === 1 || q.question_number === 1 || q.id === 1);
    if (q1) {
      console.log("\nQuestion 1 Text:", q1.question);
      console.log("Question 1 Options:", q1.options);
    } else {
      console.log("Question 31 not found in response.");
    }
  } catch (err) {
    console.error("Live API Call Failed.");
    console.error("Error:", err.message);
  }
}

run();
