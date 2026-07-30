const axios = require("../backend/node_modules/axios");

async function run() {
  const url = "https://hi-hello-production.up.railway.app/api/exam/questions?exam_type=IBPS%20PO%20Prelims&sub_type=IBPS%20PO%20Prelims%20-%20Test%202&test_id=ibps_po_prelims_test2";
  console.log(`Calling live API: ${url}...`);
  try {
    const res = await axios.get(url);
    const questions = res.data.questions || [];
    console.log(`Total questions returned: ${questions.length}`);
    
    // Let's filter for Quantitative Aptitude section
    const quantQs = questions.filter(q => q.subject === "Quantitative Aptitude");
    console.log(`Quant Questions: ${quantQs.length}`);
    
    // Print the first 5 Quant questions
    quantQs.slice(0, 5).forEach((q, idx) => {
      console.log(`\n[Quant Q${idx + 1}] (DB display_number: ${q.display_question_number})`);
      console.log(`  Question: ${q.question}`);
      console.log(`  Options:`, q.options);
      console.log(`  Correct Option: ${q.correct_option}`);
    });

  } catch (err) {
    console.error("Live API Call Failed:", err.message);
  }
}

run();
