const fs = require("fs");
const path = require("path");
const mongoose = require("../backend/node_modules/mongoose");
require("../backend/node_modules/dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Question } = require("../backend/models");

const logFilePath = path.join(__dirname, "chsl_sync_results.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

// 1. Decoy / Placeholder Mappings
const decoyFixes = {
  1: {
    32: {
      options: [
        { id: "A", text: "4, 5, 1, 2, 3" },
        { id: "B", text: "4, 1, 5, 3, 2" },
        { id: "C", text: "4, 5, 3, 1, 2" },
        { id: "D", text: "4, 5, 1, 3, 2" }
      ]
    },
    37: {
      options: [
        { id: "A", text: "76348" },
        { id: "B", text: "76834" },
        { id: "C", text: "76483" },
        { id: "D", text: "76384" }
      ]
    }
  },
  2: {
    46: {
      options: [
        { id: "A", text: "34" },
        { id: "B", text: "33" },
        { id: "C", text: "35" },
        { id: "D", text: "36" }
      ]
    },
    77: {
      options: [
        { id: "A", text: "1923" },
        { id: "B", text: "1947" },
        { id: "C", text: "1950" },
        { id: "D", text: "1919" }
      ]
    }
  },
  3: {
    37: {
      options: [
        { id: "A", text: "2" },
        { id: "B", text: "3" },
        { id: "C", text: "5" },
        { id: "D", text: "10" }
      ]
    },
    47: {
      options: [
        { id: "A", text: "Two terms" },
        { id: "B", text: "Three terms" },
        { id: "C", text: "Five terms" },
        { id: "D", text: "No limit" }
      ]
    }
  },
  4: {
    39: {
      options: [
        { id: "A", text: "676" },
        { id: "B", text: "216" },
        { id: "C", text: "125" },
        { id: "D", text: "729" }
      ]
    },
    76: {
      options: [
        { id: "A", text: "1950" },
        { id: "B", text: "1952" },
        { id: "C", text: "1947" },
        { id: "D", text: "1955" }
      ]
    },
    92: {
      options: [
        { id: "A", text: "2013" },
        { id: "B", text: "2014" },
        { id: "C", text: "2015" },
        { id: "D", text: "2016" }
      ]
    },
    96: {
      options: [
        { id: "A", text: "2014" },
        { id: "B", text: "2016" },
        { id: "C", text: "2015" },
        { id: "D", text: "2013" }
      ]
    }
  },
  5: {
    17: {
      options: [
        { id: "A", text: "2018" },
        { id: "B", text: "2020" },
        { id: "C", text: "2022" },
        { id: "D", text: "2025" }
      ]
    },
    26: {
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "No error" }
      ]
    },
    27: {
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "No error" }
      ]
    }
  },
  6: {
    94: {
      options: [
        { id: "A", text: "2025" },
        { id: "B", text: "2030" },
        { id: "C", text: "2028" },
        { id: "D", text: "2022" }
      ]
    }
  },
  8: {
    89: {
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "4" }
      ]
    }
  },
  9: {
    93: {
      options: [
        { id: "A", text: "1919" },
        { id: "B", text: "1920" },
        { id: "C", text: "1922" },
        { id: "D", text: "1924" }
      ]
    },
    97: {
      options: [
        { id: "A", text: "1975" },
        { id: "B", text: "1976" },
        { id: "C", text: "1978" },
        { id: "D", text: "1980" }
      ]
    },
    98: {
      options: [
        { id: "A", text: "6" },
        { id: "B", text: "5" },
        { id: "C", text: "11" },
        { id: "D", text: "9" }
      ]
    }
  },
  10: {
    32: {
      options: [
        { id: "A", text: "1, 5, 2, 4, 3" },
        { id: "B", text: "1, 4, 5, 2, 3" },
        { id: "C", text: "1, 5, 4, 2, 3" },
        { id: "D", text: "1, 5, 4, 3, 2" }
      ]
    },
    93: {
      options: [
        { id: "A", text: "10" },
        { id: "B", text: "12" },
        { id: "C", text: "11" },
        { id: "D", text: "15" }
      ]
    }
  }
};

// LaTeX formatting sanitization inside math blocks $ ... $
function sanitizeLatex(str) {
  if (!str) return str;
  // Match blocks of formatting $ ... $
  return str.replace(/(\$[^\$]+\$)/g, (match) => {
    let math = match;
    // Replace non-standard characters
    math = math.replace(/÷/g, "\\div");
    math = math.replace(/×/g, "\\times");
    math = math.replace(/∛/g, "\\sqrt[3]");
    math = math.replace(/⁴√/g, "\\sqrt[4]");
    math = math.replace(/⁵√/g, "\\sqrt[5]");
    math = math.replace(/√/g, "\\sqrt");
    math = math.replace(/∥/g, "\\parallel");
    return math;
  });
}

async function run() {
  log("Starting SSC CHSL papers local formatting and DB sync...");

  const papers = Array.from({ length: 10 }, (_, i) => i + 1);

  for (let paperNum of papers) {
    const filename = `ssc_chsl_tier1_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "ssc_chsl_tier1_papers", filename);
    if (!fs.existsSync(filePath)) {
      log(`Warning: File not found ${filePath}`);
      continue;
    }

    log(`Processing Paper ${paperNum}...`);
    let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (let q of data) {
      const qNum = q.display_question_number || q.question_number || q.id;

      // 1. Decoy / Placeholder option fixes
      if (decoyFixes[paperNum] && decoyFixes[paperNum][qNum]) {
        log(`  Fixing decoy options for Q${qNum}`);
        q.options = decoyFixes[paperNum][qNum].options;
      }

      // 2. Specific Question Corrections

      // Paper 1 Q1 options/explanation match fix
      if (paperNum === 1 && qNum === 1) {
        log(`  Fixing Q1 options for Paper 1`);
        q.options = [
          { id: "A", text: "89" },
          { id: "B", text: "87" },
          { id: "C", text: "79" },
          { id: "D", text: "97" }
        ];
      }

      // Paper 1 Q14 typo & options fix
      if (paperNum === 1 && qNum === 14) {
        log(`  Fixing Q14 options and typo for Paper 1`);
        q.question = "What is the value of $\\sqrt{8^2 + 15^2}$?";
        q.q = "What is the value of √(8² + 15²)?";
        q.options = [
          { id: "A", text: "17" },
          { id: "B", text: "15" },
          { id: "C", text: "16" },
          { id: "D", text: "22" }
        ];
        q.explanation = "$\\sqrt{8^2 + 15^2} = \\sqrt{64 + 225} = \\sqrt{289} = 17$.";
      }

      // 3. Specific ATHBLOCK corrections
      if (paperNum === 9 && qNum === 25) {
        log(`  Fixing ATHBLOCK in Paper 9 Q25`);
        q.explanation = q.explanation.split("$\\sqrt{M}$ATHBLOCK 1").join("\\sqrt{17^2 - 15^2}");
      }
      if (paperNum === 7 && qNum === 24) {
        log(`  Fixing ATHBLOCK in Paper 7 Q24`);
        q.explanation = q.explanation.split("(\\sqrt{M}$ATHBLOCK 1\\sqrt{3}) / 3").join("\\frac{(\\sqrt{2}-2)\\sqrt{3}}{3}");
      }
      if (paperNum === 6 && qNum === 25) {
        log(`  Fixing ATHBLOCK in Paper 6 Q25`);
        q.explanation = q.explanation.split("$\\sqrt{M}$ATHBLOCK 1").join("\\sqrt{13^2 - 12^2} = \\sqrt{25} = 5");
      }
      if (paperNum === 4 && qNum === 67) {
        log(`  Fixing ATHBLOCK in Paper 4 Q67`);
        q.question = q.question.split("x = √(3 / 2").join("x = \\frac{\\sqrt{3}}{2}");
        q.question = q.question.split("(\\sqrt(1+x) + \\sqrt(1-x)) / (\\sqrt(1+x) - \\sqrt(1-x))").join("\\frac{\\sqrt{1+x} + \\sqrt{1-x}}{\\sqrt{1+x} - \\sqrt{1-x}}");
        q.q = q.q.split("x = √(3 / 2").join("x = √3/2");
        q.options = [
          { id: "A", text: "$-\\sqrt{3}$" },
          { id: "B", text: "$\\sqrt{3}$" },
          { id: "C", text: "$2\\sqrt{3}$" },
          { id: "D", text: "$\\frac{\\sqrt{3}}{2}$" }
        ];
        q.explanation = q.explanation.split("$\\sqrt{M}$ATHBLOCK 1").join("\\frac{\\sqrt{3}}{2}");
      }
      if (paperNum === 3 && qNum === 75) {
        log(`  Fixing ATHBLOCK in Paper 3 Q75`);
        q.question = q.question.split("MATHBLOCK$\\frac{0}{6}$)?").join("$\\tan(-\\frac{5\\pi}{6})$?");
        q.explanation = q.explanation.split("\\tan(-\\theta) = -\\tan(\\theta$)").join("\\tan(-\\theta) = -\\tan(\\theta)");
        q.explanation = q.explanation.split("\\tan(5\\pi/6) = -1/\\sqrt{3}, \\tan(-5\\pi/6) = 1/\\sqrt{3}").join("\\tan(\\frac{5\\pi}{6}) = -\\frac{1}{\\sqrt{3}}, \\tan(-\\frac{5\\pi}{6}) = \\frac{1}{\\sqrt{3}}");
      }
      if (paperNum === 2 && qNum === 24) {
        log(`  Fixing ATHBLOCK in Paper 2 Q24`);
        q.question = q.question.split("$\\sqrt{M}$ATHBLOCK 0").join("\\frac{\\sqrt{3}}{2}");
        q.explanation = q.explanation.split("1/\\sqrt{3} − \\sqrt{\\frac{3}{2}} = (2 − 3)/(2\\sqrt{3}) = -1/(2\\sqrt{3})").join("\\frac{1}{\\sqrt{3}} - \\frac{\\sqrt{3}}{2} = \\frac{2 - 3}{2\\sqrt{3}} = \\frac{-1}{2\\sqrt{3}}");
      }
      if (paperNum === 10 && qNum === 25) {
        log(`  Fixing ATHBLOCK in Paper 10 Q25`);
        q.explanation = q.explanation.split("$\\sqrt{M}$ATHBLOCK 1").join("\\sqrt{17^2 - 8^2}");
      }

      // 4. LaTeX general sanitization
      q.question = sanitizeLatex(q.question);
      q.explanation = sanitizeLatex(q.explanation);
      if (q.options) {
        q.options = q.options.map(opt => ({
          ...opt,
          text: sanitizeLatex(opt.text)
        }));
      }
    }

    // Write back modified JSON to disk
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    log(`  Successfully wrote corrected JSON to disk.`);
  }

  // Connect to MongoDB to overwrite and sync
  log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  log("Connected to MongoDB successfully!");

  for (let paperNum of papers) {
    const filename = `ssc_chsl_tier1_paper${paperNum}.json`;
    const filePath = path.join(__dirname, "..", "QuestionBank", "json", "ssc_chsl_tier1_papers", filename);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    log(`Syncing database for ${filename} (${data.length} questions)...`);

    for (let diskQ of data) {
      const qNum = diskQ.display_question_number || diskQ.question_number || diskQ.id;

      // Extract and map fields to match schema structure
      const mappedOptions = diskQ.options.map(opt => opt.text);

      const updateData = {
        question: diskQ.question,
        options: mappedOptions,
        correct_option: diskQ.correct_option,
        correct_answer: diskQ.correct_answer,
        explanation: diskQ.explanation,
        question_image: diskQ.question_image || "",
        option_images: diskQ.option_images || ["", "", "", ""],
        course: diskQ.course || "SSC CHSL",
        exam_type: diskQ.exam_type || "SSC",
        paper_name: diskQ.paper_name || `SSC CHSL Prelims - Test ${paperNum}`,
        subject: diskQ.subject,
        chapter: diskQ.chapter || "",
        topic: diskQ.topic || "",
        difficulty: diskQ.difficulty || "Medium",
        category: diskQ.category || "SSC Exams",
        section: diskQ.section || diskQ.subject,
        q: diskQ.q,
        correct_letter: diskQ.correct_letter,
        status: diskQ.status || "ok",
        is_mock_eligible: diskQ.is_mock_eligible !== undefined ? diskQ.is_mock_eligible : true,
        source_file: filename,
        display_question_number: qNum,
        updated_at: new Date()
      };

      const result = await Question.findOneAndUpdate(
        { unique_id: diskQ.unique_id },
        { $set: updateData },
        { new: true, upsert: true }
      );
    }
    log(`  DB Sync completed for Paper ${paperNum}.`);
  }

  await mongoose.disconnect();
  log("Database sync process complete.");
  logStream.end();
}

run().catch(err => {
  log(`FATAL ERROR: ${err}`);
  logStream.end();
});
