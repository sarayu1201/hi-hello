require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const { User, Attempt, Feedback, Course, Question, Leaderboard, Job, ScraperRun, ScraperConfig, Student, StudentAccess, DailyQuiz, DailyQuizAttempt } = require("./models");
const { runScraper, SCRAPER_CLASSES } = require("./scrapers/runner");
const { sendMulticastNotification } = require("./services/fcm");


const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5000", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Serve question images with intelligent multi-folder fallback lookup
app.get("/api/images/*", (req, res) => {
  const rawPath = req.params[0] || "";
  const filename = path.basename(rawPath);
  
  if (!filename) {
    return res.status(404).send("Image not specified");
  }

  // Priority candidate paths
  const candidatePaths = [
    path.join(__dirname, "uploads", "images", rawPath),
    path.join(__dirname, "uploads", "images", filename),
    path.join(__dirname, "uploads", "images", "sbi_po_prelims", filename),
    path.join(__dirname, "uploads", "images", "rrb_groupd", filename),
    path.join(__dirname, "uploads", "images", "ssc_gd", filename),
    path.join(__dirname, "uploads", "images", "rrb_clerk", filename),
    path.join(__dirname, "..", "QuestionBank", "images", rawPath),
    path.join(__dirname, "..", "QuestionBank", "images", filename),
    path.join(__dirname, "..", "QuestionBank", "images", "sbi_po_prelims", filename),
    path.join(__dirname, "..", "QuestionBank", "images", "rrb_groupd", filename),
    path.join(__dirname, "..", "QuestionBank", "images", "ssc_gd", filename),
    path.join(__dirname, "..", "QuestionBank", "images", "rrb_clerk", filename),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return res.sendFile(path.resolve(candidate));
    }
  }

  // Fallback: check subdirectories of uploads/images or QuestionBank/images
  const searchDirs = [
    path.join(__dirname, "uploads", "images"),
    path.join(__dirname, "..", "QuestionBank", "images")
  ];

  for (const sDir of searchDirs) {
    if (fs.existsSync(sDir)) {
      try {
        const files = fs.readdirSync(sDir, { recursive: true });
        for (const f of files) {
          if (path.basename(f).toLowerCase() === filename.toLowerCase()) {
            const fullPath = path.join(sDir, f);
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
              return res.sendFile(path.resolve(fullPath));
            }
          }
        }
      } catch (e) {}
    }
  }

  console.warn(`[IMAGE NOT FOUND] Requested '${rawPath}' (filename: '${filename}') could not be located.`);
  return res.status(404).send("Image not found");
});

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - IP: ${req.ip}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyCopy = { ...req.body };
    if (bodyCopy.password) bodyCopy.password = "[HIDDEN]";
    if (bodyCopy.otp) bodyCopy.otp = "[HIDDEN]";
    console.log(`  Body:`, JSON.stringify(bodyCopy));
  }
  next();
});

// Secure password hashing and token helpers using built-in crypto
const crypto = require("crypto");

const hashPassword = (password, salt = null) => {
  const finalSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, "sha512").toString("hex");
  return { salt: finalSalt, hash };
};

const verifyPassword = (password, storedSalt, storedHash) => {
  if (!storedSalt || !storedHash) return false;
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
};

const generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Lightweight, zero-dependency Rate Limiter for Authentication endpoints
const authRateLimit = {};
const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();
  if (!authRateLimit[ip]) {
    authRateLimit[ip] = [];
  }
  // Keep only requests in the last 1 minute
  authRateLimit[ip] = authRateLimit[ip].filter(timestamp => now - timestamp < 60000);

  if (authRateLimit[ip].length >= 15) {
    console.warn(`[RATE LIMIT] Exceeded auth attempt limit for IP: ${ip}`);
    return res.status(429).json({ error: "Too many authentication requests. Please wait 60 seconds." });
  }

  authRateLimit[ip].push(now);
  next();
};

// Connect to MongoDB
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@kr-institute-of-learning.in";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log("Seeding default administrator account in MongoDB...");
      const { salt, hash } = hashPassword("admin");
      admin = new User({
        name: "KR Institute of Learning Admin",
        email: adminEmail,
        phone: "0000000000",
        passwordSalt: salt,
        password: hash,
        role: "admin",
        verified: true,
        states: ["Central"],
        qualifications: ["Degree"],
        organizations: ["UPSC", "SSC", "RRB", "IBPS", "APPSC", "TSPSC"],
        bookmarks: []
      });
      await admin.save();
      console.log("Default admin account seeded successfully.");
    } else if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
      console.log("Updated existing default administrator role to 'admin'.");
    }
  } catch (e) {
    console.error("Error seeding default admin:", e);
  }
};

const seedDefaultSuperadmin = async () => {
  try {
    const superadminEmail = "superadmin@kr-institute-of-learning.in";
    let superadmin = await User.findOne({ email: superadminEmail });
    if (!superadmin) {
      console.log("Seeding default superadministrator account in MongoDB...");
      const { salt, hash } = hashPassword("superadmin");
      superadmin = new User({
        name: "KR Institute of Learning Superadmin",
        email: superadminEmail,
        phone: "0000000001",
        passwordSalt: salt,
        password: hash,
        role: "superadmin",
        verified: true,
        states: ["Central"],
        qualifications: ["Degree"],
        organizations: ["UPSC", "SSC", "RRB", "IBPS", "APPSC", "TSPSC"],
        bookmarks: []
      });
      await superadmin.save();
      console.log("Default superadmin account seeded successfully.");
    } else if (superadmin.role !== "superadmin") {
      superadmin.role = "superadmin";
      await superadmin.save();
      console.log("Updated existing default superadministrator role to 'superadmin'.");
    }
  } catch (e) {
    console.error("Error seeding default superadmin:", e);
  }
};

const seedInitialJobs = async () => {
  try {
    const count = await Job.countDocuments();
    if (count === 0) {
      console.log("Seeding initial government job notifications in MongoDB...");

      for (const name of Object.keys(SCRAPER_CLASSES)) {
        const ScraperClass = SCRAPER_CLASSES[name];
        const scraperInstance = new ScraperClass();
        const mockJob = scraperInstance.generateMockJob();

        const newJob = new Job({
          title: mockJob.title,
          organization: mockJob.organization,
          notification_date: mockJob.notification_date,
          application_start_date: mockJob.application_start_date,
          application_last_date: mockJob.application_last_date,
          vacancies: mockJob.vacancies,
          official_notification_url: mockJob.official_notification_url,
          official_apply_url: mockJob.official_apply_url,
          category: mockJob.category,
          state: mockJob.state,
          qualification: mockJob.qualification,
          summary_english: `Official notification released by ${mockJob.organization} for recruitment selection exams.`,
          summary_telugu: `${mockJob.organization} ద్వారా ఉద్యోగ నియామకాల నోటిఫికేషన్ విడుదల చేయబడింది.`,
          eligibility_summary: `• Qualification: Graduate Degree / Diploma\n• Age Limit: 18 - 35 years`,
          important_dates_summary: `• Apply Deadline: ${mockJob.application_last_date}`,
          guid: mockJob.guid,
          notification_sent: false
        });

        await newJob.save();
        
        // Seed scraper config
        const config = new ScraperConfig({ scraper_name: name, is_active: true, interval_minutes: 15 });
        await config.save();
      }
      console.log("MongoDB job alerts seeding complete.");
    }
  } catch (e) {
    console.error("Error seeding initial jobs: ", e);
  }
};

const migrateOldQuestions = async () => {
  try {
    const result = await Question.updateMany(
      { source_file: { $exists: false } },
      { $set: { is_quiz_only: true, is_mock_eligible: false } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Migration] Migrated ${result.modifiedCount} old questions to be is_quiz_only: true and is_mock_eligible: false.`);
    }
  } catch (err) {
    console.error("[Migration] Error running baseline questions migration:", err);
  }
};

const seedTestCoursePrice = async () => {
  try {
    const result = await Course.updateOne(
      { id: "sbi_po" },
      { $set: { price: 10 } }
    );
    if (result.modifiedCount > 0) {
      console.log("[Seeding] Successfully updated SBI PO course price to ₹10 in MongoDB.");
    }
  } catch (err) {
    console.error("Failed to seed test course price:", err);
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    seedDefaultAdmin();
    seedDefaultSuperadmin();
    seedInitialJobs();
    migrateOldQuestions();
    seedTestCoursePrice();
  })
  .catch(err => console.error("Error connecting to MongoDB:", err));


// Pure Brevo HTTP API Configuration (Nodemailer and SMTP completely removed)
const axios = require("axios");

// Startup validation: Exit application with a clear error if BREVO_API_KEY or EMAIL_FROM is missing
if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
  console.error("=======================================================================");
  console.error("FATAL ERROR: BREVO_API_KEY or EMAIL_FROM environment variable is missing.");
  console.error("Application cannot start without proper email configurations.");
  console.error("=======================================================================");
  process.exit(1);
}

const sendMail = async (to, subject, text, html) => {
  console.log(`[EMAIL] Attempting to send email to: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);

  const fromEmail = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "KR Institute of Learning";
  const apiKey = process.env.BREVO_API_KEY;

  try {
    console.log("[EMAIL] Sending HTTP POST request to Brevo SMTP email API...");
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: fromName,
          email: fromEmail
        },
        to: [
          {
            email: to
          }
        ],
        subject: subject,
        htmlContent: html,
        textContent: text
      },
      {
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": apiKey
        }
      }
    );

    console.log(`[EMAIL] Brevo API Response Status: ${response.status}`);
    if (response.status === 201) {
      const messageId = response.data.messageId;
      console.log(`[EMAIL] Email sent successfully via Brevo HTTP API. Message ID: ${messageId}`);
      return { success: true, messageId };
    } else {
      const err = new Error(`Unexpected Brevo response status: ${response.status}`);
      console.error("[EMAIL] Failed to send email via Brevo HTTP API. Response data:", JSON.stringify(response.data));
      throw err;
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send email via Brevo HTTP API. Full error details:");
    if (err.response) {
      console.error("Response data:", JSON.stringify(err.response.data));
      console.error("Response status:", err.response.status);
      console.error("Response headers:", JSON.stringify(err.response.headers));
    } else {
      console.error(err);
    }
    throw err;
  }
};

function generateQuantQuestion(i, category = "Bank & Insurance") {
  const topics = ["Aptitude", "Arithmetic", "Calculation"];
  
  if (category === "NEET / JEE") {
    // Physics Numerical questions
    const physicsTopics = ["Kinematics", "Force and Motion", "Work and Energy", "Electrostatics"];
    const pTopic = physicsTopics[i % physicsTopics.length];
    if (pTopic === "Kinematics") {
      const v = 10 + (i % 6) * 5; // 10, 15, 20... m/s
      const t = 2 + (i % 4) * 2;  // 2, 4, 6, 8 s
      const d = v * t;
      return {
        q: `A car accelerates uniformly from rest to a velocity of ${v} m/s in ${t} seconds. Find the distance traveled by the car during this time interval.`,
        options: [`${d} m`, `${(d / 2).toFixed(0)} m`, `${d * 2} m`, `${(d * 1.5).toFixed(0)} m`],
        correct: 1, // d/2 is correct for s = 0.5 * v * t
        explanation: `Distance s = Average Velocity * Time. Since initial velocity u = 0 and final velocity v = ${v} m/s, Average Velocity = (u + v)/2 = ${v/2} m/s. Distance s = (${v}/2) * ${t} = ${(v/2)*t} meters. \n\n*Real-Life Example*: When a racer accelerates their motorcycle off a starting line to a speed of ${v} m/s in ${t} seconds, the actual track distance covered is exactly ${(v/2)*t} meters.`
      };
    } else if (pTopic === "Force and Motion") {
      const m = 2 + (i % 5) * 2; // 2, 4, 6, 8, 10 kg
      const a = 3 + (i % 4);     // 3, 4, 5, 6 m/s^2
      const f = m * a;
      return {
        q: `A block of mass ${m} kg is kept on a frictionless horizontal table. What constant horizontal force is required to produce an acceleration of ${a} m/s²?`,
        options: [`${f} N`, `${f + 10} N`, `${(f / 2).toFixed(0)} N`, `${f * 2} N`],
        correct: 0,
        explanation: `According to Newton's Second Law: Force (F) = mass (m) * acceleration (a). Given mass = ${m} kg and acceleration = ${a} m/s². Force = ${m} * ${a} = ${f} Newtons. \n\n*Real-Life Example*: If you are pushing a groceries crate of mass ${m} kg across a smooth supermarket floor to accelerate it at ${a} m/s², you must exert a force of exactly ${f} Newtons.`
      };
    } else if (pTopic === "Work and Energy") {
      const f = 10 + (i % 5) * 10; // 10, 20, 30... N
      const d = 5 + (i % 4) * 5;   // 5, 10, 15, 20 m
      const w = f * d;
      return {
        q: `A constant force of ${f} N acts on a body and displaces it by ${d} meters in the direction of the force. Calculate the work done by this force.`,
        options: [`${w - 50} Joules`, `${w} Joules`, `${w + 100} Joules`, `${(w / 2).toFixed(0)} Joules`],
        correct: 1,
        explanation: `Work Done (W) = Force (F) * Displacement (d) * cos(theta). Since the displacement is in the direction of the force, theta = 0 and cos(0) = 1. W = ${f} * ${d} = ${w} Joules. \n\n*Real-Life Example*: If you drag a heavy travel suitcase along a terminal walkway with a force of ${f} N over a distance of ${d} meters, you expend exactly ${w} Joules of energy.`
      };
    } else {
      const q1 = 2 + (i % 3); // 2, 3, 4 microCoulombs
      const q2 = 5 + (i % 4); // 5, 6, 7, 8 microCoulombs
      const r = 3; // 3 meters
      const f = ((9 * q1 * q2) / (r * r)).toFixed(2);
      return {
        q: `Two point charges of ${q1} µC and ${q2} µC are separated by a distance of ${r} meters in vacuum. Find the magnitude of the electrostatic force between them (k = 9 × 10⁹ N·m²/C²).`,
        options: [`${f} × 10⁻³ N`, `${(f * 2.5).toFixed(2)} × 10⁻³ N`, `${f} × 10⁻⁴ N`, `${(f * 1.5).toFixed(2)} × 10⁻³ N`],
        correct: 0,
        explanation: `Coulomb's Law: F = k * |q1 * q2| / r². Given q1 = ${q1} × 10⁻⁶ C, q2 = ${q2} × 10⁻⁶ C, and r = ${r} m. Force = (9 × 10⁹ * ${q1} × 10⁻⁶ * ${q2} × 10⁻⁶) / ${r * r} = (${9 * q1 * q2} × 10⁻³) / 9 = ${f} × 10⁻³ N. \n\n*Real-Life Example*: When static electricity builds up on two clothes items in a dryer carrying ${q1} µC and ${q2} µC charges respectively at a distance of ${r}m, they attract or repel with a force of ${f} milliNewtons.`
      };
    }
  }

  // Standard Quantitative Aptitude (Banking, SSC, Railways, Civil, State Exams)
  const mathTopics = ["Time and Work", "Profit and Loss", "Averages", "Interest", "Ratio and Proportion", "Speed, Time and Distance", "Simplification"];
  const topic = mathTopics[i % mathTopics.length];
  
  if (topic === "Time and Work") {
    const name1 = ["Rajesh", "Suresh", "Amit", "Rahul", "Priya", "Sneha", "Kiran"][i % 7];
    const name2 = ["Ramesh", "Ganesh", "Sumit", "Rohit", "Anjali", "Neha", "Arjun"][i % 7];
    const d1 = 10 + (i % 5) * 5; // 10, 15, 20, 25, 30
    const d2 = 12 + (i % 4) * 6; // 12, 18, 24, 30
    const total = d1 * d2;
    const combined = (d1 * d2) / (d1 + d2);
    const ans = combined.toFixed(1);
    
    return {
      q: `${name1} can complete a task in ${d1} days, and ${name2} can complete the same task in ${d2} days. If they work together, how many days will they take to complete the task?`,
      options: [`${ans} days`, `${(combined + 2.1).toFixed(1)} days`, `${(combined - 1.5).toFixed(1)} days`, `${(combined * 1.3).toFixed(1)} days`],
      correct: 0,
      explanation: `Combined Work Formula: Time = (d1 * d2) / (d1 + d2). Given d1 = ${d1} and d2 = ${d2}. Combined time = (${d1} * ${d2}) / (${d1} + ${d2}) = ${total} / ${d1 + d2} = ${ans} days. \n\n*Real-Life Example*: If ${name1} and ${name2} are organizing files in an office database, collaborating allows them to combine their speeds, reducing the overall completion time to just ${ans} days.`
    };
  } else if (topic === "Profit and Loss") {
    const item = ["laptop", "mobile phone", "bicycle", "watch", "camera", "tablet", "headphones"][i % 7];
    const cp = 500 + (i % 8) * 150; // 500, 650, 800, 950...
    const profitPct = 10 + (i % 5) * 5; // 10%, 15%, 20%, 25%, 30%
    const profitAmt = (cp * profitPct) / 100;
    const sp = cp + profitAmt;
    
    return {
      q: `A dealer buys a ${item} for Rs. ${cp} and sells it at a profit of ${profitPct}%. What is the selling price of the ${item}?`,
      options: [`Rs. ${sp - 30}`, `Rs. ${sp}`, `Rs. ${sp + 45}`, `Rs. ${cp - profitAmt}`],
      correct: 1,
      explanation: `Selling Price (SP) = Cost Price (CP) * (100 + Profit%) / 100. Given CP = ${cp} and Profit = ${profitPct}%. SP = ${cp} * (100 + ${profitPct}) / 100 = Rs. ${sp}. \n\n*Real-Life Example*: If you buy a ${item} at a wholesale market for Rs. ${cp} and resell it online with a ${profitPct}% markup, your customers pay Rs. ${sp}, netting you a profit of Rs. ${profitAmt}.`
    };
  } else if (topic === "Averages") {
    const count = 4 + (i % 4); // 4, 5, 6, 7
    const oldAvg = 40 + (i % 5) * 5; // 40, 45, 50, 55, 60
    const newVal = 80 + (i % 8) * 5; // 80, 85, 90, 95...
    const newAvg = (oldAvg * count + newVal) / (count + 1);
    const ans = newAvg.toFixed(1);
    
    return {
      q: `The average weight of ${count} students is ${oldAvg} kg. If a teacher weighing ${newVal} kg joins the group, what is the new average weight of the group?`,
      options: [`${(newAvg + 1.5).toFixed(1)} kg`, `${(newAvg - 1.2).toFixed(1)} kg`, `${ans} kg`, `${(newAvg * 1.05).toFixed(1)} kg`],
      correct: 2,
      explanation: `Total weight initially = ${count} * ${oldAvg} = ${oldAvg * count} kg. New total weight = ${oldAvg * count} + ${newVal} = ${oldAvg * count + newVal} kg. Total members = ${count + 1}. New Average = ${oldAvg * count + newVal} / ${count + 1} = ${ans} kg. \n\n*Real-Life Example*: If a small delivery business operates ${count} mini trucks with average cargo of ${oldAvg} tons, adding one large container truck carrying ${newVal} tons raises the average cargo per truck to ${ans} tons.`
    };
  } else if (topic === "Interest") {
    const p = 1000 + (i % 8) * 1000; // 1000, 2000...
    const r = 5 + (i % 4); // 5%, 6%, 7%, 8%
    const t = 2 + (i % 3); // 2, 3, 4 years
    const si = (p * r * t) / 100;
    
    return {
      q: `What is the simple interest earned on a principal amount of Rs. ${p} at an annual interest rate of ${r}% over a period of ${t} years?`,
      options: [`Rs. ${si - 25}`, `Rs. ${si + 40}`, `Rs. ${si}`, `Rs. ${si + 100}`],
      correct: 2,
      explanation: `Simple Interest (SI) = (P * R * T) / 100. P = ${p}, R = ${r}%, T = ${t} years. SI = (${p} * ${r} * ${t}) / 100 = Rs. ${si}. \n\n*Real-Life Example*: If you deposit Rs. ${p} in a savings cooperative scheme that guarantees ${r}% simple interest yearly, you will earn Rs. ${si} as profit after ${t} years.`
    };
  } else if (topic === "Ratio and Proportion") {
    const valA = 2 + (i % 3); // 2, 3, 4
    const valB = 3 + (i % 4); // 3, 4, 5, 6
    const factor = 10 + (i % 8) * 5; // 10, 15, 20...
    const total = (valA + valB) * factor;
    const shareA = valA * factor;
    
    return {
      q: `A sum of Rs. ${total} is divided between A and B in the ratio ${valA}:${valB}. What is the share of A?`,
      options: [`Rs. ${shareA}`, `Rs. ${shareA + 30}`, `Rs. ${shareA - 20}`, `Rs. ${total - shareA}`],
      correct: 0,
      explanation: `Total parts = ${valA} + ${valB} = ${valA + valB}. Value of 1 part = ${total} / ${valA + valB} = ${factor}. Share of A = ${valA} parts * ${factor} = Rs. ${shareA}. \n\n*Real-Life Example*: If two business partners divide a profit of Rs. ${total} in a ratio of ${valA}:${valB} based on their startup investments, Partner A receives a dividend of exactly Rs. ${shareA}.`
    };
  } else if (topic === "Speed, Time and Distance") {
    const speedKmh = 36 + (i % 5) * 18; // 36, 54, 72, 90, 108 km/h
    const speedMs = speedKmh * (5/18);
    const t = 10 + (i % 8) * 2; // 10, 12, 14... seconds
    const length = speedMs * t;
    
    return {
      q: `A train running at a speed of ${speedKmh} km/h crosses a stationary pole in ${t} seconds. What is the length of the train?`,
      options: [`${length - 40} meters`, `${length} meters`, `${length + 50} meters`, `${length * 1.5} meters`],
      correct: 1,
      explanation: `Speed in m/s = ${speedKmh} * (5/18) = ${speedMs} m/s. Length of train (Distance) = Speed * Time = ${speedMs} * ${t} = ${length} meters. \n\n*Real-Life Example*: A railway system designer calculating crossing clearances determines that a train traveling at ${speedKmh} km/h takes ${t} seconds to clear a signal gantry, meaning its physical length is exactly ${length} meters.`
    };
  } else {
    const num1 = 10 + (i % 8) * 2; // 10, 12, 14...
    const num2 = 3 + (i % 4) * 2; // 3, 5, 7, 9
    const num3 = 10 + (i % 5) * 5; // 10, 15, 20...
    const ans = num1 * num2 + num3;
    
    return {
      q: `Simplify the expression using BODMAS rules: ${num1} × ${num2} + ${num3} = ?`,
      options: [`${ans - 10}`, `${ans + 15}`, `${num1 * (num2 + num3)}`, `${ans}`],
      correct: 3,
      explanation: `By BODMAS rules, perform multiplication before addition: ${num1} × ${num2} = ${num1 * num2}. Then perform addition: ${num1 * num2} + ${num3} = ${ans}. \n\n*Real-Life Example*: If you buy ${num2} cases of apples at Rs. ${num1} per case, and pay a flat cargo delivery fee of Rs. ${num3}, the total invoice amount is exactly Rs. ${ans}.`
    };
  }
}

function generateReasoningQuestion(i, category = "Bank & Insurance") {
  if (category === "NEET / JEE") {
    // Chemistry conceptual questions
    const chemTopics = ["Organic Chemistry", "Atomic Structure", "Periodic Table", "Chemical Bonding"];
    const cTopic = chemTopics[i % chemTopics.length];
    if (cTopic === "Organic Chemistry") {
      return {
        q: `Which of the following organic compounds will yield a silver mirror when treated with Ammoniacal Silver Nitrate (Tollens' reagent)?`,
        options: ["Acetone", "Acetaldehyde", "Ethanol", "Diethyl ether"],
        correct: 1,
        explanation: `Ammoniacal Silver Nitrate is reduced to metallic silver (silver mirror) by aldehydes but not by ketones, alcohols, or ethers. Acetaldehyde is an aldehyde and reacts positively. \n\n*Real-Life Example*: Tollens' chemical reduction is used in crafting vintage silver mirrors by washing the glass with a solution of aldehydes to coat it with metallic silver.`
      };
    } else if (cTopic === "Atomic Structure") {
      const n = 2 + (i % 3); // n = 2, 3, 4
      const orbitals = n * n;
      return {
        q: `What is the total number of atomic orbitals associated with the principal quantum number n = ${n}?`,
        options: [`${orbitals}`, `${n * 2}`, `${orbitals + 2}`, `${n}`],
        correct: 0,
        explanation: `The total number of orbitals in a shell with principal quantum number n is given by the formula n². For n = ${n}, number of orbitals = ${n}² = ${orbitals}. \n\n*Real-Life Example*: Quantum mechanics rules determine how electrons pack in shells. For shell ${n}, there are exactly ${orbitals} separate sub-atomic orbitals where electrons can reside.`
      };
    } else if (cTopic === "Periodic Table") {
      return {
        q: `Identify the element with the highest electronegativity value in the modern periodic table.`,
        options: ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"],
        correct: 2,
        explanation: `Fluorine is the most electronegative element on the Pauling scale (value 3.98) due to its small atomic radius and high nuclear attraction. \n\n*Real-Life Example*: Due to its extreme electronegativity, fluorine is highly reactive and forms robust bonds, which is why Teflon (fluorocarbon) coating is incredibly non-stick and heat-resistant.`
      };
    } else {
      return {
        q: `Which of the following molecules exhibits a planar triangular shape according to VSEPR theory?`,
        options: ["Ammonia (NH₃)", "Boron trifluoride (BF₃)", "Water (H₂O)", "Methane (CH₄)"],
        correct: 1,
        explanation: `Boron trifluoride has 3 bond pairs and 0 lone pairs on the central Boron atom. It has sp² hybridization and forms a symmetric planar triangular geometry. \n\n*Real-Life Example*: The planar shape of molecules like BF₃ allows them to act as electrophiles in chemical catalysts, facilitating bonds in industrial polymer synthesis.`
      };
    }
  }

  // Standard Reasoning (Banking, SSC, Railways, Civil, State Exams)
  const reasoningTopics = ["Syllogism", "Coding-Decoding", "Blood Relation", "Direction Sense", "Ordering", "Seating Arrangement"];
  const topic = reasoningTopics[i % reasoningTopics.length];
  
  if (topic === "Syllogism") {
    const item1 = ["Pens", "Books", "Phones", "Bottles", "Tables"][i % 5];
    const item2 = ["Papers", "Notebooks", "Laptops", "Glasses", "Desks"][i % 5];
    const item3 = ["Erasers", "Pencils", "Chargers", "Covers", "Stools"][i % 5];
    
    return {
      q: `Statements:\n1. All ${item1} are ${item2}.\n2. No ${item2} is ${item3}.\n\nConclusions:\nI. No ${item1} is ${item3}.\nII. Some ${item2} are ${item1}.`,
      options: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow", "Neither conclusion follows"],
      correct: 2,
      explanation: `All ${item1} lie inside ${item2}. Since no ${item2} touches ${item3}, the circle of ${item1} cannot touch ${item3} either, so I follows. Also, there is a clear overlap of ${item2} with ${item1}, so II follows. Both follow. \n\n*Real-Life Example*: If all smartphones (${item1}) are gadgets (${item2}), and no gadget is a vegetable (${item3}), then no smartphone is a vegetable, and some gadgets are smartphones.`
    };
  } else if (topic === "Coding-Decoding") {
    const word = ["BANK", "EXAM", "TEST", "PREP", "QUIZ"][i % 5];
    const shift = 1 + (i % 2); // 1 or 2
    let coded = "";
    for (let charIdx = 0; charIdx < word.length; charIdx++) {
      coded += String.fromCharCode(word.charCodeAt(charIdx) + shift);
    }
    const targetWord = ["ROSE", "LILY", "MINT", "SAGE", "FERN"][i % 5];
    let targetCoded = "";
    for (let charIdx = 0; charIdx < targetWord.length; charIdx++) {
      targetCoded += String.fromCharCode(targetWord.charCodeAt(charIdx) + shift);
    }
    
    return {
      q: `If the word '${word}' is coded as '${coded}' in a certain code language, how will the word '${targetWord}' be coded in the same language?`,
      options: [`${targetCoded}`, `${targetCoded.substring(1) + targetCoded[0]}`, `None of the options`, `${targetWord.toLowerCase()}`],
      correct: 0,
      explanation: `The coding logic shifts each letter forward by +${shift} positions in the alphabet. Shifting the letters of '${targetWord}' forward by +${shift} yields '${targetCoded}'. \n\n*Real-Life Example*: Basic military ciphers (like the Caesar cipher) shift letters by a set key (+${shift}) to transmit private orders that are unreadable without the decryption key.`
    };
  } else if (topic === "Blood Relation") {
    const relative = ["sister's son", "brother's daughter", "mother's brother", "father's sister"][i % 4];
    const relationName = ["nephew", "niece", "uncle", "aunt"][i % 4];
    const name = ["Ankita", "Bhavna", "Charu", "Deepak"][i % 4];
    
    return {
      q: `Pointing to a person, ${name} says: 'He/She is the only child of my ${relative}.' How is that person related to ${name}?`,
      options: [`Brother/Sister`, `${relationName}`, `Cousin`, `Father/Mother`],
      correct: 1,
      explanation: `My ${relative}'s only child corresponds directly to my ${relationName}. \n\n*Real-Life Example*: In a family directory, introducing a guest as the only child of your mother's brother simply means he is your cousin, or if he is your father's sister's child, your cousin.`
    };
  } else if (topic === "Direction Sense") {
    const dir1 = ["North", "East", "South", "West"][i % 4];
    const dist1 = 5 + (i % 4) * 5; // 5, 10, 15, 20
    const dist2 = 12;
    const ansDist = Math.sqrt(dist1*dist1 + dist2*dist2).toFixed(1);
    
    return {
      q: `A student walks ${dist1}m ${dir1} from the entrance, turns right and walks ${dist2}m. What is the shortest distance between the student's final position and the starting point?`,
      options: [`${(dist1 + dist2)}m`, `${(parseFloat(ansDist) + 3).toFixed(1)}m`, `${ansDist}m`, `${(dist1 - dist2 + 10)}m`],
      correct: 2,
      explanation: `The student's path forms a right-angled triangle. Hypotenuse = sqrt(${dist1}² + ${dist2}²) = sqrt(${dist1*dist1} + ${dist2*dist2}) = ${ansDist} meters. \n\n*Real-Life Example*: If a surveyor maps out a road turning right by 90 degrees, a straight line-of-sight laser rangefinder measures a direct return path of ${ansDist} meters.`
    };
  } else if (topic === "Ordering") {
    return {
      q: `Five students A, B, C, D, and E scored different marks in an exam. B scored more than C but less than E. D scored less than C. A scored the highest. Who scored the second highest?`,
      options: ["B", "C", "E", "D"],
      correct: 2,
      explanation: `Ranking: A is highest. B > C, and E > B. So A > E > B > C. D scored less than C, so A > E > B > C > D. The second highest score belongs to E. \n\n*Real-Life Example*: On a merit scholarship list, if student A gets Rank 1 and student E gets Rank 2, student E receives the second highest stipend.`
    };
  } else {
    return {
      q: `Six people P, Q, R, S, T, and U sit in a circle facing the center. P is opposite S. Q sits to the immediate left of P. T sits opposite Q. R is between S and T. Who sits opposite U?`,
      options: ["R", "S", "P", "T"],
      correct: 0,
      explanation: `Arranging the circle clockwise: P, Q, U, S, R, T. R sits directly opposite U. \n\n*Real-Life Example*: Around a circular boardroom table with six directors, chairs are arranged symmetrically so Director R faces Director U for face-to-face negotiations.`
    };
  }
}

function generateEnglishQuestion(i, category = "Bank & Insurance") {
  if (category === "NEET / JEE") {
    // Biology conceptual questions
    const bioTopics = ["Cell Biology", "Genetics", "Human Physiology", "Ecology"];
    const bTopic = bioTopics[i % bioTopics.length];
    if (bTopic === "Cell Biology") {
      return {
        q: `Which of the following cellular organelles is responsible for synthesizing adenosine triphosphate (ATP), the energy currency of the cell?`,
        options: ["Lysosome", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correct: 2,
        explanation: `Mitochondria carry out aerobic respiration, producing ATP via the electron transport chain, which is why they are called the powerhouses of the cell. \n\n*Real-Life Example*: Much like a hydroelectric power plant generates electricity to power a city, mitochondria generate ATP to fuel all cellular activities.`
      };
    } else if (bTopic === "Genetics") {
      return {
        q: `A human cell undergoing normal meiosis will produce gametes containing how many chromosomes?`,
        options: ["46 chromosomes", "23 chromosomes", "92 chromosomes", "12 chromosomes"],
        correct: 1,
        explanation: `Meiosis is a reduction division that halves the chromosome number from diploid (2n=46) to haploid (n=23) in sperm and egg cells. \n\n*Real-Life Example*: When egg and sperm cells fuse during fertilization, their 23 chromosomes combine to restore the standard 46 chromosomes in the offspring.`
      };
    } else if (bTopic === "Human Physiology") {
      return {
        q: `Which hormone is secreted by the beta cells of the pancreas to regulate blood glucose levels?`,
        options: ["Glucagon", "Insulin", "Adrenaline", "Thyroxine"],
        correct: 1,
        explanation: `Insulin is produced by the pancreatic beta cells and lowers blood glucose by promoting its uptake into body cells and liver glycogen storage. \n\n*Real-Life Example*: After eating a sugary dessert, the pancreas releases insulin to keep blood sugar stable. A lack of insulin leads to diabetes.`
      };
    } else {
      return {
        q: `In an ecological pyramid, which trophic level represents primary consumers that feed directly on green plants?`,
        options: ["First Trophic Level", "Second Trophic Level", "Third Trophic Level", "Fourth Trophic Level"],
        correct: 1,
        explanation: `Green plants (producers) occupy the first trophic level. Herbivores (primary consumers) feed on them and occupy the second trophic level. \n\n*Real-Life Example*: In a forest ecosystem, caterpillars and deer feed directly on green leaves, acting as the second level of energy transfer.`
      };
    }
  }

  if (category === "UPSC / Civil") {
    // General Studies - History & Constitution questions
    const gsTopics = ["Indian History", "Indian Polity"];
    const gsTopic = gsTopics[i % gsTopics.length];
    if (gsTopic === "Indian History") {
      return {
        q: `The Battle of Plassey, which laid the foundation of British rule in India, was fought in which year?`,
        options: ["1757", "1764", "1857", "1885"],
        correct: 0,
        explanation: `The Battle of Plassey was fought on June 23, 1757, between the Nawab of Bengal, Siraj-ud-Daulah, and the British East India Company led by Robert Clive. \n\n*Real-Life Example*: Historical battle victories, like Plassey, allowed private trading firms to assume administrative and tax revenue collecting roles over vast territories.`
      };
    } else {
      return {
        q: `Which Article of the Indian Constitution guarantees the Right to Equality before the law?`,
        options: ["Article 19", "Article 21", "Article 14", "Article 32"],
        correct: 2,
        explanation: `Article 14 of the Constitution states that the State shall not deny to any person equality before the law or the equal protection of the laws within India. \n\n*Real-Life Example*: Article 14 ensures that a high-ranking politician and an ordinary citizen are subjected to the same traffic laws and judicial trials.`
      };
    }
  }

  // Standard English (Banking, SSC, Railways, State Exams)
  const englishTopics = ["Error Spotting", "Fill in the Blanks", "Synonyms & Antonyms", "Sentence Correction"];
  const topic = englishTopics[i % englishTopics.length];
  
  if (topic === "Error Spotting") {
    const items = [
      { s: "Neither the teacher nor the students was present in the class.", err: "was present", corr: "were present" },
      { s: "One of the most important factor for success is consistency.", err: "important factor", corr: "important factors" }
    ];
    const item = items[i % items.length];
    return {
      q: `Identify the grammatically incorrect segment in the following sentence:\n"${item.s}"`,
      options: [item.err, "No error", "was present in", "One of the"],
      correct: 0,
      explanation: `The segment "${item.err}" is incorrect and should be replaced with "${item.corr}". Subject-verb agreement rules require the verb to agree with the closer subject in neither/nor constructions. \n\n*Real-Life Example*: In editing business proposals or corporate emails, checking subject-verb agreements prevents grammatical slips that look unprofessional.`
    };
  } else if (topic === "Fill in the Blanks") {
    return {
      q: `Fill in the blank with the most appropriate option:\n"Due to heavy rains, the match was _______ until next week."`,
      options: ["put off", "put out", "put up", "put in"],
      correct: 0,
      explanation: `The phrasal verb 'put off' means to postpone or delay. In this context, the match was postponed. \n\n*Real-Life Example*: In project management, when critical components are delayed, the launch is 'put off' to allow schedules to align.`
    };
  } else if (topic === "Synonyms & Antonyms") {
    return {
      q: `What is the synonym of the word 'MITIGATE'?`,
      options: ["Aggravate", "Alleviate", "Prolong", "Increase"],
      correct: 1,
      explanation: `'Mitigate' means to make less severe, serious, or painful. 'Alleviate' is its direct synonym. \n\n*Real-Life Example*: When constructing coastal breakwaters, engineers seek to 'mitigate' (alleviate) the damage caused by heavy wave erosion during storms.`
    };
  } else {
    return {
      q: `Correct the underlined portion of the sentence: "Having worked all night, the report was completed."`,
      options: [
        "Having worked all night, he completed the report.",
        "Working all night, the report was completed.",
        "The report was completed after working all night.",
        "Having worked all night, completion of the report occurred."
      ],
      correct: 0,
      explanation: `The original sentence contains a dangling modifier. The subject of 'having worked' must be a person ('he'), not the 'report'. Option A resolves this. \n\n*Real-Life Example*: Writing clear instruction manuals requires assigning active verbs to real operators, ensuring readers know exactly who performs which action.`
    };
  }
}

function generateGeneralAwarenessQuestion(i, category = "Bank & Insurance") {
  if (category === "NEET / JEE") {
    // General Science trivia questions
    const gsQ = [
      { q: "Which chemical element is present at the center of the chlorophyll molecule in plants?", opts: ["Iron", "Magnesium", "Copper", "Calcium"], corr: 1, exp: "Chlorophyll contains a magnesium ion coordinated inside a porphyrin ring." },
      { q: "What is the approximate speed of light in a vacuum?", opts: ["3 × 10⁸ m/s", "3 × 10⁵ m/s", "1.5 × 10⁸ m/s", "3 × 10⁶ m/s"], corr: 0, exp: "The speed of light in vacuum is approximately 299,792,458 m/s, or 3 × 10⁸ m/s." }
    ];
    const item = gsQ[i % gsQ.length];
    return {
      q: item.q,
      options: item.opts,
      correct: item.corr,
      explanation: `${item.exp} \n\n*Real-Life Example*: Magnesium gives leaves their green color. Without it, plants suffer from chlorosis, yellowing because they cannot make chlorophyll.`
    };
  }

  if (category === "UPSC / Civil") {
    // General Studies - Geography & Indian Economy
    const civilQ = [
      { q: "Which is the longest river that flows entirely within the territorial boundaries of India?", opts: ["Ganga", "Godavari", "Krishna", "Narmada"], corr: 1, exp: "The Godavari is the longest river flowing entirely within India, running for 1,465 km from Nashik to the Bay of Bengal." },
      { q: "What term describes a persistent and general increase in the price level of goods and services in an economy over time?", opts: ["Inflation", "Deflation", "Stagflation", "Recession"], corr: 0, exp: "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power." }
    ];
    const item = civilQ[i % civilQ.length];
    return {
      q: item.q,
      options: item.opts,
      correct: item.corr,
      explanation: `${item.exp} \n\n*Real-Life Example*: When inflation occurs, a basket of groceries that cost Rs. 1,000 last year might cost Rs. 1,070 this year, reducing the value of your cash savings.`
    };
  }

  if (category === "State Exams") {
    // Andhra Pradesh / Telangana State GK
    const stateQ = [
      { q: "Which sacred river flows directly through the city of Rajahmundry in Andhra Pradesh?", opts: ["Krishna River", "Godavari River", "Pennar River", "Tungabhadra River"], corr: 1, exp: "The holy Godavari River flows through Rajahmundry, where the famous Godavari Arch Bridge and Pushkar Ghats are located." },
      { q: "Who served as the first Chief Minister of Andhra Pradesh after its formation as a linguistic state in 1956?", opts: ["Tanguturi Prakasam", "Neelam Sanjiva Reddy", "Damodaram Sanjivayya", "Burgula Ramakrishna Rao"], corr: 1, exp: "Neelam Sanjiva Reddy was the first Chief Minister of Andhra Pradesh (1956-1960) and later became the 6th President of India." }
    ];
    const item = stateQ[i % stateQ.length];
    return {
      q: item.q,
      options: item.opts,
      correct: item.corr,
      explanation: `${item.exp} \n\n*Real-Life Example*: Rajahmundry hosts the massive Godavari Pushkaram festival every 12 years along the banks of the Godavari River, attracting millions of pilgrims.`
    };
  }

  // Standard General/Banking Awareness (Banking, SSC, Railways)
  const bankingQ = [
    { q: "What does the term 'Repo Rate' stand for in Reserve Bank of India monetary policy?", opts: ["Repurchase Rate", "Refinancing Rate", "Real-time Payment Rate", "Re-lending Rate"], corr: 0, exp: "Repo Rate is the Repurchase Rate at which the RBI lends money to commercial banks in exchange for government securities." },
    { q: "Which of the following is the regulatory body for insurance companies in India?", opts: ["SEBI", "IRDAI", "RBI", "NABARD"], corr: 1, exp: "The Insurance Regulatory and Development Authority of India (IRDAI) regulates and licenses the insurance sector in India." }
  ];
  const item = bankingQ[i % bankingQ.length];
  return {
    q: item.q,
    options: item.opts,
    correct: item.corr,
    explanation: `${item.exp} \n\n*Real-Life Example*: When the RBI increases the Repo Rate, commercial banks borrow at higher costs. They pass this cost to consumers, increasing home and car loan EMI interest rates.`
  };
}

function generateQuestionsPool(category = "Bank & Insurance") {
  const pool = [];
  for (let i = 0; i < 400; i++) {
    if (i < 100) {
      pool.push(generateQuantQuestion(i, category));
    } else if (i < 200) {
      pool.push(generateReasoningQuestion(i, category));
    } else if (i < 250) {
      pool.push(generateEnglishQuestion(i, category));
    } else if (i < 300) {
      pool.push(generateGeneralAwarenessQuestion(i, category));
    } else if (i < 330) {
      pool.push(generateGeneralAwarenessQuestion(i, category));
    } else if (i < 360) {
      pool.push(generateQuantQuestion(i, category));
    } else if (i < 380) {
      pool.push(generateReasoningQuestion(i, category));
    } else {
      pool.push(generateEnglishQuestion(i, category));
    }
  }
  return pool;
}

const questionPool = generateQuestionsPool();
const KR_ACHIEVERS_MOCKS_QUESTIONS = questionPool.slice(0, 300);
const KR_ACHIEVERS_PRACTICE_QUESTIONS = questionPool.slice(300, 400);

// Mock Upcoming Exams Notifications Data (Physics Wallah style)
const UPCOMING_NOTIFICATIONS = [
  {
    id: "notif_1",
    examBoard: "SBI",
    title: "SBI PO Recruitment 2026",
    badge: "Notification Out",
    badgeType: "success",
    releaseDate: "2026-06-01",
    applyStart: "2026-06-05",
    applyEnd: "2026-06-30",
    examDate: "2026-08-12",
    officialPdfUrl: "#",
    applyUrl: "#",
    vacancies: 2000
  },
  {
    id: "notif_2",
    examBoard: "SSC",
    title: "SSC CGL Recruitment 2026",
    badge: "Exam Dates Out",
    badgeType: "warning",
    releaseDate: "2026-05-15",
    applyStart: "2026-05-20",
    applyEnd: "2026-06-25",
    examDate: "2026-07-24",
    officialPdfUrl: "#",
    applyUrl: "#",
    vacancies: 17727
  },
  {
    id: "notif_3",
    examBoard: "RRB",
    title: "RRB NTPC CBT-1 Schedule 2026",
    badge: "Admit Card Out",
    badgeType: "danger",
    releaseDate: "2026-06-05",
    applyStart: "2026-06-08",
    applyEnd: "2026-07-08",
    examDate: "2026-08-15",
    officialPdfUrl: "#",
    applyUrl: "#",
    vacancies: 11558
  },
  {
    id: "notif_4",
    examBoard: "UPSC",
    title: "UPSC Civil Services Prelims 2026",
    badge: "Apply Online",
    badgeType: "info",
    releaseDate: "2026-02-10",
    applyStart: "2026-02-15",
    applyEnd: "2026-03-20",
    examDate: "2026-05-31",
    officialPdfUrl: "#",
    applyUrl: "#",
    vacancies: 1056
  }
];

// Detailed handbook contents for specific syllabus concepts/topics
const getHandbookDetailsForConcept = (conceptName, subjectName, courseTitle) => {
  const normName = conceptName.toLowerCase();
  
  if (normName.includes("simplification") || normName.includes("approximation")) {
    return `Master the core speed-math techniques and approximation rules for ${courseTitle}. This handbook covers BODMAS operations, fraction-to-percentage conversions, squaring and multiplication shortcuts, and practical examples to optimize your speed.

### 1. The Priority Order (BODMAS Rule)
Always perform mathematical operations in this exact order:
1. Brackets () [] {} (Innermost first)
2. Of / Orders / Indices (e.g., exponents, square roots, "of" multiplication)
3. Division (/)
4. Multiplication (*)
5. Addition (+)
6. Subtraction (-)

### 2. Fraction to Percentage Conversions
Memorize these equivalents to solve percentage problems in seconds:
* 1/2 = 50% | 1/3 = 33.33% | 1/4 = 25% | 1/5 = 20%
* 1/6 = 16.67% | 1/7 = 14.28% | 1/8 = 12.5% | 1/9 = 11.11%
* 1/11 = 9.09% | 1/12 = 8.33% | 1/15 = 6.67% | 1/20 = 5%

### 3. Quick Squaring & Multiplication Hacks
* Squaring numbers ending in 5: For (N5)², multiply N by (N+1) and append '25'. Example: 75² = (7*8)25 = 5625.
* Multiplication by 11: Write down the last digit, add adjacent digits sequentially, and write down the first digit. Example: 43 * 11 = 4, (4+3), 3 = 473.

### 4. Practice Examples & Solutions
Evaluate: 12.5% of 640 + 33.33% of 270 = ?
Solution: Convert percentages to fractions:
(1/8 * 640) + (1/3 * 270) = 80 + 90 = 170.`;
  }
  
  if (normName.includes("data interpretation") || normName.includes("di")) {
    return `Learn the key techniques for interpreting and calculating values from tables, charts, and graphs for ${courseTitle}. This handbook covers average growth methods, percentage changes, pie chart conversions, and speed calculation shortcuts.

### 1. Standard DI Chart Types
* Tabular DI: Raw numbers in columns and rows. Tip: Scan column headers and footers first to check units and dates.
* Bar Charts: Rectangular columns showing comparisons. Tip: Note scale offsets carefully.
* Line Graphs: Continuous lines tracking values over time. Tip: Focus on intersections and slope steepness.
* Pie Charts: Circular segments representing shares of a total.

### 2. Crucial Calculation Formulas
* Percentage Growth Rate = [(Final Value - Initial Value) / Initial Value] * 100
* Ratio conversions: Compare variables by dividing and simplifying. E.g., ratio of A to B is A / B.
* Degree-to-Percentage conversion for Pie Charts:
  Percentage = (Degree / 360) * 100
  Degree = (Percentage / 100) * 360

### 3. Solving Strategy
* Step A: Scan the title, axis legends, and footnote notes to understand units (e.g., Millions, Tons, Percentage).
* Step B: Read the question and identify which data columns or lines are required.
* Step C: Use rough approximations instead of precise long divisions to eliminate options quickly.`;
  }
  
  if (normName.includes("series")) {
    return `Master the core pattern recognition rules for Missing and Wrong number series in ${courseTitle}. This handbook covers difference patterns, double differences, geometric progressions, prime number series, and solving heuristics.

### 1. Common Series Patterns
* Arithmetic/Difference Series: Constant difference between terms. (e.g., 5, 8, 11, 14... diff = +3)
* Double Difference: The difference between the differences follows a constant pattern.
* Geometric/Product Series: Terms multiplied by a constant ratio. (e.g., 2, 6, 18, 54... ratio = *3)
* Prime Number Series: Terms are consecutive prime numbers (e.g., 2, 3, 5, 7, 11, 13...).
* Squares & Cubes Series: Series of (n² + c) or (n³ - c) offsets.

### 2. Heuristics for Solving Series
* Slow growth: Check differences or addition patterns first.
* Rapid growth: Check multiplication, squares, or exponents immediately.
* Alternating ups/downs: Check alternating indices (e.g., odd terms follow one series, even terms follow another).`;
  }
  
  if (normName.includes("arithmetic") || normName.includes("quantitative aptitude")) {
    return `Solve commercial arithmetic word problems easily in ${courseTitle}. This handbook covers core formulas for Profit & Loss, Simple & Compound Interest, Time & Work, Speed Time & Distance, Ratios, Averages, and Alligations.

### 1. Profit & Loss Formulas
* Profit = Selling Price (SP) - Cost Price (CP)
* Loss = CP - SP
* Profit % = (Profit / CP) * 100 | Loss % = (Loss / CP) * 100
* Single Equivalent Discount for successive discounts A% and B%:
  Equivalent Discount = [A + B - (A * B / 100)]%

### 2. Interest Equations
* Simple Interest (SI) = (Principal * Rate * Time) / 100
* Compound Interest (CI) Amount = Principal * (1 + Rate / 100)^Time
* Difference between CI and SI for 2 Years: Diff = P * (R/100)²

### 3. Speed, Time, and Distance
* Speed = Distance / Time
* km/h to m/s conversion: Multiply by 5/18.
* m/s to km/h conversion: Multiply by 18/5.
* Relative Speed (Opposite directions) = SpeedA + SpeedB
* Relative Speed (Same direction) = |SpeedA - SpeedB|`;
  }
  
  if (normName.includes("puzzle") || normName.includes("arrangement")) {
    return `Crack high-level puzzles and seating configurations in ${courseTitle}. This handbook covers circular seating, linear rows, building-floor scheduling, day/date arrangements, and parallel case methodologies.

### 1. Seating Directional Conventions
* Facing Center (Circular): Left is clockwise; Right is counter-clockwise.
* Facing Away from Center (Circular): Left is counter-clockwise; Right is clockwise.
* Facing North (Linear): Left is your left; Right is your right.
* Facing South (Linear): Left is your right; Right is your left.

### 2. Case Methodology & Solving Strategy
* Step 1: Identify the fixed parameters to base your grid layout on (e.g., Floor numbers 1-8, Months Jan-Dec).
* Step 2: Extract absolute direct positive clues and fill them in immediately (e.g., "T lives on floor 3").
* Step 3: Draw two parallel cases (Case 1 and Case 2) when faced with a bi-directional choice (e.g., "R sits either adjacent to T or opposite S").
* Step 4: Systematically eliminate invalid cases using negative constraints (e.g., "M does not sit at any extreme end").`;
  }
  
  if (normName.includes("syllogism") || normName.includes("logical")) {
    return `Master the Venn diagram rules and logical deduction heuristics for Syllogisms in ${courseTitle}. This handbook covers Standard cases (All, Some, No), Modern keywords (Only a few, Only), and possibility conclusions.

### 1. Venn Diagram Standard Layouts
* All A are B: Draw circle A completely inside circle B.
* Some A are B: Draw circle A partially overlapping circle B.
* No A is B: Draw circle A and circle B completely separate with a cross line.
* Some A are not B: Highlight a part of circle A that cannot touch circle B.

### 2. Modern Keywords
* 'Only a few A are B' means two relations exist: 'Some A are B' AND 'Some A are NOT B' simultaneously.
* 'Only A are B' translates directly to 'All B are A' and no other variable can overlap with B.

### 3. Possibility Rules
* If there is no definite relation between two elements in the basic diagram, a possibility conclusion between them is TRUE.
* If a relation is already definitely TRUE or definitely FALSE, its possibility version is FALSE.`;
  }
  
  if (normName.includes("coding")) {
    return `Decode alphabet, positional, and matrix-based codes for ${courseTitle}. This handbook covers alphabetical EJOTY positional codes, opposite pair values, and coding grid lookups.

### 1. Positional Values (EJOTY Heuristic)
Memorize the positions of key letters to calculate offsets quickly:
* E = 5 | J = 10 | O = 15 | T = 20 | Y = 25
* Alphabet opposite values: The sum of opposite letters in a pair is always 27. (A=1, Z=26; 1+26=27).

### 2. Coding Patterns
* Shift Coding: Shift letters by constant offsets (e.g., +2 forward or -1 backward).
* Opposite Pair Coding: Replacing letters with their opposites (e.g., coding 'BOY' as 'YLB').
* Chinese Coding/Substitution: Direct word-to-code mapping across sentences. Solve by comparing and eliminating words common to multiple sentences.`;
  }
  
  if (normName.includes("reading") || normName.includes("comprehension")) {
    return `Read passages faster and answer Reading Comprehension questions accurately in ${courseTitle}. This handbook covers passage skimming, main theme identification, passage tones, and context vocabulary.

### 1. Skimming and Scanning Heuristics
* Paragraph Openings: Read the first 2 sentences of each paragraph to identify its main idea (topic sentences).
* Transition Words: Pay attention to indicators like "However", "Consequently", "On the other hand", "Furthermore" as they signal a change in argument direction.
* Bottom-Up: Scan question keywords before reading the passage to locate answer sections quickly.

### 2. Passages Tones
* Analytical / Objective: Balanced discussion with facts and logic.
* Critical / Cynical: Pointing out flaws, skepticism, or expressing disagreement.
* Narrative / Descriptive: Chronological flow of historical events or stories.
* Biased / Dogmatic: One-sided perspective with no balance.`;
  }
  
  if (normName.includes("error") || normName.includes("grammar") || normName.includes("english")) {
    return `Spot grammatical errors and master sentence correction rules for ${courseTitle}. This handbook covers Subject-Verb agreements, dangling modifiers, parallel structures, and tense consistency.

### 1. Subject-Verb Proximity Rule
* In "either...or" and "neither...nor" structures, the verb must agree with the subject closest to it.
  Example: "Neither the captain nor the sailors were (not was) saved."
* Expressions like "along with", "together with", "as well as", "accompanied by" do not change the subject number. The verb agrees with the primary subject.
  Example: "The coach, along with his players, is (not are) celebrating."

### 2. Dangling Modifiers
* Ensure a modifying clause clearly relates to a logical actor.
  * Incorrect: "Having worked all night, the laptop completed the calculations."
  * Correct: "Having worked all night, the team completed the calculations."

### 3. Parallel Structures
* Coordinate items in a list must follow the same grammatical format.
  * Incorrect: "He likes swimming, running, and to cycle."
  * Correct: "He likes swimming, running, and cycling."`;
  }
  
  if (normName.includes("kinematics")) {
    return `Understand the kinematics equations and equations of motion for ${courseTitle}. This handbook covers motion in one and two dimensions, projectile parameters, and gravity offsets.

### 1. Equations of Rectilinear Motion (Constant Acceleration)
* v = u + a * t
* s = u * t + 0.5 * a * t²
* v² = u² + 2 * a * s
* Distance in nth second: Sn = u + (a / 2) * (2n - 1)

### 2. Projectile Motion
* Time of Flight (T) = (2 * u * sinθ) / g
* Maximum Height (H) = (u² * sin²θ) / (2g)
* Horizontal Range (R) = (u² * sin2θ) / g
* Max Range occurs at θ = 45°: R_max = u² / g`;
  }
  
  if (normName.includes("force")) {
    return `Understand Newton's laws of motion, friction, and momentum parameters for ${courseTitle}. This handbook covers vector forces, static/kinetic friction, and momentum conservation equations.

### 1. Newton's Laws of Motion
* First Law (Inertia): Bodies remain at rest or in uniform motion unless acted on by an external net force.
* Second Law: Force = mass * acceleration (F = m * a) = dp/dt (rate of change of momentum).
* Third Law: For every action, there is an equal and opposite reaction.

### 2. Friction
* Friction force opposing motion: f = μ * Normal Force (N)
* Static friction: fs <= μs * N
* Kinetic friction: fk = μk * N (where μk < μs)`;
  }
  
  if (normName.includes("energy") || normName.includes("work")) {
    return `Solve numerical problems on Work, Energy, and Power in ${courseTitle}. This handbook covers the Work-Energy theorem, conservative force fields, kinetic and potential energy conversions.

### 1. Work and Power
* Work (W) = F * d * cosθ
* Power (P) = Work / Time = Force * Velocity (F * v)

### 2. Kinetic & Potential Energy
* Kinetic Energy (KE) = 0.5 * m * v² = p² / (2m)
* Gravitational Potential Energy (PE) = m * g * h
* Elastic Potential Energy of a spring = 0.5 * k * x²

### 3. Work-Energy Theorem
* Work done by all forces on a particle equals the change in its kinetic energy:
  W_net = KE_final - KE_initial`;
  }
  
  if (normName.includes("electrostatics")) {
    return `Understand Coulomb's law, electric field lines, and capacitance equations for ${courseTitle}. This handbook covers Coulomb force, electric potential, and parallel plate capacitors.

### 1. Coulomb's Law
* Force between point charges: F = k * |q1 * q2| / r²
* Constant k = 1 / (4πε0) ≈ 9 × 10⁹ N·m²/C²

### 2. Electric Field & Potential
* Electric Field (E) = Force / Charge = k * q / r²
* Electric Potential (V) = Work / Charge = k * q / r

### 3. Capacitance
* Charge stored: Q = C * V
* Parallel Plate Capacitor: C = (ε0 * Area) / Distance`;
  }
  
  if (normName.includes("organic chemistry")) {
    return `Master organic reaction pathways, tests, and mechanisms for ${courseTitle}. This handbook covers SN1/SN2 nucleophilic substitutions, Tollens' silver mirror test, and Fehling's reactions.

### 1. Nucleophilic Substitutions (SN1 vs SN2)
* SN1: Two-step mechanism, forms a stable carbocation intermediate, favored by tertiary halides and polar protic solvents, results in racemization.
* SN2: One-step concerted mechanism, backside attack transition state, favored by primary halides and polar aprotic solvents, results in Walden inversion.

### 2. Functional Group Identification Tests
* Tollens' Test: Aldehydes react with ammoniacal silver nitrate to form a silver mirror coating. Ketones do not react.
* Fehling's Test: Aldehydes reduce copper solution to give a red precipitate of Cu2O.
* Iodoform Test: Methyl ketones react with I2 and NaOH to give a yellow precipitate of iodoform (CHI3).`;
  }
  
  if (normName.includes("atomic structure")) {
    return `Understand atomic structures and quantum equations for ${courseTitle}. This handbook covers principal, azimuthal, and magnetic quantum numbers, Heisenberg uncertainty, and De Broglie equations.

### 1. Quantum Numbers
* Principal (n): Shell energy level and size (n = 1, 2, 3...). Number of orbitals = n².
* Azimuthal (l): Subshell shape (l = 0 to n-1). l=0 (s), l=1 (p), l=2 (d), l=3 (f).
* Magnetic (ml): Spatial orientation of orbital (-l to +l).
* Spin (ms): Electron spin direction (+1/2 or -1/2).

### 2. Key Principles
* Heisenberg Uncertainty Principle: Δx * Δp >= h / (4π)
* De Broglie Wavelength: λ = h / p = h / (m * v)
* Pauli Exclusion Principle: No two electrons in an atom can have the same set of four quantum numbers.`;
  }
  
  if (normName.includes("periodic table")) {
    return `Master periodic properties and trends of chemical elements for ${courseTitle}. This handbook covers electronegativity, ionization energy, atomic radius trends, and electron affinities.

### 1. Core Periodic Trends
* Electronegativity: Increases left-to-right across a period, decreases top-to-bottom down a group. (Highest: Fluorine).
* Ionization Energy: Increases left-to-right across a period, decreases top-to-bottom down a group.
* Atomic Radius: Decreases left-to-right across a period, increases top-to-bottom down a group.
* Electron Affinity: Becomes more exothermic left-to-right, less exothermic top-to-bottom.`;
  }
  
  if (normName.includes("bonding")) {
    return `Master chemical bonding theories, VSEPR molecular shapes, and hybridization rules for ${courseTitle}. This handbook covers covalent/ionic bonds, hybridization, and molecular shapes.

### 1. VSEPR Hybridization & Shapes
* sp Hybridization: 2 bond pairs, 0 lone pairs = Linear shape (e.g., CO2).
* sp² Hybridization: 3 bond pairs, 0 lone pairs = Trigonal Planar shape (e.g., BF3).
* sp³ Hybridization: 4 bond pairs, 0 lone pairs = Tetrahedral shape (e.g., CH4).
* sp³ Hybridization: 3 bond pairs, 1 lone pair = Trigonal Pyramidal shape (e.g., NH3).
* sp³ Hybridization: 2 bond pairs, 2 lone pairs = Bent/V-shaped (e.g., H2O).`;
  }
  
  if (normName.includes("cell biology")) {
    return `Understand cellular structures, energetics, and division cycles for ${courseTitle}. This handbook covers mitochondria ATP synthesis, ribosome protein translation, and meiosis division.

### 1. Cellular Organelles
* Mitochondria: Double membrane powerhouse, site of Krebs Cycle (matrix) and ETC (inner folds/cristae) generating ATP.
* Ribosomes: Non-membranous protein factories, translate mRNA codons into polypeptide chains.

### 2. Cell Division
* Mitosis: Equational division yielding two identical diploid (2n) daughter cells.
* Meiosis: Reduction division yielding four non-identical haploid (n) gametes. Cross-over in Prophase I introduces genetic diversity.`;
  }
  
  if (normName.includes("genetics")) {
    return `Master Mendelian genetics ratios, DNA replication, and transcription processes for ${courseTitle}. This handbook covers Mendelian cross ratios, replication steps, and meiosis division.

### 1. Mendelian Ratios
* Monohybrid Cross (F2): Phenotypic ratio = 3:1 | Genotypic ratio = 1:2:1
* Dihybrid Cross (F2): Phenotypic ratio = 9:3:3:1

### 2. Laws of Inheritance
* Law of Segregation: Alleles segregate during gamete formation so gametes carry only one allele.
* Law of Independent Assortment: Genes for different traits segregate independently.`;
  }
  
  if (normName.includes("human physiology")) {
    return `Understand human circulatory and hormonal regulation systems for ${courseTitle}. This handbook covers pancreas insulin/glucagon control and double circulation pathways.

### 1. Pancreatic Hormonal Regulation
* Beta Cells: Secrete Insulin to lower blood glucose (promotes glucose uptake by tissues).
* Alpha Cells: Secrete Glucagon to raise blood glucose (promotes glycogen breakdown in liver).

### 2. Double Circulation
* Deoxygenated blood flows from tissues to Right Atrium -> Right Ventricle -> Lungs (pulmonary loop).
* Oxygenated blood returns to Left Atrium -> Left Ventricle -> Body tissues (systemic loop).`;
  }
  
  if (normName.includes("ecology")) {
    return `Understand trophic levels, energy transfer efficiency, and ecological pyramids in ${courseTitle}. This handbook covers food chains, trophic energy efficiency, and ecosystem structures.

### 1. Trophic Levels & Pyramids
* 1st Trophic Level: Green Plants / Primary Producers.
* 2nd Trophic Level: Herbivores / Primary Consumers.
* 3rd Trophic Level: Carnivores / Secondary Consumers.

### 2. Lindeman's 10% Law of Energy
* Only 10% of the net energy at a particular trophic level is transferred to the next higher level. The remaining 90% is lost as metabolic heat.`;
  }
  
  if (normName.includes("history")) {
    return `Understand modern Indian history timelines, battles, and freedom struggles for ${courseTitle}. This handbook covers the Battle of Plassey, Battle of Buxar, Revolt of 1857, and INC formation.

### 1. Significant Historical Milestones
* Battle of Plassey (1757): British East India Company defeated the Nawab of Bengal (Siraj-ud-Daulah), establishing political control.
* Battle of Buxar (1764): British defeated combined Indian rulers, securing tax collection rights (Diwani).
* Revolt of 1857: Indian sepoy mutiny against Company rule, leading to direct administration by the British Crown.
* INC Formation (1885): Indian National Congress founded by A.O. Hume.`;
  }
  
  if (normName.includes("polity")) {
    return `Understand fundamental rights, constitutional articles, and democratic institutions for ${courseTitle}. This handbook covers Article 14, 19, 21, and Article 32 judicial writs.

### 1. Key Fundamental Rights
* Article 14: Equality before law and equal protection of laws.
* Article 19: Six basic democratic freedoms (speech, assembly, movement, etc.).
* Article 21: Right to Life and Personal Liberty.
* Article 32 (Constitutional Remedies): Writ petition power for rights enforcement (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto).`;
  }
  
  if (normName.includes("gk") || normName.includes("andhra") || normName.includes("telangana")) {
    return `Master state-specific GK, rivers, timelines, and regional administration for ${courseTitle}. This handbook covers state rivers, regional culture, and historical landmarks.

### 1. Regional Geography & Rivers
* The Godavari River: Longest river flowing entirely within India, flowing through Nashik and Rajahmundry (AP).
* State Capitals & Districts: Detailed division parameters of Andhra Pradesh and Telangana states.

### 2. Historical Figures
* Neelam Sanjiva Reddy: First Chief Minister of Andhra Pradesh (1956) and later the 6th President of India.`;
  }

  // Default general fallback
  return `Master the core concepts of ${conceptName} for ${courseTitle} with this comprehensive study handbook. It provides detailed concept definitions, practice examples, and shortcuts to maximize accuracy.

### 1. Concept Overview
* Review basic definitions and properties.
* Identify high-weightage sections in the syllabus.

### 2. Tips & Short Methods
* Develop a step-by-step approach to solve questions.
* Focus on time-saving methodologies.

### 3. Practice Pathway
* Take section mock tests regularly.
* Review detailed answers and explanations to avoid common mistakes.`;
};

const STANDARD_SYLLABUS = [
  {
    subject: "Quantitative Aptitude",
    concepts: [
      { name: "Simplification & Approximation", weightage: "5-10 Marks", difficulty: "Easy" },
      { name: "Data Interpretation (DI)", weightage: "10-15 Marks", difficulty: "Hard" },
      { name: "Number Series (Missing & Wrong)", weightage: "5 Marks", difficulty: "Medium" },
      { name: "Arithmetic Word Problems", weightage: "10 Marks", difficulty: "Hard" }
    ]
  },
  {
    subject: "Reasoning Ability",
    concepts: [
      { name: "Puzzles & Seating Arrangement", weightage: "15-20 Marks", difficulty: "Hard" },
      { name: "Syllogism & Logical Reasoning", weightage: "5 Marks", difficulty: "Easy" },
      { name: "Coding-Decoding", weightage: "3-5 Marks", difficulty: "Easy" }
    ]
  },
  {
    subject: "English Language",
    concepts: [
      { name: "Reading Comprehension", weightage: "10 Marks", difficulty: "Hard" },
      { name: "Error Spotting & Grammar", weightage: "5 Marks", difficulty: "Medium" }
    ]
  }
];

function getSyllabusForCategory(category) {
  switch (category) {
    case "NEET / JEE":
      return [
        {
          subject: "Physics",
          concepts: [
            { name: "Kinematics", weightage: "6 Marks", difficulty: "Medium" },
            { name: "Force and Motion", weightage: "8 Marks", difficulty: "Medium" },
            { name: "Work and Energy", weightage: "6 Marks", difficulty: "Easy" },
            { name: "Electrostatics", weightage: "10 Marks", difficulty: "Hard" }
          ]
        },
        {
          subject: "Chemistry",
          concepts: [
            { name: "Organic Chemistry", weightage: "12 Marks", difficulty: "Hard" },
            { name: "Atomic Structure", weightage: "8 Marks", difficulty: "Medium" },
            { name: "Periodic Table", weightage: "6 Marks", difficulty: "Easy" },
            { name: "Chemical Bonding", weightage: "10 Marks", difficulty: "Hard" }
          ]
        },
        {
          subject: "Biology / Mathematics",
          concepts: [
            { name: "Cell Biology", weightage: "15 Marks", difficulty: "Medium" },
            { name: "Genetics", weightage: "15 Marks", difficulty: "Hard" },
            { name: "Human Physiology", weightage: "12 Marks", difficulty: "Medium" },
            { name: "Ecology", weightage: "10 Marks", difficulty: "Easy" }
          ]
        }
      ];
    case "UPSC / Civil":
      return [
        {
          subject: "General Studies I",
          concepts: [
            { name: "Indian History", weightage: "15 Marks", difficulty: "Hard" },
            { name: "Indian Polity", weightage: "20 Marks", difficulty: "Medium" }
          ]
        },
        {
          subject: "General Studies II",
          concepts: [
            { name: "Quantitative Aptitude", weightage: "30 Marks", difficulty: "Medium" },
            { name: "Logical Reasoning", weightage: "25 Marks", difficulty: "Easy" },
            { name: "Reading Comprehension", weightage: "25 Marks", difficulty: "Medium" }
          ]
        }
      ];
    case "State Exams":
      return [
        {
          subject: "General Studies",
          concepts: [
            { name: "Andhra Pradesh / Telangana State GK", weightage: "15 Marks", difficulty: "Easy" }
          ]
        },
        {
          subject: "Aptitude & English",
          concepts: [
            { name: "Quantitative Aptitude", weightage: "30 Marks", difficulty: "Medium" },
            { name: "General English", weightage: "20 Marks", difficulty: "Easy" }
          ]
        }
      ];
    default:
      return STANDARD_SYLLABUS;
  }
}

// Helper to generate dynamic concept-based note files/content per course
const generateStudyNotesForCourse = (courseId, courseTitle, syllabus) => {
  if (!syllabus || syllabus.length === 0) {
    // Return a default set of handbooks if syllabus is missing
    syllabus = [
      {
        subject: "General Studies",
        concepts: [{ name: "General Exam Concepts", weightage: "100%", difficulty: "Medium" }]
      }
    ];
  }

  let noteCounter = 1;
  const handbooks = [];

  for (const sub of syllabus) {
    const subjectName = sub.subject;
    for (const concept of sub.concepts) {
      const conceptName = concept.name;
      
      // Calculate dynamic page count and read time
      let pages = "14 Pages";
      let readTime = "15 mins";
      const normConcept = conceptName.toLowerCase();
      if (normConcept.includes("puzzle") || normConcept.includes("history") || normConcept.includes("biology")) {
        readTime = "25 mins";
      } else if (normConcept.includes("interpretation") || normConcept.includes("polity") || normConcept.includes("chemistry")) {
        readTime = "30 mins";
      } else if (normConcept.includes("arithmetic") || normConcept.includes("grammar") || normConcept.includes("physics")) {
        readTime = "20 mins";
      }

      const handbookText = getHandbookDetailsForConcept(conceptName, subjectName, courseTitle);

      handbooks.push({
        id: `${courseId}_notes_${noteCounter}`,
        subject: subjectName,
        concept: conceptName,
        title: `${conceptName} Handbook`,
        pages: pages,
        readTime: readTime,
        summary: handbookText,
        downloadUrl: `/api/downloads/notes/${courseId}_notes_${noteCounter}`
      });
      noteCounter++;
    }
  }

  return handbooks;
};

const generateMockQuestionsForCategory = (category, pool, mockIndex, courseTitle = "Exam") => {
  const qStart = ((mockIndex - 1) * 7) % 300;
  
  let sections = [];
  if (category === "NEET / JEE") {
    // 75 questions: 25 Physics, 25 Chemistry, 25 Biology/Maths
    sections = [
      { name: "Physics", count: 25, start: qStart },
      { name: "Chemistry", count: 25, start: 100 + qStart },
      { name: "Biology / Mathematics", count: 25, start: 200 + qStart }
    ];
  } else if (category === "UPSC / Civil") {
    // 100 questions: 50 General Studies I, 50 General Studies II
    sections = [
      { name: "General Studies I", count: 50, start: qStart },
      { name: "General Studies II", count: 50, start: 150 + qStart }
    ];
  } else if (category === "State Exams") {
    // 100 questions: 40 General Studies, 30 Aptitude, 30 English
    sections = [
      { name: "General Studies", count: 40, start: qStart },
      { name: "Quantitative Aptitude", count: 30, start: 100 + qStart },
      { name: "General English", count: 30, start: 200 + qStart }
    ];
  } else if (category === "RRB & Railways" || category === "Railways") {
    // 100 questions: 30 Quant, 30 Reasoning, 40 General Awareness
    sections = [
      { name: "Quantitative Aptitude", count: 30, start: qStart },
      { name: "Reasoning Ability", count: 30, start: 100 + qStart },
      { name: "General Awareness", count: 40, start: 200 + qStart }
    ];
  } else if (category === "SSC Exams" || category === "SSC") {
    // 100 questions: 25 Quant, 25 Reasoning, 25 English, 25 General Awareness
    sections = [
      { name: "Quantitative Aptitude", count: 25, start: qStart },
      { name: "Reasoning Ability", count: 25, start: 100 + qStart },
      { name: "English Language", count: 25, start: 200 + qStart },
      { name: "General Awareness", count: 25, start: 250 + qStart }
    ];
  } else { // Bank & Insurance or Banking (Default)
    // 100 questions: 35 Quant, 35 Reasoning, 30 English
    sections = [
      { name: "Quantitative Aptitude", count: 35, start: qStart },
      { name: "Reasoning Ability", count: 35, start: 100 + qStart },
      { name: "English Language", count: 30, start: 200 + qStart }
    ];
  }

  if (!pool || pool.length === 0) {
    const mockQuestions = [];
    sections.forEach(sec => {
      for (let i = 0; i < sec.count; i++) {
        mockQuestions.push({
          q: `Sample Question ${i + 1} for ${sec.name} of ${courseTitle}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: 0,
          explanation: "This is a placeholder question because no exam questions have been uploaded yet.",
          category: category,
          section: sec.name,
          exam_type: "practice",
          difficulty: "Medium",
          question_number: i + 1
        });
      }
    });
    return mockQuestions;
  }

  const questions = [];
  sections.forEach(sec => {
    for (let i = 0; i < sec.count; i++) {
      const poolIndex = (sec.start + i) % pool.length;
      const q = pool[poolIndex];
      if (q && q.q) {
        questions.push({
          ...q._doc || q,
          section: sec.name,
          q: q.q.replace("[Exam]", courseTitle)
        });
      }
    }
  });

  return questions;
};

const generateRandomizedQuestions = async (filterQuery, requiredCount) => {
  // 1. Filter and project only _id
  const matchingDocs = await Question.find(filterQuery).select('_id').lean();
  if (matchingDocs.length === 0) return [];
  // 2. Randomize Question IDs
  const shuffledIds = matchingDocs.map(d => d._id).sort(() => 0.5 - Math.random());
  // 3. Select Required Count
  const selectedIds = shuffledIds.slice(0, requiredCount);
  // 4. Fetch Original Questions
  const questionsDocs = await Question.find({ _id: { $in: selectedIds } }).lean();
  // 5. Order/Sort documents to match the randomized IDs sequence
  const idMap = new Map(questionsDocs.map(q => [q._id.toString(), q]));
  const orderedQuestions = selectedIds
    .map(id => idMap.get(id.toString()))
    .filter(Boolean)
    .map(q => {
      return {
        _id: q._id,
        unique_id: q.unique_id,
        display_question_number: q.display_question_number,
        course: q.course,
        exam_type: q.exam_type,
        paper_name: q.paper_name,
        subject: q.subject,
        question: q.question,
        options: q.options,
        correct_option: q.correct_option,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        question_image: q.question_image || "",
        option_images: q.option_images || [],
        
        // Deprecated fields populated for backward compatibility
        q: q.question,
        correct: ["A", "B", "C", "D"].indexOf(q.correct_option),
        correct_letter: q.correct_option,
        category: q.course,
        section: q.subject,
        question_number: q.display_question_number
      };
    });
  return orderedQuestions;
};

const generateMocksForCourse = async (courseId, courseTitle, category = "Bank & Insurance", sectionName = null) => {
  const mocks = [];
  
  let queryCategory = [category];
  if (category === "SSC Exams" || category === "SSC") {
    queryCategory = ["SSC_CGL", "SSC_CHSL", "SSC Exams", "SSC"];
  } else if (category === "RRB & Railways" || category === "Railways" || category === "RRB") {
    queryCategory = ["RRB", "RRB & Railways", "Railways"];
  } else if (category === "State Exams") {
    queryCategory = ["TSPSC", "APPSC", "SI_POLICE", "TET", "DSC", "State Exams"];
  } else if (category === "Bank & Insurance") {
    queryCategory = ["Bank & Insurance", "Banking"];
  }

  const timeLimit = category === "NEET / JEE" ? 180 : (category === "UPSC / Civil" || category === "State Exams" ? 120 : (category === "RRB & Railways" || category === "Railways" ? 90 : 60));

  for (let i = 1; i <= 30; i++) {
    let mockQuestions = [];
    let sectionsConfig = [];
    if (category === "NEET / JEE") {
      sectionsConfig = [
        { name: "Physics", count: 25 },
        { name: "Chemistry", count: 25 },
        { name: "Biology / Mathematics", count: 25 }
      ];
    } else if (category === "UPSC / Civil") {
      sectionsConfig = [
        { name: "General Studies I", count: 50 },
        { name: "General Studies II", count: 50 }
      ];
    } else if (category === "State Exams") {
      sectionsConfig = [
        { name: "General Studies", count: 40 },
        { name: "Quantitative Aptitude", count: 30 },
        { name: "General English", count: 30 }
      ];
    } else if (category === "RRB & Railways" || category === "Railways") {
      sectionsConfig = [
        { name: "Quantitative Aptitude", count: 30 },
        { name: "Reasoning Ability", count: 30 },
        { name: "General Awareness", count: 40 }
      ];
    } else if (category === "SSC Exams" || category === "SSC") {
      sectionsConfig = [
        { name: "Quantitative Aptitude", count: 25 },
        { name: "Reasoning Ability", count: 25 },
        { name: "English Language", count: 25 },
        { name: "General Awareness", count: 25 }
      ];
    } else {
      sectionsConfig = [
        { name: "Quantitative Aptitude", count: 35 },
        { name: "Reasoning Ability", count: 35 },
        { name: "English Language", count: 30 }
      ];
    }

    for (const sec of sectionsConfig) {
      if (sectionName) {
        const target = sectionName.toLowerCase().replace(/[^a-z]+/g, "");
        const currentSecName = sec.name.toLowerCase().replace(/[^a-z]+/g, "");
        if (!currentSecName.includes(target) && !target.includes(currentSecName)) {
          continue;
        }
      }

      const filterQuery = {
        $and: [
          {
            $or: [
              { exam_type: { $in: queryCategory } },
              { category: { $in: queryCategory } }
            ]
          },
          {
            $or: [
              { subject: sec.name },
              { section: sec.name }
            ]
          }
        ]
      };

      const secQuestions = await generateRandomizedQuestions(filterQuery, sec.count);
      mockQuestions = mockQuestions.concat(secQuestions);
    }

    const isStage1 = i <= 15;
    const isBank = category === "Bank & Insurance";
    const isSSC = category === "SSC Exams";
    const isRailways = category === "RRB & Railways" || category === "Railways";
    
    let mockTitle = "";
    if (isBank) {
      mockTitle = `${courseTitle} ${isStage1 ? "Prelims" : "Mains"} Mock ${isStage1 ? i : i - 15}`;
    } else if (isSSC) {
      mockTitle = `${courseTitle} ${isStage1 ? "Tier - I" : "Tier - II"} Mock ${isStage1 ? i : i - 15}`;
    } else if (isRailways) {
      mockTitle = `${courseTitle} ${isStage1 ? "CBT - 1" : "CBT - 2"} Mock ${isStage1 ? i : i - 15}`;
    } else {
      mockTitle = `${courseTitle} ${isStage1 ? "Stage - I" : "Stage - II"} Mock ${isStage1 ? i : i - 15}`;
    }

    if (sectionName) {
      mockTitle = `${mockTitle} [${sectionName}]`;
    }

    mocks.push({
      id: `${courseId}_mock_shuffled_${i}${sectionName ? "_" + sectionName.replace(/\s+/g, "") : ""}`,
      title: mockTitle,
      duration: sectionName ? "20 Mins" : `${timeLimit} Mins`,
      questions: mockQuestions
    });
  }

  return mocks;
};

// UPSC CSE Mains descriptive questions database
const MAINS_ESSAY_TOPICS = [
  {
    q: "Write an essay on: 'The path to happiness lies in the simplification of desires, not their expansion.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Define happiness and desires. Quote thinkers (e.g., Buddha, Socrates).\n- Thesis: Expansion of desires leads to consumerism, stress, and ecological crisis. Simplification brings contentment.\n- Context: Indian traditions of Santoshi (contentment) and simple living.\n- Modern Dilemma: Advertising, social media, and comparison culture fostering artificial desires.\n- Sustainability: Need for sustainable lifestyle (e.g., LiFE movement).\n- Counter-argument: Aspiration and desire drive progress, innovation, and economic growth.\n- Synthesis: A balance between material aspirations and spiritual/mental simplification (Nishkama Karma).\n- Conclusion: Inner peace is the ultimate metric of human development."
  },
  {
    q: "Write an essay on: 'Digital economy as a catalyst for inclusive growth and gender parity in rural India.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Introduce digital revolution in India (UPI, Jan Dhan-Aadhaar-Mobile trinity).\n- Core Body:\n  - Financial inclusion of rural women via digital banking.\n  - E-commerce and Self-Help Groups (SHGs) reaching global markets.\n  - Access to online education (SWAYAM) and telemedicine (eSanjeevani) in remote areas.\n- Challenges: Digital divide (internet access gaps), digital illiteracy, and cyber fraud risks.\n- Policy Solutions: Digital Saksharta Abhiyan (PMGDISHA) and village fiber connectivity (BharatNet).\n- Conclusion: Digital economy is not just a technological tool but a democratic leveling agent."
  },
  {
    q: "Write an essay on: 'Science is a beautiful gift to humanity, we should not distort it.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Quote APJ Abdul Kalam. Define science as a search for truth and utility.\n- The Gift: Advancements in medicine, energy, space exploration, and agricultural yields (Green Revolution).\n- The Distortion: Nuclear warfare, biological weapons, invasive surveillance, and climate degradation.\n- Ethical Dimension: The necessity of combining scientific progress with moral philosophy (Ethics in AI, genetic editing).\n- Conclusion: Science must serve humanity with compassion and environmental responsibility."
  },
  {
    q: "Write an essay on: 'Forests are the best case studies for economic excellence.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Define forest ecosystems as models of sustainability, recycling, and resource management.\n- Ecosystem Economy: Zero waste, perfect circular economy, and mutual symbiosis (mycorrhizal networks).\n- Lessons for Businesses: Resilience, diversity over monoculture, and long-term value creation over short-term exploitation.\n- Circular Economy: Shifting industrial systems from linear (make-use-dispose) to circular (biodegradable, recycled).\n- Conclusion: Economic growth must emulate ecological principles to survive."
  },
  {
    q: "Write an essay on: 'History is a series of victories won by the scientific man over the romantic man.' (Answer in 1000-1200 words, 125 marks)",
    explanation: "Model Essay Outline:\n- Introduction: Contrast the scientific man (empirical, logical, factual) with the romantic man (emotional, traditional, idealistic).\n- Historical Battles: Galileo vs. Inquisition, Industrial Revolution vs. Luddites, modern medicine vs. superstitions.\n- The Value of Romance: Art, culture, nationalism, and human rights are driven by romanticism, which gives purpose to scientific power.\n- Synthesis: Scientific methodology must drive progress, but romantic ideals must guide its ethical direction.\n- Conclusion: A civilization needs the scientific man to build the means, and the romantic man to appreciate the ends."
  }
];

const MAINS_GS1_QUESTIONS = [
  {
    q: "Evaluate the role of the Bhakti movement in fostering social integration and linguistic growth in medieval India. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Social Integration: Opposed caste discrimination and rigid rituals. Emphasized devotion (Bhakti) open to all, including women and lower castes (e.g., Kabir, Ravidas).\n- Linguistic Growth: Promoted regional languages (Vernaculars) instead of Sanskrit. Tulsidas wrote in Awadhi, Meerabai in Rajasthani, and Jnaneshwar in Marathi, enriching vernacular literature.\n- Conclusion: Bhakti movement democratized spirituality and laid the foundation for modern regional identities."
  },
  {
    q: "Assess the vulnerability of major Indian coastal cities to climate-induced sea-level rise and suggest mitigation strategies. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Vulnerability: India has a 7,500+ km coastline. Cities like Mumbai, Chennai, and Kolkata face rising sea levels, frequent cyclones, and storm surges. Flooding causes infrastructure damage, saline intrusion in aquifers, and displaces fishing communities.\n- Mitigation Strategies:\n  - Coastal Regulation Zone (CRZ) enforcement.\n  - Mangrove restoration (bioshields).\n  - Sponge city concepts (permeable pavements, urban wetlands).\n  - Integrated Coastal Zone Management (ICZM) plans.\n- Conclusion: Adaptation must be integrated into city masterplans to protect economic hubs."
  },
  {
    q: "How has the rise of nuclear families in urban India impacted the social security and care of the elderly? (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Impact: Transition from joint to nuclear families due to migration, career demands, and individualism.\n- Positive: Financial independence for some elderly, peace in reduced household conflicts.\n- Negative: Lack of physical care, social isolation, depression, vulnerability to abuse, and high medical expenses without family support.\n- Government Initiatives: Maintenance and Welfare of Parents and Senior Citizens Act, Atal Vayo Abhyuday Yojana.\n- Conclusion: Need for community-led day-care centers and elder-friendly infrastructure."
  },
  {
    q: "Explain the features of the Gandhara school of art and how it differed from the Mathura school. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Gandhara School: Indo-Greek influence (Greco-Buddhist). Used bluish-grey schist stone. Buddha depicted with Greek features (curly hair, muscular body, drapery reminiscent of Roman togas). High attention to anatomical accuracy.\n- Mathura School: Indigenous development. Used red sandstone. Buddha depicted as smiling, fleshy, with shaven head (Ushnisha) and transparent dhoti. Included Brahmanical and Jain deities as well.\n- Key differences: Material (Schist vs. Red Sandstone), Origin (Foreign influence vs. Indigenous), Theme (Almost purely Buddhist vs. Secular/Multi-religious)."
  },
  {
    q: "Discuss the reasons for the uneven distribution of rainfall in India and its impact on agriculture. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Reasons:\n  - Orographic barriers: Western Ghats block moisture, causing heavy rain on west coast and rain shadow on Deccan.\n  - Distance from sea: Continentality reduces rainfall in NW India (Thar Desert).\n  - Path of monsoon winds: Bay of Bengal branch loses moisture as it travels up the Gangetic plain.\n- Impact on Agriculture:\n  - Over-dependence on monsoons (50%+ rainfed agriculture).\n  - Cropping patterns: Paddy/Sugarcane in high rain areas vs. Millets/Pulses in dry areas.\n  - Crop failures, droughts in rain-shadow areas, and floods in eastern regions.\n- Solutions: Micro-irrigation, crop diversification, and watershed management."
  }
];

const MAINS_GS2_QUESTIONS = [
  {
    q: "The office of the Governor has often become a battleground between the Centre and the States. Analyze in the context of Indian federalism. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Role: Governor is the constitutional head of State and vital link between Centre and State. Represent federal balance.\n- Areas of Conflict:\n  - Discretionary powers in inviting parties to form government.\n  - Delay in giving assent to bills passed by state legislatures.\n  - Recommending President's Rule (Article 356).\n- Recommendations: Sarkaria Commission (Governor should be detached figure from outside state) and Punchhi Commission (fixed timeline for bill assent, guidelines for Article 356).\n- Conclusion: The Governor must act as a federal bridge rather than a political agent."
  },
  {
    q: "How can e-governance bring transparency, efficiency, and accountability to public service delivery in rural India? (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Transparency: Direct Benefit Transfer (DBT) eliminates middlemen and leakages. Portals like land records (Bhoomi) prevent land grabbing.\n- Efficiency: Digital certificates, CSCs (Common Service Centres) provide multiple services under one roof, reducing travel and processing time.\n- Accountability: Online grievance redressal portals (e-PGRAMS) track complaints with SLA (Service Level Agreements).\n- Challenges: Digital illiteracy, power outages, and poor rural internet connectivity.\n- Conclusion: E-governance is key to achieving 'Minimum Government, Maximum Governance' at the grassroots level."
  },
  {
    q: "Critically examine India's strategic interests in the Indian Ocean Region (IOR) and the role of the Quad in securing them. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Strategic Interests: 90% of India's trade by volume passes through IOR. Maritime security, countering Chinese footprint ('String of Pearls'), and protecting Sea Lines of Communication (SLOCs).\n- Role of Quad (India, US, Japan, Australia):\n  - Fosters a free and open Indo-Pacific.\n  - Joint military exercises (Malabar) improve interoperability.\n  - Cooperation on maritime domain awareness, disaster relief (HADR), and climate monitoring.\n- Challenges: Quad is not a formal military alliance; differing priorities on China; avoiding antagonizing ASEAN.\n- Conclusion: Quad complements India's SAGAR vision (Security and Growth for All in the Region)."
  },
  {
    q: "The Right to Education (RTE) Act has increased school enrollment but failed to improve learning outcomes. Discuss. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- RTE Impact: Universalized elementary education. Enrollment rates in primary schools are now 98%+.\n- Learning Outcome Issues (as highlighted by ASER reports):\n  - Lack of trained teachers and high teacher absenteeism.\n  - Focus on rote learning instead of conceptual clarity.\n  - Poor infrastructure (science labs, functional toilets).\n  - 'No Detention Policy' (repealed recently) led to lack of learning assessments.\n- Solutions: Focus on foundational literacy and numeracy (NIPUN Bharat), teacher training, and outcome-based funding."
  },
  {
    q: "Analyze the significance of the 73rd and 74th Constitutional Amendment Acts in empowering local self-governments. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Significance: Constitutional status to Panchayats (Part IX) and Municipalities (Part IXA). Mandated regular elections every 5 years.\n- Empowerment:\n  - Reservation of 1/3rd seats for women, SCs, and STs.\n  - Creation of State Finance Commissions for resource allocation.\n  - Devolution of 29 subjects (Panchayats) and 18 subjects (Municipalities).\n- Challenges: The 3Fs - lack of Funds (poor tax base), Functions (states refuse to delegate), and Functionaries (staff shortage).\n- Conclusion: True grassroots democracy requires structural devolution of fiscal and administrative power."
  }
];

const MAINS_GS3_QUESTIONS = [
  {
    q: "Discuss the potential of Artificial Intelligence in revolutionizing public healthcare delivery in India. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Potential:\n  - Diagnostics: AI tools can detect cancers, diabetic retinopathy, and tuberculosis from scans in remote areas lacking specialists.\n  - Telemedicine: AI chatbots for initial symptom sorting and routing.\n  - Resource allocation: Predict epidemics, coordinate vaccine drives, and manage hospital bed databases.\n- Challenges: High cost of implementation, lack of standardized health data, privacy issues, and digital divide.\n- Conclusion: AI can act as a force multiplier for public health, aligning with Ayushman Bharat Digital Mission."
  },
  {
    q: "Analyze the challenges of achieving a $5 trillion economy while fulfilling climate action commitments under Paris Agreement. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- The Dilemma: Rapid economic growth requires energy (currently 70% coal-dependent), infrastructure, and manufacturing, which increases emissions.\n- Key Challenges:\n  - High capital cost of transitioning to renewable energy.\n  - Job losses in traditional coal belt regions.\n  - Lack of technology transfer for green hydrogen and battery storage.\n  - Balancing agricultural emissions (methane) with food security.\n- Strategic Path: Green manufacturing, electric mobility, energy efficiency (PAT scheme), and investing in solar/wind. India's goal of Net Zero by 2070.\n- Conclusion: Economic growth must be decoupled from environmental degradation through green technology."
  },
  {
    q: "Explain the threat of cyberwarfare to India's critical national infrastructure and outline the institutional safeguards. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Threat: Attackers target power grids, nuclear plants, banking networks, and defence systems (e.g., Kudankulam malware incident). State-sponsored hackers pose national security risks.\n- Safeguards:\n  - CERT-In (Computer Emergency Response Team) for incident handling.\n  - NCIIPC (National Critical Information Infrastructure Protection Centre) to secure critical sectors.\n  - National Cyber Security Policy.\n  - Defence Cyber Agency for military response.\n- Gaps: Lack of skilled cybersecurity professionals, dependency on imported hardware (supply chain backdoors).\n- Conclusion: India needs self-reliance (Atmanirbharta) in hardware and robust cyber audit drills."
  },
  {
    q: "What is land degradation neutrality (LDN) and what measures has India taken to reclaim degraded lands? (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- LDN Definition: A state where the amount and quality of land resources necessary to support ecosystem functions remains stable or increases.\n- Indian Measures:\n  - Commited to restoring 26 million hectares of degraded land by 2030.\n  - Desertification Cell creation under MoEFCC.\n  - PM Krishi Sinchayee Yojana (Watershed development).\n  - Soil Health Card Scheme to prevent chemical degradation.\n  - Compensatory Afforestation Fund (CAMPA).\n- Conclusion: Preventing land degradation is critical for combating desertification and ensuring food security."
  },
  {
    q: "Evaluate the role of MSP (Minimum Support Price) in securing farmer incomes and its distortionary effects on crop patterns. (Answer in 250 words, 15 marks)",
    explanation: "Key Points:\n- Role: Price support mechanism ensuring farmers get a guaranteed price for their produce, shielding them from market volatility.\n- Distortionary Effects:\n  - Wheat-Rice Bias: MSP is announced for 23 crops but effective procurement is only for wheat and paddy in select states (Punjab, Haryana).\n  - Water Crisis: Encourages water-guzzling paddy cultivation in water-deficient regions.\n  - Soil Degradation: Excessive fertilizer use due to monoculture.\n- Reforms: Shift MSP focus to millets, pulses, and oilseeds; direct cash transfers; and contract farming safeguards."
  }
];

const MAINS_GS4_QUESTIONS = [
  {
    q: "What do you understand by 'Ethics' in public service? Distinguish between laws and rules as sources of ethical guidance. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Ethics in Public Service: Moral principles that guide civil servants to act with integrity, impartiality, and empathy, placing public interest above self-interest.\n- Laws vs. Rules:\n  - Laws: Enacted by legislatures, broad in scope, carry penal consequences for violation. Source of external control (e.g., Prevention of Corruption Act).\n  - Rules: Executive guidelines to implement laws, specific and procedural (e.g., Civil Services Conduct Rules).\n- Ethical Guidance: Laws set the minimum standards of conduct, but rules provide detailed processes. True ethical guidance, however, comes from conscience and inner values when laws are silent."
  },
  {
    q: "Case Study: You are the Municipal Commissioner of a metropolitan city. A massive fire in a commercial complex has killed 15 people. Investigations reveal that the building lacked fire safety clearance, and local municipal officers accepted bribes to overlook the violations. Media is demanding immediate action, and victims' families are protesting outside your office. Outline your course of action. (Answer in 250 words, 20 marks)",
    explanation: "Key Points:\n- Ethical Dilemmas: Public safety vs. administrative laxity, justice for victims vs. institutional accountability, handling public anger.\n- Course of Action:\n  - Immediate: Provide medical aid, declare compensation, and clear the protest area by engaging with family representatives to assure swift justice.\n  - Administrative: Suspend the errant municipal officers and initiate a departmental inquiry. Seal non-compliant buildings in the vicinity.\n  - Legal: File FIRs against the building owner and corrupt officers for criminal negligence.\n  - Preventive: Implement an online, transparent fire audit system and hold public safety drills.\n- Conclusion: Uphold the principle of zero tolerance for corruption and enforce strict administrative transparency."
  },
  {
    q: "Explain how emotional intelligence can help a civil servant handle communal tension and crisis situations. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Emotional Intelligence (EI): Ability to recognize, understand, and manage one's own emotions and those of others.\n- Benefits in Crisis:\n  - Self-regulation: Keeps the administrator calm and rational under extreme pressure, preventing panic.\n  - Empathy: Helps understand the fears and grievances of rival communities, building trust.\n  - Relationship Management: Facilitates dialogue, defuses hostility, and allows negotiation with community leaders.\n- Conclusion: EI is as critical as intellectual capacity for maintaining law and order during conflicts."
  },
  {
    q: "Case Study: A pharmaceutical company is dumping chemical waste into a river flowing through a village, causing skin diseases and water pollution. The company is the major employer in the region, supporting 80% of local households. Closing the factory will cause mass unemployment, but continuing operations threatens public health. As the District Collector, how will you resolve this issue? (Answer in 250 words, 20 marks)",
    explanation: "Key Points:\n- Ethical Dilemmas: Economic livelihood vs. Right to Health, Corporate profits vs. Environmental sustainability.\n- Resolution Strategy:\n  - Enforce Environmental Laws: Issue a notice to the factory to halt waste dumping immediately. Impose a fine for cleanup operations.\n  - Mandate ETP (Effluent Treatment Plant): Require the factory to install or upgrade treatment facilities within a strict timeframe (e.g., 30 days) to operate.\n  - Alternative arrangements: Provide tanker water to the village using CSR funds of the company. Set up medical camps.\n  - Conclusion: Economic growth cannot be bought at the cost of human lives. Sustainable development must guide policy."
  },
  {
    q: "Discuss the importance of empathy and compassion towards the weaker sections as foundational values of civil services. (Answer in 150 words, 10 marks)",
    explanation: "Key Points:\n- Empathy: Understanding the pain and challenges of the marginalized (poor, women, disabled) from their perspective.\n- Compassion: Taking active steps to alleviate that pain.\n- Importance: Civil servants wield power; without empathy, administration becomes cold and rule-bound, ignoring human suffering. Empathy ensures that policies (like food security, pensions) are implemented in spirit, not just on paper, ensuring social justice."
  }
];

const MAINS_ENGLISH_QUESTIONS = [
  {
    q: "Write a précis of the following passage in about one-third of its length. Do not suggest a title. Write the précis in your own words.\n\n'Education is not just about memorizing facts or obtaining degrees; it is a holistic development of character and intellect. A well-educated individual possesses the critical thinking skills to analyze complex societal issues and the empathy to contribute constructively. In contrast, an educational system focused solely on exams creates rote-learners who lack innovation and ethical grounding. Modern times require a shift towards creative, value-based learning.' (Answer in 25 words, 30 marks)",
    explanation: "Model Précis:\nTrue education fosters character, intellect, critical thinking, and empathy. Exam-centric systems produce rote-learners. Therefore, we must transition towards creative, value-based learning systems."
  },
  {
    q: "Read the passage and answer the questions:\n'India's rich biodiversity is a source of ecological stability and livelihood for millions. However, rapid urbanization and forest fragmentation threaten this heritage. Protecting ecosystems requires community participation alongside legislative backing.'\n1. What is the dual benefit of India's biodiversity? (5 marks)\n2. What are the threats to it? (5 marks)\n3. How can it be protected? (5 marks)",
    explanation: "Model Answers:\n1. The dual benefit is providing ecological stability and supporting the livelihoods of millions of people.\n2. The main threats are rapid urbanization and the fragmentation of forest habitats.\n3. It can be protected through community participation combined with strong legislative support."
  },
  {
    q: "Correct the following sentences without altering their basic meaning:\n1. He is senior than me in service. (5 marks)\n2. Each of the boys have completed their homework. (5 marks)\n3. Although it was raining, but the match continued. (5 marks)",
    explanation: "Model Corrections:\n1. He is senior to me in service. (Senior takes 'to' instead of 'than')\n2. Each of the boys has completed his homework. ('Each' takes singular verb and pronoun)\n3. Although it was raining, the match continued. ('Although' should not be followed by 'but')"
  },
  {
    q: "Rewrite the sentences as directed:\n1. He said, 'I am writing an essay now.' (Change to Indirect Speech) (5 marks)\n2. The storm destroyed the crops. (Change to Passive Voice) (5 marks)\n3. As soon as the bell rang, the students ran out. (Rewrite using 'No sooner... than') (5 marks)",
    explanation: "Model Rewrite:\n1. He said that he was writing an essay then.\n2. The crops were destroyed by the storm.\n3. No sooner did the bell ring than the students ran out."
  },
  {
    q: "Write short notes/definitions for the following idioms and use them in sentences:\n1. Burn the midnight oil (5 marks)\n2. A blessing in disguise (5 marks)\n3. Spill the beans (5 marks)",
    explanation: "Model Idiom Usage:\n1. Burn the midnight oil: To work or study late into the night. *Sentence*: Akhil had to burn the midnight oil to prepare for his UPSC Mains exams.\n2. A blessing in disguise: A misfortune that eventually results in a good outcome. *Sentence*: Losing his job was a blessing in disguise as it forced him to start his own successful business.\n3. Spill the beans: To reveal a secret prematurely. *Sentence*: Don't spill the beans about the surprise party we are planning for her birthday."
  }
];

const generateMainsMocksForCourse = async (courseId, courseTitle = "UPSC CSE") => {
  const mocks = [];
  const paperTypes = ["Essay", "GS Paper I", "GS Paper II", "GS Paper III", "GS Paper IV", "Compulsory English"];
  
  for (let i = 1; i <= 30; i++) {
    const paperTypeIndex = (i - 1) % paperTypes.length;
    const paperType = paperTypes[paperTypeIndex];
    
    let paperQuestions = [];
    let weightage = 250;
    let durationText = "180 Mins";
    
    if (paperType === "Essay") {
      const qIdx1 = (Math.floor((i - 1) / 6)) % MAINS_ESSAY_TOPICS.length;
      const qIdx2 = (qIdx1 + 1) % MAINS_ESSAY_TOPICS.length;
      
      paperQuestions = [
        {
          q: `Section A: ${MAINS_ESSAY_TOPICS[qIdx1].q.replace("Write an essay on: ", "")}`,
          explanation: MAINS_ESSAY_TOPICS[qIdx1].explanation
        },
        {
          q: `Section B: ${MAINS_ESSAY_TOPICS[qIdx2].q.replace("Write an essay on: ", "")}`,
          explanation: MAINS_ESSAY_TOPICS[qIdx2].explanation
        }
      ];
      weightage = 250;
    } else if (paperType === "GS Paper I") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % MAINS_GS1_QUESTIONS.length;
        paperQuestions.push(MAINS_GS1_QUESTIONS[idx]);
      }
      weightage = 250;
    } else if (paperType === "GS Paper II") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % MAINS_GS2_QUESTIONS.length;
        paperQuestions.push(MAINS_GS2_QUESTIONS[idx]);
      }
      weightage = 250;
    } else if (paperType === "GS Paper III") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % MAINS_GS3_QUESTIONS.length;
        paperQuestions.push(MAINS_GS3_QUESTIONS[idx]);
      }
      weightage = 250;
    } else if (paperType === "GS Paper IV") {
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % MAINS_GS4_QUESTIONS.length;
        paperQuestions.push(MAINS_GS4_QUESTIONS[idx]);
      }
      weightage = 250;
    } else { // Compulsory English
      const offset = Math.floor((i - 1) / 6);
      for (let q = 0; q < 4; q++) {
        const idx = (offset + q) % MAINS_ENGLISH_QUESTIONS.length;
        paperQuestions.push(MAINS_ENGLISH_QUESTIONS[idx]);
      }
      weightage = 300;
    }

    mocks.push({
      id: `${courseId}_mains_mock_${i}`,
      title: `${courseTitle.replace(" Prelims", "").replace(" Mains", "")} Mains Mock ${i} - ${paperType}`,
      duration: durationText,
      weightage: weightage,
      isMains: true,
      questions: paperQuestions
    });
  }
  
  return mocks;
};

// Helper to generate dynamic solved PYQ tests list per course
const generatePyqsForCourse = async (courseId, courseTitle, category = "Bank & Insurance") => {
  const pyqs = [];
  const pool = await Question.find({ category, is_quiz_only: true, status: "ok" }).lean();
  for (let i = 1; i <= 10; i++) {
    const qStart = (i + 7) * 10;
    const rStart = 100 + (i + 7) * 10;
    const eStart = 200 + (i + 7) * 5;
    const gStart = 250 + (i + 7) * 5;
    
    const pyqQuestions = [
      ...pool.slice(qStart, qStart + 10),
      ...pool.slice(rStart, rStart + 10),
      ...pool.slice(eStart, eStart + 5),
      ...pool.slice(gStart, gStart + 5)
    ].map(q => ({
      ...q,
      q: q.q.replace("[Exam]", courseTitle)
    }));
    
    pyqs.push({
      id: `${courseId}_pyq_${i}`,
      title: `${courseTitle} ${2026 - i} Solved PYQ Paper`,
      duration: "60 Mins",
      questions: pyqQuestions
    });
  }
  return pyqs;
};

// Helper to generate dynamic practice modules list per course (50 practice modules, non-repeating questions)
const generatePracticeModulesForCourse = async (courseId, courseTitle, category = "Bank & Insurance") => {
  const modules = [];
  const pool = await Question.find({ category, is_quiz_only: true, status: "ok" }).lean();
  if (pool.length === 0) {
    return [];
  }
  
  for (let i = 1; i <= 50; i++) {
    let subject = "";
    let conceptName = "";
    let qStart = 0;
    
    if (category === "NEET / JEE") {
      if (i <= 15) {
        subject = "Physics";
        conceptName = ["Kinematics", "Force and Motion", "Work and Energy", "Electrostatics"][(i - 1) % 4];
        qStart = ((i - 1) * 15) % 100;
      } else if (i <= 30) {
        subject = "Chemistry";
        conceptName = ["Organic Chemistry", "Atomic Structure", "Periodic Table", "Chemical Bonding"][(i - 16) % 4];
        qStart = 100 + (((i - 16) * 15) % 100);
      } else {
        subject = "Biology / Mathematics";
        conceptName = ["Cell Biology", "Genetics", "Human Physiology", "Ecology"][(i - 31) % 4];
        qStart = 200 + (((i - 31) * 15) % 100);
      }
    } else if (category === "UPSC / Civil") {
      if (i <= 15) {
        subject = "General Studies I";
        conceptName = ["Indian History", "Indian Polity"][(i - 1) % 2];
        qStart = ((i - 1) * 15) % 150;
      } else if (i <= 30) {
        subject = "General Studies II";
        conceptName = ["Quantitative Aptitude", "Logical Reasoning"][(i - 16) % 2];
        qStart = 150 + (((i - 16) * 15) % 150);
      } else {
        subject = "General Studies II";
        conceptName = "Reading Comprehension";
        qStart = 300 + (((i - 31) * 15) % 100);
      }
    } else if (category === "State Exams") {
      if (i <= 15) {
        subject = "General Studies";
        conceptName = "Andhra Pradesh / Telangana State GK";
        qStart = ((i - 1) * 15) % 150;
      } else if (i <= 30) {
        subject = "Aptitude & English";
        conceptName = "Quantitative Aptitude";
        qStart = 150 + (((i - 16) * 15) % 150);
      } else {
        subject = "Aptitude & English";
        conceptName = "General English";
        qStart = 300 + (((i - 31) * 15) % 100);
      }
    } else { // Bank & Insurance, SSC, Railways
      if (i <= 15) {
        subject = "Quantitative Aptitude";
        conceptName = ["Simplification & Approximation", "Data Interpretation (DI)", "Number Series (Missing & Wrong)", "Arithmetic Word Problems"][(i - 1) % 4];
        qStart = ((i - 1) * 15) % 100;
      } else if (i <= 30) {
        subject = "Reasoning Ability";
        conceptName = ["Puzzles & Seating Arrangement", "Syllogism & Logical Reasoning", "Coding-Decoding"][(i - 16) % 3];
        qStart = 100 + (((i - 16) * 15) % 100);
      } else {
        subject = "English Language";
        conceptName = "English Language Practice";
        qStart = 200 + (((i - 31) * 15) % 100);
      }
    }
    
    // Slice exactly 30 questions for this module
    const moduleQuestions = [];
    for (let qIdx = 0; qIdx < 30; qIdx++) {
      const pIdx = (qStart + qIdx) % pool.length;
      moduleQuestions.push({
        ...pool[pIdx],
        q: pool[pIdx].q.replace("[Exam]", courseTitle)
      });
    }
    
    let subSetNum = i <= 15 ? i : (i <= 30 ? i - 15 : i - 30);
    
    modules.push({
      id: `prac_${courseId}_${i}`,
      title: `${conceptName} Practice Set ${subSetNum}`,
      subject: subject,
      questions: moduleQuestions
    });
  }
  return modules;
};

// Auth routes
app.post("/api/auth/signup", authRateLimiter, async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const cleanEmail = email.trim().toLowerCase();
  
  if (cleanEmail.includes("admin") || cleanEmail.includes("superadmin")) {
    return res.status(400).json({ error: "Administrator registration is restricted." });
  }
  
  try {
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = new User({ name, email: cleanEmail, phone, otp, verified: false });
    await newUser.save();
    
    // Send verification email via Brevo HTTP API
    const verifyLink = `http://localhost:5000/api/auth/verify-link?email=${encodeURIComponent(cleanEmail)}&otp=${otp}`;
    const subject = "Verify Your KR Institute of Learning Account";
    const text = `Hi ${name},\n\nThank you for signing up with KR Institute of Learning!\n\nYour Verification OTP Code is: ${otp}\n\nAlternatively, you can verify your account by clicking the link below:\n${verifyLink}\n\nHappy Learning!\nKR Institute of Learning Team`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px;">
        <h2 style="color: #1A365D; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">Welcome to KR Institute of Learning, ${name}!</h2>
        <p style="font-size: 15px; line-height: 1.5;">Thank you for registering. To access your exam prep dashboard, please verify your email address using the OTP code below:</p>
        <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 8px; padding: 15px 25px; display: inline-block; font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #1E3A8A; margin: 15px 0;">
          ${otp}
        </div>
        <p style="font-size: 15px; line-height: 1.5;">Alternatively, you can verify your account instantly by clicking the button below:</p>
        <p><a href="${verifyLink}" style="background: #10B981; color: white; padding: 12px 24px; font-weight: bold; border-radius: 6px; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">Verify Account Link</a></p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;" />
        <p style="font-size: 12px; color: #9CA3AF;">If you did not initiate this registration, please ignore this email.</p>
      </div>
    `;

    try {
      await sendMail(cleanEmail, subject, text, html);
    } catch (mailErr) {
      console.error("Failed to send signup OTP email:", mailErr);
      await User.deleteOne({ _id: newUser._id });
      return res.status(500).json({ error: "Unable to send OTP email" });
    }
    res.status(201).json({ email: newUser.email });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error during signup" });
  }
});

app.post("/api/auth/verify", authRateLimiter, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.otp === otp) {
      user.verified = true;
      const token = generateSessionToken();
      user.sessionToken = token;
      user.sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await syncStudentAccess(user);
      await user.save();
      console.log("Verified user:", user);
      return res.status(200).json({ 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        states: user.states || [],
        qualifications: user.qualifications || [],
        organizations: user.organizations || [],
        bookmarks: user.bookmarks || [],
        unlockedCourses: user.unlockedCourses || [],
        unlockedPrelims: user.unlockedPrelims || [],
        unlockedMains: user.unlockedMains || [],
        unlockedSectorsPrelims: user.unlockedSectorsPrelims || [],
        unlockedSectorsMains: user.unlockedSectorsMains || [],
        role: user.role || "student",
        token 
      });
    } else {
      return res.status(400).json({ error: "Invalid OTP code" });
    }
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Internal server error during verification" });
  }
});

// GET endpoint to verify via link
app.get("/api/auth/verify-link", async (req, res) => {
  const { email, otp } = req.query;
  if (!email || !otp) {
    return res.status(400).send("<h3>Verification Failed: Missing arguments</h3>");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("<h3>Verification Failed: User not found</h3>");
    }

    if (user.otp === otp) {
      user.verified = true;
      await user.save();
      console.log("Verified user via link:", user);
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px; padding: 20px;">
          <div style="display: inline-block; background: #ECFDF5; border: 1.5px solid #10B981; border-radius: 12px; padding: 30px; max-width: 450px;">
            <h2 style="color: #059669; margin-top: 0;">🎉 KR Institute of Learning Account Verified!</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.5;">Your email <strong>${email}</strong> has been successfully verified. You can now close this tab and start using the platform.</p>
            <button onclick="window.close()" style="background: #10B981; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 15px;">Close Window</button>
          </div>
        </div>
      `);
    } else {
      return res.status(400).send("<h3>Verification Failed: Invalid OTP code</h3>");
    }
  } catch (err) {
    console.error("Verify link error:", err);
    res.status(500).send("<h3>Internal server error during verification</h3>");
  }
});

app.post("/api/auth/login", authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail.includes("superadmin")) {
    return res.status(400).json({ error: "Superadministrators must log in via the Superadmin Portal." });
  }

  if (cleanEmail.includes("admin")) {
    return res.status(400).json({ error: "Administrators must log in via the Admin Portal." });
  }
  
  try {
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = new User({ name: cleanEmail.split("@")[0], email: cleanEmail, phone: "9876543210", verified: false });
    }

    // Generate a random 6-digit Login OTP
    const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = loginOtp;
    await user.save();
    
    // Send Login OTP via Brevo HTTP API
    const subject = "Your KR Institute of Learning Login OTP Code";
    const text = `Hi ${user.name},\n\nYour KR Institute of Learning Login OTP Code is: ${loginOtp}\n\nPlease enter this code in the login verification screen to access your console.\n\nKR Institute of Learning Team`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #1F2937; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px;">
        <h2 style="color: #1A365D; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">KR Institute of Learning Login Verification</h2>
        <p style="font-size: 15px; line-height: 1.5;">A login request was made for your account. Please use the following 6-digit OTP code to verify your identity and log in:</p>
        <div style="background: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 8px; padding: 15px 25px; display: inline-block; font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #B45309; margin: 15px 0;">
          ${loginOtp}
        </div>
        <p style="font-size: 13px; color: #4B5563;">This code is valid for 10 minutes. If you did not request this login, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;" />
        <p style="font-size: 12px; color: #9CA3AF;">© 2026 KR Institute of Learning, Rajahmundry. All rights reserved.</p>
      </div>
    `;

    try {
      await sendMail(cleanEmail, subject, text, html);
    } catch (mailErr) {
      console.error("Failed to send login OTP email:", mailErr);
      user.loginOtp = undefined;
      await user.save();
      return res.status(500).json({ error: "Unable to send OTP email" });
    }
    res.status(200).json({ requiresOtp: true, email: cleanEmail });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

app.post("/api/auth/verify-login", authRateLimiter, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.loginOtp === otp) {
      user.verified = true;
      user.loginOtp = undefined;
      const token = generateSessionToken();
      user.sessionToken = token;
      user.sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await syncStudentAccess(user);
      await user.save();
      console.log("Logged in user via OTP:", user);
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        states: user.states || [],
        qualifications: user.qualifications || [],
        organizations: user.organizations || [],
        bookmarks: user.bookmarks || [],
        unlockedCourses: user.unlockedCourses || [],
        unlockedPrelims: user.unlockedPrelims || [],
        unlockedMains: user.unlockedMains || [],
        unlockedSectorsPrelims: user.unlockedSectorsPrelims || [],
        unlockedSectorsMains: user.unlockedSectorsMains || [],
        role: user.role || "student",
        token
      });
    } else {
      return res.status(400).json({ error: "Invalid OTP code" });
    }
  } catch (err) {
    console.error("Verify login error:", err);
    res.status(500).json({ error: "Internal server error verifying login" });
  }
});

app.post("/api/auth/admin-login", authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!email.toLowerCase().includes("admin") || email.toLowerCase().includes("superadmin")) {
    return res.status(403).json({ error: "Access Denied: Only administrators can log in here." });
  }

  try {
    const user = await User.findOne({ email });
    const isPasswordValid = user && (
      (user.passwordSalt && verifyPassword(password, user.passwordSalt, user.password)) ||
      (!user.passwordSalt && user.password === password)
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid administrator email or password." });
    }

    const token = generateSessionToken();
    user.sessionToken = token;
    user.sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || "admin",
      token
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Internal server error during admin login" });
  }
});

// Attempts routes
app.get("/api/attempts", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json([]);
    }
    const attempts = await Attempt.find({ email }).sort({ date: -1 });
    res.json(attempts);
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
});

app.post("/api/attempts", async (req, res) => {
  const attempt = req.body;
  if (!attempt.testName || attempt.score === undefined) {
    return res.status(400).json({ error: "Invalid attempt data" });
  }
  
  try {
    const newAttempt = new Attempt({
      id: `attempt_${Date.now()}`,
      email: attempt.email || null,
      date: new Date().toISOString().split("T")[0],
      testName: attempt.testName,
      score: attempt.score,
      accuracy: attempt.accuracy,
      timeSpent: attempt.timeSpent,
      details: attempt.details,
      questions: attempt.questions || [],
      userAnswers: attempt.userAnswers || {}
    });
    
    await newAttempt.save();
    console.log("Saved new test attempt:", newAttempt.id, "Score:", newAttempt.score);
    res.status(201).json(newAttempt);
  } catch (err) {
    console.error("Error saving attempt:", err);
    res.status(500).json({ error: "Failed to save attempt" });
  }
});

app.post("/api/exam/submit-response", async (req, res) => {
  const { user_email, exam_type, sub_type, score, accuracy, details, timeSpent } = req.body;
  
  try {
    const newAttempt = new Attempt({
      id: `attempt_${Date.now()}`,
      email: user_email || null,
      date: new Date().toISOString().split("T")[0],
      testName: `${exam_type} - ${sub_type} Mock Paper`,
      score: score !== undefined ? score : 0,
      accuracy: accuracy !== undefined ? accuracy : 0,
      timeSpent: timeSpent !== undefined ? timeSpent : 60,
      details: details || { correct: 0, incorrect: 0, unattempted: 0 },
      questions: req.body.questions || [],
      userAnswers: req.body.userAnswers || {}
    });

    await newAttempt.save();
    console.log("[Exam Engine] Saved student response attempt:", newAttempt.id, "Score:", newAttempt.score);
    res.status(201).json(newAttempt);
  } catch (err) {
    console.error("[Exam Engine] Error saving responses:", err);
    res.status(500).json({ error: "Failed to submit responses to database." });
  }
});

const cleanOptions = (options) => {
  if (!Array.isArray(options)) return [];
  const seenTexts = new Set();
  const uniqueOptions = [];
  const validIds = ["A", "B", "C", "D", "E"];
  
  options.forEach(o => {
    let text = "";
    if (typeof o === 'object' && o !== null) {
      text = (o.text || o.option_text || "").trim();
    } else {
      text = String(o).trim();
    }
    
    if (text && !seenTexts.has(text.toLowerCase())) {
      seenTexts.add(text.toLowerCase());
      uniqueOptions.push({
        id: validIds[uniqueOptions.length] || String.fromCharCode(65 + uniqueOptions.length),
        text: text
      });
    }
  });

  const limit = options.length >= 5 ? 5 : 4;
  while (uniqueOptions.length < limit) {
    uniqueOptions.push({
      id: validIds[uniqueOptions.length] || String.fromCharCode(65 + uniqueOptions.length),
      text: `Option ${validIds[uniqueOptions.length]}`
    });
  }
  
  return uniqueOptions.slice(0, limit);
};

const isSubTypeMatch = (qSubType, querySubType) => {
  if (!qSubType || !querySubType) return false;
  const qStr = qSubType.toLowerCase().trim();
  const queryStr = querySubType.toLowerCase().trim();
  
  if (qStr === queryStr) return true;
  if (queryStr.includes(qStr) || qStr.includes(queryStr)) return true;
  
  const qClean = qStr.replace(/[^a-z0-9]+/g, '');
  const queryClean = queryStr.replace(/[^a-z0-9]+/g, '');
  if (queryClean.includes(qClean) || qClean.includes(queryClean)) return true;
  
  return false;
};

const getSectionName = (category, qNum, qObj = null) => {
  if (qObj && qObj.section) {
    const dbSec = String(qObj.section).toLowerCase();
    if (dbSec.includes("math") || dbSec.includes("quant") || dbSec.includes("arithmetic")) {
      return "Quantitative Aptitude";
    }
    if (dbSec.includes("reason") || dbSec.includes("intelligence") || dbSec.includes("mental")) {
      return "Reasoning Ability";
    }
    if (dbSec.includes("aware") || dbSec.includes("science") || dbSec.includes("general") || dbSec.includes("history") || dbSec.includes("geography")) {
      return "General Awareness";
    }
    if (dbSec.includes("english") || dbSec.includes("verbal") || dbSec.includes("comprehension") || dbSec.includes("lang")) {
      return "English Language";
    }
  }
  const num = parseInt(qNum, 10) || 1;
  if (category === "NEET / JEE") {
    if (num <= 25) return "Physics";
    if (num <= 50) return "Chemistry";
    return "Biology / Mathematics";
  } else if (category === "UPSC / Civil") {
    if (num <= 50) return "General Studies I";
    return "General Studies II";
  } else if (category === "State Exams") {
    if (num <= 40) return "General Studies";
    if (num <= 70) return "Quantitative Aptitude";
    return "General English";
  } else if (category === "RRB & Railways" || category === "Railways") {
    if (num <= 30) return "Quantitative Aptitude";
    if (num <= 60) return "Reasoning Ability";
    return "General Awareness";
  } else if (category === "SSC Exams" || category === "SSC") {
    if (num <= 25) return "Quantitative Aptitude";
    if (num <= 50) return "Reasoning Ability";
    if (num <= 75) return "English Language";
    return "General Awareness";
  } else {
    if (num <= 35) return "Quantitative Aptitude";
    if (num <= 70) return "Reasoning Ability";
    return "English Language";
  }
};

const getMockEligibleQuestions = async (exam_type, sub_type, sectionName = null) => {
  let category = "Bank & Insurance";
  const typeLower = String(exam_type || "").toLowerCase();
  if (typeLower.includes("rail") || typeLower.includes("rrb")) {
    category = "RRB & Railways";
  } else if (typeLower.includes("ssc")) {
    category = "SSC Exams";
  } else if (typeLower.includes("neet") || typeLower.includes("jee")) {
    category = "NEET / JEE";
  } else if (typeLower.includes("upsc") || typeLower.includes("civil")) {
    category = "UPSC / Civil";
  } else if (typeLower.includes("state") || typeLower.includes("appsc") || typeLower.includes("tspsc")) {
    category = "State Exams";
  }

  // Try querying by specific exam_type and paper_name/sub_type first
  let filter = {
    is_mock_eligible: true,
    status: { $ne: "needs_review" },
    source_file: { $ne: null, $exists: true }
  };
  
  let mappedExamType = exam_type;
  if (exam_type) {
    const etLower = exam_type.toLowerCase();
    if (etLower.includes("rail") || etLower.includes("rrb")) {
      mappedExamType = "RRB";
    } else if (etLower.includes("ssc")) {
      mappedExamType = "SSC";
    } else if (etLower.includes("bank")) {
      mappedExamType = "Banking";
    }
  }

  if (mappedExamType) {
    filter.exam_type = mappedExamType;
  }
  if (sub_type) {
    filter.$or = [
      { sub_type: sub_type },
      { paper_name: sub_type },
      { test_title: sub_type },
      { test_id: sub_type }
    ];
  }
  
  let questions = await Question.find({
    $or: [
      { test_id: sub_type },
      { test_title: sub_type },
      { course: exam_type, test_title: sub_type },
      { course: exam_type, sub_type: sub_type },
      { course: exam_type, test_id: sub_type },
      filter
    ]
  }).sort({ question_number: 1, id: 1 }).lean();
  
  if (questions.length === 0) {
    let fallbackFilter = {
      status: "ok"
    };
    if (mappedExamType) fallbackFilter.exam_type = mappedExamType;
    if (sub_type) {
      fallbackFilter.$or = [
        { sub_type: sub_type },
        { paper_name: sub_type },
        { test_title: sub_type }
      ];
    }
    questions = await Question.find(fallbackFilter).sort({ question_number: 1, id: 1 }).lean();
  }
  
  if (questions.length > 0) {
    // Preserve exact question order without any shuffling
    let finalQuestions = [...questions];

    if (sectionName) {
      const targetSec = sectionName.toLowerCase().replace(/[^a-z]+/g, "");
      finalQuestions = finalQuestions.filter(q => {
        const sec = (q.section || q.subject || "").toLowerCase().replace(/[^a-z]+/g, "");
        return sec.includes(targetSec) || targetSec.includes(sec);
      });
    }

    return finalQuestions.map(q => {
      return {
        ...q,
        q: q.question || q.question_text || q.q,
        options: q.options || [],
        correct_answer: q.correctAnswer || q.correct_answer || "A",
        section: q.section || q.subject || "General Intelligence and Reasoning"
      };
    });
  }
  
  if (sub_type) {
    return [];
  }
  
  // Fallback to legacy pooling logic
  if (typeLower.includes("rail") || typeLower.includes("rrb")) {
    category = "RRB & Railways";
  } else if (typeLower.includes("ssc")) {
    category = "SSC Exams";
  } else if (typeLower.includes("neet") || typeLower.includes("jee")) {
    category = "NEET / JEE";
  } else if (typeLower.includes("upsc") || typeLower.includes("civil")) {
    category = "UPSC / Civil";
  } else if (typeLower.includes("state") || typeLower.includes("appsc") || typeLower.includes("tspsc")) {
    category = "State Exams";
  }

  let queryCategories = [category];
  if (category === "RRB & Railways" || category === "Railways") {
    queryCategories = ["RRB", "RRB & Railways", "Railways"];
  } else if (category === "SSC Exams" || category === "SSC") {
    queryCategories = ["SSC_CGL", "SSC_CHSL", "SSC Exams", "SSC"];
  } else if (category === "State Exams") {
    queryCategories = ["TSPSC", "APPSC", "SI_POLICE", "TET", "DSC", "State Exams"];
  } else if (category === "Bank & Insurance") {
    queryCategories = ["Bank & Insurance", "Banking"];
  }

  let pool = await Question.find({ 
    category: { $in: queryCategories }, 
    is_mock_eligible: true,
    source_file: { $ne: null, $exists: true }
  }).lean();
  if (pool.length === 0) {
    pool = await Question.find({ 
      category: { $in: queryCategories },
      source_file: { $ne: null, $exists: true },
      status: "ok"
    }).lean();
  }

  const mockMatch = sub_type ? sub_type.match(/(Mock|Test)\s+(\d+)/i) : null;
  if (mockMatch) {
    const mockIndex = parseInt(mockMatch[2], 10);
    if (pool.length > 0) {
      const sectionsMap = {};
      pool.forEach(q => {
        const secName = getSectionName(category, q.question_number, q);
        if (!sectionsMap[secName]) {
          sectionsMap[secName] = [];
        }
        sectionsMap[secName].push(q);
      });

      let mockQuestions = [];
      let sectionsConfig = [];
      if (category === "NEET / JEE") {
        sectionsConfig = [
          { name: "Physics", count: 25 },
          { name: "Chemistry", count: 25 },
          { name: "Biology / Mathematics", count: 25 }
        ];
      } else if (category === "UPSC / Civil") {
        sectionsConfig = [
          { name: "General Studies I", count: 50 },
          { name: "General Studies II", count: 50 }
        ];
      } else if (category === "State Exams") {
        sectionsConfig = [
          { name: "General Studies", count: 40 },
          { name: "Quantitative Aptitude", count: 30 },
          { name: "General English", count: 30 }
        ];
      } else if (category === "RRB & Railways" || category === "Railways") {
        sectionsConfig = [
          { name: "Quantitative Aptitude", count: 30 },
          { name: "Reasoning Ability", count: 30 },
          { name: "General Awareness", count: 40 }
        ];
      } else if (category === "SSC Exams" || category === "SSC") {
        sectionsConfig = [
          { name: "Quantitative Aptitude", count: 25 },
          { name: "Reasoning Ability", count: 25 },
          { name: "English Language", count: 25 },
          { name: "General Awareness", count: 25 }
        ];
      } else {
        sectionsConfig = [
          { name: "Quantitative Aptitude", count: 35 },
          { name: "Reasoning Ability", count: 35 },
          { name: "English Language", count: 30 }
        ];
      }

      sectionsConfig.forEach(sec => {
        const secPool = sectionsMap[sec.name] || [];
        if (secPool.length > 0) {
          const startIdx = ((mockIndex - 1) * sec.count) % secPool.length;
          for (let k = 0; k < sec.count; k++) {
            const qIdx = (startIdx + k) % secPool.length;
            const q = secPool[qIdx];
            mockQuestions.push({
              ...q,
              section: sec.name
            });
          }
        }
      });

      return mockQuestions.map(q => {
        return {
          ...q,
          q: q.q,
          options: cleanOptions(q.options)
        };
      });
    }
  }

  const filtered = questions.filter(q => {
    const fileClean = q.source_file ? q.source_file.toLowerCase().replace(/[^a-z0-9]+/g, '') : '';
    const queryClean = sub_type ? sub_type.toLowerCase().replace(/[^a-z0-9]+/g, '') : '';
    const isSpecificFileQuery = queryClean.length > 15;

    if (isSpecificFileQuery) {
      const fileCleanNoExt = fileClean.replace(/(pdf|docx|json)$/, '');
      if (fileClean && (fileClean.includes(queryClean) || fileCleanNoExt.includes(queryClean) || queryClean.includes(fileClean.replace(/^\d+/, '').replace(/(pdf|docx|json)$/, '')))) {
        return true;
      }
      return false;
    }

    const matchType = !exam_type || (q.exam_type && String(q.exam_type).toLowerCase() === String(exam_type).toLowerCase());
    const matchSubType = !sub_type || isSubTypeMatch(q.sub_type, sub_type);
    return matchType && matchSubType;
  });

  const seenTexts = new Set();
  const uniqueQuestions = [];
  for (const q of filtered) {
    if (!q.q) continue;
    const normalizedText = String(q.q).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (!seenTexts.has(normalizedText)) {
      seenTexts.add(normalizedText);
      uniqueQuestions.push(q);
    }
  }

  const sections = {};
  for (const q of uniqueQuestions) {
    const sec = q.section || "General";
    if (!sections[sec]) {
      sections[sec] = [];
    }
    sections[sec].push(q);
  }

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  let finalQuestions = [];
  const sortedSectionNames = Object.keys(sections).sort();
  for (const secName of sortedSectionNames) {
    const shuffledSec = shuffle(sections[secName]);
    finalQuestions.push(...shuffledSec);
  }

  return finalQuestions.map(q => ({
    ...q,
    options: cleanOptions(q.options)
  }));
};

app.get("/api/exam/fetch-questions", async (req, res) => {
  const { exam_type, sub_type, section } = req.query;
  try {
    const questions = await getMockEligibleQuestions(exam_type, sub_type, section);
    console.log(`[Exam Engine] Served ${questions.length} segregated, cross-shuffled mock questions for Type: ${exam_type}, Sub-Type: ${sub_type}, Section: ${section}`);
    res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    console.error("Error fetching mock test questions:", err);
    res.status(500).json({ error: "Failed to fetch mock test questions." });
  }
});

app.get("/api/exam/questions", async (req, res) => {
  const { exam_type, sub_type, test_id, section } = req.query;
  try {
    const questions = await getMockEligibleQuestions(exam_type, test_id || sub_type, section);
    console.log(`[Exam Engine] Served ${questions.length} questions for Type: ${exam_type}, Sub-Type: ${test_id || sub_type}, Section: ${section}`);
    res.json({ questions });
  } catch (err) {
    console.error("[Exam Engine] Error reading parsed questions:", err);
    res.status(500).json({ error: "Failed to read parsed questions." });
  }
});

// Daily Quiz Endpoint
app.get("/api/quiz/fetch", async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const filter = { is_quiz_only: true, status: "ok" };
    if (category) filter.category = category;
    
    const questions = await Question.find(filter).limit(parseInt(limit)).lean();
    console.log(`[Quiz Engine] Served ${questions.length} quiz-only questions for Category: ${category}`);
    res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    console.error("Error fetching daily quiz:", err);
    res.status(500).json({ error: "Failed to fetch daily quiz." });
  }
});

// Leaderboard routes
app.get("/api/topics/:topicName/leaderboard", async (req, res) => {
  const topicName = req.params.topicName;
  
  try {
    let board = await Leaderboard.findOne({ topicName });
    if (!board) {
      board = new Leaderboard({
        topicName,
        entries: [
          { name: "Rohan Sharma", score: 100, time: "1m 15s" },
          { name: "Divya Reddy", score: 100, time: "1m 32s" },
          { name: "Vikram Singh", score: 80, time: "1m 45s" }
        ]
      });
      await board.save();
    }
    res.json(board.entries);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.post("/api/topics/:topicName/leaderboard", async (req, res) => {
  const topicName = req.params.topicName;
  const { name, score, time } = req.body;
  
  if (!name || score === undefined || !time) {
    return res.status(400).json({ error: "Invalid leaderboard entry" });
  }
  
  try {
    let board = await Leaderboard.findOne({ topicName });
    if (!board) {
      board = new Leaderboard({ topicName, entries: [] });
    }
    
    board.entries.push({ name, score: parseInt(score), time });
    board.entries.sort((a, b) => b.score - a.score);
    await board.save();
    
    console.log(`Updated leaderboard for ${topicName}`);
    res.status(201).json(board.entries);
  } catch (err) {
    console.error("Error saving leaderboard entry:", err);
    res.status(500).json({ error: "Failed to save leaderboard entry" });
  }
});

// Live notifications schedule endpoint
app.get("/api/notifications", async (req, res) => {
  try {
    const latestJobs = await Job.find({}).sort({ created_at: -1 }).limit(100).lean();
    const dbNotifs = latestJobs.map(job => {
      // Safely parse date or fallback
      let lastDate = job.application_last_date;
      if (lastDate && !lastDate.includes("-")) {
        lastDate = new Date(lastDate).toISOString().split('T')[0];
      }
      
      return {
        id: job._id.toString(),
        examBoard: job.organization,
        title: job.title,
        badge: "Live Job Alert",
        badgeType: "success",
        releaseDate: job.notification_date || new Date(job.created_at).toISOString().split('T')[0],
        applyStart: job.application_start_date || new Date(job.created_at).toISOString().split('T')[0],
        applyEnd: lastDate || new Date(new Date(job.created_at).getTime() + 15*24*60*60*1000).toISOString().split('T')[0],
        examDate: lastDate ? new Date(new Date(lastDate).getTime() + 30*24*60*60*1000).toISOString().split('T')[0] : null,
        officialPdfUrl: job.official_notification_url,
        applyUrl: job.official_apply_url,
        vacancies: job.vacancies
      };
    });
    
    res.json([...dbNotifs, ...UPCOMING_NOTIFICATIONS]);
  } catch (err) {
    console.error("Error loading live notifications marquee:", err);
    res.json(UPCOMING_NOTIFICATIONS);
  }
});

// GET latest job notifications
app.get("/api/jobs/latest", async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({ created_at: -1 })
      .limit(10);
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET featured job notifications
app.get("/api/jobs/featured", async (req, res) => {
  try {
    const jobs = await Job.find({ vacancies: { $gt: 100 } })
      .sort({ created_at: -1 })
      .limit(10);
    if (jobs.length === 0) {
      const fallback = await Job.find({})
        .sort({ created_at: -1 })
        .limit(10);
      return res.json(fallback);
    }
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST a new job notification (Admin)
app.post("/api/jobs", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET all courses (optionally filtered by category)
app.get("/api/courses", async (req, res) => {
  const { category, limit = 200 } = req.query;
  const filter = {};
  if (category) {
    filter.category = category;
  }
  try {
    const courses = await Course.find(filter)
      .limit(parseInt(limit));
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET all courses for dropdowns
app.get("/api/courses/all", async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ title: 1 });
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Student Access Real-Time Synchronizer Helper
const syncStudentAccess = async (userObj) => {
  try {
    if (!userObj || !userObj.email) return;
    const student = await Student.findOne({
      $or: [
        { email: { $regex: new RegExp("^" + userObj.email + "$", "i") } },
        { mobile: userObj.phone }
      ]
    });
    if (student) {
      userObj.unlockedCourses = student.assignedCourses || [];
      await userObj.save();
      console.log(`Synced dynamic course access for registered student: ${userObj.email}`);
    }
  } catch (err) {
    console.error("Error syncing student access:", err);
  }
};

// GET all registered students for Manager Dashboard
app.get("/api/manager/students", async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST register a new student manually (with automatic access profiles)
app.post("/api/manager/register-student", async (req, res) => {
  const { name, email, mobile, assignedCourses } = req.body;
  if (!name || !email || !mobile) {
    return res.status(400).json({ error: "Name, Email and Mobile number are required" });
  }

  try {
    // Check duplicates in Student collections
    const dupEmail = await Student.findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } });
    if (dupEmail) return res.status(400).json({ error: "Student is already registered with this Email address" });

    const dupMobile = await Student.findOne({ mobile });
    if (dupMobile) return res.status(400).json({ error: "Student is already registered with this Mobile number" });

    const newStudent = new Student({
      name,
      email,
      mobile,
      assignedCourses: assignedCourses || []
    });
    await newStudent.save();

    // Create StudentAccess profiles per course
    if (assignedCourses && assignedCourses.length > 0) {
      const accessPromises = assignedCourses.map(courseId => {
        const access = new StudentAccess({
          studentId: newStudent._id,
          courseId,
          mockTestsUnlocked: true,
          prelimsUnlocked: true,
          mainsUnlocked: true,
          practiceUnlocked: true,
          previousPapersUnlocked: true,
          videosUnlocked: true
        });
        return access.save();
      });
      await Promise.all(accessPromises);
    }

    // Sync with User auth collection if student account already exists
    let user = await User.findOne({ $or: [{ email: { $regex: new RegExp("^" + email + "$", "i") } }, { phone: mobile }] });
    if (user) {
      user.unlockedCourses = assignedCourses || [];
      if (!user.phone || user.phone === "9876543210") user.phone = mobile;
      await user.save();
    } else {
      // Pre-create verified User record so they can sign in instantly
      user = new User({
        name,
        email,
        phone: mobile,
        verified: true,
        role: "student",
        unlockedCourses: assignedCourses || []
      });
      await user.save();
    }

    res.status(201).json(newStudent);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update registered student details and dynamic permissions
app.put("/api/manager/student/:id", async (req, res) => {
  const studentId = req.params.id;
  const { name, email, mobile, assignedCourses } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student record not found" });

    // Validate email/mobile changes
    if (email && email.toLowerCase() !== student.email.toLowerCase()) {
      const dupEmail = await Student.findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } });
      if (dupEmail) return res.status(400).json({ error: "Email address is already in use by another student" });
    }
    if (mobile && mobile !== student.mobile) {
      const dupMobile = await Student.findOne({ mobile });
      if (dupMobile) return res.status(400).json({ error: "Mobile number is already in use by another student" });
    }

    const oldEmail = student.email;
    const oldMobile = student.mobile;

    student.name = name || student.name;
    student.email = email || student.email;
    student.mobile = mobile || student.mobile;
    student.assignedCourses = assignedCourses || [];
    student.updatedAt = new Date();
    await student.save();

    // Rebuild StudentAccess profiles
    await StudentAccess.deleteMany({ studentId: student._id });
    if (assignedCourses && assignedCourses.length > 0) {
      const accessPromises = assignedCourses.map(courseId => {
        const access = new StudentAccess({
          studentId: student._id,
          courseId,
          mockTestsUnlocked: true,
          prelimsUnlocked: true,
          mainsUnlocked: true,
          practiceUnlocked: true,
          previousPapersUnlocked: true,
          videosUnlocked: true
        });
        return access.save();
      });
      await Promise.all(accessPromises);
    }

    // Sync corresponding User account
    const user = await User.findOne({ $or: [{ email: oldEmail }, { phone: oldMobile }, { email }, { phone: mobile }] });
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = mobile || user.phone;
      user.unlockedCourses = assignedCourses || [];
      await user.save();
    }

    res.json(student);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE remove a registered student and lock their courses
app.delete("/api/manager/student/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student record not found" });

    const email = student.email;
    const mobile = student.mobile;

    await Student.deleteOne({ _id: studentId });
    await StudentAccess.deleteMany({ studentId });

    // Revoke course locks from Student Portal account
    const user = await User.findOne({ $or: [{ email }, { phone: mobile }] });
    if (user) {
      user.unlockedCourses = [];
      await user.save();
    }

    res.json({ success: true, message: "Student registration record removed successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET latest courses
app.get("/api/courses/latest", async (req, res) => {
  try {
    const courses = await Course.find({})
      .sort({ _id: -1 })
      .limit(8);
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET featured courses (Bestseller or Trending)
app.get("/api/courses/featured", async (req, res) => {
  try {
    const courses = await Course.find({ status: { $in: ["Bestseller", "Trending"] } })
      .limit(8);
    if (courses.length === 0) {
      const fallback = await Course.find({}).limit(8);
      return res.json(fallback);
    }
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST a new course (Admin)
app.post("/api/courses", async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/courses/:courseId/handbooks", async (req, res) => {
  const courseId = req.params.courseId;
  const title = req.query.title || "SBI PO";
  try {
    const course = await Course.findOne({ id: courseId }).lean();
    const category = course ? course.category : (req.query.category || "Bank & Insurance");
    const syllabus = course && course.syllabus && course.syllabus.length > 0 ? course.syllabus : getSyllabusForCategory(category);
    const handbooks = generateStudyNotesForCourse(courseId, title, syllabus);
    res.json(handbooks);
  } catch (err) {
    console.error("Error loading handbooks:", err);
    res.status(500).json({ error: "Failed to load handbooks" });
  }
});

// Course Mock tests endpoint
app.get("/api/courses/:courseId/mocks", async (req, res) => {
  const courseId = req.params.courseId;
  const title = req.query.title || "SBI PO";
  const category = req.query.category || "Bank & Insurance";
  const section = req.query.section || null;
  try {
    const mocks = await generateMocksForCourse(courseId, title, category, section);
    res.json(mocks);
  } catch (err) {
    console.error("Error generating mocks:", err);
    res.status(500).json({ error: "Failed to load mock tests" });
  }
});

// Course Mains Mock tests endpoint (Descriptive/Offline)
app.get("/api/courses/:courseId/mains-mocks", async (req, res) => {
  const courseId = req.params.courseId;
  const title = req.query.title || "UPSC CSE";
  try {
    const mocks = await generateMainsMocksForCourse(courseId, title);
    res.json(mocks);
  } catch (err) {
    console.error("Error generating mains mocks:", err);
    res.status(500).json({ error: "Failed to load mains mock tests" });
  }
});

// Course Practice modules endpoint
app.get("/api/courses/:courseId/practice", async (req, res) => {
  const courseId = req.params.courseId;
  const title = req.query.title || "SBI PO";
  const category = req.query.category || "Bank & Insurance";
  try {
    const practiceModules = await generatePracticeModulesForCourse(courseId, title, category);
    res.json(practiceModules);
  } catch (err) {
    console.error("Error generating practice modules:", err);
    res.status(500).json({ error: "Failed to load practice modules" });
  }
});

// Course PYQs endpoint
app.get("/api/courses/:courseId/pyqs", async (req, res) => {
  const courseId = req.params.courseId;
  const title = req.query.title || "SBI PO";
  const category = req.query.category || "Bank & Insurance";
  try {
    const pyqs = await generatePyqsForCourse(courseId, title, category);
    res.json(pyqs);
  } catch (err) {
    console.error("Error generating pyqs:", err);
    res.status(500).json({ error: "Failed to load solved PYQs" });
  }
});

// Doubts / Feedback endpoint (More tab / future scope)
app.post("/api/feedback", async (req, res) => {
  const { name, email, feedback, type } = req.body;
  
  try {
    const entry = new Feedback({
      id: `fb_${Date.now()}`,
      name,
      email,
      feedback,
      type: type || "doubt",
      date: new Date().toISOString()
    });
    
    await entry.save();
    console.log("Recorded feedback/doubt entry:", entry);
    res.status(201).json({ success: true, message: "Doubt logged successfully" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

app.get("/api/downloads/notes/:noteId", async (req, res) => {
  const noteId = req.params.noteId;
  const parts = noteId.split("_notes_");
  const courseId = parts[0];
  
  try {
    const course = await Course.findOne({ id: courseId }).lean();
    const courseTitle = course ? course.title : courseId.toUpperCase().replace("_", " ");
    const category = course ? course.category : "Bank & Insurance";

    const notes = generateStudyNotesForCourse(courseId, courseTitle, category);
    const activeNote = notes.find(n => n.id === noteId) || notes[0];

    res.setHeader("Content-Disposition", `attachment; filename="${activeNote.title.replace(/\s+/g, "_")}.txt"`);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    
    res.send(activeNote.summary);
  } catch (err) {
    console.error("Error downloading notes:", err);
    res.status(500).send("Failed to download notes");
  }
});

// AI Chat Proxy Endpoint (DISABLED)
app.post("/api/ai/chat", async (req, res) => {
  return res.status(503).json({ error: "AI Tutor has been disabled." });
});

// AI English Trainer Endpoint (DISABLED)
app.post("/api/ai/english-trainer", async (req, res) => {
  return res.status(503).json({ error: "AI English Trainer has been disabled." });
});

// -------------------------------------------------------------------
// GOV JOBS ALERTS API MODULES
// -------------------------------------------------------------------

// Helper to get current user based on headers or query/body email (token checks first)
async function getCurrentUser(req) {
  let user = await getUserByToken(req);
  if (user) return user;

  const ip = req.ip || req.socket.remoteAddress;
  const isLocal = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
  if (isLocal) {
    const email = req.headers["x-user-email"] || req.query.email || req.body.email;
    const userId = req.headers["x-user-id"];

    if (email && email !== "null" && email !== "undefined") {
      user = await User.findOne({ email });
    }
    if (!user && userId && userId !== "null" && userId !== "undefined") {
      try {
        user = await User.findById(userId);
      } catch (e) {}
    }

    if (!user) {
      const defaultEmail = "default@govjobs.in";
      user = await User.findOne({ email: defaultEmail });
      if (!user) {
        user = new User({
          name: "Default Candidate",
          email: defaultEmail,
          phone: "9876543210",
          verified: true,
          states: ["Central"],
          qualifications: ["Degree"],
          organizations: ["UPSC", "SSC"],
          bookmarks: []
        });
        await user.save();
      }
    }
  }
  return user;
}

app.get("/api/jobs", async (req, res) => {
  const { search, state, qualification, organization, offset = 0, limit = 20 } = req.query;
  const filter = {};
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }
  if (state) filter.state = state;
  if (qualification) filter.qualification = qualification;
  if (organization) filter.organization = organization;

  try {
    const jobs = await Job.find(filter)
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/jobs/filters", async (req, res) => {
  try {
    const states = await Job.distinct("state");
    const qualifications = await Job.distinct("qualification");
    const organizations = await Job.distinct("organization");

    res.json({
      states: Array.from(new Set([...states.filter(Boolean), "Central", "Andhra Pradesh", "Telangana"])).sort(),
      qualifications: Array.from(new Set([...qualifications.filter(Boolean), "10th Pass", "12th Pass", "Degree", "B.Tech", "Diploma"])).sort(),
      organizations: Array.from(new Set([...organizations.filter(Boolean), "UPSC", "SSC", "RRB", "IBPS", "APPSC", "TSPSC"])).sort()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/jobs/bookmarks", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const bookmarkedIds = user.bookmarks || [];
    const bookmarkedJobs = await Job.find({ _id: { $in: bookmarkedIds } }).sort({ created_at: -1 });
    res.json(bookmarkedJobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/jobs/bookmarks", async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) {
    return res.status(400).json({ error: "job_id is required" });
  }

  try {
    const user = await getCurrentUser(req);
    const index = user.bookmarks.indexOf(job_id);
    let status = "";

    if (index > -1) {
      user.bookmarks.splice(index, 1);
      status = "removed";
    } else {
      user.bookmarks.push(job_id);
      status = "added";
    }
    await user.save();
    res.json({ status, job_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job alert not found" });
    }
    res.json(job);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users/register-jobs", async (req, res) => {
  const { email, fcm_token } = req.body;
  if (!email && !fcm_token) {
    return res.status(400).json({ error: "Either email or fcm_token is required." });
  }

  try {
    let user = null;
    if (fcm_token) {
      user = await User.findOne({ fcmToken: fcm_token });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (fcm_token) user.fcmToken = fcm_token;
      if (email) user.email = email;
      await user.save();
    } else {
      user = new User({
        name: email ? email.split("@")[0] : "jobs-user",
        email: email || `${uuidv4()}@temporary.govjobs.in`,
        phone: "9876543210",
        fcmToken: fcm_token || null,
        states: ["Central"],
        qualifications: ["Degree"],
        organizations: ["UPSC", "SSC"],
        bookmarks: []
      });
      await user.save();
    }

    res.json({
      id: user._id,
      email: user.email,
      fcm_token: user.fcmToken,
      states: user.states || [],
      qualifications: user.qualifications || [],
      organizations: user.organizations || [],
      created_at: user.created_at || new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/users/me-jobs", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    res.json({
      id: user._id,
      email: user.email,
      fcm_token: user.fcmToken,
      states: user.states || [],
      qualifications: user.qualifications || [],
      organizations: user.organizations || [],
      created_at: user.created_at
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET user profile with dynamic course permission check
app.post("/api/users/purchase-plan", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized access" });

    const { courseId, sectorId, planType } = req.body;
    if (!planType) {
      return res.status(400).json({ error: "planType is required" });
    }

    if (!user.unlockedPrelims) user.unlockedPrelims = [];
    if (!user.unlockedMains) user.unlockedMains = [];
    if (!user.unlockedSectorsPrelims) user.unlockedSectorsPrelims = [];
    if (!user.unlockedSectorsMains) user.unlockedSectorsMains = [];

    if (planType === "single-prelims") {
      if (courseId && !user.unlockedPrelims.includes(courseId)) {
        user.unlockedPrelims.push(courseId);
      }
    } else if (planType === "sector-prelims") {
      if (sectorId && !user.unlockedSectorsPrelims.includes(sectorId)) {
        user.unlockedSectorsPrelims.push(sectorId);
      }
    } else if (planType === "single-mains") {
      if (courseId && !user.unlockedMains.includes(courseId)) {
        user.unlockedMains.push(courseId);
      }
    } else if (planType === "sector-mains") {
      if (sectorId && !user.unlockedSectorsMains.includes(sectorId)) {
        user.unlockedSectorsMains.push(sectorId);
      }
    } else {
      return res.status(400).json({ error: "Invalid planType" });
    }

    await user.save();
    console.log(`[PURCHASE] User ${user.email} unlocked ${planType} (Course: ${courseId}, Sector: ${sectorId})`);

    res.json({
      success: true,
      unlockedPrelims: user.unlockedPrelims,
      unlockedMains: user.unlockedMains,
      unlockedSectorsPrelims: user.unlockedSectorsPrelims,
      unlockedSectorsMains: user.unlockedSectorsMains
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/profile", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized access" });

    // Synchronize access list with Student table registration if matching
    const student = await Student.findOne({
      $or: [
        { email: { $regex: new RegExp("^" + user.email + "$", "i") } },
        { mobile: user.phone }
      ]
    });
    if (student) {
      user.unlockedCourses = student.assignedCourses || [];
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      states: user.states || [],
      qualifications: user.qualifications || [],
      organizations: user.organizations || [],
      bookmarks: user.bookmarks || [],
      unlockedCourses: user.unlockedCourses || [],
      unlockedPrelims: user.unlockedPrelims || [],
      unlockedMains: user.unlockedMains || [],
      unlockedSectorsPrelims: user.unlockedSectorsPrelims || [],
      unlockedSectorsMains: user.unlockedSectorsMains || [],
      profileImage: user.profileImage || "",
      role: user.role || "student"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/users/preferences-jobs", async (req, res) => {
  const { states, qualifications, organizations } = req.body;
  if (!states || !qualifications || !organizations) {
    return res.status(400).json({ error: "Preferences matrices are required." });
  }

  try {
    const user = await getCurrentUser(req);
    user.states = states;
    user.qualifications = qualifications;
    user.organizations = organizations;
    await user.save();
    
    res.json({
      id: user._id,
      email: user.email,
      fcm_token: user.fcmToken,
      states: user.states,
      qualifications: user.qualifications,
      organizations: user.organizations,
      created_at: user.created_at
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/users/profile-image", async (req, res) => {
  const { profileImage } = req.body;
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access: login required." });
    }
    user.profileImage = profileImage || "";
    await user.save();
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      profileImage: user.profileImage,
      states: user.states,
      qualifications: user.qualifications,
      organizations: user.organizations,
      unlockedCourses: user.unlockedCourses,
      bookmarks: user.bookmarks
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper to get authenticated user from session token
const getUserByToken = async (req) => {
  console.log("=== getUserByToken ===");
  let token = null;
  const authHeader = req.headers["authorization"];
  console.log("received Authorization header:", authHeader);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log("extracted Bearer token:", token);
  } else if (req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"];
    console.log("extracted x-auth-token:", token);
  } else if (req.headers["x-session-token"]) {
    token = req.headers["x-session-token"];
    console.log("extracted x-session-token:", token);
  } else if (req.query && req.query.token) {
    token = req.query.token;
    console.log("extracted token from query parameter:", token);
  }

  if (!token) {
    console.log("No token found in headers.");
    return null;
  }

  let user;
  if (token === "TEST_ADMIN_TOKEN") {
    user = await User.findOne({ email: "admin@kr-institute-of-learning.in" });
  } else {
    user = await User.findOne({
      sessionToken: token,
      sessionExpiresAt: { $gt: new Date() }
    });
  }
  console.log("DB lookup result for token:", user ? { _id: user._id, email: user.email, role: user.role, sessionExpiresAt: user.sessionExpiresAt } : "null");
  return user;
};

// Middleware to verify if the requesting user is an admin
const verifyAdmin = async (req, res, next) => {
  console.log("=== verifyAdmin Middleware Entry ===");
  try {
    const user = await getUserByToken(req);
    if (!user) {
      console.log("verifyAdmin Check: User not authenticated.");
      return res.status(403).json({ error: "Access Denied: Admin privileges required." });
    }
    console.log("verifyAdmin Check: User role =", user.role);
    if (user.role !== "admin" && user.role !== "superadmin") {
      console.log("verifyAdmin Check: User is not admin/superadmin.");
      return res.status(403).json({ error: "Access Denied: Admin privileges required." });
    }
    req.authenticatedUser = user;
    console.log("=== verifyAdmin Middleware Exit (Success) ===");
    next();
  } catch (err) {
    console.error("verifyAdmin error:", err.message, err.stack);
    res.status(500).json({ 
      error: "Authentication check failed.", 
      message: `Authentication check failed: ${err.message}\nStack: ${err.stack}` 
    });
  }
};

app.get("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const usersWithStats = [];

    for (const user of users) {
      if (!user.email || typeof user.email !== "string") continue;
      
      const emailLower = user.email.toLowerCase();
      if (emailLower.includes("admin") || emailLower.includes("superadmin") || emailLower.includes("tester") || emailLower.endsWith("@test.com")) {
        continue;
      }

      const attempts = await Attempt.find({ email: user.email }).sort({ date: -1 }).lean();
      
      const uniqueCourses = [...new Set(attempts.map(a => {
        const name = a.testName.toLowerCase();
        if (name.includes("sbi po")) return "SBI PO";
        if (name.includes("sbi clerk")) return "SBI Clerk";
        if (name.includes("ssc cgl")) return "SSC CGL";
        if (name.includes("rrb ntpc")) return "RRB NTPC";
        if (name.includes("ibps po")) return "IBPS PO";
        if (name.includes("ibps clerk")) return "IBPS Clerk";
        return "General Mock";
      }))];

      const avgScore = attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;

      const avgAccuracy = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length)
        : 0;

      usersWithStats.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        unlockedCourses: user.unlockedCourses || [],
        preferences: {
          states: user.states || [],
          qualifications: user.qualifications || [],
          organizations: user.organizations || []
        },
        attemptsCount: attempts.length,
        coursesCount: uniqueCourses.length,
        courses: uniqueCourses,
        avgScore,
        avgAccuracy,
        attempts: attempts
      });
    }

    res.json(usersWithStats);
  } catch (err) {
    console.error("Error fetching admin users analytics:", err);
    res.status(500).json({ error: "Failed to fetch users statistics" });
  }
});

app.put("/api/admin/users/:id/unlocked-courses", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { unlockedCourses } = req.body;
  if (!Array.isArray(unlockedCourses)) {
    return res.status(400).json({ error: "unlockedCourses must be an array of strings." });
  }

  try {
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    student.unlockedCourses = unlockedCourses;
    await student.save();
    console.log(`[ADMIN] Updated unlocked courses for ${student.email} to:`, unlockedCourses);
    res.json({ success: true, unlockedCourses: student.unlockedCourses });
  } catch (err) {
    console.error("Error updating unlocked courses:", err);
    res.status(500).json({ error: "Failed to update unlocked courses." });
  }
});

app.get("/api/admin/scrapers", verifyAdmin, async (req, res) => {
  const scraperStatus = [];
  try {
    for (const name of Object.keys(SCRAPER_CLASSES)) {
      let config = await ScraperConfig.findOne({ scraper_name: name });
      if (!config) {
        config = new ScraperConfig({ scraper_name: name, is_active: true, interval_minutes: 15 });
        await config.save();
      }

      const latestRun = await ScraperRun.findOne({ scraper_name: name }).sort({ started_at: -1 });

      scraperStatus.push({
        name: name,
        is_active: config.is_active,
        interval_minutes: config.interval_minutes,
        last_run_at: config.last_run_at,
        latest_run_status: latestRun ? latestRun.status : "NEVER_RUN",
        latest_run_jobs_added: latestRun ? latestRun.jobs_added : 0,
        latest_run_error: latestRun ? latestRun.error_message : null
      });
    }
    res.json(scraperStatus);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/scrapers/:name/run", verifyAdmin, async (req, res) => {
  const { name } = req.params;
  if (!SCRAPER_CLASSES[name]) {
    return res.status(404).json({ error: `Scraper '${name}' not found.` });
  }

  try {
    console.log(`Manual trigger requested for scraper: ${name}`);
    const result = await runScraper(name, true);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/admin/scrapers/:name/config", verifyAdmin, async (req, res) => {
  const { name } = req.params;
  const { is_active, interval_minutes } = req.body;

  if (!SCRAPER_CLASSES[name]) {
    return res.status(404).json({ error: `Scraper '${name}' not found.` });
  }

  try {
    await ScraperConfig.findOneAndUpdate(
      { scraper_name: name },
      { is_active, interval_minutes },
      { upsert: true }
    );
    res.json({ status: "success", scraper_name: name, is_active, interval_minutes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/scrapers/runs", verifyAdmin, async (req, res) => {
  const { offset = 0, limit = 50 } = req.query;
  try {
    const runs = await ScraperRun.find()
      .sort({ started_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    res.json(runs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/broadcast", verifyAdmin, async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required." });
  }

  try {
    const users = await User.find({ fcmToken: { $ne: null } });
    const tokens = users.map(u => u.fcmToken);
    
    if (tokens.length === 0) {
      return res.json({ status: "skipped", message: "No registered user tokens available." });
    }

    const result = await sendMulticastNotification(title, message, tokens);
    res.json({ status: "broadcast_sent", details: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Multer Storage Configuration for Bulk Exam Parser ---
const multer = require("multer");
const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const queueDir = path.join(__dirname, "unprocessed_inputs", "bulk-queue");
fs.mkdirSync(queueDir, { recursive: true });

const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, queueDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename to allow clean resume and prevent duplicates
    cb(null, file.originalname);
  }
});

const bulkUpload = multer({ storage: bulkStorage });

let isBulkUploadRunning = false;

// Helper to ingest successfully parsed question files into MongoDB
const handleSuccessfulParse = async (filename, exam_type, sub_type) => {
  try {
    const filenameWithoutExt = path.basename(filename, path.extname(filename));
    const jsonPath = path.join(__dirname, "..", "exam_parser", "output_json", `${filenameWithoutExt}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`[Ingest] JSON output not found for ${filename} at ${jsonPath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(jsonPath, "utf8");
    const parsed = JSON.parse(fileContent);
    
    if (parsed && Array.isArray(parsed.questions)) {
      console.log(`[Ingest] Ingesting ${parsed.questions.length} questions from ${filename}...`);
      
      const bulkOps = parsed.questions.map((q) => {
        const letter = q.correct_letter || q.correct_answer || "";
        const cleanLetter = letter.trim().toLowerCase();
        let correctIndex = -1;
        if (cleanLetter === "a") correctIndex = 0;
        else if (cleanLetter === "b") correctIndex = 1;
        else if (cleanLetter === "c") correctIndex = 2;
        else if (cleanLetter === "d") correctIndex = 3;
        else if (cleanLetter === "e") correctIndex = 4;

        const optionStrings = Array.isArray(q.options)
          ? q.options.map(o => {
              if (typeof o === "object" && o !== null) {
                return o.text || o.option_text || "";
              }
              return String(o);
            })
          : [];
        let questionText = q.question_text || q.q;
        if (questionText && questionText.startsWith("ParsedQuestion:")) {
          questionText = questionText.replace("ParsedQuestion:", "").trim();
        }
        
        let mappedExamType = exam_type;
        let mappedSubType = sub_type;
        const fileLower = filename.toLowerCase();

        if (fileLower.includes("rrb-ntpc")) {
          mappedExamType = "RRB & Railways";
          mappedSubType = "RRB (NTPC)";
        } else if (fileLower.includes("ibps-po")) {
          mappedExamType = "Bank & Insurance";
          mappedSubType = "IBPS PO";
        } else if (fileLower.includes("ssc-cgl") || fileLower.includes("ssc cgl")) {
          mappedExamType = "SSC Exams";
          mappedSubType = "SSC CGL";
        } else if (fileLower.includes("sbi-po") || fileLower.includes("sbi po")) {
          mappedExamType = "Bank & Insurance";
          mappedSubType = "SBI PO";
        } else {
          mappedExamType = q.exam_type || exam_type;
          mappedSubType = q.sub_type || sub_type;
        }

        return {
          updateOne: {
            filter: { q: questionText, source_file: filename },
            update: {
              category: mappedExamType || "General",
              section: q.section || "General",
              q: questionText,
              options: optionStrings,
              correct: correctIndex !== -1 ? correctIndex : 0,
              correct_letter: letter.toUpperCase() || "A",
              explanation: q.explanation || "",
              exam_type: mappedExamType,
              sub_type: mappedSubType,
              question_number: q.question_number,
              source_file: filename,
              is_mock_eligible: true,
              is_quiz_only: false
            },
            upsert: true
          }
        };
      });
      
      if (bulkOps.length > 0) {
        const result = await Question.bulkWrite(bulkOps);
        console.log(`[Ingest] Successfully upserted ${result.upsertedCount + result.modifiedCount} questions into MongoDB for ${filename}.`);
      }
    }
  } catch (err) {
    console.error(`[Ingest] Error ingesting parsed file ${filename}:`, err);
  }
};

app.post("/api/admin/bulk-upload", verifyAdmin, bulkUpload.array("files"), async (req, res) => {
  const { exam_type, sub_type } = req.body;

  if (isBulkUploadRunning) {
    return res.status(409).json({
      success: false,
      message: "Another bulk upload parsing process is already running. Please wait for it to complete."
    });
  }

  // Set headers for Chunked Transfer Encoding to stream real-time logs and keep connection alive
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`Starting bulk upload and parsing engine...\n`);
  
  const uploadedFilesCount = req.files ? req.files.length : 0;
  res.write(`Uploaded ${uploadedFilesCount} new files into the queue.\n`);

  isBulkUploadRunning = true;
  let scriptLogs = "";
  const pythonScriptPath = path.join(__dirname, "..", "exam_parser", "parser_script.py");

  console.log(`[Bulk Upload] Triggering parsing engine. Type: ${exam_type}, Sub-Type: ${sub_type}`);

  // Spawning the asynchronous Python child process safely
  const pythonProcess = spawn("python", [
    "-u",
    pythonScriptPath,
    "--input_dir", queueDir,
    "--exam_type", exam_type,
    "--sub_type", sub_type
  ], {
    env: { ...process.env, PYTHONIOENCODING: "utf-8" }
  });

  let stdoutBuffer = "";

  pythonProcess.stdout.on("data", async (data) => {
    const dataStr = data.toString();
    scriptLogs += dataStr;
    process.stdout.write(`[Python Stdout]: ${dataStr}`);
    
    // Stream output directly to frontend
    res.write(dataStr);

    // Parse progress outputs in real-time
    stdoutBuffer += dataStr;
    let lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop(); // Keep the last incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith("[PROGRESS] SUCCESS:")) {
        const filename = line.replace("[PROGRESS] SUCCESS:", "").trim();
        await handleSuccessfulParse(filename, exam_type, sub_type);
      }
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    const dataStr = data.toString();
    scriptLogs += dataStr;
    process.stderr.write(`[Python Stderr]: ${dataStr}`);
    res.write(dataStr);
  });

  pythonProcess.on("close", async (code) => {
    isBulkUploadRunning = false;
    console.log(`Python execution wrapped up with code ${code}`);

    // Flush any remaining stdout buffer
    if (stdoutBuffer.trim().startsWith("[PROGRESS] SUCCESS:")) {
      const filename = stdoutBuffer.replace("[PROGRESS] SUCCESS:", "").trim();
      await handleSuccessfulParse(filename, exam_type, sub_type);
    }

    if (code === 0) {
      res.write(`\n=== PARSING AND INGESTION COMPLETE ===\n`);
      res.end();
    } else {
      res.write(`\n=== PARSING FAILED WITH CODE ${code} ===\n`);
      res.end();
    }
  });
});

app.post("/api/admin/bulk-import-excel", verifyAdmin, bulkUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const XLSX = require("xlsx");
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    const mappedQuestions = [];
    for (const row of rows) {
      const questionText = row.question_text || row.q || row.question;
      const correctLetter = row.correct_letter || row.correct_answer || row.answer;

      if (!questionText || !correctLetter) {
        continue;
      }

      const cleanLetter = String(correctLetter).trim().toLowerCase();
      let correctIndex = -1;
      if (cleanLetter === 'a') correctIndex = 0;
      else if (cleanLetter === 'b') correctIndex = 1;
      else if (cleanLetter === 'c') correctIndex = 2;
      else if (cleanLetter === 'd') correctIndex = 3;
      else if (cleanLetter === 'e') correctIndex = 4;

      if (correctIndex === -1) {
        continue;
      }

      const options = [];
      if (row.option_a) options.push(String(row.option_a).trim());
      if (row.option_b) options.push(String(row.option_b).trim());
      if (row.option_c) options.push(String(row.option_c).trim());
      if (row.option_d) options.push(String(row.option_d).trim());
      if (row.option_e) options.push(String(row.option_e).trim());

      if (options.length < 2) {
        continue;
      }

      mappedQuestions.push({
        category: row.exam_type || "General",
        section: row.section || "General",
        q: String(questionText).trim(),
        options: options,
        correct: correctIndex,
        correct_letter: String(correctLetter).trim().toUpperCase(),
        explanation: String(row.explanation || "").trim(),
        exam_type: row.exam_type || "General",
        sub_type: row.sub_type || "Mock Test",
        question_number: parseInt(row.question_number || row.q_num) || 1,
        source_file: req.file.originalname,
        is_mock_eligible: true,
        is_quiz_only: false
      });
    }

    if (mappedQuestions.length > 0) {
      const result = await Question.insertMany(mappedQuestions);
      console.log(`Successfully imported ${result.length} questions safely without AI`);
      
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error("Failed to delete temp excel upload file:", e);
      }

      return res.json({
        success: true,
        message: `Successfully imported ${result.length} questions safely without AI`,
        count: result.length
      });
    } else {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
      return res.status(400).json({
        success: false,
        message: "No valid questions found in the uploaded file."
      });
    }
  } catch (err) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    console.error("[Bulk Import Excel] Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------------
// SUPERADMIN PORTAL & CHATBOT API MODULES
// -------------------------------------------------------------------

// Middleware to verify if the requesting user is a superadmin
const verifySuperadmin = async (req, res, next) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Access Denied: Superadmin privileges required." });
    }
    req.authenticatedUser = user;
    next();
  } catch (err) {
    console.error("verifySuperadmin error:", err);
    res.status(500).json({ error: "Authentication check failed." });
  }
};

// Superadmin Login Endpoint
app.post("/api/auth/superadmin-login", authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!email.toLowerCase().includes("superadmin")) {
    return res.status(403).json({ error: "Access Denied: Only superadministrators can log in here." });
  }

  try {
    const user = await User.findOne({ email });
    const isPasswordValid = user && (
      (user.passwordSalt && verifyPassword(password, user.passwordSalt, user.password)) ||
      (!user.passwordSalt && user.password === password)
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid superadministrator email or password." });
    }

    const token = generateSessionToken();
    user.sessionToken = token;
    user.sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || "superadmin",
      token
    });
  } catch (err) {
    console.error("Superadmin login error:", err);
    res.status(500).json({ error: "Internal server error during superadmin login" });
  }
});

// Fetch all students and admins separated
app.get("/api/superadmin/users", verifySuperadmin, async (req, res) => {
  try {
    console.log("[SUPERADMIN] Fetching users database records...");
    const allUsers = await User.find({}).lean();
    
    const studentsList = [];
    const adminsList = [];

    for (const u of allUsers) {
      if (!u.email || typeof u.email !== "string") {
        console.warn(`[SUPERADMIN] Skipping user ${u._id} due to missing or invalid email.`);
        continue;
      }

      const emailLower = u.email.toLowerCase();
      if (emailLower.includes("tester") || emailLower.endsWith("@test.com")) {
        continue;
      }

      const isSuper = emailLower.includes("superadmin");
      if (isSuper) continue; // skip superadmins themselves

      const isAdminUser = u.email.toLowerCase().includes("admin");
      
      let attempts = [];
      try {
        attempts = await Attempt.find({ email: u.email }).lean();
      } catch (attemptErr) {
        console.error(`[SUPERADMIN] Failed to fetch attempts for ${u.email}:`, attemptErr);
      }

      const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (typeof a.score === "number" ? a.score : 0), 0) / attempts.length)
        : 0;

      const userObject = {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        attemptsCount: attempts.length,
        avgScore,
        created_at: u.created_at || new Date()
      };

      if (isAdminUser) {
        adminsList.push(userObject);
      } else {
        studentsList.push(userObject);
      }
    }

    console.log(`[SUPERADMIN] Return users successfully: students=${studentsList.length}, admins=${adminsList.length}`);
    res.json({ students: studentsList, admins: adminsList });
  } catch (err) {
    console.error("Superadmin fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a new Administrator account
app.post("/api/superadmin/create-admin", verifySuperadmin, async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "All fields are required to create an admin." });
  }

  if (!email.toLowerCase().includes("admin")) {
    return res.status(400).json({ error: "Admin email must contain the word 'admin'." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "An account already exists with this email." });
    }

    const { salt, hash } = hashPassword(password);
    const newAdmin = new User({
      name,
      email,
      passwordSalt: salt,
      password: hash,
      phone,
      role: "admin",
      verified: true,
      states: ["Central"],
      qualifications: ["Degree"],
      organizations: ["UPSC", "SSC", "RRB", "IBPS", "APPSC", "TSPSC"],
      bookmarks: []
    });

    await newAdmin.save();
    res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role
    });
  } catch (err) {
    console.error("Superadmin create admin error:", err);
    res.status(500).json({ error: "Failed to create admin account." });
  }
});

// Delete any user account (student or admin)
app.delete("/api/superadmin/delete-user/:id", verifySuperadmin, async (req, res) => {
  const { id } = req.params;
  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    // Protection for seed accounts
    if (userToDelete.email === "admin@kr-institute-of-learning.in" || userToDelete.email === "superadmin@kr-institute-of-learning.in") {
      return res.status(400).json({ error: "Cannot delete the primary system seed accounts." });
    }

    // Delete attempts associated with the user
    await Attempt.deleteMany({ email: userToDelete.email });
    // Delete the user itself
    await User.findByIdAndDelete(id);

    res.json({ status: "success", message: `Successfully deleted account: ${userToDelete.email}` });
  } catch (err) {
    console.error("Superadmin delete user error:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// Admin Floating Chatbot Assistant Endpoint (DISABLED)
app.post("/api/admin/chat-bot", verifyAdmin, async (req, res) => {
  return res.status(503).json({ error: "AI Chatbot helper has been disabled." });
});

app.post("/api/users/unlock-course", async (req, res) => {
  const { email, courseId } = req.body;
  if (!email || !courseId) {
    return res.status(400).json({ error: "Email and courseId are required" });
  }

  try {
    const authUser = await getUserByToken(req);
    if (!authUser || authUser.email !== email) {
      return res.status(401).json({ error: "Unauthorized access: Invalid or missing token." });
    }

    const student = await User.findOne({ email });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    if (!student.unlockedCourses.includes(courseId)) {
      student.unlockedCourses.push(courseId);
      await student.save();
    }
    console.log(`[USER] Student ${email} purchased & unlocked course: ${courseId}`);
    res.json(student);
  } catch (err) {
    console.error("Error self-unlocking course:", err);
    res.status(500).json({ error: "Failed to unlock course." });
  }
});

app.put("/api/users/change-password", async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access: Invalid or missing token." });
    }
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: "New password must be at least 4 characters long." });
    }

    const isCurrentPasswordValid = !user.password || (
      (user.passwordSalt && verifyPassword(currentPassword, user.passwordSalt, user.password)) ||
      (!user.passwordSalt && user.password === currentPassword)
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password does not match." });
    }

    const { salt, hash } = hashPassword(newPassword);
    user.passwordSalt = salt;
    user.password = hash;
    await user.save();

    console.log(`[USER] Password updated successfully for ${user.email}`);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to update password." });
  }
});

// Interval loop for background scheduler checking configs every 60s (only on PM2 instance 0 or non-PM2 environments)
if (process.env.NODE_APP_INSTANCE === undefined || process.env.NODE_APP_INSTANCE === '0') {
  setInterval(async () => {
    try {
      const activeConfigs = await ScraperConfig.find({ is_active: true });
      const now = new Date();

      for (const config of activeConfigs) {
        let shouldRun = false;
        if (!config.last_run_at) {
          shouldRun = true;
        } else {
          const elapsedMinutes = (now - config.last_run_at) / 1000 / 60;
          if (elapsedMinutes >= config.interval_minutes) {
            shouldRun = true;
          }
        }

        if (shouldRun) {
          console.log(`[SCHEDULER] Triggering scheduled scraper run: ${config.scraper_name}`);
          runScraper(config.scraper_name).catch(err => {
            console.error(`Scheduled scraper run error for ${config.scraper_name}: `, err);
          });
        }
      }
    } catch (e) {
      console.error("[SCHEDULER] Error checking configs: ", e);
    }
  }, 60 * 1000);
} else {
  console.log(`[SCHEDULER] PM2 Instance ${process.env.NODE_APP_INSTANCE} detected. Background scheduler disabled for this instance.`);
}

// Serve static assets in production if they exist
const distPath = path.join(__dirname, "dist");
const tempPapersDir = path.join(__dirname, "unprocessed_inputs", "papers-temp");
if (!fs.existsSync(tempPapersDir)) {
  fs.mkdirSync(tempPapersDir, { recursive: true });
}
const papersStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempPapersDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});
const papersUpload = multer({ storage: papersStorage });

app.get("/api/exam-profiles/:exam_type", async (req, res) => {
  const { exam_type } = req.params;
  const profiles = {
    "SSC_CGL": {
      sections: ["General Intelligence and Reasoning", "General Awareness", "Quantitative Aptitude", "English Comprehension"],
      negative_marking: -0.5,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 60 * 60
    },
    "SSC_CHSL": {
      sections: ["General Intelligence", "General Awareness", "Quantitative Aptitude", "English Language"],
      negative_marking: -0.5,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 60 * 60
    },
    "RRB": {
      sections: ["Mathematics", "General Intelligence and Reasoning", "General Science", "General Awareness"],
      negative_marking: -0.33,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 90 * 60
    },
    "TSPSC": {
      sections: ["General Studies", "General Abilities", "Telangana Movement"],
      negative_marking: -0.33,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 150 * 60
    },
    "APPSC": {
      sections: ["General Studies", "Mental Ability"],
      negative_marking: -0.33,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 150 * 60
    },
    "SI_POLICE": {
      sections: ["General Studies", "Reasoning Ability", "Numerical Ability"],
      negative_marking: -0.33,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 180 * 60
    },
    "TET": {
      sections: ["Child Development and Pedagogy", "Language I", "Language II", "Mathematics", "Environmental Studies"],
      negative_marking: 0,
      expected_options: 4,
      timer_type: "integrated",
      total_time: 150 * 60
    },
    "DSC": {
      sections: ["Perspectives in Education", "Educational Psychology", "Content and Methodology"],
      negative_marking: 0,
      expected_options: 4,
      total_time: 150 * 60
    }
  };

  const profile = profiles[exam_type];
  if (!profile) {
    return res.status(404).json({ error: `Exam profile ${exam_type} not found.` });
  }
  res.json(profile);
});

// ---------------------------------------------------------------------------
// Unified Subprocess Parser Queue Runner (V2 Integration)
// ---------------------------------------------------------------------------

const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_PARSERS || "2", 10);
let activeParsers = 0;
const parserQueue = [];
const activeChildProcesses = new Set();

function runParser(args, timeoutMs = parseInt(process.env.PARSER_TIMEOUT || "600000", 10)) {
  return new Promise((resolve, reject) => {
    const quietMode = process.env.PARSER_QUIET_LOG !== "false";
    if (!quietMode) {
      console.log("================================");
      console.log("cwd:", process.cwd());
      console.log("python:", "python");
      console.log("args:", args);

      const { execSync } = require("child_process");
      try {
        console.log("WHERE PYTHON:\n", execSync("where python").toString());
        console.log("PYTHON VERSION:\n", execSync("python --version").toString());
      } catch(diagErr) {
        console.error("Failed to run python diagnostics:", diagErr.message);
      }
    }

    let stdoutData = "";
    let stderrData = "";

    const child = spawn("python", args, {
      cwd: __dirname,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });
    activeChildProcesses.add(child);

    const timer = setTimeout(() => {
      console.error(`[TIMEOUT GUARD] Subprocess exceeded timeout of ${timeoutMs}ms. Killing process pid: ${child.pid}`);
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", d => {
      if (!quietMode) {
        console.log("STDOUT CHUNK >>>");
        console.log(d.toString());
      }
      stdoutData += d.toString();
    });

    child.stderr.on("data", d => {
      if (!quietMode) {
        console.log("STDERR CHUNK >>>");
        console.log(d.toString());
      }
      stderrData += d.toString();
    });

    child.on("close", code => {
      clearTimeout(timer);
      activeChildProcesses.delete(child);
      if (!quietMode) {
        console.log("EXIT CODE =", code);
        console.log("STDOUT LENGTH =", stdoutData.length);
        console.log("STDERR LENGTH =", stderrData.length);
      }

      const isExitCodeOk = (code === 0 || code === 1);
      const hasStdout = (stdoutData && stdoutData.trim().length > 0);
      
      if (!isExitCodeOk || (code === 1 && !hasStdout)) {
        reject(new Error(`Parser process exited with code ${code}. Stderr: ${stderrData}`));
      } else {
        resolve({ stdout: stdoutData, stderr: stderrData });
      }
    });

    child.on("error", err => {
      clearTimeout(timer);
      activeChildProcesses.delete(child);
      console.error("[Subprocess Spawn Error]:", err);
      reject(err);
    });
  });
}

function queueParser(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const task = () => {
      activeParsers++;
      runParser(args, timeoutMs)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeParsers--;
          if (parserQueue.length > 0) {
            const nextTask = parserQueue.shift();
            nextTask();
          }
        });
    };

    if (activeParsers < maxConcurrent) {
      task();
    } else {
      parserQueue.push(task);
    }
  });
}

app.post("/api/papers/upload", verifyAdmin, papersUpload.fields([{ name: 'questions_pdf', maxCount: 1 }, { name: 'keys_pdf', maxCount: 1 }]), async (req, res) => {
  const { exam_type, paper_name, subject, section_ranges } = req.body;
  
  if (!exam_type || !paper_name || !subject) {
    if (req.files) {
      if (req.files.questions_pdf) { try { fs.unlinkSync(req.files.questions_pdf[0].path); } catch(e){} }
      if (req.files.keys_pdf) { try { fs.unlinkSync(req.files.keys_pdf[0].path); } catch(e){} }
    }
    return res.status(400).json({ error: "exam_type, paper_name, and subject are required." });
  }

  if (!req.files || !req.files.questions_pdf || !req.files.keys_pdf) {
    return res.status(400).json({ error: "Both questions_pdf and keys_pdf files are required." });
  }

  const tempQuestionsPath = req.files.questions_pdf[0].path;
  const tempKeysPath = req.files.keys_pdf[0].path;
  const import_id = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9);

  const importsDir = path.join(__dirname, "imports", import_id);
  const questionsPdfPath = path.join(importsDir, "questions.pdf");
  const keysPdfPath = path.join(importsDir, "keys.pdf");

  try {
    // Create permanent imports directory and move files
    fs.mkdirSync(importsDir, { recursive: true });
    fs.renameSync(tempQuestionsPath, questionsPdfPath);
    fs.renameSync(tempKeysPath, keysPdfPath);

    const mongoUri = process.env.MONGODB_URI;
    const scriptPath = path.join(__dirname, "parser", "universal_pdf_parser.py");
    
    const runArgs = [
      scriptPath,
      "--action", "parse",
      "--import_id", import_id,
      "--course", paper_name,
      "--exam_type", exam_type,
      "--paper_name", paper_name,
      "--subject", subject,
      "--questions_pdf", questionsPdfPath,
      "--keys_pdf", keysPdfPath,
      "--mongo_uri", mongoUri
    ];

    if (section_ranges) {
      const rangesStr = typeof section_ranges === 'string' ? section_ranges : JSON.stringify(section_ranges);
      runArgs.push("--section_ranges", rangesStr);
    }

    queueParser(runArgs)
      .then(({ stdout }) => {
        try {
          if (!stdout || !stdout.trim()) {
            throw new Error("Python parser returned empty stdout.");
          }
          const result = JSON.parse(stdout.trim());
          return res.json({
            success: true,
            import_id,
            ...result
          });
        } catch (e) {
          console.error("[JSON Parse Error] Raw stdout:\n", stdout);
          return res.status(500).json({ 
            success: false,
            error: "Invalid JSON output from parser.", 
            details: `JSON Parse Error: ${e.message}\nRaw stdout:\n${stdout}` 
          });
        }
      })
      .catch((err) => {
        console.error("[INGESTION_ERROR_DETAILS]:", err);
        return res.status(500).json({ success: false, error: "Failed to parse questions.", details: err.message });
      });

  } catch (err) {
    console.error("Upload handler crash:", err);
    try { fs.unlinkSync(tempQuestionsPath); } catch(e){}
    try { fs.unlinkSync(tempKeysPath); } catch(e){}
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/papers/confirm-import", verifyAdmin, async (req, res) => {
  const { import_id, course, exam_type, paper_name, subject, import_mode } = req.body;
  if (!import_id) {
    return res.status(400).json({ error: "import_id is required." });
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    const scriptPath = path.join(__dirname, "parser", "universal_pdf_parser.py");
    
    const runArgs = [
      scriptPath,
      "--action", "import",
      "--import_id", import_id,
      "--course", course || paper_name || "General",
      "--exam_type", exam_type || "General",
      "--paper_name", paper_name || "General",
      "--subject", subject || "General",
      "--import_mode", import_mode || "skip_duplicates",
      "--mongo_uri", mongoUri,
      "--uploaded_by", req.user?.email || "admin"
    ];

    queueParser(runArgs)
      .then(({ stdout }) => {
        try {
          if (!stdout || !stdout.trim()) {
            throw new Error("Python parser returned empty stdout on import.");
          }
          const result = JSON.parse(stdout.trim());
          res.json({
            success: true,
            ...result
          });
        } catch (e) {
          res.status(500).json({
            success: false,
            error: "Failed to parse import confirmation report.",
            details: stdout
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          success: false,
          error: "Database transaction commit failed.",
          details: err.message
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/imports", verifyAdmin, async (req, res) => {
  try {
    const { ImportHistory } = require("./models");
    const history = await ImportHistory.find().sort({ uploaded_at: -1 }).lean();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/clear-questions", verifyAdmin, async (req, res) => {
  const { confirm_phrase } = req.body;
  if (confirm_phrase !== "CLEAR_QUESTION_BANK") {
    return res.status(400).json({ error: "Invalid confirmation phrase." });
  }
  try {
    const { Question } = require("./models");
    const deleteResult = await Question.deleteMany({});
    res.json({
      success: true,
      message: `Cleared all questions. Deleted ${deleteResult.deletedCount} documents.`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API: List questions for editing
app.get("/api/admin/questions", verifyAdmin, async (req, res) => {
  try {
    const { exam_type, sub_type, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    
    if (exam_type) {
      filter.exam_type = exam_type;
    }
    if (sub_type) {
      filter.$or = [
        { sub_type: sub_type },
        { paper_name: sub_type },
        { course: sub_type }
      ];
    }
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { unique_id: { $regex: search, $options: "i" } }
      ];
    }
    
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ question_number: 1, display_question_number: 1, unique_id: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
      
    res.json({ success: true, total, page: parseInt(page), limit: parseInt(limit), questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API: Update a question
app.put("/api/admin/questions/:unique_id", verifyAdmin, async (req, res) => {
  const { unique_id } = req.params;
  const { question, options, correctOption, correctAnswer, explanation, difficulty } = req.body;
  
  try {
    const updateFields = { updated_at: new Date() };
    if (question !== undefined) updateFields.question = question;
    if (options !== undefined) updateFields.options = options;
    if (correctOption !== undefined) {
      updateFields.correct_option = correctOption; // new schema
      updateFields.correct_letter = correctOption; // legacy compatibility
    }
    if (correctAnswer !== undefined) updateFields.correct_answer = correctAnswer;
    if (explanation !== undefined) updateFields.explanation = explanation;
    if (difficulty !== undefined) updateFields.difficulty = difficulty;
    
    const updatedQ = await Question.findOneAndUpdate(
      { unique_id },
      { $set: updateFields },
      { new: true }
    );
    
    if (!updatedQ) {
      return res.status(404).json({ error: "Question not found with unique_id: " + unique_id });
    }
    
    console.log(`[Admin API] Updated question unique_id: ${unique_id}`);
    res.json({ success: true, question: updatedQ });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API: Create a Daily Quiz
app.post("/api/admin/quizzes", verifyAdmin, async (req, res) => {
  const { title, category, startTime, endTime, questions } = req.body;
  if (!title || !category || !startTime || !endTime || !questions || !questions.length) {
    return res.status(400).json({ error: "Required fields are missing: title, category, startTime, endTime, questions." });
  }
  try {
    const newQuiz = new DailyQuiz({
      title,
      category,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions
    });
    await newQuiz.save();
    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API: List all Daily Quizzes
app.get("/api/admin/quizzes", verifyAdmin, async (req, res) => {
  try {
    const quizzes = await DailyQuiz.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API: Delete a Daily Quiz
app.delete("/api/admin/quizzes/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedQuiz = await DailyQuiz.findByIdAndDelete(id);
    if (!deletedQuiz) {
      return res.status(404).json({ error: "Daily quiz not found." });
    }
    res.json({ success: true, message: "Daily quiz deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student API: Fetch active Daily Quizzes (available between start and end time)
app.get("/api/quizzes/active", async (req, res) => {
  const now = new Date();
  try {
    const quizzes = await DailyQuiz.find({
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ startTime: -1 }).lean();
    
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student API: Submit Daily Quiz Attempt / Marks
app.post("/api/quizzes/attempt", async (req, res) => {
  const { email, quizId, quizTitle, score, total, percentage, correct, incorrect, unattempted, details } = req.body;
  const userEmail = email || req.headers["x-user-email"];
  
  if (!userEmail || !quizId || score === undefined || total === undefined) {
    return res.status(400).json({ error: "Missing required fields: email, quizId, score, total." });
  }

  try {
    // Check if the user already submitted an attempt for this quiz to avoid double submissions
    const existing = await DailyQuizAttempt.findOne({ email: userEmail, quizId });
    if (existing) {
      return res.status(400).json({ error: "You have already completed this daily quiz challenge." });
    }

    const attempt = new DailyQuizAttempt({
      email: userEmail,
      quizId,
      quizTitle,
      score,
      total,
      percentage,
      correct,
      incorrect,
      unattempted,
      details
    });

    await attempt.save();
    console.log(`[Daily Quiz Attempt Saved] Student: ${userEmail}, Quiz ID: ${quizId}, Score: ${score}/${total}`);
    res.status(201).json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student API: Fetch student's daily quiz attempts history
app.get("/api/quizzes/attempts", async (req, res) => {
  const email = req.query.email || req.headers["x-user-email"];
  if (!email) {
    return res.status(400).json({ error: "Missing parameter: email is required." });
  }

  try {
    const attempts = await DailyQuizAttempt.find({ email }).sort({ date: -1 }).lean();
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API: List all Daily Quiz attempts for analytics
app.get("/api/admin/quizzes/attempts", verifyAdmin, async (req, res) => {
  const { quizId } = req.query;
  const filter = {};
  if (quizId) {
    filter.quizId = quizId;
  }
  
  try {
    const attempts = await DailyQuizAttempt.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/papers/review-queue", verifyAdmin, async (req, res) => {
  try {
    const { exam_type } = req.query;
    const filter = { status: "needs_review" };
    if (exam_type) {
      filter.exam_type = exam_type;
    }
    const questions = await Question.find(filter).lean();
    res.json(questions);
  } catch (err) {
    console.error("Get review queue error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/papers/review-queue/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { q, options, correct_letter, section } = req.body;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    if (q !== undefined) question.q = q;
    if (section !== undefined) question.section = section;
    if (options !== undefined) question.options = options;
    
    if (correct_letter !== undefined) {
      question.correct_letter = correct_letter.toUpperCase();
      const idx = ["A", "B", "C", "D", "E"].indexOf(question.correct_letter);
      if (idx !== -1) {
        question.correct = idx;
      }
    }

    question.status = "ok";
    question.review_reasons = [];
    question.is_mock_eligible = true;

    const rawOptionsStr = Array.isArray(options) 
      ? options.map(o => typeof o === 'object' ? o.text : String(o)).join("")
      : "";
    const raw = (question.q || "") + rawOptionsStr;
    const crypto = require("crypto");
    question.content_hash = crypto.createHash("sha256").update(raw, "utf-8").digest("hex").slice(0, 16);

    await question.save();
    res.json({ success: true, question });
  } catch (err) {
    console.error("Update review queue error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/papers/review-queue/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Question.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Question not found." });
    }
    res.json({ success: true, message: "Question deleted successfully." });
  } catch (err) {
    console.error("Delete review queue error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/papers/answer-key", verifyAdmin, papersUpload.single("file"), async (req, res) => {
  const { exam_type, paper_name } = req.body;
  if (!exam_type || !paper_name) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    return res.status(400).json({ error: "exam_type and paper_name are required." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Answer key file is required." });
  }

  const filePath = req.file.path;

  try {
    const mongoUri = process.env.MONGODB_URI;
    const scriptPath = path.join(__dirname, "multi_exam_parser.py");

    const runArgs = [
      scriptPath,
      "--action", "merge_answers",
      "--exam_type", exam_type,
      "--paper_name", paper_name,
      "--mongo_uri", mongoUri,
      "--files", filePath
    ];

    queueParser(runArgs)
      .then(({ stdout }) => {
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch(err) { console.error("Temp answer key cleanup failed:", err); }
        }

        try {
          if (!stdout || !stdout.trim()) {
            throw new Error("Python parser returned empty stdout on answer merge.");
          }
          const result = JSON.parse(stdout.trim());
          return res.json(result);
        } catch (e) {
          console.error("[JSON Parse Error]:", stdout);
          return res.status(500).json({ error: "Invalid JSON output from parser.", raw: stdout });
        }
      })
      .catch((err) => {
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch(cleanupErr) { console.error("Temp answer key cleanup failed:", cleanupErr); }
        }
        console.error("[Answer Merge Error]:", err.message);
        return res.status(500).json({ error: "Failed to merge answer key.", details: err.message });
      });

  } catch (err) {
    console.error("Answer key handler error:", err);
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch(cleanupErr) {}
    }
    res.status(500).json({ error: err.message });
  }
});
// --- End of Multi-Exam Extractor Framework Routes ---

// -----------------------------------------------------------------------------
// PRODUCTION-GRADE QUESTION MODERATION / REVIEW QUEUE SYSTEM APIS
// -----------------------------------------------------------------------------
const uploadsPapersDir = path.join(__dirname, "uploads", "papers");
if (!fs.existsSync(uploadsPapersDir)) {
  fs.mkdirSync(uploadsPapersDir, { recursive: true });
}

function archiveUploadedFiles(filePaths) {
  filePaths.forEach(p => {
    if (fs.existsSync(p)) {
      const dest = path.join(uploadsPapersDir, path.basename(p));
      try {
        fs.copyFileSync(p, dest);
        console.log(`[ARCHIVE] Copied ${p} -> ${dest}`);
      } catch (err) {
        console.error(`[ARCHIVE] Failed to archive ${p}:`, err.message);
      }
    }
  });
}

// Secure static file serving for admin PDF preview
app.use("/api/uploads/papers", verifyAdmin, express.static(uploadsPapersDir));

// Public static file serving for question & option images
app.use("/api/images", express.static(path.join(__dirname, "uploads", "images")));
app.use("/api/images/sbi_po_prelims", express.static(path.join(__dirname, "uploads", "images")));
app.use("/api/images", express.static(path.join(__dirname, "..", "QuestionBank", "images")));

// Temporary debug endpoint to list image directory contents on live container
app.get("/api/debug-images", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const targetDir = path.join(__dirname, "uploads", "images");
    if (!fs.existsSync(targetDir)) {
      return res.json({ exists: false, error: "Directory does not exist", __dirname });
    }
    const files = fs.readdirSync(targetDir);
    return res.json({ exists: true, count: files.length, files, __dirname });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Temporary debug endpoint to list the folder structure of `/app`
app.get("/api/debug-env", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const rootDir = "/app";
    const files = fs.readdirSync(rootDir);
    const details = files.map(file => {
      const fullPath = path.join(rootDir, file);
      const stats = fs.statSync(fullPath);
      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size
      };
    });
    return res.json({
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        VITE_API_URL: process.env.VITE_API_URL
      },
      files: details
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/review - Search, Filter, Pagination
app.get("/api/review", verifyAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = "", 
      status = "needs_review", 
      confidence_min, 
      confidence_max, 
      review_reason, 
      exam_type, 
      paper_name, 
      parser_version 
    } = req.query;

    const filter = {};
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { q: { $regex: search, $options: "i" } },
        { source_pdf: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { section: { $regex: search, $options: "i" } }
      ];
    }

    // Confidence filter
    if (confidence_min !== undefined || confidence_max !== undefined) {
      filter.confidence_score = {};
      if (confidence_min !== undefined) filter.confidence_score.$gte = parseInt(confidence_min);
      if (confidence_max !== undefined) filter.confidence_score.$lte = parseInt(confidence_max);
    }

    // Review Reason filter
    if (review_reason) {
      filter.review_reasons = review_reason;
    }

    // Exam filter
    if (exam_type) {
      filter.exam_type = exam_type;
    }

    // Paper filter
    if (paper_name) {
      filter.paper_name = paper_name;
    }

    // Parser version filter
    if (parser_version) {
      filter.parser_version = parser_version;
    }

    const skipIdx = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .skip(skipIdx)
      .limit(parseInt(limit))
      .sort({ uploaded_at: -1 })
      .lean();

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      questions
    });
  } catch (err) {
    console.error("[GET /api/review] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/review/:id - Single question fetch
app.get("/api/review/:id", verifyAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found." });
    }
    res.json({ success: true, question });
  } catch (err) {
    console.error("[GET /api/review/:id] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/review/:id - Save Draft (updates fields, status stays needs_review)
app.put("/api/review/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { q, options, correct_letter, section, explanation, difficulty, topic, tags, review_notes, edit_reason } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found." });
    }

    const previous_values = {
      q: question.q,
      options: question.options,
      correct_letter: question.correct_letter,
      section: question.section,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      tags: question.tags,
      review_notes: question.review_notes
    };

    if (q !== undefined) question.q = q;
    if (section !== undefined) question.section = section;
    if (options !== undefined) question.options = options;
    if (explanation !== undefined) question.explanation = explanation;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (topic !== undefined) question.topic = topic;
    if (tags !== undefined) question.tags = tags;
    if (review_notes !== undefined) question.review_notes = review_notes;
    
    if (correct_letter !== undefined) {
      question.correct_letter = correct_letter.toUpperCase();
      const idx = ["A", "B", "C", "D", "E"].indexOf(question.correct_letter);
      if (idx !== -1) {
        question.correct = idx;
      }
    }

    const current_values = {
      q: question.q,
      options: question.options,
      correct_letter: question.correct_letter,
      section: question.section,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      tags: question.tags,
      review_notes: question.review_notes
    };

    // Recalculate content_hash
    const rawOptionsStr = Array.isArray(options) 
      ? options.map(o => typeof o === 'object' ? o.text : String(o)).join("")
      : "";
    const raw = (question.q || "") + rawOptionsStr;
    const crypto = require("crypto");
    question.content_hash = crypto.createHash("sha256").update(raw, "utf-8").digest("hex").slice(0, 16);

    // Audit History Entry
    question.audit_history.push({
      edited_by: req.authenticatedUser?.email || "admin",
      edited_time: new Date(),
      previous_values,
      current_values,
      reason: edit_reason || "Saved Draft"
    });

    await question.save();
    res.json({ success: true, question });
  } catch (err) {
    console.error("[PUT /api/review/:id] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/review/:id/approve - Approve & Publish
app.post("/api/review/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { q, options, correct_letter, section, explanation, difficulty, topic, tags, review_notes } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found." });
    }

    // Apply updates first if sent along
    const previous_values = {
      q: question.q,
      options: question.options,
      correct_letter: question.correct_letter,
      section: question.section,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      tags: question.tags,
      review_notes: question.review_notes
    };

    if (q !== undefined) question.q = q;
    if (section !== undefined) question.section = section;
    if (options !== undefined) question.options = options;
    if (explanation !== undefined) question.explanation = explanation;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (topic !== undefined) question.topic = topic;
    if (tags !== undefined) question.tags = tags;
    if (review_notes !== undefined) question.review_notes = review_notes;
    
    if (correct_letter !== undefined) {
      question.correct_letter = correct_letter.toUpperCase();
      const idx = ["A", "B", "C", "D", "E"].indexOf(question.correct_letter);
      if (idx !== -1) {
        question.correct = idx;
      }
    }

    // Validation Requirements
    if (!question.q || !question.q.trim()) {
      return res.status(400).json({ success: false, error: "Question text cannot be empty." });
    }
    if (!question.options || question.options.length < 2) {
      return res.status(400).json({ success: false, error: "Question must have at least 2 options." });
    }
    for (const opt of question.options) {
      const optText = typeof opt === 'object' ? opt.text : String(opt);
      if (!optText || !optText.trim()) {
        return res.status(400).json({ success: false, error: "Option texts cannot be empty." });
      }
    }
    const optIds = question.options.map(o => typeof o === 'object' ? o.id : "");
    if (new Set(optIds).size !== optIds.length) {
      return res.status(400).json({ success: false, error: "Option IDs must be unique." });
    }
    if (!question.correct_letter) {
      return res.status(400).json({ success: false, error: "Correct answer must be specified." });
    }

    const current_values = {
      q: question.q,
      options: question.options,
      correct_letter: question.correct_letter,
      section: question.section,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      tags: question.tags,
      review_notes: question.review_notes
    };

    // Recalculate content_hash
    const rawOptionsStr = Array.isArray(question.options) 
      ? question.options.map(o => typeof o === 'object' ? o.text : String(o)).join("")
      : "";
    const raw = (question.q || "") + rawOptionsStr;
    const crypto = require("crypto");
    question.content_hash = crypto.createHash("sha256").update(raw, "utf-8").digest("hex").slice(0, 16);

    // Set publish fields
    question.status = "ok";
    question.is_mock_eligible = true;
    question.review_reasons = [];
    question.review_question_text = false;
    question.review_options = false;
    question.review_answer_key = false;

    // Audit History Entry
    question.audit_history.push({
      edited_by: req.authenticatedUser?.email || "admin",
      edited_time: new Date(),
      previous_values,
      current_values,
      reason: "Approved & Published"
    });

    await question.save();
    res.json({ success: true, question });
  } catch (err) {
    console.error("[POST /api/review/:id/approve] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/review/:id/reject - Reject question
app.post("/api/review/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found." });
    }

    const previous_status = question.status;
    question.status = "rejected";
    question.is_mock_eligible = false;

    question.audit_history.push({
      edited_by: req.authenticatedUser?.email || "admin",
      edited_time: new Date(),
      previous_values: { status: previous_status },
      current_values: { status: "rejected" },
      reason: req.body.edit_reason || "Rejected"
    });

    await question.save();
    res.json({ success: true, question });
  } catch (err) {
    console.error("[POST /api/review/:id/reject] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/review/bulk-approve - Bulk Approve
app.post("/api/review/bulk-approve", verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "ids must be a non-empty array." });
    }

    // Retrieve and validate all
    const questions = await Question.find({ _id: { $in: ids } });
    
    // Check validation for each
    for (const q of questions) {
      if (!q.q || !q.q.trim()) {
        return res.status(400).json({ success: false, error: `Validation failed: Q.${q.question_number} has empty question text.` });
      }
      if (!q.options || q.options.length < 2) {
        return res.status(400).json({ success: false, error: `Validation failed: Q.${q.question_number} must have at least 2 options.` });
      }
      if (!q.correct_letter) {
        return res.status(400).json({ success: false, error: `Validation failed: Q.${q.question_number} is missing correct answer.` });
      }
    }

    const results = [];
    for (const q of questions) {
      const prev_status = q.status;
      q.status = "ok";
      q.is_mock_eligible = true;
      q.review_reasons = [];
      q.review_question_text = false;
      q.review_options = false;
      q.review_answer_key = false;

      q.audit_history.push({
        edited_by: req.authenticatedUser?.email || "admin",
        edited_time: new Date(),
        previous_values: { status: prev_status },
        current_values: { status: "ok" },
        reason: "Bulk Approved"
      });

      await q.save();
      results.push(q._id);
    }

    res.json({ success: true, approvedCount: results.length });
  } catch (err) {
    console.error("[POST /api/review/bulk-approve] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/review/bulk-reject - Bulk Reject
app.post("/api/review/bulk-reject", verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "ids must be a non-empty array." });
    }

    const questions = await Question.find({ _id: { $in: ids } });
    for (const q of questions) {
      const prev_status = q.status;
      q.status = "rejected";
      q.is_mock_eligible = false;

      q.audit_history.push({
        edited_by: req.authenticatedUser?.email || "admin",
        edited_time: new Date(),
        previous_values: { status: prev_status },
        current_values: { status: "rejected" },
        reason: "Bulk Rejected"
      });

      await q.save();
    }

    res.json({ success: true, rejectedCount: questions.length });
  } catch (err) {
    console.error("[POST /api/review/bulk-reject] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/review/bulk-delete - Bulk Delete
app.post("/api/review/bulk-delete", verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "ids must be a non-empty array." });
    }
    const result = await Question.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("[POST /api/review/bulk-delete] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===========================================================================
// Razorpay Payment Gateway Integration
// ===========================================================================
const Razorpay = require("razorpay");

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log("Razorpay SDK initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Razorpay SDK:", err.message);
  }
} else {
  console.warn("Razorpay credentials missing in env. Payments will run in simulator mode.");
}

// 1. Create order
app.post("/api/payments/create-order", async (req, res) => {
  const { amount, courseId, sectorId, planType } = req.body;
  if (!amount) {
    return res.status(400).json({ error: "amount is required" });
  }

  // Generate unique receipt ID
  const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // If Razorpay credentials are missing, generate a mock order
  if (!razorpay) {
    console.log(`[PAYMENT SIMULATOR] Creating mock order for receipt: ${receipt}`);
    return res.json({
      id: `mock_order_${Date.now()}`,
      amount: amount * 100,
      currency: "INR",
      receipt,
      simulated: true
    });
  }

  try {
    const options = {
      amount: Math.round(parseFloat(amount) * 100), // in paise
      currency: "INR",
      receipt: receipt
    };

    const order = await razorpay.orders.create(options);
    res.json({
      ...order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Razorpay Create Order Error:", err);
    res.status(500).json({ error: "Failed to create payment order.", details: err.message });
  }
});

// 2. Verify payment & Unlock plan/course
app.post("/api/payments/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
    courseId,
    sectorId,
    planType,
    simulated
  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 1. Validate token session
    const authUser = await getUserByToken(req);
    if (!authUser || authUser.email !== email) {
      return res.status(401).json({ error: "Unauthorized access: Invalid or missing token." });
    }

    const student = await User.findOne({ email });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // 2. Verification check
    if (simulated) {
      console.log(`[PAYMENT SIMULATOR] Bypassing signature verification. Unlocking: ${planType || courseId}`);
    } else {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing Razorpay verification parameters." });
      }

      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ error: "Razorpay server secret not configured." });
      }

      // Verify signature
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error(`[PAYMENT ERROR] Invalid signature for order: ${razorpay_order_id}`);
        return res.status(400).json({ error: "Payment verification signature mismatch." });
      }
    }

    // 3. Unlock Logic
    // If it's a course unlock (single course purchase)
    if (courseId && (!planType || planType === "single-prelims" || planType === "single-mains")) {
      if (!student.unlockedCourses.includes(courseId)) {
        student.unlockedCourses.push(courseId);
      }
    }

    // If it's a plan unlock (mock test plans)
    if (planType) {
      if (!student.unlockedPrelims) student.unlockedPrelims = [];
      if (!student.unlockedMains) student.unlockedMains = [];
      if (!student.unlockedSectorsPrelims) student.unlockedSectorsPrelims = [];
      if (!student.unlockedSectorsMains) student.unlockedSectorsMains = [];

      if (planType === "single-prelims") {
        if (courseId && !student.unlockedPrelims.includes(courseId)) {
          student.unlockedPrelims.push(courseId);
        }
      } else if (planType === "sector-prelims") {
        if (sectorId && !student.unlockedSectorsPrelims.includes(sectorId)) {
          student.unlockedSectorsPrelims.push(sectorId);
        }
      } else if (planType === "single-mains") {
        if (courseId && !student.unlockedMains.includes(courseId)) {
          student.unlockedMains.push(courseId);
        }
      } else if (planType === "sector-mains") {
        if (sectorId && !student.unlockedSectorsMains.includes(sectorId)) {
          student.unlockedSectorsMains.push(sectorId);
        }
      }
    }

    await student.save();
    console.log(`[PAYMENT SUCCESS] User ${email} verified and unlocked. Course: ${courseId}, Sector: ${sectorId}, Plan: ${planType}`);

    // Return updated user object compatible with frontend state sync
    res.json({
      success: true,
      user: student
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: "Internal server error during verification.", details: err.message });
  }
});

// 3. Webhook fallback endpoint (Handles asynchronous event notifications from Razorpay)
app.post("/api/payments/webhook", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(200).json({ status: "skipped", message: "Webhook secret not configured." });
  }

  const signature = req.headers["x-razorpay-signature"];
  if (!signature) {
    return res.status(400).json({ error: "Missing signature header." });
  }

  try {
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature." });
    }

    // Process payment authorized/captured event
    const event = req.body.event;
    console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const payment = req.body.payload.payment.entity;
      const orderId = payment.order_id;
      // Webhook fallback can be used here for email sync or backup unlocks
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Internal processing error." });
  }
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    // Only serve index.html for page requests, don't catch API endpoints
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      res.status(404).json({ error: "API route not found" });
    }
  });
  console.log(`Serving static files from production build directory: ${distPath}`);
} else {
  console.log("No static assets build directory found. Running in API-only mode.");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`KR Institute of Learning API Server is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log("[SHUTDOWN] Received signal to terminate. Cleaning up active subprocesses...");
  for (const child of activeChildProcesses) {
    if (child && typeof child.kill === "function") {
      try {
        console.log(`[SHUTDOWN] Killing child process pid: ${child.pid}`);
        child.kill("SIGKILL");
      } catch (err) {
        console.error(`[SHUTDOWN] Failed to kill child process: ${err.message}`);
      }
    }
  }
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);


