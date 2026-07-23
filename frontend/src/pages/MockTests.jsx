import { useState, useEffect, useRef, useMemo } from "react";
import { FileText, Clock, BarChart2, CheckCircle, Lock, ChevronRight, AlertCircle, Award, ChevronLeft } from "lucide-react";
import "./MockTests.css";
import { generateQuestionsPool, generateMockQuestionsForCategory } from "../data/exams";
import { generateMainsMocksForCourseOffline } from "../data/mainsQuestions";
import MockTestScreen from "./MockTestScreen";

const FALLBACK_COURSES = [
  // Banking & Insurance
  { title: "SBI PO", category: "Banking" },
  { title: "SBI Clerk", category: "Banking" },
  { title: "IBPS RRB Clerk", category: "Banking" },
  { title: "IBPS RRB PO", category: "Banking" },
  { title: "IBPS PO", category: "Banking" },
  { title: "IBPS Clerk", category: "Banking" },
  { title: "NICL AO", category: "Banking" },
  { title: "NICL Assistant", category: "Banking" },
  { title: "NIACL AO", category: "Banking" },
  { title: "NIACL Assistant", category: "Banking" },
  { title: "IBPS SO", category: "Banking" },
  { title: "IBPS AFO", category: "Banking" },
  { title: "LIC AAO", category: "Banking" },
  { title: "LIC AAO SO / AE Specialist", category: "Banking" },
  { title: "LIC ADO", category: "Banking" },
  { title: "LIC Assistant Exam", category: "Banking" },
  { title: "LIC HFL", category: "Banking" },
  { title: "SEAL", category: "Banking" },
  { title: "RBI Assistant", category: "Banking" },
  { title: "BoB LBO", category: "Banking" },
  { title: "SBI Apprentice", category: "Banking" },
  { title: "Bank of Maharashtra Manipal", category: "Banking" },
  { title: "Canara Bank PO", category: "Banking" },
  { title: "Dena Bank PO", category: "Banking" },
  { title: "ECGC PO", category: "Banking" },
  { title: "ESIC SSO", category: "Banking" },
  { title: "ESIC UDC", category: "Banking" },
  { title: "GIC Assistant Manager", category: "Banking" },
  { title: "IDBI Assistant Manager", category: "Banking" },
  { title: "IDBI Executive", category: "Banking" },
  { title: "Indian Bank PO", category: "Banking" },
  { title: "IPPB Officer", category: "Banking" },
  { title: "Lakshmi Vilas Bank PO", category: "Banking" },
  { title: "Nainital Bank", category: "Banking" },
  { title: "Nainital Bank PO", category: "Banking" },
  { title: "NHB Assistant", category: "Banking" },
  { title: "OICL AO", category: "Banking" },
  { title: "PNB IT Officer", category: "Banking" },
  { title: "Central Warehousing Corporation", category: "Banking" },
  { title: "EPFO Assistant", category: "Banking" },
  { title: "FCI Manager", category: "Banking" },

  // SSC
  { title: "SSC CGL", category: "SSC" },
  { title: "SSC CHSL", category: "SSC" },
  { title: "SSC MTS", category: "SSC" },
  { title: "SSC CPO", category: "SSC" },

  // Railways
  { title: "RRB NTPC", category: "Railways" },
  { title: "RRB Group D", category: "Railways" },
  { title: "RRB ALP", category: "Railways" },

  // State
  { title: "APPSC Group 1", category: "State" },
  { title: "APPSC Group 2", category: "State" },
  { title: "APPSC Group 3", category: "State" },
  { title: "APPSC Group 4", category: "State" },
  { title: "TSPSC Group 1", category: "State" },
  { title: "TSPSC Group 2", category: "State" },
  { title: "TSPSC Group 3", category: "State" },
  { title: "TSPSC Group 4", category: "State" },

  // UPSC
  { title: "UPSC CSE", category: "UPSC" }
];

// Sample questions list for the exam player
const EXAM_QUESTIONS = [
  {
    section: "Quantitative Aptitude",
    q: "What is the value of 15% of 80 + 25% of 120?",
    options: ["32", "38", "42", "45"],
    correct: 2 // 42
  },
  {
    section: "Quantitative Aptitude",
    q: "A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/h?",
    options: ["30 km/h", "36 km/h", "45 km/h", "54 km/h"],
    correct: 1 // 36 km/h
  },
  {
    section: "Quantitative Aptitude",
    q: "The average of 5 consecutive odd numbers is 25. What is the largest of these numbers?",
    options: ["27", "29", "31", "33"],
    correct: 1 // 29 (21, 23, 25, 27, 29)
  },
  {
    section: "Reasoning Ability",
    q: "Pointing to a photograph, a man said: 'I have no brother or sister, but that man's father is my father's son.' Whose photograph was it?",
    options: ["His own", "His father's", "His son's", "His nephew's"],
    correct: 2 // His son's
  },
  {
    section: "Reasoning Ability",
    q: "In a certain code language, 'MOCK' is written as 'NPDL'. How is 'TEST' written in that code?",
    options: ["SDTS", "UFTU", "UFUT", "UFTV"],
    correct: 1 // UFTU (+1 pattern)
  },
  {
    section: "Reasoning Ability",
    q: "Statements: All A are B. All B are C. \nConclusions: I. All A are C. II. Some B are A.",
    options: ["Only conclusion I follows", "Only conclusion II follows", "Both I and II follow", "Neither follows"],
    correct: 2 // Both
  },
  {
    section: "English Language",
    q: "Find the synonym of the word: 'ABANDON'",
    options: ["Retain", "Keep", "Forsake", "Support"],
    correct: 2 // Forsake
  },
  {
    section: "English Language",
    q: "Choose the word with the correct spelling:",
    options: ["Committe", "Committee", "Commitee", "Comitee"],
    correct: 1 // Committee
  }
];

const getCoreStandardTitle = (title) => {
  if (!title) return "";
  const t = title.toLowerCase();
  
  // Clean up title by removing common noise suffixes/prefixes
  let clean = title.replace(/\b(tier\s*-?\s*[1234]|prelims?|mains?|mock\s*tests?|test\s*series|exam\s*prep|online\s*test|preparation|batch|2026)\b/gi, "");
  clean = clean.replace(/\s+/g, ' ').trim();
  const tc = clean.toLowerCase();
  
  if (tc.includes("cgl")) return "SSC CGL";
  if (tc.includes("chsl")) return "SSC CHSL";
  if (tc.includes("mts")) return "SSC MTS";
  if (tc.includes("cpo")) return "SSC CPO";
  if (tc.includes("gd constable") || tc.includes("ssc gd") || tc.includes("sc_gd") || tc.includes("ssc_gd")) return "SSC GD";
  
  if (tc.includes("ntpc")) return "RRB NTPC";
  if (tc.includes("rrb gd") || tc.includes("rrb_gd") || tc.includes("rr gd")) return "RRB GD";
  if (tc.includes("alp")) return "RRB ALP";
  if (tc.includes("group d") || tc.includes("group-d")) return "RRB Group D";
  if (tc.includes("technician")) return "RRB Technician";
  if (tc.includes("rrb tc") || tc.includes("rrb tte") || tc.includes("ticket collector")) return "RRB Ticket Collector (TC)";
  
  if (tc.includes("sbi po")) return "SBI PO";
  if (tc.includes("sbi clerk")) return "SBI Clerk";
  if (tc.includes("ibps rrb po") || (tc.includes("rrb") && tc.includes("po"))) return "IBPS RRB PO";
  if (tc.includes("ibps rrb clerk") || (tc.includes("rrb") && tc.includes("clerk"))) return "IBPS RRB Clerk";
  if (tc.includes("ibps po")) return "IBPS PO";
  if (tc.includes("ibps clerk")) return "IBPS Clerk";
  
  if (tc.includes("upsc")) return "UPSC CSE";
  if (tc.includes("ts police") || (tc.includes("telangana") && tc.includes("police"))) return "TS Police SI & Constable";
  if (tc.includes("ap police") || (tc.includes("andhra") && tc.includes("police"))) return "AP Police SI & Constable";
  
  if (tc.includes("appsc group 1") || tc.includes("appsc group-1")) return "APPSC Group 1";
  if (tc.includes("appsc group 2") || tc.includes("appsc group-2")) return "APPSC Group 2";
  if (tc.includes("appsc group 3") || tc.includes("appsc group-3")) return "APPSC Group 3";
  if (tc.includes("appsc group 4") || tc.includes("appsc group-4")) return "APPSC Group 4";
  
  if (tc.includes("tspsc group 1") || tc.includes("tspsc group-1")) return "TSPSC Group 1";
  if (tc.includes("tspsc group 2") || tc.includes("tspsc group-2")) return "TSPSC Group 2";
  if (tc.includes("tspsc group 3") || tc.includes("tspsc group-3")) return "TSPSC Group 3";
  if (tc.includes("tspsc group 4") || tc.includes("tspsc group-4")) return "TSPSC Group 4";
  
  if (clean === "") return "General Mock Test";
  return clean.replace(/\b\w/g, c => c.toUpperCase());
};

export default function MockTests({ user, setUser, requestAuth, onAddAttempt, navigate, initialCourseId }) {
  const BACKEND_URL = import.meta.env.VITE_API_URL || ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')))
  ? (window.location.protocol + "//" + window.location.hostname + ":5000")
  : "");
  const [filter, setFilter] = useState("prelims");
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [unlockedSeries, setUnlockedSeries] = useState(new Set());
  const [activePurchaseSeries, setActivePurchaseSeries] = useState(null);
  const [lockedAlert, setLockedAlert] = useState(null);
  const [activeExamId, setActiveExamId] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeExam, setActiveExam] = useState(null); // the mock test being taken
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0); // active question index inside player
  const [answers, setAnswers] = useState({}); // mapping question index -> selected option index
  const [statuses, setStatuses] = useState({}); // mapping question index -> 'answered' | 'marked' | 'visited' | 'not_answered'
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const timerRef = useRef(null);

  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);

  // Fetch all courses dynamically from database
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/courses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(err => console.error("Error fetching courses for mock tests:", err));
  }, []);

  // Helper to map a course object to a sector ID
  const getCourseSectorId = (course) => {
    if (!course) return "Banking";
    const cat = course.category || "";
    const title = course.title || "";
    if (cat.includes("Bank")) return "Banking";
    if (cat.includes("SSC")) return "SSC";
    if (cat.includes("Rail")) return "Railways";
    if (cat.includes("UPSC")) return "UPSC";
    if (title.toUpperCase().includes("TSPSC") || title.toUpperCase().includes("TS ")) return "TSPSC";
    if (title.toUpperCase().includes("APPSC") || title.toUpperCase().includes("AP ")) return "APPSC";
    if (cat.includes("State")) return "APPSC";
    return "Banking";
  };

  // Synchronize dynamic mock test series unlocks based on purchased plans & manager assignments
  useEffect(() => {
    if (user) {
      setUnlockedSeries(prev => {
        const next = new Set(); // Reset on user or courses change to avoid stale state
        const listToUse = courses.length > 0 ? courses : FALLBACK_COURSES;
        
        // Helper to add series locks safely
        const addUnlocks = (courseObj) => {
          const cleanId = courseObj.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          return cleanId;
        };

        // 1. Manager manually assigned (full access) or purchased full courses
        if (Array.isArray(user.unlockedCourses)) {
          user.unlockedCourses.forEach(courseId => {
            const course = listToUse.find(c => c.id === courseId);
            if (course) {
              const cleanId = addUnlocks(course);
              next.add(`${cleanId}_prelims`);
              next.add(`${cleanId}_mains`);
            } else {
              const cleanId = courseId.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              next.add(`${cleanId}_prelims`);
              next.add(`${cleanId}_mains`);
            }
          });
        }

        // 2. Single Course Prelims purchased
        if (Array.isArray(user.unlockedPrelims)) {
          user.unlockedPrelims.forEach(courseId => {
            const course = listToUse.find(c => c.id === courseId);
            if (course) {
              const cleanId = addUnlocks(course);
              next.add(`${cleanId}_prelims`);
            } else {
              const cleanId = courseId.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              next.add(`${cleanId}_prelims`);
            }
          });
        }

        // 3. Single Course Mains purchased
        if (Array.isArray(user.unlockedMains)) {
          user.unlockedMains.forEach(courseId => {
            const course = listToUse.find(c => c.id === courseId);
            if (course) {
              const cleanId = addUnlocks(course);
              next.add(`${cleanId}_mains`);
            } else {
              const cleanId = courseId.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              next.add(`${cleanId}_mains`);
            }
          });
        }

        // 4. Complete Sector Prelims purchased
        if (Array.isArray(user.unlockedSectorsPrelims)) {
          user.unlockedSectorsPrelims.forEach(sectorId => {
            listToUse.forEach(course => {
              if (getCourseSectorId(course) === sectorId) {
                const cleanId = addUnlocks(course);
                next.add(`${cleanId}_prelims`);
              }
            });
          });
        }

        // 5. Complete Sector Mains purchased
        if (Array.isArray(user.unlockedSectorsMains)) {
          user.unlockedSectorsMains.forEach(sectorId => {
            listToUse.forEach(course => {
              if (getCourseSectorId(course) === sectorId) {
                const cleanId = addUnlocks(course);
                next.add(`${cleanId}_mains`);
              }
            });
          });
        }

        return next;
      });
    } else {
      setUnlockedSeries(new Set());
    }
  }, [user, courses]);

  // Generate mock test series dynamically from fetched courses, fallback to static courses
  const mockTestSeries = useMemo(() => {
    const rawList = courses.length > 0 ? courses : FALLBACK_COURSES;
    
    // Standardize titles and deduplicate course items
    const standardizedList = [];
    const coreTitlesSeen = new Set();
    
    rawList.forEach(course => {
      const coreTitle = getCoreStandardTitle(course.title);
      if (!coreTitle || coreTitlesSeen.has(coreTitle)) return;
      coreTitlesSeen.add(coreTitle);
      standardizedList.push({
        ...course,
        title: coreTitle
      });
    });

    const series = [];
    const titlesSeen = new Set();

    standardizedList.forEach(course => {
      if (titlesSeen.has(course.title)) return;
      titlesSeen.add(course.title);
      
      const cleanId = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const isCgl = cleanId.includes('ssc_cgl') || cleanId === 'ssc_cgl';
      const isChsl = cleanId.includes('ssc_chsl') || cleanId === 'ssc_chsl';
      const isIbpsClerk = cleanId.includes('ibps_clerk');
      const isRrbPo = cleanId.includes('ibps_rrb_po') || cleanId.includes('rrb_po');
      const isRrbNtpc = cleanId.includes('rrb_ntpc') || cleanId.includes('ntpc');
      const isRrbClerk = cleanId.includes('ibps_rrb_clerk') || cleanId.includes('rrb_clerk');
      const isSscGd = cleanId.includes('ssc_gd') || cleanId.includes('sc_gd');
      const isRrbGd = cleanId.includes('rrb_gd');
      const isSbiPo = cleanId.includes('sbi_po');
      const isIbpsPo = cleanId.includes('ibps_po') || cleanId.includes('ibpspo');
      const isSbiClerk = cleanId.includes('sbi_clerk');
      const isUnlocked = isCgl || isChsl || isIbpsClerk || isRrbPo || isRrbNtpc || isRrbClerk || isSscGd || isRrbGd || isSbiPo || isIbpsPo || isSbiClerk;

      const prelimsNumTests = (isIbpsClerk || isRrbPo || isRrbNtpc || isCgl || isChsl || isRrbClerk || isSscGd || isRrbGd || isSbiPo || isIbpsPo || isSbiClerk) ? 10 : 20;
      const mainsNumTests = isCgl ? 3 : (isChsl ? 2 : (isRrbNtpc ? 10 : 20));

      const getTestId = (stage, idx) => {
        if (isIbpsClerk) return `ibps_clerk_prelims_test${idx + 1}`;
        if (isRrbClerk) return `rrb_clerk_prelims_test${idx + 1}`;
        if (isRrbPo) return `rrb_po_prelims_test${idx + 1}`;
        if (isRrbNtpc) return stage === 'prelims' ? `rrb_ntpc_cbt1_test${idx + 1}` : `rrb_ntpc_cbt2_test${idx + 1}`;
        if (isCgl) return `ssc_cgl_${stage}_test${idx + 1}`;
        if (isChsl) return `ssc_chsl_${stage}_test${idx + 1}`;
        if (isSscGd) return `ssc_gd_prelims_test${idx + 1}`;
        if (isRrbGd) return `rrb_gd_prelims_test${idx + 1}`;
        if (isSbiPo) return `sbi_po_prelims_test${idx + 1}`;
        if (isIbpsPo) return `ibps_po_prelims_test${idx + 1}`;
        if (isSbiClerk) return `sbi_clerk_prelims_test${idx + 1}`;
        return `mock_${cleanId}_${stage === 'prelims' ? 'pre' : 'main'}_${idx + 1}`;
      };

      // 1. Prelims Series (CBT 1 for RRB NTPC)
      series.push({
        id: `${cleanId}_prelims`,
        title: isRrbNtpc ? `RRB NTPC CBT 1 Mock Tests` : `${course.title} Prelims Mock Tests`,
        type: "prelims",
        category: course.category || (isCgl || isChsl || isSscGd ? "SSC Exams" : "RRB & Railways"),
        totalTests: prelimsNumTests,
        freeTests: isUnlocked ? prelimsNumTests : 0,
        isPurchased: false,
        tests: Array.from({ length: prelimsNumTests }, (_, idx) => {
          const tid = getTestId('prelims', idx);
          const subTitle = isIbpsClerk ? `IBPS Clerk Prelims - Test ${idx + 1}` : 
                           (isRrbClerk ? `IBPS RRB Clerk Prelims - Test ${idx + 1}` :
                           (isRrbPo ? `IBPS RRB PO Prelims - Test ${idx + 1}` :
                           (isRrbNtpc ? `RRB NTPC CBT 1 - Test ${idx + 1}` : 
                           (isCgl ? `SSC CGL Prelims - Test ${idx + 1}` : 
                           (isChsl ? `SSC CHSL Prelims - Test ${idx + 1}` : 
                           (isSscGd ? `SSC GD Constable Prelims - Test ${idx + 1}` : 
                           (isRrbGd ? `RRB GD Prelims - Test ${idx + 1}` : 
                           (isSbiPo ? `SBI PO Prelims - Test ${idx + 1}` : 
                           (isIbpsPo ? `IBPS PO Prelims - Test ${idx + 1}` : 
                           (isSbiClerk ? `SBI Clerk Prelims - Test ${idx + 1}` : `${course.title} Prelims - Test ${idx + 1}`))))))))));
          return {
            id: tid,
            name: isRrbPo ? `IBPS RRB PO Prelims - Test ${idx + 1}` : 
                  (isRrbClerk ? `IBPS RRB Clerk Prelims - Test ${idx + 1}` :
                  (isRrbNtpc ? `RRB NTPC CBT 1 - Test ${idx + 1}` : 
                  (isSscGd ? `SSC GD Constable Prelims - Test ${idx + 1}` : 
                  (isRrbGd ? `RRB GD Prelims - Test ${idx + 1}` : 
                  (isSbiPo ? `SBI PO Prelims - Test ${idx + 1}` : 
                  (isIbpsPo ? `IBPS PO Prelims - Test ${idx + 1}` : 
                  (isSbiClerk ? `SBI Clerk Prelims - Test ${idx + 1}` : `${course.title} Prelims - Test ${idx + 1}`))))))),
            questionsCount: (isRrbPo || isRrbClerk || isSscGd) ? 80 : 100,
            timeLimit: (isRrbPo || isRrbClerk) ? 45 : ((isRrbNtpc || isRrbGd) ? 90 : 60),
            free: isUnlocked ? true : false,
            difficulty: idx % 3 === 0 ? "Easy" : (idx % 3 === 1 ? "Medium" : "Hard"),
            examType: isIbpsClerk ? "IBPS CLERK PRELIMS" : 
                      (isRrbClerk ? "IBPS RRB CLERK PRELIMS" :
                      (isRrbNtpc ? "RRB NTPC CBT 1" : (isCgl ? "SSC CGL" : (isChsl ? "SSC CHSL" : (isSscGd ? "SSC" : (isRrbGd ? "RRB" : (isSbiPo ? "Banking" : (isIbpsPo ? "Banking" : (isSbiClerk ? "Banking" : (course.category || "Banking")))))))))),
            subType: subTitle,
            testId: tid
          };
        })
      });

      // 2. Mains Series (CBT 2 for RRB NTPC, Skip for RRB GD & SSC GD)
      if (cleanId !== 'rrb_gd' && cleanId !== 'ssc_gd' && cleanId !== 'ssc_gd_constable') {
        series.push({
          id: `${cleanId}_mains`,
          title: isRrbNtpc ? `RRB NTPC CBT 2 Mock Tests` : `${course.title} Mains Mock Tests`,
          type: "mains",
          category: course.category || (isCgl || isChsl ? "SSC Exams" : "RRB & Railways"),
          totalTests: mainsNumTests,
          freeTests: isUnlocked ? mainsNumTests : 0,
          isPurchased: false,
          tests: Array.from({ length: mainsNumTests }, (_, idx) => {
            const tid = getTestId('mains', idx);
            const subTitle = isRrbNtpc ? `RRB NTPC CBT 2 - Test ${idx + 1}` : 
                             (isCgl ? `SSC CGL Mains - Test ${idx + 1}` : 
                             (isChsl ? `SSC CHSL Mains - Test ${idx + 1}` : `${course.title} Mains - Test ${idx + 1}`));
            return {
              id: tid,
              name: isRrbNtpc ? `RRB NTPC CBT 2 - Test ${idx + 1}` : `${course.title} Mains - Test ${idx + 1}`,
              questionsCount: isRrbNtpc ? 120 : 100,
              timeLimit: isRrbNtpc ? 90 : 180,
              free: isUnlocked ? true : false,
              difficulty: idx % 2 === 0 ? "Medium" : "Hard",
              examType: isRrbNtpc ? "RRB NTPC CBT 2" : (isCgl ? "SSC CGL" : (isChsl ? "SSC CHSL" : (course.category || "SSC"))),
              subType: subTitle,
              testId: tid,
              isMains: true,
              seriesId: `${cleanId}_mains`,
              courseTitle: isRrbNtpc ? `RRB NTPC CBT 2` : `${course.title} Mains`
            };
          })
        });
      }
    });

    return series;
  }, [courses]);

  // Set activeExamId to initialCourseId's series if provided
  useEffect(() => {
    if (initialCourseId && mockTestSeries.length > 0) {
      const listToUse = courses.length > 0 ? courses : FALLBACK_COURSES;
      const matched = listToUse.find(c => c.id === initialCourseId);
      if (matched) {
        const cleanId = matched.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const targetSeriesId = `${cleanId}_${filter}`;
        const exists = mockTestSeries.some(s => s.id === targetSeriesId);
        if (exists) {
          setActiveExamId(targetSeriesId);
        }
      }
    }
  }, [initialCourseId, mockTestSeries, filter, courses]);

  // Auto select first exam in filter when filter changes or series are loaded
  useEffect(() => {
    if (mockTestSeries.length > 0) {
      const defaultExam = mockTestSeries.find(s => s.type === filter);
      if (defaultExam) {
        const currentActive = mockTestSeries.find(s => s.id === activeExamId);
        if (!currentActive || currentActive.type !== filter) {
          setActiveExamId(defaultExam.id);
        }
      }
    }
  }, [filter, mockTestSeries, activeExamId]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const selectedSeries = useMemo(() => {
    if (mockTestSeries.length === 0) return null;
    return mockTestSeries.find(s => s.id === activeExamId) || mockTestSeries.find(s => s.type === filter) || mockTestSeries[0];
  }, [activeExamId, filter, mockTestSeries]);

  const matchedCourse = useMemo(() => {
    if (!selectedSeries) return null;
    const listToUse = courses.length > 0 ? courses : FALLBACK_COURSES;
    return listToUse.find(c => {
      const cleanId = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      return selectedSeries.id.startsWith(cleanId) || selectedSeries.id.startsWith(c.id);
    });
  }, [selectedSeries, courses]);

  const sectorInfo = useMemo(() => {
    if (!matchedCourse) return { id: "Banking", name: "Banking" };
    return {
      id: getCourseSectorId(matchedCourse),
      name: getCourseSectorId(matchedCourse)
    };
  }, [matchedCourse]);

  // Helper to map test examType to course category
  const mapExamTypeToCategory = (examType) => {
    switch (examType) {
      case "Banking": return "Bank & Insurance";
      case "SSC": return "SSC Exams";
      case "Railways": return "Railways";
      case "State": return "State Exams";
      case "UPSC": return "UPSC / Civil";
      case "NEET / JEE": return "NEET / JEE";
      default: return "Bank & Insurance";
    }
  };

  // Initialize and run exam timer
  useEffect(() => {
    if (activeExam) {
      const isOfflineMains = activeExam.isMains && (activeExam.seriesId?.includes("upsc") || activeExam.examType === "UPSC");
      if (isOfflineMains) {
        const match = activeExam.id?.match(/_(\d+)$/);
        const mockIndex = match ? parseInt(match[1]) : 1;
        const seriesId = activeExam.seriesId || "upsc_cse_mains";
        const courseTitle = activeExam.courseTitle || "UPSC CSE Mains";
        const mainsMocks = generateMainsMocksForCourseOffline(seriesId, courseTitle);
        const selectedMainsMock = mainsMocks[mockIndex - 1] || mainsMocks[0];
        setQuestions(selectedMainsMock.questions);
        return;
      }
      
      const category = mapExamTypeToCategory(activeExam.examType);
      
      const cleanOptions = (options) => {
        if (!Array.isArray(options)) return [];
        const seenTexts = new Set();
        const uniqueOptions = [];
        const validIds = ["A", "B", "C", "D"];
        
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

        while (uniqueOptions.length < 4) {
          uniqueOptions.push({
            id: validIds[uniqueOptions.length] || String.fromCharCode(65 + uniqueOptions.length),
            text: `Option ${validIds[uniqueOptions.length]}`
          });
        }
        
        return uniqueOptions;
      };

       const fetchQuestionsFromDb = async () => {
        setLoadingQuestions(true);
        try {
          const type = activeExam.examType || category;
          const subType = activeExam.subType || activeExam.name || "";
          const testId = activeExam.testId || activeExam.id || "";
          const res = await fetch(`${BACKEND_URL}/api/exam/questions?exam_type=${encodeURIComponent(type)}&sub_type=${encodeURIComponent(subType)}&test_id=${encodeURIComponent(testId)}&_t=${Date.now()}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            if (data.questions && data.questions.length > 0) {
              const mapped = data.questions.map(q => {
                const cleanedOpts = cleanOptions(q.options);
                const optImgs = q.option_images || [];
                return {
                  question_number: q.question_number,
                  q: q.question || q.question_text || q.q,
                  question_image: q.question_image || "",
                  options: cleanedOpts.map((o, idx) => ({
                    text: o.text,
                    image: optImgs[idx] || null
                  })),
                  correct: q.correct_answer ? (typeof q.correct_answer === 'number' ? q.correct_answer : (q.correct_answer.toUpperCase().charCodeAt(0) - 65)) : 0,
                  correct_answer: q.correct_answer,
                  section: q.section || q.subject || "",
                  subject: q.subject || q.section || "",
                  exam_type: q.exam_type || type,
                  sub_type: q.sub_type || subType,
                  explanation: q.explanation || ""
                };
              });
              setQuestions(mapped);
              setLoadingQuestions(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Error fetching parsed questions, falling back to offline pool:", err);
        }
        
        // Always generate offline questions fallback so test NEVER fails to open
        const fallbackPool = generateMockQuestionsForCategory(category, activeExam.questionsCount || 100);
        setQuestions(fallbackPool);
        setLoadingQuestions(false);
      };

      fetchQuestionsFromDb();
      setTimeLeft(activeExam.timeLimit * 60);
      setAnswers({});
      setConfirmSubmit(false);
      setCurrentQIdx(0);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam]);

  const handleDownloadMainsQuestionPaper = (mock) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the question paper.");
      return;
    }

    let questionsHtml = "";
    mock.questions.forEach((q, idx) => {
      questionsHtml += `
        <div style="margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px dashed #E5E7EB; padding-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
            <span>Q${idx + 1}.</span>
            <span style="color: #4B5563;">[UPSC Mains Mock]</span>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #111827; margin: 0 0 10px 0;">${q.q}</p>
          <div style="border: 1px dashed #D1D5DB; height: 180px; margin-top: 15px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 12px; font-style: italic;">
            [Write your response in this space offline]
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>UPSC Mains Question Paper - ${mock.title}</title>
        <style>
          body { font-family: Georgia, serif; color: #1F2937; margin: 0; padding: 40px; background: white; }
          .header { text-align: center; border-bottom: 2px double #1A365D; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; font-family: sans-serif; color: #1A365D; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: bold; color: #111827; margin: 10px 0; text-transform: uppercase; }
          .meta-info { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #1A365D; border-bottom: 1px solid #1A365D; padding: 8px 0; margin-top: 15px; }
          .instructions { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.5; margin-bottom: 30px; }
          .footer { text-align: center; margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 11px; color: #6B7280; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #1A365D; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: sans-serif;">
            Print / Save as PDF
          </button>
        </div>
        
        <div class="header">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Rajahmundry UPSC Civil Services Hub</div>
          <div class="title">${mock.title}</div>
          <div class="meta-info">
            <span>TIME ALLOWED: ${mock.duration || '3 Hours'}</span>
            <span>MAXIMUM MARKS: ${mock.weightage || 250}</span>
          </div>
        </div>

        <div class="instructions">
          <strong>QUESTION PAPER SPECIFIC INSTRUCTIONS:</strong><br/>
          1. Please read each of the following instructions carefully before attempting questions.<br/>
          2. All questions are compulsory. Write answers in the medium authorized in the Admission Certificate.<br/>
          3. Word limit in questions, wherever specified, should be adhered to.<br/>
          4. Any page or portion of the page left blank in the QCA Booklet must be clearly struck off.
        </div>

        <div>${questionsHtml}</div>

        <div class="footer">
          <p>KR Institute of Learning Hub, Rajahmundry. Promoting Offline & Self-Regulatory Evaluation.</p>
          <p>© 2026 KR Institute of Learning. All rights reserved.</p>
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

  const handleDownloadMainsAnswers = (mock) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to view model answers.");
      return;
    }

    let answersHtml = "";
    mock.questions.forEach((q, idx) => {
      answersHtml += `
        <div style="margin-bottom: 40px; page-break-inside: avoid; border-bottom: 1.5px solid #E5E7EB; padding-bottom: 25px;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #1A365D; font-size: 16px;">
            QUESTION ${idx + 1}:
          </div>
          <p style="font-size: 15px; font-weight: bold; line-height: 1.6; color: #111827; margin: 0 0 15px 0;">${q.q}</p>
          <div style="background: #F0FDF4; border: 1.5px solid #A7F3D0; border-radius: 8px; padding: 20px;">
            <div style="font-weight: 800; color: #065F46; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #A7F3D0; padding-bottom: 5px;">
              💡 Model Answer Key & Evaluation Framework
            </div>
            <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6; color: #047857; margin: 0;">${q.explanation}</pre>
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>UPSC Model Answers - ${mock.title}</title>
        <style>
          body { font-family: Georgia, serif; color: #1F2937; margin: 0; padding: 40px; background: white; }
          .header { text-align: center; border-bottom: 2px double #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; font-family: sans-serif; color: #065F46; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: bold; color: #111827; margin: 10px 0; text-transform: uppercase; }
          .meta-info { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #10B981; border-bottom: 1px solid #10B981; padding: 8px 0; margin-top: 15px; }
          .instructions { background: #ECFDF5; border: 1px solid #A7F3D0; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.5; margin-bottom: 30px; color: #065F46; }
          .footer { text-align: center; margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 11px; color: #6B7280; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
          <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-family: sans-serif;">
            Print / Save Model Answers
          </button>
        </div>
        
        <div class="header">
          <div class="logo">KR INSTITUTE OF LEARNING</div>
          <div class="subtitle">Rajahmundry UPSC Civil Services Hub</div>
          <div class="title">${mock.title} - MODEL SOLUTIONS</div>
          <div class="meta-info">
            <span>UPSC MAINS WRITTEN MOCK</span>
            <span>MODEL EVALUATION SCHEME</span>
          </div>
        </div>

        <div class="instructions">
          <strong>SELF-EVALUATION GUIDELINES:</strong><br/>
          - Compare your offline answer sheet points with the core frameworks provided below.<br/>
          - Award marks based on coverage of core dimensions: Intro (10%), Key points (70%), Formatting/Structure (10%), Conclusion (10%).<br/>
          - Emphasize maps, flowcharts, and contemporary examples to achieve extra marks.
        </div>

        <div>${answersHtml}</div>

        <div class="footer">
          <p>KR Institute of Learning Hub, Rajahmundry. Self-Assessed Model Key.</p>
          <p>© 2026 KR Institute of Learning. All rights reserved.</p>
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

  const handleStartTest = (test) => {
    requestAuth(() => {
      setActiveExam(test);
    });
  };

  const selectQuestion = (idx) => {
    setCurrentQIdx(idx);
    setStatuses(prev => ({
      ...prev,
      [idx]: prev[idx] === "unvisited" ? "visited" : prev[idx]
    }));
  };

  const handleOptionChange = (optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentQIdx]: optionIdx
    }));
  };

  const handleSaveNext = () => {
    const optionSelected = answers[currentQIdx] !== undefined;
    setStatuses(prev => ({
      ...prev,
      [currentQIdx]: optionSelected ? "answered" : "not_answered"
    }));

    if (currentQIdx + 1 < questions.length) {
      selectQuestion(currentQIdx + 1);
    }
  };

  const handleMarkReview = () => {
    setStatuses(prev => ({
      ...prev,
      [currentQIdx]: "marked"
    }));
    if (currentQIdx + 1 < questions.length) {
      selectQuestion(currentQIdx + 1);
    }
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQIdx];
      return updated;
    });
    setStatuses(prev => ({
      ...prev,
      [currentQIdx]: "visited"
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const currentQuestions = questionsRef.current;
    const currentAnswers = answersRef.current;

    currentQuestions.forEach((q, idx) => {
      const selected = currentAnswers[idx];
      if (selected === undefined) {
        unattempted++;
      } else if (selected === q.correct) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const totalQuestions = currentQuestions.length;
    const percentageScore = Math.max(0, Math.round((correct / totalQuestions) * 100));

    return {
      correct,
      incorrect,
      unattempted,
      score: percentageScore,
      accuracy: correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0
    };
  };

  const handleForceSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const results = calculateResults();
    const attempt = {
      id: "attempt_" + Date.now(),
      testName: activeExam.name,
      score: results.score,
      accuracy: results.accuracy,
      date: new Date().toISOString().split("T")[0],
      timeSpent: activeExam.timeLimit - Math.ceil(timeLeft / 60),
      details: {
        correct: results.correct,
        incorrect: results.incorrect,
        unattempted: results.unattempted
      },
      questions: questionsRef.current,
      userAnswers: answersRef.current
    };
    onAddAttempt(attempt);
    setActiveExam(null);
    navigate("results");
  };

  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Group questions by sections
  const sections = [...new Set(questions.map(q => q.section))];
  const activeSection = questions[currentQIdx]?.section;

  if (activeExam) {
    const isOfflineMains = activeExam.isMains && (activeExam.seriesId?.includes("upsc") || activeExam.examType === "UPSC");
    if (isOfflineMains) {
      const match = activeExam.id?.match(/_(\d+)$/);
      const mockIndex = match ? parseInt(match[1]) : 1;
      const seriesId = activeExam.seriesId || "upsc_cse_mains";
      const courseTitle = activeExam.courseTitle || "UPSC CSE Mains";
      const mainsMocks = generateMainsMocksForCourseOffline(seriesId, courseTitle);
      const selectedMainsMock = mainsMocks[mockIndex - 1] || mainsMocks[0];

      return (
        <div className="exam-fullscreen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.95)", color: "white", padding: "20px" }}>
          <div style={{ background: "var(--card)", color: "var(--text)", width: "90%", maxWidth: "650px", padding: "30px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", textAlign: "center", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--navy-text)", marginBottom: "10px" }}>📝 {courseTitle} - Offline Written Mock</h2>
            <h3 style={{ fontSize: "16px", color: "var(--muted)", marginBottom: "24px" }}>{selectedMainsMock.title}</h3>
            
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "16px", borderRadius: "8px", textAlign: "left", marginBottom: "24px", fontSize: "14px", lineHeight: "1.6" }}>
              <h4 style={{ fontWeight: "bold", marginBottom: "8px", color: "var(--navy-text)" }}>Offline Attempt Guidelines:</h4>
              <p style={{ margin: "4px 0" }}>1. <strong>Print the question paper</strong> using the button below to solve it on physical papers.</p>
              <p style={{ margin: "4px 0" }}>2. Set a timer for <strong>3 Hours (180 Mins)</strong> and solve the questions in a quiet room.</p>
              <p style={{ margin: "4px 0" }}>3. Once completed, download the <strong>Model Answers PDF</strong> to crosscheck and grade your responses.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                onClick={() => handleDownloadMainsQuestionPaper(selectedMainsMock)}
                style={{ padding: "12px 20px", background: "var(--blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
              >
                🖨️ Print / Save Question Paper PDF
              </button>
              <button 
                onClick={() => handleDownloadMainsAnswers(selectedMainsMock)}
                style={{ padding: "12px 20px", background: "var(--gold-bg)", color: "var(--text)", border: "1.5px solid var(--gold)", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
              >
                💡 Download Model Answers & Key PDF
              </button>
              <button 
                onClick={() => setActiveExam(null)}
                style={{ padding: "12px 20px", background: "#EF4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "15px", marginTop: "12px" }}
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      );
    }

    const mapExamTypeToPattern = (cat) => {
      const c = (cat || "").toLowerCase();
      if (c.includes("bank") || c.includes("insur")) return "Banking";
      if (c.includes("ssc")) return "SSC";
      if (c.includes("rail") || c.includes("rrb")) return "RRB";
      if (c.includes("state") || c.includes("appsc")) return "APPSC Groups";
      if (c.includes("upsc")) return "UPSC";
      return "SSC"; // default
    };

    const mockData = {
      questions: questions.map((q, idx) => ({
        question_number: idx + 1,
        question_text: q.q || q.question_text || "",
        question_image: q.question_image || "",
        options: (q.options || []).map((opt, oIdx) => ({
          id: String.fromCharCode(65 + oIdx), // 'A', 'B', 'C', 'D'
          text: typeof opt === 'object' && opt.text ? opt.text : opt,
          image: typeof opt === 'object' && opt.image ? opt.image : null
        })),
        correct_answer: q.correct_answer || String.fromCharCode(65 + (q.correct !== undefined ? q.correct : 0)),
        correct: (() => {
          if (q.correct !== undefined && q.correct !== null) return q.correct;
          if (q.correct_answer !== undefined && q.correct_answer !== null) {
            if (typeof q.correct_answer === 'number') return q.correct_answer;
            const val = String(q.correct_answer).trim().toUpperCase();
            if (val) {
              if (!isNaN(val)) return parseInt(val, 10);
              return val.charCodeAt(0) - 65;
            }
          }
          return 0;
        })(),
        exam_type: q.exam_type || mapExamTypeToPattern(activeExam.category || activeExam.examType),
        sub_type: q.sub_type || activeExam.name || "Mock Test",
        section: q.section || "",
        explanation: q.explanation || ""
      }))
    };

    return (
      <MockTestScreen
        mockData={mockData}
        loading={loadingQuestions}
        user={user}
        onGoBack={() => setActiveExam(null)}
        onSubmit={async (result) => {
          if (result) {
            // Map selected letters (A, B, C, D) to option indices (0, 1, 2, 3) safely
            const mappedUserAnswers = {};
            if (result.responses) {
              result.responses.forEach(r => {
                const qIdx = r.question_number - 1;
                if (r.selected_option) {
                  const val = String(r.selected_option).trim().toUpperCase();
                  if (val) {
                    if (!isNaN(val)) {
                      mappedUserAnswers[qIdx] = parseInt(val, 10);
                    } else {
                      mappedUserAnswers[qIdx] = val.charCodeAt(0) - 65;
                    }
                  }
                }
              });
            }

            // Map mockData questions list to scorecard format with diagram images support safely
            const scorecardQuestions = mockData.questions.map(q => {
              let correctIdx = 0;
              if (q.correct !== undefined && q.correct !== null) {
                correctIdx = q.correct;
              } else if (q.correct_answer !== undefined && q.correct_answer !== null) {
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
                options: (q.options || []).map(opt => typeof opt === 'object' && opt.text !== undefined ? opt.text : opt),
                correct: correctIdx,
                section: q.section || "General",
                explanation: q.explanation || "",
                question_image: q.question_image || "",
                option_images: (q.options || []).map(opt => typeof opt === 'object' && opt.image !== undefined ? opt.image : null)
              };
            });

            // Start saving the mock test attempt in the background and return promise
            return onAddAttempt({
              testName: activeExam.name,
              score: result.score,
              accuracy: result.accuracy,
              timeSpent: result.timeSpent || 60,
              details: result.details,
              questions: scorecardQuestions,
              userAnswers: mappedUserAnswers
            });
          }
        }}
      />
    );
  }

  const handlePurchasePlan = async (planType) => {
    if (!user) {
      alert("Please log in to purchase mock test packages.");
      requestAuth();
      return;
    }

    // 1. Determine plan amount
    const isPrelims = filter === "prelims";
    let amount = 999; // default for sector plans
    if (planType === "single-prelims") {
      amount = 299;
    } else if (planType === "single-mains") {
      amount = 399;
    }

    if (matchedCourse?.id === "sbi_po") {
      amount = 10;
    }

    try {
      const token = localStorage.getItem("kr_token") || user.token;
      
      // 2. Request backend order creation
      const orderRes = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          courseId: matchedCourse?.id,
          sectorId: sectorInfo?.id,
          planType
        })
      });

      if (!orderRes.ok) {
        throw new Error("Failed to initialize payment transaction.");
      }

      const orderData = await orderRes.json();

      // Helper function to complete verification
      const verifyAndUnlock = async (verificationPayload) => {
        const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            ...verificationPayload,
            email: user.email,
            courseId: matchedCourse?.id,
            sectorId: sectorInfo?.id,
            planType
          })
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const updatedUserObj = verifyData.user;
          
          // Re-attach token for active session
          const completedUser = { ...updatedUserObj, token };
          
          alert(`🎉 Purchase Successful! Unlocked plan: ${planType}`);
          if (typeof setUser === "function") {
            setUser(completedUser);
          }
          localStorage.setItem("kr_user", JSON.stringify(completedUser));
          setActivePurchaseSeries(null);
        } else {
          alert("Payment verification failed. Please contact support.");
        }
      };

      // 3. Open Checkout (Real or Simulated)
      if (orderData.simulated) {
        console.log("[PAYMENT] Operating in simulation mode.");
        const confirmSim = window.confirm(
          `[TEST MODE SIMULATOR]\n\nDo you want to simulate a successful payment of ₹${amount} for unlocking this plan?`
        );
        if (confirmSim) {
          await verifyAndUnlock({ simulated: true });
        }
      } else {
        const options = {
          key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "KR Institute of Learning",
          description: `Unlock Plan: ${planType}`,
          order_id: orderData.id,
          prefill: {
            name: user.name || "",
            email: user.email || "",
            contact: user.phone || ""
          },
          theme: {
            color: "#1B365D"
          },
          handler: async function (response) {
            await verifyAndUnlock({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function () {
              alert("Payment cancelled.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert(`Network error during purchase initiation: ${err.message}`);
    }
  };

  return (
    <div className="mock-tests-page">
      <div className="back-home-wrapper">
        <button className="btn-back-home" onClick={() => navigate("home")}>
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>

      {/* Mobile-Only Active Exam Header bar */}
      <div className="mobile-mt-header">
        <button className="btn-toggle-sidebar" onClick={() => setShowMobileSidebar(true)}>
          ☰ Select Exam
        </button>
        <span className="mobile-active-exam">{selectedSeries?.title.replace(" Mock Tests", "")}</span>
      </div>

      <div className="mt-two-panel-layout">
        
        {/* Left Sidebar Panel */}
        <div className={`mt-sidebar-panel ${showMobileSidebar ? "mobile-open" : ""}`}>
          <div className="sidebar-header-row">
            <h3>Mock Tests</h3>
            <button className="mobile-close-sidebar-btn" onClick={() => setShowMobileSidebar(false)}>×</button>
          </div>
          
          {/* Segmented Switcher inside Sidebar */}
          <div className="sidebar-tab-switcher">
            <button 
              className={`sidebar-tab-btn ${filter === "prelims" ? "active" : ""}`}
              onClick={() => {
                setFilter("prelims");
                setSearchTerm(""); // clear search when switching tabs
              }}
            >
              Prelims
            </button>
            <button 
              className={`sidebar-tab-btn ${filter === "mains" ? "active" : ""}`}
              onClick={() => {
                setFilter("mains");
                setSearchTerm(""); // clear search when switching tabs
              }}
            >
              Mains
            </button>
          </div>

          {/* Search Bar inside Sidebar */}
          <div className="sidebar-search-box">
            <input 
              type="text" 
              placeholder="🔍 Search exam name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          {/* Vertical Clickable Rows */}
          <div className="sidebar-exam-list">
            {mockTestSeries
              .filter(s => s.type === filter)
              .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(series => (
              <div 
                key={series.id}
                className={`sidebar-exam-item ${activeExamId === series.id ? "active" : ""}`}
                onClick={() => {
                  setActiveExamId(series.id);
                  setShowMobileSidebar(false);
                }}
              >
                <ChevronRight size={14} className="exam-item-chevron" />
                <span className="exam-item-name">{series.title.replace(" Mock Tests", "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="mt-content-panel">
          {selectedSeries ? (
            <>
              <div className="content-panel-header">
                <div className="header-info-col">
                  <h2>{selectedSeries.title}</h2>
                  <p>{selectedSeries.totalTests} Full Length Mock Test Papers</p>
                </div>
                
                {!unlockedSeries.has(selectedSeries.id) && (
                  <button 
                    className="btn-buy-series-right"
                    onClick={() => setActivePurchaseSeries(selectedSeries)}
                  >
                    Unlock Test Series
                  </button>
                )}
              </div>

              {/* Clean test rows list */}
              <div className="test-rows-container">
                {selectedSeries.tests.map((test) => {
                  const isSeriesUnlocked = unlockedSeries.has(selectedSeries.id);
                  const isUnlocked = test.free || isSeriesUnlocked;
                  return (
                    <div 
                      className={`test-row-item ${isUnlocked ? "unlocked" : "locked"}`}
                      key={test.id}
                      onClick={() => {
                        if (isUnlocked) {
                          handleStartTest(test);
                        } else {
                          setLockedAlert(selectedSeries);
                        }
                      }}
                    >
                      <div className="test-row-left-group">
                        <div className="test-row-icon">
                          {isUnlocked ? <FileText size={18} color="#10b981" /> : <Lock size={18} color="#94a3b8" />}
                        </div>
                        <div className="test-row-details">
                          <span className="test-row-name">{test.name}</span>
                          <span className="test-row-info-meta">
                            {test.questionsCount} Qs • {test.timeLimit} Mins • Latest 2026 TCS Exam Pattern
                          </span>
                        </div>
                      </div>

                      <div className="test-row-right-group">
                        {test.free ? (
                          <span className="badge-free-pill">FREE</span>
                        ) : isSeriesUnlocked ? (
                          <span className="badge-unlocked-pill">UNLOCKED</span>
                        ) : (
                          <span className="badge-locked-pill">🔒 Locked</span>
                        )}
                        
                        <button className={`btn-test-action ${isUnlocked ? "start-btn" : "unlock-btn"}`}>
                          {isUnlocked ? "Start Test" : "Unlock"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-series-selected">
              <h3>Select an exam from the sidebar to view mock tests.</h3>
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphic Purchase Modal */}
      {activePurchaseSeries && (() => {
        const isPrelims = filter === "prelims";
        const singlePrice = isPrelims ? "₹299" : "₹399";
        const sectorPrice = "₹999";
        const planName = isPrelims ? "Prelims" : "Mains";
        const singlePlanType = isPrelims ? "single-prelims" : "single-mains";
        const sectorPlanType = isPrelims ? "sector-prelims" : "sector-mains";
        const courseTitleClean = matchedCourse ? matchedCourse.title : (activePurchaseSeries.title.replace(" Mock Tests", ""));
        
        return (
          <div className="purchase-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div className="purchase-modal-card" style={{ maxWidth: "800px", width: "95%", borderRadius: "24px", background: "rgba(15, 23, 42, 0.98)", border: "1.5px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)", backdropFilter: "blur(20px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="purchase-modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: "#FFFFFF", fontFamily: "'Sora', sans-serif" }}>
                    🚀 Unlock {planName} Test Series
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#cbd5e1", fontFamily: "'Sora', sans-serif" }}>
                    Choose the package that fits your preparation goals.
                  </p>
                </div>
                <button className="close-modal-btn" onClick={() => setActivePurchaseSeries(null)} style={{ background: "transparent", border: "none", color: "#cbd5e1", fontSize: "28px", cursor: "pointer", display: "flex", alignItems: "center" }}>&times;</button>
              </div>

              <div className="purchase-modal-body" style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                
                {/* Card 1: Single Course Unlock */}
                <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1.5px solid rgba(255, 255, 255, 0.06)", borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "all 0.3s ease" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: "800", color: "#FFFFFF", fontFamily: "'Sora', sans-serif" }}>
                      Unlock Single Course {planName}
                    </h4>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#cbd5e1", fontFamily: "'Sora', sans-serif" }}>
                      Unlock full mock tests for {courseTitleClean} only.
                    </p>
                    
                    <div style={{ margin: "16px 0", display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{ fontSize: "28px", fontWeight: "900", color: "#ef4444", fontFamily: "'Sora', sans-serif" }}>{singlePrice}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through" }}>{isPrelims ? "₹499" : "₹699"}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 0", fontSize: "13px", color: "#cbd5e1" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> All {courseTitleClean} {planName} Tests
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> First 3 Sectional Quizzes Free
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Complete {planName} Access
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-confirm-payment"
                    onClick={() => handlePurchasePlan(singlePlanType)}
                    style={{ width: "100%", padding: "12px", background: "transparent", border: "1.5px solid #ef4444", color: "#ef4444", borderRadius: "10px", fontWeight: "800", fontSize: "13.5px", cursor: "pointer", transition: "all 0.25s ease" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                  >
                    Purchase {singlePrice}
                  </button>
                </div>

                {/* Card 2: Complete Sector Unlock (Recommended) */}
                <div style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))", border: "2px solid #ef4444", borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", boxShadow: "0 10px 25px rgba(239, 68, 68, 0.15)" }}>
                  <div style={{ position: "absolute", top: "-12px", right: "20px", background: "#ef4444", color: "#FFFFFF", fontSize: "10px", fontWeight: "900", padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", zIndex: 5 }}>
                    ⭐ Best Value Plan
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: "800", color: "#FFFFFF", fontFamily: "'Sora', sans-serif" }}>
                      Unlock All {sectorInfo.name} {planName}
                    </h4>
                    <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#cbd5e1", fontFamily: "'Sora', sans-serif" }}>
                      Unlock all {sectorInfo.name} exam {planName} tests + all Sectional Quizzes in this category!
                    </p>
                    
                    <div style={{ margin: "16px 0", display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{ fontSize: "28px", fontWeight: "900", color: "#10b981", fontFamily: "'Sora', sans-serif" }}>{sectorPrice}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through" }}>₹2,499</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 0", fontSize: "13px", color: "#cbd5e1" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Unlock ALL {sectorInfo.name} {planName} Exams
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Unlimited Sectional Quizzes
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Full {sectorInfo.name} Sector Access
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-confirm-payment"
                    onClick={() => handlePurchasePlan(sectorPlanType)}
                    style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "#ffffff", borderRadius: "10px", fontWeight: "800", fontSize: "13.5px", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)", transition: "all 0.25s ease" }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(239, 68, 68, 0.35)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.2)"; }}
                  >
                    💳 Pay {sectorPrice} & Unlock
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Locked Alert Warning Popup */}
      {lockedAlert && (
        <div className="locked-alert-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="locked-alert-card" style={{ maxWidth: "450px", width: "100%", borderRadius: "20px", background: "rgba(15, 23, 42, 0.95)", border: "1.5px solid rgba(255, 255, 255, 0.1)", padding: "28px", textAlign: "center", boxShadow: "0 15px 35px rgba(0, 0, 0, 0.5)", backdropFilter: "blur(20px)" }}>
            <div className="lock-icon-container" style={{ width: "60px", height: "60px", background: "rgba(239, 68, 68, 0.1)", border: "2px solid #ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", fontSize: "24px" }}>
              🔒
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#FFFFFF", fontFamily: "'Sora', sans-serif", fontWeight: "800" }}>Test Series Locked</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "13.5px", color: "#cbd5e1", lineHeight: "1.5", fontFamily: "'Sora', sans-serif" }}>
              Unlock all tests in the <strong>{lockedAlert.title}</strong> by purchasing this series.
            </p>
            
            <div className="locked-alert-actions" style={{ display: "flex", gap: "12px" }}>
              <button 
                className="btn-alert-close" 
                onClick={() => setLockedAlert(null)}
                style={{ flex: 1, padding: "12px", background: "rgba(255, 255, 255, 0.08)", border: "none", color: "#FFFFFF", borderRadius: "10px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
              >
                Cancel
              </button>
              <button 
                className="btn-alert-buy"
                onClick={() => {
                  setActivePurchaseSeries(lockedAlert);
                  setLockedAlert(null);
                }}
                style={{ flex: 1, padding: "12px", background: "#ef4444", border: "none", color: "#FFFFFF", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                Unlock Test Series
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
