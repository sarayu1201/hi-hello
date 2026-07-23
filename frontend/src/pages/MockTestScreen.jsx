import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, Unlock, Clock, AlertTriangle, CheckCircle2, Send, Maximize2
} from "lucide-react";
import ResultCard from "../components/ResultCard";
import axios from "axios";

/**
 * Live LaTeX Formatter
 * Parses and formats math equations written in $...$ (inline) or $$...$$ (display blocks)
 */
const ensureMathDelimiters = (text) => {
  if (!text) return "";
  const str = String(text).trim();
  
  if (str.includes("$")) {
    return str;
  }
  
  // If it's a single formula token without spaces
  if (!str.includes(" ")) {
    if (str.includes("\\") || str.includes("^") || str.includes("_")) {
      return `$${str}$`;
    }
    return str;
  }
  
  // Split by spaces and wrap only specific math-containing words
  const words = str.split(" ");
  const mappedWords = words.map(word => {
    const cleanWord = word.trim();
    if (!cleanWord) return "";
    
    if (cleanWord.includes("\\") || cleanWord.includes("^") || cleanWord.includes("_")) {
      if (cleanWord.startsWith("$") && cleanWord.endsWith("$")) {
        return cleanWord;
      }
      
      // Preserve punctuation at the end of the math token (e.g. commas or periods: "120cm^2,")
      const punctuationMatch = cleanWord.match(/[,.;?]+$/);
      if (punctuationMatch) {
        const punctuation = punctuationMatch[0];
        const mathPart = cleanWord.slice(0, -punctuation.length);
        return `$${mathPart}$${punctuation}`;
      }
      
      return `$${cleanWord}$`;
    }
    return word;
  });
  
  return mappedWords.join(" ");
};

const cleanMathText = (text) => {
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
        <div className="space-y-4 mathjax-process text-slate-900">
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

  return <span className="mathjax-process">{text}</span>;
};

const getSectionTimeLimit = (examType) => {
  const cleanType = String(examType || "").toLowerCase().trim();
  if (cleanType.includes("bank")) return 20 * 60;
  if (cleanType.includes("ssc")) return 20 * 60;
  if (cleanType.includes("rrb") || cleanType.includes("railway")) return 20 * 60;
  if (cleanType.includes("neet") || cleanType.includes("jee")) return 60 * 60;
  return 20 * 60;
};

export default function MockTestScreen({ mockData, loading = false, user, timeLimit, examName, onSubmit, onGoBack }) {
  // --- Refs ---
  const hasInitializedRef = useRef(false);
  const lastTestSignatureRef = useRef("");

  // --- State Declarations ---
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStatusText, setSubmitStatusText] = useState("Analyzing response sheet...");

  // Sections & Questions
  const [examType, setExamType] = useState("SSC");
  const [subType, setSubType] = useState("CGL Tier-1");
  const [sections, setSections] = useState({}); // { "Section Name": [QuestionObjects] }
  const [activeSection, setActiveSection] = useState("");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0); // local index inside active section
  
  // Responses & Statuses
  const [answers, setAnswers] = useState({}); // { question_number: option_id }
  const [questionStatus, setQuestionStatus] = useState({}); // { question_number: 'answered' | 'marked-review' | 'not-answered' | 'visited' }
  
  // Timers & Locks
  const [examProfile, setExamProfile] = useState(null);
  const [timeLimitType, setTimeLimitType] = useState("integrated"); // 'integrated' | 'sectional'
  const [currentTimeLeft, setCurrentTimeLeft] = useState(3600); // countdown in seconds
  const [lockedSections, setLockedSections] = useState(new Set()); // locked section names (IBPS pattern)
  
  // Cheating & Security
  const [warningsCount, setWarningsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const BACKEND_URL = import.meta.env.VITE_API_URL || ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')))
  ? (window.location.protocol + "//" + window.location.hostname + ":5000")
  : "");

  // Typeset math equations whenever question, section, or examStarted changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch(err => console.warn('MathJax typesetting warning:', err));
      }, 80);
    }
  }, [currentQuestionIdx, activeSection, sections, examStarted]);

  // Dynamic Tailwind CDN Injection & Styles
  useEffect(() => {
    // Inject Tailwind Play CDN dynamically for this component if it's not present
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    // Inject custom styles for scrollbar hiding and selection blocking
    if (!document.getElementById("exam-screen-styles")) {
      const style = document.createElement("style");
      style.id = "exam-screen-styles";
      style.innerHTML = `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          background-color: #f4f6f9 !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Clean up global selection block on exit
      const style = document.getElementById("exam-screen-styles");
      if (style) style.remove();
    };
  }, []);

  // --- Exam initialization, Shuffling (Fisher-Yates) & Sectioning ---
  useEffect(() => {
    if (!mockData || !mockData.questions || mockData.questions.length === 0) return;
    
    const signature = `${mockData.questions.length}_${mockData.questions[0].sub_type || 'test'}_${mockData.questions[0].exam_type || 'type'}`;
    if (lastTestSignatureRef.current !== signature) {
      hasInitializedRef.current = false;
      lastTestSignatureRef.current = signature;
      setExamStarted(false);
      setExamSubmitted(false);
      setAnswers({});
      setQuestionStatus({});
      setLockedSections(new Set());
      setWarningsCount(0);
      setShowWarningModal(false);
    }
    
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    const rawQuestions = [...mockData.questions];
    const detectedExamType = rawQuestions[0].exam_type || "SSC";
    const detectedSubType = rawQuestions[0].sub_type || "Mock Test";
    setExamType(detectedExamType);
    setSubType(detectedSubType);
    
    // Group raw questions by their predefined section, or dynamic partition
    let sectionMap = {};
    const appearanceOrder = [];
    const hasPredefinedSections = rawQuestions.some(q => (q.section && q.section !== "General" && q.section !== "default") || (q.subject && q.subject !== "General"));
    
    if (hasPredefinedSections) {
      rawQuestions.forEach(q => {
        let sec = q.section || q.subject || "General";
        if (!appearanceOrder.includes(sec)) {
          appearanceOrder.push(sec);
        }
        if (!sectionMap[sec]) sectionMap[sec] = [];
        sectionMap[sec].push(q);
      });
    } else if (detectedExamType === "Banking" || detectedExamType === "Bank & Insurance" || detectedExamType === "IBPS CLERK PRELIMS") {
      const total = rawQuestions.length;
      const s1 = Math.floor(total * 0.3); // English
      const s2 = Math.floor(total * 0.35); // Quant
      sectionMap = {
        "English Language": rawQuestions.slice(0, s1),
        "Numerical Ability": rawQuestions.slice(s1, s1 + s2),
        "Reasoning Ability": rawQuestions.slice(s1 + s2)
      };
      appearanceOrder.push("English Language", "Numerical Ability", "Reasoning Ability");
    } else if (detectedExamType === "SSC" || detectedExamType === "SSC Exams" || detectedExamType === "RRB" || detectedExamType === "RRB & Railways") {
      const total = rawQuestions.length;
      const size = Math.floor(total / 4);
      sectionMap = {
        "General Intelligence and Reasoning": rawQuestions.slice(0, size),
        "General Knowledge and General Awareness": rawQuestions.slice(size, size * 2),
        "Mathematics": rawQuestions.slice(size * 2, size * 3),
        "English Language": rawQuestions.slice(size * 3)
      };
      appearanceOrder.push("General Intelligence and Reasoning", "General Knowledge and General Awareness", "Mathematics", "English Language");
    } else {
      sectionMap = {
        "General Studies & Mental Ability": rawQuestions
      };
      appearanceOrder.push("General Studies & Mental Ability");
    }

    // Preserve exact exam section order based on appearance in test paper
    const secKeys = Object.keys(sectionMap).sort((a, b) => {
      const ia = appearanceOrder.indexOf(a);
      const ib = appearanceOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    const finalizedSections = {};
    secKeys.forEach(secName => {
      const questionsList = [...sectionMap[secName]];
      if (questionsList.length > 0) {
        finalizedSections[secName] = questionsList;
      }
    });

    setSections(finalizedSections);
    
    // Set initial active section
    const secNames = Object.keys(finalizedSections);
    if (secNames.length > 0) {
      setActiveSection(secNames[0]);
      setCurrentQuestionIdx(0);
      
      // Mark first question of first section as visited
      const firstQNum = finalizedSections[secNames[0]][0].question_number;
      setQuestionStatus(prev => ({ ...prev, [firstQNum]: prev[firstQNum] || "not-answered" }));
    }

    // Timer and Section lock configurations
    if (examName && examName.toUpperCase().includes("SBI PO")) {
      setTimeLimitType("integrated");
      setCurrentTimeLeft((timeLimit || 120) * 60);
    } else {
      const isRrbOrIntegratedExam = (
        String(examName || "").toLowerCase().includes("rrb") ||
        String(detectedExamType || "").toLowerCase().includes("rrb") ||
        String(mockData?.course || "").toLowerCase().includes("rrb") ||
        (timeLimit && timeLimit > 0)
      );

      if (isRrbOrIntegratedExam) {
        setTimeLimitType("integrated");
        setCurrentTimeLeft((timeLimit || 45) * 60);
        setLockedSections(new Set());
      } else {
        axios.get(`${BACKEND_URL}/api/exam-profiles/${detectedExamType}`)
          .then(res => {
            const profile = res.data;
            setExamProfile(profile);
            if (profile.timer_type === "sectional") {
              setTimeLimitType("sectional");
              setCurrentTimeLeft(profile.section_time || 20 * 60);
            } else {
              setTimeLimitType("integrated");
              setCurrentTimeLeft((timeLimit || 60) * 60);
              setLockedSections(new Set());
            }
          })
          .catch(err => {
            console.error("Failed to load exam profile, falling back:", err);
            setTimeLimitType("integrated");
            setCurrentTimeLeft((timeLimit || 60) * 60);
            setLockedSections(new Set());
          });
      }
    }

  }, [mockData]);

  // --- Countdown Clock Tick Timer ---
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const timer = setInterval(() => {
      setCurrentTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, activeSection, timeLimitType]);

  // Track Fullscreen status change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Trigger warning if user exits fullscreen during active test
      if (examStarted && !examSubmitted && !isSubmitting && !document.fullscreenElement) {
        triggerCheatingWarning();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [examStarted, examSubmitted, isSubmitting]);

  // --- Cheating Prevention (Visibility & Focus) ---
  useEffect(() => {
    if (!examStarted || examSubmitted || isSubmitting) return;

    const handleVisibility = () => {
      if (document.hidden) triggerCheatingWarning();
    };
    const handleBlur = () => {
      triggerCheatingWarning();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examStarted, examSubmitted, isSubmitting]);

  // --- Security Listeners (Right Click, Copy-Paste, Hotkeys) ---
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const blockContextMenu = (e) => e.preventDefault();
    const blockCopyPaste = (e) => e.preventDefault();
    const blockRefresh = (e) => {
      // F5 (116), Ctrl+R (82)
      if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
        e.preventDefault();
        alert("Action restricted: Reloading pages is disabled during the exam!");
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);
    document.addEventListener("keydown", blockRefresh);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
      document.removeEventListener("keydown", blockRefresh);
    };
  }, [examStarted, examSubmitted]);

  // --- Navigation & Core Action Handlers ---
  const startExam = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    }
    setExamStarted(true);
    setIsFullscreen(true);
  };

  const handleTimeOut = () => {
    if (timeLimitType === "sectional") {
      const sectionNames = Object.keys(sections);
      const currentSecIdx = sectionNames.indexOf(activeSection);
      if (currentSecIdx < sectionNames.length - 1) {
        const nextSec = sectionNames[currentSecIdx + 1];
        setLockedSections(prev => new Set([...prev, activeSection]));
        setActiveSection(nextSec);
        setCurrentQuestionIdx(0);
        setCurrentTimeLeft(getSectionTimeLimit(examType)); // reset sectional timer
        // Make sure first question of next section is visited
        const nextQNum = sections[nextSec][0].question_number;
        setQuestionStatus(prev => ({ ...prev, [nextQNum]: prev[nextQNum] || "not-answered" }));
        alert(`Time's up for ${activeSection}! Moving to next section: ${nextSec}`);
      } else {
        alert("Total exam time expired. Submitting your response...");
        submitExam();
      }
    } else {
      alert("Exam time expired. Submitting your response...");
      submitExam();
    }
  };

  const triggerCheatingWarning = () => {
    if (isSubmitting || examSubmitted) return;
    if (examName && examName.toUpperCase().includes("SBI PO")) return;
    setWarningsCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        alert("Maximum warning limit reached due to focus loss/escape. Submitting test automatically...");
        submitExam();
      } else {
        setShowWarningModal(true);
      }
      return nextCount;
    });
  };

  const selectOption = (optionId) => {
    const currentQ = sections[activeSection][currentQuestionIdx];
    setAnswers(prev => ({ ...prev, [currentQ.question_number]: optionId }));
  };

  const handleClearResponse = () => {
    const currentQ = sections[activeSection][currentQuestionIdx];
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.question_number];
      return copy;
    });
    setQuestionStatus(prev => ({ ...prev, [currentQ.question_number]: "not-answered" }));
  };

  const handleMarkForReview = () => {
    const currentQ = sections[activeSection][currentQuestionIdx];
    setQuestionStatus(prev => ({ ...prev, [currentQ.question_number]: "marked-review" }));
    advanceQuestion();
  };

  const handleSaveAndNext = () => {
    const currentQ = sections[activeSection][currentQuestionIdx];
    const isAnswered = !!answers[currentQ.question_number];
    setQuestionStatus(prev => ({ 
      ...prev, 
      [currentQ.question_number]: isAnswered ? "answered" : "not-answered" 
    }));
    advanceQuestion();
  };

  const advanceQuestion = () => {
    const activeQs = sections[activeSection] || [];
    if (currentQuestionIdx < activeQs.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      // Mark next question as visited
      const nextQNum = activeQs[nextIdx].question_number;
      setQuestionStatus(prev => ({ ...prev, [nextQNum]: prev[nextQNum] || "not-answered" }));
    } else {
      // Reached the end of active section.
      const secNames = Object.keys(sections);
      const currentSecIdx = secNames.indexOf(activeSection);
      if (currentSecIdx < secNames.length - 1) {
        if (timeLimitType !== "sectional") {
          const nextSec = secNames[currentSecIdx + 1];
          setActiveSection(nextSec);
          setCurrentQuestionIdx(0);
          const nextQNum = sections[nextSec][0].question_number;
          setQuestionStatus(prev => ({ ...prev, [nextQNum]: prev[nextQNum] || "not-answered" }));
        } else {
          const confirmNext = window.confirm("You have reached the end of this section. Do you want to submit this section and move to the next section early? (You will not be able to return to this section)");
          if (confirmNext) {
            const nextSec = secNames[currentSecIdx + 1];
            setLockedSections(prev => new Set([...prev, activeSection]));
            setActiveSection(nextSec);
            setCurrentQuestionIdx(0);
            setCurrentTimeLeft(getSectionTimeLimit(examType)); // reset sectional timer
            const nextQNum = sections[nextSec][0].question_number;
            setQuestionStatus(prev => ({ ...prev, [nextQNum]: prev[nextQNum] || "not-answered" }));
          }
        }
      } else {
        if (timeLimitType !== "sectional") {
          const nextSec = secNames[0];
          setActiveSection(nextSec);
          setCurrentQuestionIdx(0);
          const nextQNum = sections[nextSec][0].question_number;
          setQuestionStatus(prev => ({ ...prev, [nextQNum]: prev[nextQNum] || "not-answered" }));
        } else {
          alert("You have reached the end of the exam. You can submit now.");
        }
      }
    }
  };

  const jumpToQuestion = (idx) => {
    const activeQs = sections[activeSection] || [];
    if (idx >= 0 && idx < activeQs.length) {
      setCurrentQuestionIdx(idx);
      const qNum = activeQs[idx].question_number;
      setQuestionStatus(prev => ({ ...prev, [qNum]: prev[qNum] || "not-answered" }));
    }
  };

  const handleSectionClick = (secName) => {
    if (timeLimitType === "sectional") {
      const sectionNames = Object.keys(sections);
      const currentSecIdx = sectionNames.indexOf(activeSection);
      const targetSecIdx = sectionNames.indexOf(secName);
      if (targetSecIdx === currentSecIdx + 1) {
        const confirmNext = window.confirm(`Do you want to submit ${activeSection} and move to ${secName} early? (You will not be able to return to ${activeSection})`);
        if (confirmNext) {
          setLockedSections(prev => new Set([...prev, activeSection]));
          setActiveSection(secName);
          setCurrentQuestionIdx(0);
          setCurrentTimeLeft(getSectionTimeLimit(examType)); // reset sectional timer
          const qNum = sections[secName][0].question_number;
          setQuestionStatus(prev => ({ ...prev, [qNum]: prev[qNum] || "not-answered" }));
        }
      } else if (lockedSections.has(secName)) {
        alert("This section is locked because you have already submitted it or its time limit has expired.");
      } else if (secName !== activeSection) {
        alert("You can only move to the next section or wait for the sectional timer to end.");
      }
      return;
    }
    setActiveSection(secName);
    setCurrentQuestionIdx(0);
    const qNum = sections[secName][0].question_number;
    setQuestionStatus(prev => ({ ...prev, [qNum]: prev[qNum] || "not-answered" }));
  };

  // --- Grading & Submission ---
  const submitExam = async () => {
    if (examSubmitted || isSubmitting) return;

    // Exit Fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    setIsSubmitting(true);
    setSubmitProgress(0);
    setSubmitStatusText("Analyzing response sheet...");

    // Grade Responses
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const responseBundle = [];

    Object.keys(sections).forEach(secName => {
      sections[secName].forEach(q => {
        const qNum = q.question_number;
        const selected = answers[qNum] || "";
        const correct = q.correct_answer || "";
        const status = questionStatus[qNum] || "not-visited";

        if (!selected) {
          unattemptedCount++;
        } else if (selected.toUpperCase() === correct.toUpperCase()) {
          correctCount++;
        } else {
          incorrectCount++;
        }

        responseBundle.push({
          question_number: qNum,
          selected_option: selected,
          status: status
        });
      });
    });

    const negPenalty = Math.abs(examProfile && examProfile.negative_marking !== undefined ? examProfile.negative_marking : 0.25);
    const rawScore = correctCount * 1.0 - incorrectCount * negPenalty;
    const finalScore = parseFloat(rawScore.toFixed(2));
    const accuracyPct = correctCount + incorrectCount > 0 
      ? parseFloat(((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1)) 
      : 0;

    const mappedUserAnswers = {};
    responseBundle.forEach(r => {
      const qIdx = r.question_number - 1;
      if (r.selected_option) {
        mappedUserAnswers[qIdx] = r.selected_option.toUpperCase().charCodeAt(0) - 65;
      }
    });

    const payload = {
      user_email: user?.email || "candidate@test.com",
      exam_type: examType,
      sub_type: subType,
      score: finalScore,
      accuracy: accuracyPct,
      timeSpent: 60, // default placeholder
      details: {
        correct: correctCount,
        incorrect: incorrectCount,
        unattempted: unattemptedCount
      },
      responses: responseBundle,
      questions: mockData.questions.map(q => {
        let correctIdx = 0;
        if (q.correct_answer !== undefined && q.correct_answer !== null) {
          if (typeof q.correct_answer === 'number') {
            correctIdx = q.correct_answer;
          } else {
            const val = String(q.correct_answer).trim().toUpperCase();
            if (val) {
              if (!isNaN(val)) {
                correctIdx = parseInt(val, 10);
              } else {
                correctIdx = val.charCodeAt(0) - 65;
              }
            }
          }
        }
        return {
          q: q.question_text,
          options: q.options.map(opt => typeof opt === 'object' && opt.text !== undefined ? opt.text : opt),
          correct: correctIdx,
          section: q.section || "General",
          explanation: q.explanation || ""
        };
      }),
      userAnswers: mappedUserAnswers
    };

    // Save to Exam Engine API
    let examEnginePromise = fetch(`${BACKEND_URL}/api/exam/submit-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.error("[MockTestScreen] Failed to submit responses to exam engine:", err);
    });

    // Save to attempts history API via parent onSubmit
    let submitPromise = Promise.resolve();
    if (onSubmit) {
      submitPromise = Promise.resolve(onSubmit(payload));
    }

    // Run premium submission progress loader animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      setSubmitProgress(progress);

      if (progress === 15) {
        setSubmitStatusText("Grading 100 questions...");
      } else if (progress === 35) {
        setSubmitStatusText("Calculating sectional accuracy & breakdown...");
      } else if (progress === 55) {
        setSubmitStatusText("Generating detailed scorecard metrics...");
      } else if (progress === 75) {
        setSubmitStatusText("Saving attempt history to database...");
      } else if (progress === 90) {
        setSubmitStatusText("Finalizing explanations & diagrams...");
      } else if (progress === 100) {
        clearInterval(progressInterval);
        setSubmitStatusText("Report ready!");

        // Wait for both background save actions to resolve fully
        Promise.all([examEnginePromise, submitPromise]).then(() => {
          setTimeout(() => {
            setIsSubmitting(false);
            setExamSubmitted(true);
          }, 400);
        }).catch(err => {
          console.error("Failed background submit resolution:", err);
          setTimeout(() => {
            setIsSubmitting(false);
            setExamSubmitted(true);
          }, 400);
        });
      }
    }, 35);
  };

  // --- Helper calculations for display ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Tally current active section status counts
  const getSummaryCounts = () => {
    let answered = 0;
    let marked = 0;
    let notAnswered = 0;
    let notVisited = 0;

    const activeQs = sections[activeSection] || [];
    activeQs.forEach(q => {
      const status = questionStatus[q.question_number] || "not-visited";
      if (status === "answered") answered++;
      else if (status === "marked-review") marked++;
      else if (status === "not-answered") notAnswered++;
      else notVisited++;
    });

    return { answered, marked, notAnswered, notVisited };
  };

  // Check if sections have loaded
  const activeQuestions = sections[activeSection] || [];
  const currentQuestion = activeQuestions[currentQuestionIdx] || null;

  // --- LOADING & EMPTY STATE DETECTION & RENDER ---
  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-6 text-slate-800 font-sans select-none animate-fade-in">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg font-bold text-slate-900 font-sora">Preparing exam sheet...</h2>
          <p className="text-slate-500 text-xs">Please wait while we load your test questions.</p>
        </div>
      </div>
    );
  }

  const questionsList = mockData?.questions || [];
  if (questionsList.length === 0) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen bg-[#f4f6f9] flex items-center justify-center p-6 text-slate-800 font-sans select-none">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xl animate-fade-in">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-bold font-sora text-slate-900 mb-2">No Test Material Available</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            This mock test is currently being prepared. Questions will be live once the administrator uploads the exam papers for this course. Please check back later!
          </p>
          <button 
            onClick={() => {
              if (onSubmit) onSubmit(null);
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl text-white text-sm font-bold transition-all shadow-md font-sora"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER 1: Pre-Exam Instruction Screen (Ivory Theme) ---
  if (!examStarted) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen bg-[#f4f6f9] flex items-center justify-center p-6 text-slate-800 font-sans select-none">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-xl p-8 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5 mb-6">
            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Clock size={28} />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-sora text-slate-900">Computer Based Test (CBT) Instructions</h1>
              <p className="text-slate-500 text-xs mt-1">Category: {examType} ({subType})</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed overflow-y-auto max-h-[350px] pr-2">
            <h3 className="text-slate-900 font-bold">General Instructions:</h3>
            <p>1. The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</p>
            
            {examType === "Banking" ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-800">
                <strong>⚠️ Strict Sectional Locking Active (IBPS Pattern):</strong>
                <p className="mt-1">You will have exactly 20 minutes to complete each section. Manual switching between sections is disabled. When the sectional timer hits 00:00, the section will lock automatically and advance to the next. You cannot return to previous sections.</p>
              </div>
            ) : (
              <p>2. You can navigate between any sections and change responses at any point before the overall timer runs out.</p>
            )}

            <h3 className="text-slate-900 font-bold mt-4">Keyboard & Mouse Controls:</h3>
            <p>3. Do not attempt to refresh (F5 / Ctrl+R) or change tabs, as doing so will trigger security alerts and may auto-submit your test.</p>
            <p>4. Right-clicks, text copy-paste, and window switching are strictly disabled.</p>

            <h3 className="text-slate-900 font-bold mt-4">Palette Legend:</h3>
            <div className="grid grid-cols-2 gap-3 mt-2 text-slate-700">
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">0</span> Not Visited</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-md bg-[#e53e3e] text-white flex items-center justify-center text-xs font-bold">0</span> Visited & Skipped</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-md bg-[#2ca85a] text-white flex items-center justify-center text-xs font-bold">0</span> Answered & Saved</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-md bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold">0</span> Marked for Review</div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 mt-6 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
              <input type="checkbox" required className="rounded accent-blue-600" defaultChecked />
              I declare that I have read and understood all instructions.
            </label>
            <button 
              onClick={startExam}
              className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-[#152a65] rounded-lg text-white text-sm font-bold transition-all shadow-md"
            >
              Agree & Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 1.5: Loader Progress Overlay during submission ---
  if (isSubmitting) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0B132B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Background Decorative Gradients */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          filter: 'blur(80px)',
          top: '10%',
          left: '15%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.15)',
          filter: 'blur(80px)',
          bottom: '10%',
          right: '15%',
          pointerEvents: 'none'
        }} />

        {/* Loader Container */}
        <div style={{
          width: '90%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '40px 30px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Circular Glow Effect */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Spinning background ring */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '4px solid rgba(59, 130, 246, 0.1)',
              borderTop: '4px solid #3B82F6',
              animation: 'spin_loader 1.5s linear infinite'
            }} />
            {/* Counter Text */}
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#3B82F6',
              textShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
            }}>
              {submitProgress}%
            </span>
          </div>

          <h3 style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '12px',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(to right, #FFFFFF, #93C5FD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Evaluating Response Sheet
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '30px',
            height: '20px',
            transition: 'all 0.3s ease'
          }}>
            {submitStatusText}
          </p>

          {/* Progress Bar Container */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '15px'
          }}>
            <div style={{
              width: `${submitProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
              borderRadius: '10px',
              transition: 'width 0.1s ease-out',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            DO NOT CLOSE OR REFRESH THIS PAGE
          </span>
        </div>

        {/* CSS Keyframes injected dynamically */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin_loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // --- RENDER 2: Post-Exam Submission Screen (Ivory Theme) ---
  if (examSubmitted) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen bg-[#f4f6f9] overflow-y-auto p-6 flex justify-center items-start select-none">
        <ResultCard 
          questions={mockData.questions}
          answers={answers}
          onGoBack={onGoBack || (() => window.location.reload())}
          examType={examType}
          subType={subType}
        />
      </div>
    );
  }

  const { answered, marked, notAnswered, notVisited } = getSummaryCounts();
  const isTimeCritical = currentTimeLeft <= 300; // less than 5 minutes

  // --- RENDER 3: Computerized Examination interface (Ivory White Theme) ---
  return (
    <div className="fixed inset-0 z-[99999] min-h-screen bg-[#f4f6f9] text-slate-800 select-none flex flex-col font-sans h-screen overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* TOP BAR: Title, tabs, and timer (Navy blue / TCS Style header) */}
      <header className="bg-[#1e3a8a] border-b border-blue-900 px-4 py-3 lg:px-6 lg:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shadow-md shrink-0">
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-xs uppercase tracking-wider font-sora">
              CBT Engine
            </div>
            <div>
              <h1 className="text-sm lg:text-lg font-bold text-white tracking-tight">{examType} Competitive Mock Test</h1>
              <p className="text-blue-200 text-[10px] lg:text-xs">{subType} Pattern Module</p>
            </div>
          </div>
        </div>

        {/* Section tabs switcher (hide if APPSC or UPSC) */}
        {examType !== "APPSC Groups" && examType !== "UPSC" && (
          <div className="flex items-center bg-blue-950/60 p-1 rounded-lg border border-blue-800 overflow-x-auto max-w-full no-scrollbar">
            {Object.keys(sections).map((secName, index) => {
              const isLocked = lockedSections.has(secName);
              const isActive = activeSection === secName;
              return (
                <button
                  key={index}
                  onClick={() => handleSectionClick(secName)}
                  disabled={timeLimitType === "sectional" && !isActive}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] lg:text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-blue-900 shadow-md"
                      : "text-blue-100 hover:text-white"
                  } ${(timeLimitType === "sectional" && !isActive) ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {timeLimitType === "sectional" && !isActive ? (
                    <Lock size={12} className="text-blue-300" />
                  ) : isActive ? (
                    <Unlock size={12} className="text-blue-950" />
                  ) : null}
                  {secName}
                </button>
              );
            })}
          </div>
        )}

        {/* Countdown Timer and Submit */}
        <div className="flex items-center gap-3 justify-between w-full lg:w-auto">
          <div className={`flex items-center gap-2 border px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-mono font-bold text-base lg:text-lg tracking-wider ${
            isTimeCritical 
              ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" 
              : "bg-blue-950 border-blue-800 text-emerald-400"
          }`}>
            <Clock size={16} />
            <span>{formatTime(currentTimeLeft)}</span>
          </div>

          <button 
            onClick={submitExam}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e53e3e] hover:bg-[#c53030] active:bg-[#9b2c2c] rounded-lg text-white font-bold text-xs lg:text-sm transition-all shadow-md"
          >
            <Send size={12} /> Submit Exam
          </button>
        </div>
      </header>

      {/* DUAL-PANEL DASHBOARD LAYOUT */}
      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        
        {/* LEFT PANEL (65% width): Active question pane (Ivory White style) */}
        <div className="w-full lg:w-[65%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
          
          <div className="px-4 py-3 md:px-8 md:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <h2 className="text-xs md:text-sm font-bold text-slate-700 font-sora">
              Question No. {currentQuestionIdx + 1}
            </h2>
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-slate-500">
              <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-blue-700">Marks: +{currentQuestion?.marks || 1.0}</span>
              <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-red-700">Negative: -{currentQuestion?.negative_marks || currentQuestion?.negativeMarks || 0.25}</span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8 space-y-6">
            {currentQuestion ? (
              <>
                {/* Clean question text rendering with LaTeX */}
                <div className="text-slate-900 text-sm md:text-base leading-relaxed font-semibold">
                  {renderLaTeX(currentQuestion.question_text, currentQuestion.subject || currentQuestion.section)}
                </div>
                {currentQuestion.question_image && (
                  <div className="mt-4 flex flex-col items-start gap-1">
                    <img 
                      src={`${BACKEND_URL}/api/images/${currentQuestion.question_image}`} 
                      alt="Question diagram" 
                      className="max-h-[380px] w-auto object-contain rounded-lg border border-slate-200 shadow-sm"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* 4 Interactive option radio buttons */}
                <div className="space-y-3.5 pt-4">
                  {currentQuestion.options && currentQuestion.options.map((opt, oidx) => {
                    let optId = "";
                    let optText = "";
                    let optImage = null;
                    if (typeof opt === 'object' && opt !== null) {
                      optId = opt.id || ["A", "B", "C", "D", "E"][oidx];
                      optText = opt.text || "";
                      optImage = opt.image || null;
                    } else {
                      optId = ["A", "B", "C", "D", "E"][oidx];
                      optText = String(opt);
                    }
                    
                    // Fallback to option_images array from database
                    if (!optImage && currentQuestion.option_images && currentQuestion.option_images[oidx]) {
                      optImage = currentQuestion.option_images[oidx];
                    }

                    const isSelected = answers[currentQuestion.question_number] === optId;
                    return (
                      <label 
                        key={optId}
                        onClick={() => selectOption(optId)}
                        className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? "bg-blue-50 border-blue-500 shadow-sm text-slate-900 font-bold" 
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="pt-0.5">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? "border-blue-500 bg-blue-600" 
                              : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-medium leading-relaxed flex-1">
                          <div className="flex items-center">
                            <span className="font-bold text-slate-500 mr-2">{optId}.</span>
                            {!optImage && renderLaTeX(optText, currentQuestion.subject || currentQuestion.section)}
                          </div>
                          {optImage && (
                            <div className="mt-2 flex flex-col items-start gap-1">
                              <img 
                                src={`${BACKEND_URL}/api/images/${optImage}`} 
                                alt={`Option ${optId} diagram`} 
                                className="max-h-[140px] w-auto object-contain rounded border border-slate-105 shadow-sm cursor-zoom-in hover:scale-[1.01] transition-transform duration-200"
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent selecting option when clicking to zoom
                                  window.open(`${BACKEND_URL}/api/images/${optImage}`, '_blank');
                                }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <HelpCircle className="animate-spin mr-2" /> Loading active question pool...
              </div>
            )}
          </div>

          {/* Bottom control footer */}
          <div className="px-4 py-4 md:px-8 md:py-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleMarkForReview}
                disabled={!currentQuestion || !answers[currentQuestion?.question_number]}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[#7c3aed]/40 text-[#7c3aed] hover:bg-[#7c3aed]/5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={handleClearResponse}
                disabled={!currentQuestion || !answers[currentQuestion?.question_number]}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all"
              >
                Clear Response
              </button>
            </div>
            
            <button 
              onClick={handleSaveAndNext}
              disabled={!currentQuestion || !answers[currentQuestion?.question_number]}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#2ca85a] hover:bg-[#238c4a] active:bg-[#1a6d38] text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Next
            </button>
          </div>
        </div>

        {/* RIGHT PANEL (35% width): Candidate details & palette (Government exam style blue-gray) */}
        <div className="w-full lg:w-[35%] bg-[#edf2f7] border-t lg:border-t-0 lg:border-l border-slate-200 p-4 md:p-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Candidate Block with profile placeholder and Roll Number */}
            <div className="flex items-center gap-4 bg-white p-3 md:p-4 border border-slate-200 rounded-xl shadow-sm">
              <div className="shrink-0">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-slate-400 bg-slate-100 p-1.5 rounded-full border border-slate-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-slate-800 font-bold text-xs md:text-sm tracking-tight truncate font-sora">Candidate</h4>
                <p className="text-slate-600 text-[10px] md:text-xs mt-0.5">Roll No: 2026-CBT-9901</p>
                <p className="text-slate-500 text-[9px] md:text-[10px] mt-0.5 truncate">{user?.email || "candidate@test.com"}</p>
              </div>
            </div>

            {/* Live Tally Badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs">
              <div className="bg-[#2ca85a]/10 border border-[#2ca85a]/20 text-[#2ca85a] p-2 md:p-2.5 rounded-lg flex items-center gap-1.5 font-bold justify-between shadow-sm">
                <span>🟢 Answered:</span> <span>{answered}</span>
              </div>
              <div className="bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[#e53e3e] p-2 md:p-2.5 rounded-lg flex items-center gap-1.5 font-bold justify-between shadow-sm">
                <span>🔴 Skipped:</span> <span>{notAnswered}</span>
              </div>
              <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#7c3aed] p-2 md:p-2.5 rounded-lg flex items-center gap-1.5 font-bold justify-between shadow-sm">
                <span>🟣 Review:</span> <span>{marked}</span>
              </div>
              <div className="bg-slate-200 border border-slate-350 text-slate-600 p-2 md:p-2.5 rounded-lg flex items-center gap-1.5 font-bold justify-between shadow-sm">
                <span>⚪ Unvisited:</span> <span>{notVisited}</span>
              </div>
            </div>

            {/* Interactive Palette Grid mapping current active section */}
            <div className="border border-slate-200 rounded-xl p-3 md:p-4 bg-white shadow-sm">
              <h3 className="text-[11px] md:text-xs font-bold text-slate-800 font-sora mb-3 border-b border-slate-100 pb-2">
                Question Palette: {activeSection}
              </h3>
              
              <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                {activeQuestions.map((q, idx) => {
                  const status = questionStatus[q.question_number] || "not-visited";
                  const isCurrent = currentQuestionIdx === idx;
                  
                  let bgClass = "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300";
                  if (status === "answered") {
                    bgClass = "bg-[#2ca85a] hover:bg-[#238c4a] text-white border-[#2ca85a]";
                  } else if (status === "marked-review") {
                    bgClass = "bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-[#7c3aed]";
                  } else if (status === "not-answered") {
                    bgClass = "bg-[#e53e3e] hover:bg-[#c53030] text-white border-[#e53e3e]";
                  }

                  return (
                    <button
                      key={q.question_number}
                      onClick={() => {
                        jumpToQuestion(idx);
                      }}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all border ${bgClass} ${
                        isCurrent ? "ring-2 ring-blue-500 border-blue-400 scale-[1.05]" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400 leading-normal">
            ⚙️ Exam Session ID: {user?.id || "Session-12A"} &bull; {examType} Module Version 2.4.2 <br />
            &copy; 2026 KR Institute of Learning. All Rights Reserved.
          </div>
        </div>

      </div>

      {/* Cheating Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-7 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-red-600 font-sora mb-2">Security Warning!</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              Focus loss or screen tab switching detected! Changing tabs or exiting fullscreen mode is strictly prohibited. 
            </p>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-6 text-sm text-slate-500">
              Warnings Triggered: <strong className="text-red-650 font-bold">{warningsCount} / 3</strong> <br />
              <span className="text-xs text-slate-400">At 3 warnings, your exam will be automatically locked and submitted.</span>
            </div>

            <button 
              onClick={() => {
                setShowWarningModal(false);
                const docEl = document.documentElement;
                if (docEl.requestFullscreen && !document.fullscreenElement) {
                  docEl.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg text-white text-sm font-bold transition-all shadow-md"
            >
              Resume Test & Restore Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
