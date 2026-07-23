import { useState, useEffect } from "react";
import { Trophy, Star, TrendingUp, CheckCircle, XCircle, AlertCircle, Clock, Calendar, ArrowRight, User, Award, ShieldAlert, Zap, ChevronLeft } from "lucide-react";
import "./Results.css";
import { generateQuestionsPool, generateMockQuestionsForCategory } from "../data/exams";

const BACKEND_URL = import.meta.env.VITE_API_URL || ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')))
  ? (window.location.protocol + "//" + window.location.hostname + ":5000")
  : "");

const ensureMathDelimiters = (text) => {
  return text || "";
};

const stripLaTeX = (text) => {
  return text || "";
};

const renderLaTeX = (text, subject = "") => {
  if (!text) return "";

  // Check if there is a JSON table representation in the text
  const tableJsonMatch = text.match(/\{[\s\S]*?"headers"[\s\S]*?"rows"[\s\S]*?\}/);
  if (tableJsonMatch) {
    const beforeTable = text.substring(0, tableJsonMatch.index);
    const afterTable = text.substring(tableJsonMatch.index + tableJsonMatch[0].length);
    try {
      const tableData = JSON.parse(tableJsonMatch[0]);
      const headers = tableData.headers || [];
      const rows = tableData.rows || [];

      return (
        <div className="space-y-4 text-slate-900">
          <div>{beforeTable}</div>
          <div className="overflow-x-auto my-4 max-w-md mx-auto">
            <table className="min-w-full border-collapse border border-slate-300 rounded-lg overflow-hidden text-center shadow-sm">
              <thead className="bg-slate-100">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-slate-300 px-4 py-2 text-sm text-slate-800">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>{afterTable}</div>
        </div>
      );
    } catch (e) {
      console.warn("Failed to parse JSON table in question:", e);
    }
  }

  return <span>{text}</span>;
};

// Helper to reconstruct questions list for past attempts if they don't contain it
const reconstructAttemptQuestions = (attempt) => {
  if (!attempt) return [];
  if (attempt.questions && Array.isArray(attempt.questions) && attempt.questions.length > 0) {
    return attempt.questions;
  }

  const name = attempt.testName || "";
  let category = "Bank & Insurance";
  let courseTitle = "SBI PO";
  
  if (name.includes("SSC")) {
    category = "SSC Exams";
    courseTitle = "SSC CGL";
  } else if (name.includes("RRB") || name.includes("Railway") || name.includes("NTPC")) {
    category = "RRB & Railways";
    courseTitle = "RRB NTPC";
  } else if (name.includes("UPSC") || name.includes("Civil")) {
    category = "UPSC / Civil";
    courseTitle = "UPSC CSE";
  } else if (name.includes("JEE") || name.includes("NEET")) {
    category = "NEET / JEE";
    courseTitle = "JEE Main";
  } else if (name.includes("Police") || name.includes("TSPSC") || name.includes("State") || name.includes("AP") || name.includes("Telangana")) {
    category = "State Exams";
    courseTitle = "State Exam";
  }

  const match = name.match(/(\d+)/);
  const mockIndex = match ? parseInt(match[1]) : 1;

  try {
    const pool = generateQuestionsPool(category);
    if (name.toLowerCase().includes("quiz")) {
      return pool.slice(0, 20).map(q => ({
        ...q,
        q: q.q.replace("[Exam]", courseTitle)
      }));
    } else if (name.toLowerCase().includes("pyq")) {
      return pool.slice(10, 40).map(q => ({
        ...q,
        q: q.q.replace("[Exam]", courseTitle)
      }));
    } else {
      return generateMockQuestionsForCategory(category, pool, mockIndex, courseTitle);
    }
  } catch (err) {
    console.error("Error reconstructing questions for past attempt:", err);
    return [];
  }
};

// Helper to reconstruct mocked user answers matching the attempt score if missing
const reconstructUserAnswers = (attempt, questionsList) => {
  if (!attempt || !questionsList || questionsList.length === 0) return {};
  if (attempt.userAnswers) return attempt.userAnswers;

  const correctCount = attempt.details?.correct || Math.round(questionsList.length * (attempt.score / 100));
  const incorrectCount = attempt.details?.incorrect || (questionsList.length - correctCount - (attempt.details?.unattempted || 0));

  const userAnswers = {};
  let correctAssigned = 0;
  let incorrectAssigned = 0;

  questionsList.forEach((q, idx) => {
    if (correctAssigned < correctCount) {
      userAnswers[idx] = q.correct;
      correctAssigned++;
    } else if (incorrectAssigned < incorrectCount) {
      userAnswers[idx] = (q.correct + 1) % q.options.length; // assign incorrect option
      incorrectAssigned++;
    }
  });

  return userAnswers;
};

// Premium circular progress card component using native SVG rings
function PremiumProgressCircle({ value, label, colorCode }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="premium-metric-card" style={{
      background: "var(--white)",
      border: "1.5px solid var(--border)",
      borderRadius: "14px",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
      transition: "transform 0.2s ease",
      cursor: "default"
    }}>
      <div className="svg-container" style={{ position: "relative", width: "76px", height: "76px" }}>
        <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
          <circle 
            cx="38" 
            cy="38" 
            r={radius} 
            fill="transparent" 
            stroke="var(--bg)" 
            strokeWidth="5" 
          />
          <circle 
            cx="38" 
            cy="38" 
            r={radius} 
            fill="transparent" 
            stroke={colorCode} 
            strokeWidth="5" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "76px",
          height: "76px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Sora', sans-serif",
          fontWeight: "800",
          fontSize: "15px",
          color: "var(--navy)"
        }}>
          {value}%
        </div>
      </div>
      <span style={{
        marginTop: "8px",
        fontSize: "10px",
        fontWeight: "700",
        color: "var(--muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>{label}</span>
    </div>
  );
}

const HALL_OF_FAME = [
  { name: "Ravi Kumar Reddy",    exam: "SBI PO",           year: 2024, rank: 145,  batch: "Banking Pro" },
  { name: "Priya Lakshmi",       exam: "IBPS RRB PO",      year: 2024, rank: 89,   batch: "Banking Pro" },
  { name: "Suresh Babu",         exam: "RRB NTPC",         year: 2023, rank: 234,  batch: "Railway Batch" },
  { name: "Kavitha Devi",        exam: "SSC CGL",          year: 2023, rank: 512,  batch: "SSC Batch" },
  { name: "Nagarjuna Rao",       exam: "TSPSC Group-2",    year: 2024, rank: 67,   batch: "State Exams" },
  { name: "Sravani Patel",       exam: "SBI Clerk",        year: 2024, rank: 321,  batch: "Banking Foundation" }
];

const INITIALS_COLORS = ["#0B2F8F","#10B981","#8B5CF6","#F59E0B","#EF4444","#0EA5E9"];

export default function Results({ user, attemptHistory = [], requestAuth, navigate }) {
  const [selectedAttemptId, setSelectedAttemptId] = useState(
    attemptHistory.length > 0 ? attemptHistory[0].id : null
  );

  useEffect(() => {
    if (attemptHistory.length > 0) {
      setSelectedAttemptId(attemptHistory[0].id);
    }
  }, [attemptHistory]);

  // Typeset MathJax when results or attempt data is rendered
  useEffect(() => {
    let timer;
    const runTypeset = () => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(err => console.warn('MathJax results typesetting warning:', err));
      } else {
        timer = setTimeout(runTypeset, 200);
      }
    };
    timer = setTimeout(runTypeset, 100);
    return () => clearTimeout(timer);
  }, [selectedAttemptId, attemptHistory, activeQuestions.length]);

  const activeAttempt = attemptHistory.find(a => a.id === selectedAttemptId) || attemptHistory[0];
  const activeQuestions = activeAttempt ? reconstructAttemptQuestions(activeAttempt) : [];
  const activeUserAnswers = activeAttempt && activeQuestions.length > 0 ? reconstructUserAnswers(activeAttempt, activeQuestions) : {};

  // Calculate user aggregate metrics
  const totalTests = attemptHistory.length;
  const avgScore = totalTests > 0 
    ? Math.round(attemptHistory.reduce((sum, a) => sum + (a.score || 0), 0) / totalTests) 
    : 0;
  const avgAccuracy = totalTests > 0 
    ? Math.round(attemptHistory.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalTests) 
    : 0;

  const handleSignupGate = () => {
    requestAuth();
  };

  const handleDownloadPdfReport = (attempt, questions, userAnswers) => {
    if (!attempt) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the PDF scorecard.");
      return;
    }

    const correctCount = attempt.details?.correct || Math.round(questions.length * (attempt.score / 100));
    const incorrectCount = attempt.details?.incorrect || (questions.length - correctCount - (attempt.details?.unattempted || 0));
    const unattemptedCount = attempt.details?.unattempted || 0;
    const scoreVal = attempt.score;
    const accuracyVal = attempt.accuracy;
    const timeSpentVal = attempt.timeSpent;

    let questionsHtml = "";
    if (questions && questions.length > 0) {
      questions.forEach((q, idx) => {
        const selectedOpt = userAnswers ? userAnswers[idx] : undefined;
        const isCorrect = selectedOpt === q.correct;
        const isUnattempted = selectedOpt === undefined;
        
        let statusText = isCorrect ? "CORRECT" : isUnattempted ? "UNATTEMPTED" : "INCORRECT";
        let statusColor = isCorrect ? "#059669" : isUnattempted ? "#4B5563" : "#DC2626";
        let cardBg = isCorrect ? "#F0FDF4" : isUnattempted ? "#F9FAFB" : "#FEF2F2";
        let cardBorder = isCorrect ? "#10B981" : isUnattempted ? "#D1D5DB" : "#EF4444";

        let optionsHtml = "";
        q.options.forEach((opt, oIdx) => {
          const isCorrectOpt = oIdx === q.correct;
          const isSelectedOpt = oIdx === selectedOpt;
          let optBg = "white";
          let optBorder = "#E5E7EB";
          let optColor = "#1F2937";
          let optBold = "normal";

          if (isCorrectOpt) {
            optBg = "#D1FAE5";
            optBorder = "#10B981";
            optColor = "#065F46";
            optBold = "bold";
          } else if (isSelectedOpt) {
            optBg = "#FEE2E2";
            optBorder = "#EF4444";
            optColor = "#991B1B";
            optBold = "bold";
          }

          optionsHtml += `
            <div style="background: ${optBg}; border: 1.5px solid ${optBorder}; color: ${optColor}; font-weight: ${optBold}; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 18px; height: 18px; border-radius: 50%; background: ${isCorrectOpt ? '#10B981' : isSelectedOpt ? '#EF4444' : '#94A3B8'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">
                ${String.fromCharCode(65 + oIdx)}
              </span>
              <span>${opt}</span>
              ${isCorrectOpt ? ' <span style="margin-left: auto; font-size: 11px; background: #10B981; color: white; padding: 1px 6px; border-radius: 10px; font-weight: bold;">Correct Answer</span>' : ''}
              ${isSelectedOpt && !isCorrectOpt ? ' <span style="margin-left: auto; font-size: 11px; background: #EF4444; color: white; padding: 1px 6px; border-radius: 10px; font-weight: bold;">Your Answer</span>' : ''}
            </div>
          `;
        });

        questionsHtml += `
          <div style="background: ${cardBg}; border: 1.5px solid ${cardBorder}; padding: 20px; border-radius: 8px; margin-bottom: 20px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${cardBorder}; padding-bottom: 8px; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 800; color: #4B5563; text-transform: uppercase;">
                Question ${idx + 1} &bull; ${q.section}
              </span>
              <span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800;">
                ${statusText}
              </span>
            </div>
            <p style="font-size: 15px; font-weight: 700; margin: 0 0 12px 0; color: #111827;">${q.q}</p>
            <div>${optionsHtml}</div>
            ${q.explanation ? `
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #D1D5DB; font-size: 12.5px; color: #4B5563; line-height: 1.4;">
                <strong>💡 Explanation:</strong> ${q.explanation}
              </div>
            ` : ""}
          </div>
        `;
      });
    } else {
      questionsHtml = `
        <div style="text-align: center; padding: 30px; border: 1px solid #E5E7EB; border-radius: 8px; color: #4B5563;">
          <p>Detailed scorecard question review is not available for this record.</p>
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>KR Institute of Learning Scorecard - ${attempt.testName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1E293B; margin: 0; padding: 30px; background: white; }
          .header-banner { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: white; padding: 30px 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .logo { font-size: 28px; font-weight: 800; color: #FF8A00; letter-spacing: 0.5px; margin-bottom: 5px; }
          .subtitle { font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
          .title { font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 16px 0 4px 0; }
          .date { font-size: 12px; color: #CBD5E1; }
          
          .certificate-box { background: #FFF4E6; border: 1.5px dashed #FF8A00; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; }
          .certificate-box h3 { margin: 0 0 4px 0; color: #E07A00; font-size: 15px; font-weight: 700; }
          .certificate-box p { margin: 0; color: #64748B; font-size: 12.5px; }

          .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 12px; text-align: center; }
          .stat-num { display: block; font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 2px; }
          .stat-lbl { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; }
          
          .section-title { font-size: 15px; font-weight: 800; color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; margin: 24px 0 16px 0; text-transform: uppercase; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #FF8A00; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 10px rgba(255, 138, 0, 0.2);">
            Print / Save as PDF
          </button>
        </div>
        
        <div class="header-banner">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Competitive Exam Hub</div>
          <div class="title">OFFICIAL SCORECARD & PERFORMANCE REPORT</div>
          <div class="date">Attempted on: ${attempt.date || new Date().toLocaleDateString()}</div>
        </div>

        <div class="certificate-box">
          <h3>Test: ${attempt.testName}</h3>
          <p>Verified Mock Performance Report under timed conditions, generated from KR Institute of Learning Competitive Exam Hub.</p>
        </div>
 
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-num">${scoreVal}%</span>
            <span class="stat-lbl">Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${accuracyVal}%</span>
            <span class="stat-lbl">Accuracy</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${correctCount} Qs</span>
            <span class="stat-lbl">Correct</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${incorrectCount} Qs</span>
            <span class="stat-lbl">Incorrect</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${timeSpentVal} mins</span>
            <span class="stat-lbl">Time Spent</span>
          </div>
        </div>
 
        <div class="section-title">EVALUATION DETAIL & REVIEW</div>
        <div>${questionsHtml}</div>
 
        <div class="footer">
          <p>This is an official system-generated scorecard from KR Institute of Learning Platform.</p>
          <p>© 2026 KR Institute of Learning Hub. All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Mock sectional performance data for the active test
  const getSectionData = (attempt) => {
    if (!attempt) return [];
    
    // Distribute correct/incorrect count mockingly based on actual score
    const correct = attempt.details?.correct || 0;
    const incorrect = attempt.details?.incorrect || 0;
    const unattempted = attempt.details?.unattempted || 0;

    // Distribute to 3 sections
    return [
      { name: "Quantitative Aptitude", total: 3, correct: Math.min(3, Math.round(correct * 0.4)), incorrect: Math.min(2, Math.round(incorrect * 0.3)), time: "22m" },
      { name: "Reasoning Ability", total: 3, correct: Math.min(3, Math.round(correct * 0.4)), incorrect: Math.min(2, Math.round(incorrect * 0.4)), time: "18m" },
      { name: "English Language", total: 2, correct: Math.min(2, Math.round(correct * 0.2)), incorrect: Math.min(2, Math.round(incorrect * 0.3)), time: "12m" }
    ];
  };

  const sectionData = getSectionData(activeAttempt);

  return (
    <div className="results-page">
      <div className="back-home-wrapper">
        <button className="btn-back-home" onClick={() => navigate("home")}>
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>
      <div className="page-hero">
        <h1>Results <span>& Analytics</span></h1>
        <p>Analyze your progress, monitor accuracy trends, and match up with test-toppers.</p>
      </div>

      <div className="results-body">
        {/* If user is logged in, display the Performance Analytics Dashboard */}
        {user ? (
          <div className="analytics-dashboard">
            <h2>📈 Welcome back, {user.name}!</h2>
            <p className="dash-sub">Here is your customized mock-test performance report.</p>

            {/* Overall Stats Cards */}
            <div className="stats-summary-grid">
              <div className="summary-card">
                <div className="card-icon blue"><Trophy size={20}/></div>
                <div className="card-info">
                  <span className="card-num">{totalTests}</span>
                  <span className="card-label">Total Mocks Attempted</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon gold"><TrendingUp size={20}/></div>
                <div className="card-info">
                  <span className="card-num">{avgScore}%</span>
                  <span className="card-label">Average Score</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon green"><Star size={20}/></div>
                <div className="card-info">
                  <span className="card-num">{avgAccuracy}%</span>
                  <span className="card-label">Average Accuracy</span>
                </div>
              </div>
            </div>

            {activeAttempt ? (
              <div className="details-pane-wrapper">
                {/* Selected Test Attempt Analytics */}
                <div className="attempt-details-card">
                  <div className="attempt-details-header">
                    <div>
                      <span className="details-tag">Selected Attempt Analysis</span>
                      <h3>{activeAttempt?.testName || ""}</h3>
                    </div>
                    <div className="attempt-date-badge">
                      <Calendar size={13}/> {activeAttempt?.date || ""}
                    </div>
                  </div>

                  <div className="attempt-details-grid">
                    <div className="circular-progress-section">
                      <div className="metrics-box" style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                        <PremiumProgressCircle value={activeAttempt?.score ?? 0} label="Score" colorCode="var(--blue)" />
                        <PremiumProgressCircle value={activeAttempt?.accuracy ?? 0} label="Accuracy" colorCode="var(--green)" />
                      </div>
                      <div className="time-metric">
                        <Clock size={14}/> Time Spent: <strong>{activeAttempt?.timeSpent ?? 0} mins</strong>
                      </div>

                      {/* Topper Comparison (Oliveboard feature) */}
                      <div className="topper-comparison-widget">
                        <h4>Topper Comparison</h4>
                        <div className="tc-grid">
                          <div className="tc-bar-item">
                            <span className="tc-bar-val text-blue">{activeAttempt?.score ?? 0}%</span>
                            <div className="tc-progress-container"><div className="tc-progress-fill bg-blue" style={{height: `${activeAttempt?.score ?? 0}%`}}/></div>
                            <span className="tc-bar-lbl">You</span>
                          </div>
                          <div className="tc-bar-item">
                            <span className="tc-bar-val text-gold">94%</span>
                            <div className="tc-progress-container"><div className="tc-progress-fill bg-gold" style={{height: "94%"}}/></div>
                            <span className="tc-bar-lbl">Topper</span>
                          </div>
                          <div className="tc-bar-item">
                            <span className="tc-bar-val text-gray">68%</span>
                            <div className="tc-progress-container"><div className="tc-progress-fill bg-gray" style={{height: "68%"}}/></div>
                            <span className="tc-bar-lbl">Cutoff</span>
                          </div>
                        </div>
                        <div className="cutoff-status">
                          {(activeAttempt?.score ?? 0) >= 68 ? (
                            <span className="status-badge passed">Passed Cutoff 🎉</span>
                          ) : (
                            <span className="status-badge failed">Failed Cutoff (Aim for &gt;68%)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="questions-breakdown-section">
                      <h4>Answer Breakdown</h4>
                      <div className="breakdown-list">
                        <div className="breakdown-item correct">
                          <CheckCircle size={16}/>
                          <span className="label">Correct Answers</span>
                          <span className="val">+{activeAttempt?.details?.correct ?? 0} Qs</span>
                        </div>
                        <div className="breakdown-item incorrect">
                          <XCircle size={16}/>
                          <span className="label">Incorrect Answers</span>
                          <span className="val">-{activeAttempt?.details?.incorrect ?? 0} Qs</span>
                        </div>
                        <div className="breakdown-item unattempted">
                          <AlertCircle size={16}/>
                          <span className="label">Unattempted Questions</span>
                          <span className="val">{activeAttempt?.details?.unattempted ?? 0} Qs</span>
                        </div>
                      </div>

                      {/* Sectional Performance Table (Oliveboard structure) */}
                      <div className="sectional-performance-card">
                        <h4>Sectional Analysis</h4>
                        <div className="sectional-table-wrapper">
                          <table className="sectional-table">
                            <thead>
                              <tr>
                                <th>Section</th>
                                <th>Correct</th>
                                <th>Accuracy</th>
                                <th>Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sectionData.map((sec, i) => {
                                const acc = sec.correct + sec.incorrect > 0 
                                  ? Math.round((sec.correct / (sec.correct + sec.incorrect)) * 100) 
                                  : 0;
                                return (
                                  <tr key={i}>
                                    <td className="sec-table-name">{sec.name.split(" ")[0]}</td>
                                    <td>{sec.correct}/{sec.total}</td>
                                    <td className={acc >= 80 ? "text-green" : acc >= 50 ? "text-gold" : "text-red"}>
                                      {acc}%
                                    </td>
                                    <td>{sec.time}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Difficulty-wise Accuracy Analysis */}
                      <div className="difficulty-analysis-card">
                        <h4>Difficulty Accuracy Analysis</h4>
                        <div className="diff-analysis-grid">
                          <div className="diff-bar-row">
                            <span className="diff-label">Easy</span>
                            <div className="diff-bar-track">
                              <div className="diff-bar-fill bg-green" style={{ width: (activeAttempt?.score ?? 0) >= 50 ? "90%" : "60%" }}/>
                            </div>
                            <span className="diff-val">{(activeAttempt?.score ?? 0) >= 50 ? "90%" : "60%"}</span>
                          </div>
                          <div className="diff-bar-row">
                            <span className="diff-label">Medium</span>
                            <div className="diff-bar-track">
                              <div className="diff-bar-fill bg-gold" style={{ width: (activeAttempt?.score ?? 0) >= 70 ? "75%" : "40%" }}/>
                            </div>
                            <span className="diff-val">{(activeAttempt?.score ?? 0) >= 70 ? "75%" : "40%"}</span>
                          </div>
                          <div className="diff-bar-row">
                            <span className="diff-label">Hard</span>
                            <div className="diff-bar-track">
                              <div className="diff-bar-fill bg-red" style={{ width: (activeAttempt?.score ?? 0) >= 80 ? "40%" : "10%" }}/>
                            </div>
                            <span className="diff-val">{(activeAttempt?.score ?? 0) >= 80 ? "40%" : "10%"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="strength-card">
                        <h5>💡 Recommendation:</h5>
                        <p>
                          {(activeAttempt?.accuracy ?? 0) >= 80 
                            ? "Excellent accuracy! Focus on speed. Try solving speed-drills in Quantitative Aptitude to shave off seconds."
                            : "Accuracy is below 80%. Re-read the explanations for your incorrect questions to clear concept gaps."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Question Review List */}
                  <div className="detailed-question-review no-print" style={{ marginTop: '24px', padding: '24px', borderTop: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>📋 Question-by-Question Review</h4>
                      <button className="btn-download-pdf-report" onClick={() => handleDownloadPdfReport(activeAttempt, activeQuestions, activeUserAnswers)} style={{
                        background: 'var(--blue)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '12.5px',
                        boxShadow: '0 4px 10px rgba(49, 130, 206, 0.2)'
                      }}>
                        📥 Download Scorecard PDF
                      </button>
                    </div>
                    {activeQuestions && activeQuestions.length > 0 ? (
                      <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeQuestions.map((q, idx) => {
                          const selectedOpt = activeUserAnswers ? activeUserAnswers[idx] : undefined;
                          const isCorrect = selectedOpt === q.correct;
                          const isUnattempted = selectedOpt === undefined;

                          return (
                            <div key={idx} className={`review-question-card`} style={{
                              padding: '18px',
                              borderRadius: '8px',
                              border: '1.5px solid',
                              borderColor: isCorrect ? '#A7F3D0' : isUnattempted ? '#CBD5E1' : '#FCA5A5',
                              background: isCorrect ? 'var(--gold-bg)' : isUnattempted ? 'var(--bg)' : 'rgba(239, 68, 68, 0.05)',
                              color: 'var(--text)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                                  Question {idx + 1} &bull; {q.section}
                                </span>
                                <span className="review-status-badge" style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  background: isCorrect ? 'var(--green)' : isUnattempted ? 'var(--muted)' : 'var(--red)',
                                  color: 'white'
                                }}>
                                  {isCorrect ? '✓ Correct' : isUnattempted ? '⚠️ Unattempted' : '✗ Incorrect'}
                                </span>
                              </div>
                              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px', lineHeight: '1.4' }}>{renderLaTeX(q.q, q.subject || q.section)}</p>
                              {q.question_image && (
                                <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {(Array.isArray(q.question_image) 
                                    ? q.question_image 
                                    : (typeof q.question_image === 'string' && q.question_image.includes(','))
                                      ? q.question_image.split(',').map(s => s.trim())
                                      : [q.question_image]
                                  ).map((imgSrc, imgIdx) => (
                                    <img 
                                      key={imgIdx}
                                      src={`${BACKEND_URL}/api/images/${imgSrc}`} 
                                      alt={`Question diagram ${imgIdx + 1}`} 
                                      style={{ maxHeight: '180px', width: 'auto', display: 'block', borderRadius: '4px', border: '1px solid var(--border)' }}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ))}
                                </div>
                              )}
                              <div className="review-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                                {(q.options || []).map((opt, oIdx) => {
                                  const isOptionCorrect = oIdx === q.correct;
                                  const isOptionSelected = oIdx === selectedOpt;
                                  const optImg = q.option_images ? q.option_images[oIdx] : null;
                                  
                                  let optBg = 'var(--white)';
                                  let optBorder = 'var(--border)';
                                  let optColor = 'var(--text)';
                                  let optWeight = 'normal';
                                  
                                  if (isOptionCorrect) {
                                    optBg = 'rgba(16, 185, 129, 0.15)';
                                    optBorder = 'var(--green)';
                                    optColor = 'var(--text)';
                                    optWeight = '800';
                                  } else if (isOptionSelected) {
                                    optBg = 'rgba(239, 68, 68, 0.15)';
                                    optBorder = 'var(--red)';
                                    optColor = 'var(--text)';
                                    optWeight = '800';
                                  }

                                  return (
                                    <div key={oIdx} style={{
                                      padding: '10px 14px',
                                      borderRadius: '6px',
                                      border: '1.5px solid',
                                      borderColor: optBorder,
                                      fontSize: '13px',
                                      background: optBg,
                                      color: optColor,
                                      fontWeight: optWeight,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                      gap: '6px'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '50%',
                                          background: isOptionCorrect ? 'var(--green)' : isOptionSelected ? 'var(--red)' : 'var(--muted)',
                                          color: 'white',
                                          fontSize: '11px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: '800'
                                        }}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <span>{!optImg && renderLaTeX(opt, q.subject || q.section)}</span>
                                      </div>
                                      {optImg && (
                                        <div style={{ marginTop: '4px' }}>
                                          <img 
                                            src={`${BACKEND_URL}/api/images/${optImg}`} 
                                            alt={`Option ${String.fromCharCode(65 + oIdx)} diagram`}
                                            style={{ maxHeight: '80px', width: 'auto', borderRadius: '2px', border: '1px solid var(--border)' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {q.explanation && (
                                <div className="mathjax-process" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed var(--border)', fontSize: '13px', color: 'var(--text)', opacity: 0.95, lineHeight: '1.4' }}>
                                   <strong>💡 Explanation:</strong> {stripLaTeX(q.explanation)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'var(--muted)' }}>
                        <p style={{ margin: 0, fontSize: '13.5px' }}>
                          Detailed scorecard question review is only available for mock tests completed in this session.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left/Sidebar Attempt Selection List */}
                <div className="attempts-history-list">
                  <h4>Attempt History</h4>
                  <div className="history-scroll">
                    {attemptHistory.map((att) => (
                      <button 
                        key={att.id} 
                        className={`history-item-row ${(activeAttempt?.id) === att.id ? "active" : ""}`}
                        onClick={() => setSelectedAttemptId(att.id)}
                      >
                        <div className="hist-name-block">
                          <div className="hist-test-name">{att.testName}</div>
                          <span className="hist-date">{att.date}</span>
                        </div>
                        <div className="hist-score-block">
                          <span className="hist-score">{att.score}%</span>
                          <span className="hist-acc">Acc: {att.accuracy}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="btn-take-more" onClick={() => navigate("mocktests")}>
                    Practice More Tests &arr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-attempts-banner">
                <AlertCircle size={40} color="var(--accent)"/>
                <h3>No mock test attempts recorded yet.</h3>
                <p>Start a free mock test to view detailed analytics on your progress, speed, and accuracy.</p>
                <button className="btn-start-first-mock" onClick={() => navigate("mocktests")}>
                  Start Free Mock Test <ArrowRight size={15}/>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="login-prompt-banner">
            <Trophy size={48} color="var(--accent)"/>
            <h2>Sign Up for Custom Analytics</h2>
            <p>Access custom scorecards, error logs, speed tracking and comparisons with state toppers.</p>
            <button className="btn-login-dashboard" onClick={handleSignupGate}>
              Sign Up / Sign In Now
            </button>
          </div>
        )}

        {/* Hall of Fame / KR Institute of Learning Success Stories */}
        <div className="hall-of-fame-section">
          <div className="hof-header">
            <h2>🏆 Our Selection Toppers</h2>
            <p>Recent selected students from KR Institute of Learning who cracked major recruitment exams.</p>
          </div>

          <div className="results-grid">
            {HALL_OF_FAME.map((r, i) => (
              <div className="result-card" key={r.name}>
                <div className="rc-avatar" style={{background: INITIALS_COLORS[i % INITIALS_COLORS.length]}}>
                  {r.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                </div>
                <div className="rc-info">
                  <div className="rc-name">{r.name}</div>
                  <div className="rc-exam">{r.exam} {r.year}</div>
                  <div className="rc-rank"><Star size={12} fill="currentColor"/>Rank {r.rank}</div>
                  <div className="rc-batch">{r.batch}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
