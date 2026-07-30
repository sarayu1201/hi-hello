const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const resolveDbSubType = (testId, subType, examType) => {
  const queryStr = String(testId || subType || "").toLowerCase().trim();
  if (
    (queryStr.includes("prelims - test") || queryStr.includes("mains - test") || queryStr.includes("ug - ")) &&
    !queryStr.includes("pattern module") &&
    !queryStr.includes("mock_shuffled") &&
    !queryStr.includes("shuffled")
  ) {
    return testId || subType;
  }
  let numberMatch = queryStr.match(/(?:mock|test|paper|cbt)?\s*_?(\d+)\b/i);
  let mockNumber = numberMatch ? parseInt(numberMatch[1]) : 1;
  const normalized = queryStr.replace(/[^a-z0-9]/g, "");
  if (normalized.includes("sscchsl") || normalized.includes("sschsl") || normalized.includes("schsl")) {
    return `SSC CHSL Prelims - Test ${mockNumber}`;
  }
  return testId || subType;
};

const resolveDbCourse = (subType) => {
  if (!subType) return null;
  const lower = subType.toLowerCase();
  if (lower.includes("ssc chsl") || lower.includes("ssc_chsl")) {
    if (lower.includes("mains") || lower.includes("tier2") || lower.includes("tier-2") || lower.includes("tier 2")) {
      return "ssc_chsl_tier2_papers";
    }
    return "ssc_chsl_tier1_papers";
  }
  return null;
};

async function testQuery(exam_type, sub_type) {
  let category = "Bank & Insurance";
  const typeLower = String(exam_type || "").toLowerCase();
  const subLower = String(sub_type || "").toLowerCase();
  if (typeLower.includes("ssc") || subLower.includes("ssc")) {
    category = "SSC Exams";
  }

  let resolvedCourseNames = [exam_type];
  if (exam_type) {
    const courseLower = exam_type.toLowerCase();
    if (!resolvedCourseNames.includes(courseLower)) resolvedCourseNames.push(courseLower);
    const courseUnderscore = courseLower.replace(/\s+/g, "_");
    if (!resolvedCourseNames.includes(courseUnderscore)) resolvedCourseNames.push(courseUnderscore);
  }

  let resolvedSubTypes = [];
  if (sub_type) {
    const resolvedVal = resolveDbSubType(null, sub_type, exam_type);
    if (resolvedVal) resolvedSubTypes.push(resolvedVal);
    if (!resolvedSubTypes.includes(sub_type)) resolvedSubTypes.push(sub_type);
  }

  let filter = {
    is_mock_eligible: true,
    status: { $ne: "needs_review" },
    source_file: { $ne: null, $exists: true }
  };
  
  let resolvedCourse = resolveDbCourse(resolvedSubTypes[0]);
  if (resolvedCourse) {
    filter.course = resolvedCourse;
  }

  let mappedExamType = exam_type;
  if (exam_type) {
    const etLower = exam_type.toLowerCase();
    if (etLower.includes("ssc")) {
      mappedExamType = "SSC";
    }
  }
  if (mappedExamType) {
    filter.exam_type = mappedExamType;
  }

  console.log("Resolved values:");
  console.log("  resolvedCourseNames:", resolvedCourseNames);
  console.log("  resolvedSubTypes:", resolvedSubTypes);
  console.log("  filter:", filter);

  console.log("Executing primary Question.find query...");
  let questions = await Question.find({
    $or: [
      { test_id: { $in: resolvedSubTypes } },
      { test_title: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, test_title: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, sub_type: { $in: resolvedSubTypes } },
      { course: { $in: resolvedCourseNames }, test_id: { $in: resolvedSubTypes } },
      filter
    ]
  }).sort({ display_question_number: 1, question_number: 1, id: 1 }).lean();

  console.log(`Primary query results: ${questions.length} questions.`);

  if (questions.length === 0) {
    console.log("Primary query returned 0. Trying fallback query...");
    let fallbackFilter = {
      status: "ok"
    };
    if (mappedExamType) fallbackFilter.exam_type = mappedExamType;
    if (resolvedSubTypes.length > 0) {
      fallbackFilter.$or = [
        { sub_type: { $in: resolvedSubTypes } },
        { paper_name: { $in: resolvedSubTypes } },
        { test_title: { $in: resolvedSubTypes } }
      ];
    }
    console.log("  fallbackFilter:", fallbackFilter);
    questions = await Question.find(fallbackFilter).sort({ display_question_number: 1, question_number: 1, id: 1 }).lean();
    console.log(`Fallback query results: ${questions.length} questions.`);
  }

  if (questions.length > 0) {
    console.log("Sample question 1:");
    console.log(`  Question: "${questions[0].question.slice(0, 100)}..."`);
    console.log(`  options:`, questions[0].options);
    console.log(`  course: "${questions[0].course}"`);
    console.log(`  sub_type: "${questions[0].sub_type}"`);
    console.log(`  paper_name: "${questions[0].paper_name}"`);
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await testQuery("SSC CHSL", "ssc_chsl_prelims_test1");
  await mongoose.disconnect();
}

run().catch(console.error);
