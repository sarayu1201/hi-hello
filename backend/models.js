const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String },
  passwordSalt: { type: String },
  otp: { type: String },
  verified: { type: Boolean, default: false },
  loginOtp: { type: String },
  fcmToken: { type: String, unique: true, sparse: true },
  states: [{ type: String }],
  qualifications: [{ type: String }],
  organizations: [{ type: String }],
  bookmarks: [{ type: String }],
  unlockedCourses: [{ type: String }],
  profileImage: { type: String, default: "" },
  sessionToken: { type: String },
  sessionExpiresAt: { type: Date },
  role: { type: String, default: "student" },
  unlockedPrelims: [{ type: String }],
  unlockedMains: [{ type: String }],
  unlockedSectorsPrelims: [{ type: String }],
  unlockedSectorsMains: [{ type: String }]
});



// Attempt Schema
const AttemptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String },
  testName: { type: String, required: true },
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  date: { type: String, required: true },
  timeSpent: { type: Number, required: true },
  details: {
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
    unattempted: { type: Number, required: true }
  },
  questions: [mongoose.Schema.Types.Mixed],
  userAnswers: mongoose.Schema.Types.Mixed
});

// Feedback / Doubt Schema
const FeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  feedback: { type: String },
  type: { type: String },
  date: { type: String }
});

// Concept Schema for Syllabus nested fields
const ConceptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weightage: { type: String, required: true },
  difficulty: { type: String, required: true }
});

// Subject Schema for Syllabus nested fields
const SubjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  concepts: [ConceptSchema]
});

// Course Schema
const CourseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  logoType: { type: String },
  price: { type: Number },
  mrp: { type: Number },
  duration: { type: String },
  facultyName: { type: String, default: "KR Academy Expert" },
  enrolledCount: { type: Number, default: 120 },
  status: { type: String, default: "Trending" }, // "New", "Trending", "Bestseller"
  image: { type: String, default: "/success_bg.png" },
  syllabus: [SubjectSchema]
});



// Question Pool Schema
const QuestionSchema = new mongoose.Schema({
  unique_id: { type: String, required: true, unique: true },
  display_question_number: { type: Number },
  course: { type: String },
  exam_type: { type: String },
  paper_name: { type: String },
  subject: { type: String },
  chapter: { type: String, default: "" },
  topic: { type: String, default: "" },
  difficulty: { type: String, default: "Medium" },
  question_type: { type: String, default: "multiple_choice" },
  question: { type: String, required: true },
  options: [{ type: String }],
  correct_option: { type: String },
  correct_answer: { type: String },
  explanation: { type: String },
  question_image: { type: String, default: "" },
  option_images: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  
  // Legacy compatibility fields (deprecated - use new standardized schema fields above)
  category: { type: String }, // @deprecated
  section: { type: String }, // @deprecated
  q: { type: String }, // @deprecated
  correct: { type: Number }, // @deprecated
  question_number: { type: Number }, // @deprecated
  source_file: { type: String }, // @deprecated
  correct_letter: { type: String }, // @deprecated
  status: { type: String, default: "ok" }, // @deprecated
  is_mock_eligible: { type: Boolean, default: true } // @deprecated
});

QuestionSchema.index({ unique_id: 1 }, { unique: true });
QuestionSchema.index({ test_id: 1 });
QuestionSchema.index({ sub_type: 1 });
QuestionSchema.index({ paper_name: 1 });
QuestionSchema.index({ test_title: 1 });
QuestionSchema.index({ course: 1 });
QuestionSchema.index({ exam_type: 1 });

// Topic Leaderboard Schema (to store leaderboard arrays)
const LeaderboardSchema = new mongoose.Schema({
  topicName: { type: String, required: true, unique: true },
  entries: [
    {
      name: { type: String, required: true },
      score: { type: Number, required: true },
      time: { type: String, required: true }
    }
  ]
});

// Job Schema
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true, index: true },
  notification_date: { type: String },
  application_start_date: { type: String },
  application_last_date: { type: String },
  vacancies: { type: Number },
  official_notification_url: { type: String, unique: true },
  official_apply_url: { type: String },
  category: { type: String },
  state: { type: String, default: "Central", index: true },
  qualification: { type: String, index: true },
  summary_english: { type: String },
  summary_telugu: { type: String },
  eligibility_summary: { type: String },
  important_dates_summary: { type: String },
  notification_sent: { type: Boolean, default: false },
  guid: { type: String, unique: true, index: true },
  created_at: { type: Date, default: Date.now }
});

// ScraperRun Schema
const ScraperRunSchema = new mongoose.Schema({
  scraper_name: { type: String, required: true },
  status: { type: String, required: true }, // "SUCCESS", "FAILED", "RUNNING"
  jobs_found: { type: Number, default: 0 },
  jobs_added: { type: Number, default: 0 },
  error_message: { type: String },
  started_at: { type: Date, default: Date.now },
  completed_at: { type: Date }
});

// ScraperConfig Schema
const ScraperConfigSchema = new mongoose.Schema({
  scraper_name: { type: String, required: true, unique: true },
  is_active: { type: Boolean, default: true },
  interval_minutes: { type: Number, default: 15 },
  last_run_at: { type: Date }
});

// Import History Schema
const ImportHistorySchema = new mongoose.Schema({
  import_id: { type: String, required: true, unique: true },
  parser_version: { type: String, default: "v1.0" },
  uploaded_at: { type: Date, default: Date.now },
  uploaded_by: { type: String },
  course: { type: String },
  exam_type: { type: String },
  paper_name: { type: String },
  subject: { type: String },
  questions_found: { type: Number },
  questions_validated: { type: Number },
  questions_imported: { type: Number },
  duplicates: { type: Number },
  rejected: { type: Number },
  elapsed_time: { type: String },
  status: { type: String }, // "PASS" | "FAIL"
  
  // Legacy compatibility fields
  duplicates_count: { type: Number },
  rejected_count: { type: Number },
  confidence_score: { type: Number },
  time_taken: { type: String }
});

const User = mongoose.model("User", UserSchema);
const Attempt = mongoose.model("Attempt", AttemptSchema);
const Feedback = mongoose.model("Feedback", FeedbackSchema);
const Course = mongoose.model("Course", CourseSchema);
const Question = mongoose.model("Question", QuestionSchema);
const Leaderboard = mongoose.model("Leaderboard", LeaderboardSchema);
const Job = mongoose.model("Job", JobSchema);
const ScraperRun = mongoose.model("ScraperRun", ScraperRunSchema);
const ScraperConfig = mongoose.model("ScraperConfig", ScraperConfigSchema);
const ImportHistory = mongoose.model("ImportHistory", ImportHistorySchema);

// Student Schema
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  assignedCourses: [{ type: String }],
  createdBy: { type: String, default: "manager" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// StudentAccess Schema
const StudentAccessSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  courseId: { type: String, required: true },
  mockTestsUnlocked: { type: Boolean, default: true },
  prelimsUnlocked: { type: Boolean, default: true },
  mainsUnlocked: { type: Boolean, default: true },
  practiceUnlocked: { type: Boolean, default: true },
  previousPapersUnlocked: { type: Boolean, default: true },
  videosUnlocked: { type: Boolean, default: true }
});

const Student = mongoose.model("Student", StudentSchema);
const StudentAccess = mongoose.model("StudentAccess", StudentAccessSchema);

module.exports = {
  User,
  Attempt,
  Feedback,
  Course,
  Question,
  Leaderboard,
  Job,
  ScraperRun,
  ScraperConfig,
  ImportHistory,
  Student,
  StudentAccess
};

