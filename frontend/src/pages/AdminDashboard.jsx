import React, { useState, useEffect, useRef } from "react";
import { 
  Users, Award, Bell, Settings, Search, RefreshCw, Send, Play, ShieldAlert, BookOpen, ChevronDown, ChevronUp, Clock,
  MessageSquare, Bot, Download, Filter, Calendar, TrendingUp, BarChart2, Upload, Check
} from "lucide-react";
import { ALL_EXAMS } from "../data/exams";
import "./AdminDashboard.css";
import axios from "axios";
import ReviewQueue from "./ReviewQueue";

export default function AdminDashboard({ user, navigate, logout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [scrapers, setScrapers] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  
  // Advanced sorting and filtering
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState("name"); // 'name' | 'attempts' | 'score' | 'accuracy'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const [filterMinAttempts, setFilterMinAttempts] = useState("all"); // 'all' | '0' | '1' | '5'
  const [filterScoreBoundary, setFilterScoreBoundary] = useState("all"); // 'all' | 'high' (>=75%) | 'low' (<50%)
  const [filterCourse, setFilterCourse] = useState("all");

  // Drawer Search
  const [drawerSearch, setDrawerSearch] = useState("");

  // Scraper logs filtering
  const [scraperLogSearch, setScraperLogSearch] = useState("");
  const [scraperLogStatus, setScraperLogStatus] = useState("ALL"); // 'ALL' | 'SUCCESS' | 'FAILED'
  
  // Scraper Actions
  const [runningScrapers, setRunningScrapers] = useState({});
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Broadcast history local state
  const [broadcastHistory, setBroadcastHistory] = useState(() => {
    const saved = localStorage.getItem("kr_broadcast_history");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "SBI PO Mock Test Live!", message: "The first comprehensive SBI PO Prelims mock test is now available. Log in to take the test.", date: "2026-06-18 10:15 AM" },
      { id: 2, title: "System Maintenance Scheduled", message: "KR Institute of Learning portals will undergo standard optimization tonight between 2 AM to 4 AM IST.", date: "2026-06-12 04:00 PM" }
    ];
  });

  // Chart tooltip state
  const [chartTooltip, setChartTooltip] = useState(null);

  // Student Registration & Access states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regAssignedCourses, setRegAssignedCourses] = useState([]);
  const [regSearchTerm, setRegSearchTerm] = useState("");
  const [regCourseFilter, setRegCourseFilter] = useState("");
  const [regDateFilter, setRegDateFilter] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [regSelectedCourse, setRegSelectedCourse] = useState("");
  const [regStudents, setRegStudents] = useState([]);
  const [editingRegStudent, setEditingRegStudent] = useState(null);
  const [regFormLoading, setRegFormLoading] = useState(false);

  // Bulk Exam Parser states
  const [examType, setExamType] = useState("");
  const [subType, setSubType] = useState("");
  const [subject, setSubject] = useState("");
  const [isFullMock, setIsFullMock] = useState(false);
  const [sectionRanges, setSectionRanges] = useState([{ name: "", start: "", end: "" }]);
  const [importMode, setImportMode] = useState("skip_duplicates");
  const [questionsFile, setQuestionsFile] = useState(null);
  const [keysFile, setKeysFile] = useState(null);
  const [parserLoading, setParserLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState("");
  const [importId, setImportId] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? (window.location.protocol + "//" + window.location.hostname + ":5000")
    : "");

  // Restrict access
  const isAdmin = user && user.email && user.email.includes("admin") && !user.email.includes("superadmin");

  useEffect(() => {
    if (!isAdmin) {
      navigate("home");
      return;
    }
    fetchData();
  }, [user]);

  const fetchImportHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/imports`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data && data.success) {
        setImportHistory(data.history || []);
      }
    } catch (e) {
      console.error("Error fetching import history:", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchScrapers(),
        fetchRuns(),
        fetchRegStudents(),
        fetchRegCourses(),
        fetchImportHistory()
      ]);
    } catch (e) {
      console.error("Error fetching admin stats:", e);
    } finally {
      setLoading(false);
    }
  };

  // Headers helper
  const getHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (user && user.email) {
      headers["x-user-email"] = user.email;
    }
    if (user && user.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
    }
    return headers;
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: getHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        if (logout) logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScrapers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scrapers`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setScrapers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegStudents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/manager/students`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setRegStudents(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegCourses = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/courses/all`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setAllCourses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCourseToReg = () => {
    if (!regSelectedCourse) return;
    if (regAssignedCourses.includes(regSelectedCourse)) {
      showNotification("Course Already Assigned", "This course is already in the list.");
      return;
    }
    setRegAssignedCourses(prev => [...prev, regSelectedCourse]);
    setRegSelectedCourse("");
  };

  const handleRemoveCourseFromReg = (courseId) => {
    setRegAssignedCourses(prev => prev.filter(c => c !== courseId));
  };

  const handleRegisterOrUpdateStudent = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regMobile.trim()) {
      showNotification("Missing Fields", "Name, Email and Mobile number are required.");
      return;
    }

    setRegFormLoading(true);
    const payload = {
      name: regName.trim(),
      email: regEmail.trim(),
      mobile: regMobile.trim(),
      assignedCourses: regAssignedCourses
    };

    try {
      let res;
      if (editingRegStudent) {
        res = await fetch(`${BACKEND_URL}/api/manager/student/${editingRegStudent._id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${BACKEND_URL}/api/manager/register-student`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok) {
        showNotification(
          editingRegStudent ? "Student Updated" : "Student Registered",
          editingRegStudent ? "Successfully updated student access permissions." : "Successfully created student record & access permissions."
        );
        setRegName("");
        setRegEmail("");
        setRegMobile("");
        setRegAssignedCourses([]);
        setEditingRegStudent(null);
        fetchRegStudents();
      } else {
        showNotification("Action Failed", data.error || "Failed to submit student details.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error", "Network error saving student details.");
    } finally {
      setRegFormLoading(false);
    }
  };

  const handleEditRegStudent = (student) => {
    setEditingRegStudent(student);
    setRegName(student.name);
    setRegEmail(student.email);
    setRegMobile(student.mobile);
    setRegAssignedCourses(student.assignedCourses || []);
  };

  const handleCancelRegEdit = () => {
    setEditingRegStudent(null);
    setRegName("");
    setRegEmail("");
    setRegMobile("");
    setRegAssignedCourses([]);
  };

  const handleDeleteRegStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? All their course access will be locked.`)) {
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/manager/student/${studentId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        showNotification("Student Deleted", "Registration record and course access removed.");
        fetchRegStudents();
      } else {
        const data = await res.json();
        showNotification("Delete Failed", data.error || "Could not delete student registration.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error", "Network error deleting student.");
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scrapers/runs?limit=15`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerScraper = async (name) => {
    setRunningScrapers(prev => ({ ...prev, [name]: true }));
    showNotification("Triggering...", `Crawler: ${name} manually started.`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scrapers/${name}/run`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("Success", `Crawler completed! Found: ${data.jobs_found}, Added: ${data.jobs_added}`);
        fetchScrapers();
        fetchRuns();
      } else {
        showNotification("Failed", `Error: ${data.error || "Scraper execution failed"}`);
      }
    } catch (err) {
      showNotification("Error", "Server connection failed.");
    } finally {
      setRunningScrapers(prev => ({ ...prev, [name]: false }));
    }
  };

  const toggleScraperActive = async (name, currentActive) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scrapers/${name}/config`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !currentActive })
      });
      if (res.ok) {
        showNotification("Config Saved", `Scraper ${name} state toggled.`);
        fetchScrapers();
      }
    } catch (e) {
      showNotification("Error", "Could not toggle configuration.");
    }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    setBroadcasting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/broadcast`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("Broadcast Sent", `Dispatched alerts to ${data.tokens_sent || 0} devices.`);
        const newAlert = {
          id: Date.now(),
          title: broadcastTitle,
          message: broadcastMsg,
          date: new Date().toLocaleString()
        };
        const updatedHistory = [newAlert, ...broadcastHistory];
        setBroadcastHistory(updatedHistory);
        localStorage.setItem("kr_broadcast_history", JSON.stringify(updatedHistory));
        setBroadcastTitle("");
        setBroadcastMsg("");
      } else {
        showNotification("Broadcast Failed", data.error || "Failed to broadcast message");
      }
    } catch (err) {
      showNotification("Error", "Server connection failed.");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const isSubjectRequired = !isFullMock;
    if (!questionsFile || !keysFile || !examType || !subType || (isSubjectRequired && !subject)) {
      alert("Please fill all fields and select both PDFs!");
      return;
    }

    if (isFullMock) {
      if (sectionRanges.length === 0 || sectionRanges.some(sr => !sr.name || !sr.start || !sr.end)) {
        alert("Please configure all section names and start/end question ranges for the Full Mock Exam!");
        return;
      }
    }

    const formData = new FormData();
    formData.append('exam_type', examType);
    formData.append('paper_name', subType);
    formData.append('subject', isFullMock ? "Full Mock Test" : subject);
    formData.append('questions_pdf', questionsFile);
    formData.append('keys_pdf', keysFile);
    if (isFullMock) {
      formData.append('section_ranges', JSON.stringify(sectionRanges));
    }

    setParserLoading(true);
    setUploadProgress(0);
    setTerminalLogs('Starting PDF parser upload stage...\n');
    setPreviewData([]);
    setReportSummary(null);

    try {
      let resolvedToken = "";
      if (user && user.token) {
        resolvedToken = user.token;
      }
      if (!resolvedToken) {
        try {
          const savedUser = JSON.parse(localStorage.getItem("kr_user"));
          if (savedUser && savedUser.token) {
            resolvedToken = savedUser.token;
          }
        } catch (e) {}
      }
      const response = await axios.post(`${BACKEND_URL}/api/papers/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${resolvedToken}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setTerminalLogs(prev => prev + "Files uploaded. Parsing and matching keys inside background...\n");
          }
        }
      });

      if (response.data && response.data.success) {
        setImportId(response.data.import_id);
        setPreviewData(response.data.preview || []);
        setReportSummary(response.data.report || null);
        setTerminalLogs(prev => prev + `\n✅ PDF PARSED SUCCESSFULLY!\n` +
          `Confidence Score: ${response.data.report.confidence}%\n` +
          `Questions Found: ${response.data.report.questions_found}\n` +
          `Keys Found: ${response.data.report.keys_found}\n` +
          `Please review the preview below and click "Confirm Import" to insert into the database.\n`
        );
      }
    } catch (error) {
      const serverMsg = error.response?.data?.error || error.response?.data?.details || error.message;
      setTerminalLogs(prev => prev + `\n❌ ERROR: Ingestion failed.\n${serverMsg}\n`);
    } finally {
      setParserLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importId) return;
    setIsConfirmingImport(true);
    setTerminalLogs(prev => prev + "\nCommitting validated questions to MongoDB Question Bank via transaction...\n");
    try {
      let resolvedToken = "";
      if (user && user.token) resolvedToken = user.token;
      const response = await axios.post(`${BACKEND_URL}/api/papers/confirm-import`, {
        import_id: importId,
        course: subType,
        exam_type: examType,
        paper_name: subType,
        subject: subject,
        import_mode: importMode
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedToken}`
        }
      });

      if (response.data && response.data.success) {
        setTerminalLogs(prev => prev + `\n🚀 IMPORT COMPLETED SUCCESSFULLY!\n` +
          `Questions Imported: ${response.data.inserted}\n` +
          `Duplicates Skipped: ${response.data.duplicates}\n` +
          `Total Database Questions: ${response.data.db_total_questions}\n` +
          `Import Session: ${importId}\n`
        );
        setImportId("");
        setPreviewData([]);
        setReportSummary(null);
        fetchImportHistory();
      }
    } catch (error) {
      const serverMsg = error.response?.data?.error || error.message;
      setTerminalLogs(prev => prev + `\n❌ IMPORT ERROR: ${serverMsg}\n`);
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleClearQuestionBank = async () => {
    if (clearConfirmText !== "CLEAR_QUESTION_BANK") {
      alert("Please enter the correct confirmation phrase!");
      return;
    }
    try {
      let resolvedToken = "";
      if (user && user.token) resolvedToken = user.token;
      const response = await axios.post(`${BACKEND_URL}/api/admin/clear-questions`, {
        confirm_phrase: clearConfirmText
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedToken}`
        }
      });
      if (response.data && response.data.success) {
        alert(response.data.message);
        setShowClearModal(false);
        setClearConfirmText("");
        setTerminalLogs(prev => prev + `\n🗑️ ${response.data.message}\n`);
        fetchImportHistory();
      }
    } catch (error) {
      alert(error.response?.data?.error || error.message);
    }
  };


  const handleScraperIntervalChange = async (name, intervalMinutes) => {
    const scraperObj = scrapers.find(s => s.name === name);
    if (!scraperObj) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scrapers/${name}/config`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ is_active: scraperObj.is_active, interval_minutes: parseInt(intervalMinutes) })
      });
      if (res.ok) {
        showNotification("Config Saved", `Crawler frequency set to ${intervalMinutes} minutes.`);
        fetchScrapers();
      } else {
        showNotification("Save Failed", "Could not update interval.");
      }
    } catch (err) {
      showNotification("Error", "Network connection failed.");
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    const headers = ["Student Name", "Email Address", "Phone", "Attempts Count", "Average Score %", "Average Accuracy %", "Unlocked Courses"];
    const rows = filteredStudents.map(s => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      s.attemptsCount,
      `${s.avgScore}%`,
      `${s.avgAccuracy}%`,
      `"${s.unlockedCourses.join(', ')}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KR_Academy_Students_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showNotification = (title, body) => {
    setNotification({ title, body });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleCourseUnlock = async (studentId, studentEmail, courseId, checkState) => {
    const studentObj = students.find(s => s._id === studentId);
    if (!studentObj) return;

    const currentUnlocked = studentObj.unlockedCourses || [];
    let nextUnlocked;
    if (checkState) {
      nextUnlocked = [...currentUnlocked, courseId];
    } else {
      nextUnlocked = currentUnlocked.filter(id => id !== courseId);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${studentId}/unlocked-courses`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ unlockedCourses: nextUnlocked })
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => {
          if (s._id === studentId) {
            return { ...s, unlockedCourses: nextUnlocked };
          }
          return s;
        }));
        showNotification("Access Updated", `Course access updated for ${studentEmail}`);
      } else {
        showNotification("Update Failed", "Could not save course access changes.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error", "Network error updating course access.");
    }
  };

  const filteredStudents = students
    .filter(s => {
      // 1. Search Query
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                            s.email.toLowerCase().includes(search.toLowerCase()) ||
                            s.phone.includes(search);
      if (!matchesSearch) return false;

      // 2. Minimum Attempts Filter
      if (filterMinAttempts === "none" && s.attemptsCount > 0) return false;
      if (filterMinAttempts === "1" && s.attemptsCount < 1) return false;
      if (filterMinAttempts === "5" && s.attemptsCount < 5) return false;

      // 3. Average Score Boundary Filter
      if (filterScoreBoundary === "high" && s.avgScore < 75) return false;
      if (filterScoreBoundary === "low" && s.avgScore >= 50) return false;

      // 4. Course Filter
      if (filterCourse !== "all") {
        const hasCourse = s.courses.some(c => c.toLowerCase().includes(filterCourse.toLowerCase())) || 
                          (s.unlockedCourses && s.unlockedCourses.includes(filterCourse));
        if (!hasCourse) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortField === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === "attempts") {
        valA = a.attemptsCount;
        valB = b.attemptsCount;
      } else if (sortField === "score") {
        valA = a.avgScore;
        valB = b.avgScore;
      } else if (sortField === "accuracy") {
        valA = a.avgAccuracy;
        valB = b.avgAccuracy;
      } else {
        return 0;
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  const totalAttempts = students.reduce((sum, s) => sum + s.attemptsCount, 0);

  // Chart Calculations
  const scoreBuckets = {
    excellent: students.filter(s => s.avgScore >= 90).length,
    good: students.filter(s => s.avgScore >= 70 && s.avgScore < 90).length,
    average: students.filter(s => s.avgScore >= 50 && s.avgScore < 70).length,
    low: students.filter(s => s.avgScore > 0 && s.avgScore < 50).length,
    none: students.filter(s => s.attemptsCount === 0).length
  };

  const attemptsByExam = {
    "SBI PO": 0,
    "SBI Clerk": 0,
    "SSC CGL": 0,
    "RRB NTPC": 0,
    "IBPS PO/Clerk": 0,
    "Others": 0
  };

  students.forEach(s => {
    if (s.attempts) {
      s.attempts.forEach(a => {
        const name = a.testName.toLowerCase();
        if (name.includes("sbi po")) attemptsByExam["SBI PO"]++;
        else if (name.includes("sbi clerk")) attemptsByExam["SBI Clerk"]++;
        else if (name.includes("ssc cgl")) attemptsByExam["SSC CGL"]++;
        else if (name.includes("rrb ntpc")) attemptsByExam["RRB NTPC"]++;
        else if (name.includes("ibps")) attemptsByExam["IBPS PO/Clerk"]++;
        else attemptsByExam["Others"]++;
      });
    }
  });

  const maxScoreBucket = Math.max(
    scoreBuckets.excellent,
    scoreBuckets.good,
    scoreBuckets.average,
    scoreBuckets.low,
    scoreBuckets.none,
    1
  );

  const examCategories = Object.keys(attemptsByExam);
  const examCounts = Object.values(attemptsByExam);
  const getFilteredCoursesForBulk = () => {
    return allCourses;
  };

  const maxExamCount = Math.max(...examCounts, 1);
  
  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <ShieldAlert size={48} />
        <h2>Access Denied</h2>
        <p>You do not have the administrative privileges required to view this dashboard.</p>
        <button onClick={() => navigate("home")}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {notification && (
        <div className="admin-toast-notif">
          <strong>{notification.title}</strong>
          <p>{notification.body}</p>
        </div>
      )}

      <header className="admin-header">
        <div className="title-area">
          <ShieldAlert className="admin-icon" size={24} />
          <h2>KR Institute of Learning Administration Console</h2>
          <span className="live-pill">Global Control</span>
        </div>

        <nav className="tab-navigation">
          <button className={`tab-link ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            Overview
          </button>
          <button className={`tab-link ${activeTab === "students" ? "active" : ""}`} onClick={() => setActiveTab("students")}>
            Students &amp; Results
          </button>
          <button className={`tab-link ${activeTab === "register_students" ? "active" : ""}`} onClick={() => setActiveTab("register_students")}>
            Register Students
          </button>
          <button className={`tab-link ${activeTab === "scrapers" ? "active" : ""}`} onClick={() => setActiveTab("scrapers")}>
            Crawler Systems
          </button>
          <button className={`tab-link ${activeTab === "broadcast" ? "active" : ""}`} onClick={() => setActiveTab("broadcast")}>
            Push Alerts Broadcast
          </button>
          <button className={`tab-link ${activeTab === "review_queue" ? "active" : ""}`} onClick={() => setActiveTab("review_queue")}>
            Review Queue
          </button>
          <button className="tab-link refresh-btn" onClick={fetchData} title="Refresh All Data">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </nav>
      </header>

      {loading && students.length === 0 ? (
        <div className="admin-loading-screen">
          <div className="spinner"></div>
          <p>Analyzing system models and statistics...</p>
        </div>
      ) : (
        <div className="admin-tab-content-wrapper">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="stats-grid-admin">
                <div className="stat-card-admin">
                  <div className="stat-icon-wrapper blue">
                    <Users size={24} />
                  </div>
                  <div className="stat-val-admin">{students.length}</div>
                  <div className="stat-lbl-admin">Registered Students</div>
                </div>

                <div className="stat-card-admin">
                  <div className="stat-icon-wrapper green">
                    <Award size={24} />
                  </div>
                  <div className="stat-val-admin">{totalAttempts}</div>
                  <div className="stat-lbl-admin">Mock Tests Written</div>
                </div>

                <div className="stat-card-admin">
                  <div className="stat-icon-wrapper purple">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-val-admin">
                    {students.reduce((sum, s) => sum + s.coursesCount, 0)}
                  </div>
                  <div className="stat-lbl-admin">Total Active Courses</div>
                </div>

                <div className="stat-card-admin">
                  <div className="stat-icon-wrapper gold">
                    <Settings size={24} />
                  </div>
                  <div className="stat-val-admin">
                    {scrapers.filter(s => s.is_active).length} / {scrapers.length}
                  </div>
                  <div className="stat-lbl-admin">Active Crawlers</div>
                </div>
              </div>

              {/* Analytics Charts Grid */}
              <div className="analytics-charts-wrapper">
                <div className="chart-card-admin">
                  <h3><BarChart2 size={18} className="txt-blue" style={{ marginRight: '6px' }} /> Student Score Distribution</h3>
                  <svg viewBox="0 0 500 200" className="custom-svg-chart">
                    {/* Grid lines */}
                    <line x1="50" y1="160" x2="470" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <line x1="50" y1="100" x2="470" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4" />
                    <line x1="50" y1="40" x2="470" y2="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4" />
                    
                    {/* Y Axis Labels */}
                    <text x="40" y="164" textAnchor="end" fill="#9ca3af" fontSize="9">{0}</text>
                    <text x="40" y="104" textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(maxScoreBucket / 2)}</text>
                    <text x="40" y="44" textAnchor="end" fill="#9ca3af" fontSize="9">{maxScoreBucket}</text>

                    {/* Bars */}
                    {[
                      { label: "90%+", count: scoreBuckets.excellent, x: 75, color: "#10b981" },
                      { label: "70-89%", count: scoreBuckets.good, x: 160, color: "#3b82f6" },
                      { label: "50-69%", count: scoreBuckets.average, x: 245, color: "#f59e0b" },
                      { label: "<50%", count: scoreBuckets.low, x: 330, color: "#ef4444" },
                      { label: "No Test", count: scoreBuckets.none, x: 415, color: "#6b7280" }
                    ].map((bar, idx) => {
                      const barHeight = (bar.count / maxScoreBucket) * 120;
                      const barY = 160 - barHeight;
                      return (
                        <g key={idx}>
                          <rect
                            x={bar.x}
                            y={barY}
                            width="40"
                            height={barHeight}
                            rx="4"
                            fill={bar.color}
                            opacity="0.85"
                            className="bar-hover-effect"
                            onMouseEnter={(e) => setChartTooltip({ text: `${bar.count} Students`, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setChartTooltip(null)}
                          />
                          {bar.count > 0 && (
                            <text
                              x={bar.x + 20}
                              y={barY - 6}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {bar.count}
                            </text>
                          )}
                          <text
                            x={bar.x + 20}
                            y="178"
                            textAnchor="middle"
                            fill="#9ca3af"
                            fontSize="9"
                            fontWeight="600"
                          >
                            {bar.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="chart-card-admin">
                  <h3><TrendingUp size={18} className="txt-purple" style={{ marginRight: '6px' }} /> Mock Test Attempts Volume</h3>
                  <svg viewBox="0 0 500 200" className="custom-svg-chart">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="55" y1="160" x2="455" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <line x1="55" y1="100" x2="455" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4" />
                    <line x1="55" y1="40" x2="455" y2="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4" />

                    {/* Y Axis Labels */}
                    <text x="45" y="164" textAnchor="end" fill="#9ca3af" fontSize="9">{0}</text>
                    <text x="45" y="104" textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(maxExamCount / 2)}</text>
                    <text x="45" y="44" textAnchor="end" fill="#9ca3af" fontSize="9">{maxExamCount}</text>

                    {(() => {
                      const points = examCounts.map((count, i) => {
                        const x = i * 72 + 75;
                        const y = 160 - (count / maxExamCount) * 120;
                        return { x, y, count, label: examCategories[i] };
                      });
                      
                      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
                      const areaPath = `${linePath} L ${points[points.length-1].x} 160 L ${points[0].x} 160 Z`;
                      
                      return (
                        <g>
                          <path d={areaPath} fill="url(#areaGrad)" />
                          <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
                          {points.map((p, idx) => (
                            <g key={idx}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="#ffffff"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) => setChartTooltip({ text: `${p.count} Attempts`, x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setChartTooltip(null)}
                              />
                              <text
                                x={p.x}
                                y="178"
                                textAnchor="middle"
                                fill="#9ca3af"
                                fontSize="9"
                                fontWeight="600"
                              >
                                {p.label}
                              </text>
                              {p.count > 0 && (
                                <text
                                  x={p.x}
                                  y={p.y - 8}
                                  textAnchor="middle"
                                  fill="#a78bfa"
                                  fontSize="9"
                                  fontWeight="bold"
                                >
                                  {p.count}
                                </text>
                              )}
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
              
              {/* Tooltip Overlay */}
              {chartTooltip && (
                <div 
                  className="chart-tooltip-box"
                  style={{ 
                    position: "fixed",
                    left: `${chartTooltip.x + 15}px`,
                    top: `${chartTooltip.y - 15}px`,
                    pointerEvents: "none"
                  }}
                >
                  {chartTooltip.text}
                </div>
              )}

              <div className="admin-split-layout">
                <div className="split-panel">
                  <h3>Recent Scraper System Logs</h3>
                  <div className="recent-runs-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Crawler</th>
                          <th>Status</th>
                          <th>Jobs Found</th>
                          <th>Added</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.slice(0, 5).map((run, idx) => (
                          <tr key={idx}>
                            <td><strong>{run.scraper_name}</strong></td>
                            <td>
                              <span className={`status-badge ${run.status.toLowerCase()}`}>
                                {run.status}
                              </span>
                            </td>
                            <td>{run.jobs_found}</td>
                            <td>{run.jobs_added}</td>
                            <td>{new Date(run.started_at).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="split-panel">
                  <h3>Top Performing Students</h3>
                  <div className="recent-runs-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Tests Written</th>
                          <th>Avg Score</th>
                          <th>Avg Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...students]
                          .sort((a, b) => b.avgScore - a.avgScore)
                          .slice(0, 5)
                          .map((student, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{student.name}</strong>
                                <div className="sub-text">{student.email}</div>
                              </td>
                              <td>{student.attemptsCount}</td>
                              <td>
                                <strong className="txt-green">{student.avgScore}%</strong>
                              </td>
                              <td>{student.avgAccuracy}%</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Students & Results */}
          {activeTab === "students" && (
            <div className="students-tab">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div className="search-bar-admin" style={{ flex: 1, minWidth: "260px", marginBottom: 0 }}>
                  <Search className="search-icon-admin" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search students by name, email or phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    className="filter-panel-toggle-btn"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={16} /> {showFilters ? "Hide Filters" : "Advanced Filters"}
                  </button>
                  
                  <button 
                    className="csv-export-btn"
                    onClick={handleExportCSV}
                    title="Export current filtered list to CSV spreadsheet"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="advanced-filter-panel">
                  <div className="filter-grid">
                    <div className="filter-group-control">
                      <label>Sort By</label>
                      <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                        <option value="name">Alphabetical</option>
                        <option value="attempts">Mock Test Attempts</option>
                        <option value="score">Average Score</option>
                        <option value="accuracy">Average Accuracy</option>
                      </select>
                    </div>

                    <div className="filter-group-control">
                      <label>Order</label>
                      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>

                    <div className="filter-group-control">
                      <label>Mock Attempts</label>
                      <select value={filterMinAttempts} onChange={(e) => setFilterMinAttempts(e.target.value)}>
                        <option value="all">All Students</option>
                        <option value="none">No Attempts Written</option>
                        <option value="1">At Least 1 Attempt</option>
                        <option value="5">At Least 5 Attempts</option>
                      </select>
                    </div>

                    <div className="filter-group-control">
                      <label>Performance</label>
                      <select value={filterScoreBoundary} onChange={(e) => setFilterScoreBoundary(e.target.value)}>
                        <option value="all">All Scores</option>
                        <option value="high">Top Performers (&gt;= 75%)</option>
                        <option value="low">Needs Improvement (&lt; 50%)</option>
                      </select>
                    </div>

                    <div className="filter-group-control">
                      <label>Exam Package</label>
                      <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                        <option value="all">All Packages</option>
                        {ALL_EXAMS.map(exam => (
                          <option key={exam.id} value={exam.id}>{exam.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="students-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Student Profile</th>
                      <th>Phone</th>
                      <th>Active Exams / Courses</th>
                      <th>Stats</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const isExpanded = expandedUser === student._id;
                      return (
                        <React.Fragment key={student._id}>
                          <tr className={isExpanded ? "expanded-row-head" : ""}>
                            <td>
                              <button 
                                className="expand-row-btn"
                                onClick={() => {
                                  setExpandedUser(isExpanded ? null : student._id);
                                  setDrawerSearch("");
                                }}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                            <td>
                              <div className="student-profile-cell">
                                <div className="student-avatar-admin">{student.name.charAt(0).toUpperCase()}</div>
                                <div>
                                  <strong>{student.name}</strong>
                                  <div className="sub-text">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{student.phone}</td>
                            <td>
                              <div className="courses-chips-admin">
                                {student.courses.map(c => (
                                  <span key={c} className="course-chip-admin">{c}</span>
                                ))}
                                {student.courses.length === 0 && <span className="no-courses">No courses attempted yet</span>}
                              </div>
                            </td>
                            <td>
                              <div className="student-stats-admin">
                                <div>Tests: <strong>{student.attemptsCount}</strong></div>
                                <div>Avg Score: <strong className="txt-blue">{student.avgScore}%</strong></div>
                              </div>
                            </td>
                            <td>
                              <button 
                                className="btn-view-results"
                                onClick={() => {
                                  setExpandedUser(isExpanded ? null : student._id);
                                  setDrawerSearch("");
                                }}
                              >
                                {isExpanded ? "Hide Results" : "View Results"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="expanded-details-row">
                              <td colSpan="6">
                                <div className="student-results-drawer">
                                  <div className="drawer-attempts-header">
                                    <h4>Mock Test Results History — {student.name}</h4>
                                    {student.attempts.length > 0 && (
                                      <div className="drawer-attempts-search-wrapper">
                                        <Search size={14} />
                                        <input 
                                          type="text" 
                                          placeholder="Search written tests..." 
                                          value={drawerSearch}
                                          onChange={(e) => setDrawerSearch(e.target.value)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {(() => {
                                    const filteredAttempts = student.attempts.filter(att => 
                                      att.testName.toLowerCase().includes(drawerSearch.toLowerCase())
                                    );
                                    
                                    if (student.attempts.length === 0) {
                                      return <p className="no-attempts-text">This student has not attempted any mock tests yet.</p>;
                                    }
                                    if (filteredAttempts.length === 0) {
                                      return <p className="no-attempts-text">No attempts matching "{drawerSearch}" found.</p>;
                                    }
                                    
                                    return (
                                      <div className="drawer-attempts-grid">
                                        {filteredAttempts.map((att, index) => (
                                          <div key={index} className="attempt-detail-card-admin">
                                            <div className="attempt-card-header">
                                              <h5>{att.testName}</h5>
                                              <span className="attempt-date"><Clock size={12} /> {att.date}</span>
                                            </div>
                                            <div className="attempt-metrics">
                                              <div className="metric">
                                                <span>Score</span>
                                                <strong className={att.score >= 70 ? "txt-green" : att.score >= 50 ? "txt-orange" : "txt-red"}>{att.score}%</strong>
                                              </div>
                                              <div className="metric">
                                                <span>Accuracy</span>
                                                <strong>{att.accuracy}%</strong>
                                              </div>
                                              <div className="metric">
                                                <span>Time Spent</span>
                                                <strong>{att.timeSpent} mins</strong>
                                              </div>
                                            </div>
                                            {att.details && (
                                              <div className="attempt-questions-breakdown">
                                                <span className="q-badge correct">Correct: {att.details.correct}</span>
                                                <span className="q-badge incorrect">Incorrect: {att.details.incorrect}</span>
                                                <span className="q-badge unattempted">Unattempted: {att.details.unattempted}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}

                                  {/* Course Package Access Controls */}
                                  <div className="admin-student-access-control" style={{ marginTop: "25px", borderTop: "2px solid var(--border)", paddingTop: "20px" }}>
                                    <h4 style={{ marginBottom: "12px", color: "var(--text)", fontWeight: "800" }}>🔑 Course Package Access Controls</h4>
                                    <p className="sub-text" style={{ marginBottom: "16px", color: "var(--muted)", fontSize: "13px" }}>Manage which premium courses are unlocked for {student.name}. Unlocked courses bypass student paywalls.</p>
                                    
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                                      {ALL_EXAMS.map(exam => {
                                        const isCourseUnlocked = student.unlockedCourses && student.unlockedCourses.includes(exam.id);
                                        return (
                                          <label key={exam.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s ease" }}>
                                            <input 
                                              type="checkbox"
                                              checked={!!isCourseUnlocked}
                                              onChange={(e) => handleToggleCourseUnlock(student._id, student.email, exam.id, e.target.checked)}
                                            />
                                            <div>
                                              <strong style={{ fontSize: "13px", display: "block", color: "var(--text)" }}>{exam.title}</strong>
                                              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{exam.category}</span>
                                            </div>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">No students found matching your query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Register Students */}
          {activeTab === "register_students" && (
            <div className="register-students-tab">
              {/* Form & Selection side-by-side */}
              <div className="admin-scraper-config-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px", alignItems: "start" }}>
                
                {/* Basic Information Card */}
                <div className="premium-form-card" style={{ height: "100%" }}>
                  <div className="scraper-card-header" style={{ marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ color: "var(--text)", fontWeight: "800", fontSize: "17px", fontFamily: "'Sora', sans-serif" }}>
                        {editingRegStudent ? "✏️ Edit Student Account" : "👤 Register Student Account"}
                      </h4>
                      <p className="sub-text" style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px", fontFamily: "'Sora', sans-serif" }}>
                        Enter the student's credentials. Registered students receive automatic access.
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleRegisterOrUpdateStudent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group-admin">
                      <label className="premium-input-label">Student Name *</label>
                      <input 
                        type="text"
                        placeholder="e.g. Veera Kumar"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="premium-input-field"
                        required
                      />
                    </div>
                    
                    <div className="form-group-admin">
                      <label className="premium-input-label">Email Address *</label>
                      <input 
                        type="email"
                        placeholder="e.g. student@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="premium-input-field"
                        required
                      />
                    </div>
                    
                    <div className="form-group-admin">
                      <label className="premium-input-label">Mobile Number *</label>
                      <input 
                        type="tel"
                        placeholder="e.g. 9989564788"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="premium-input-field"
                        required
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                      <button 
                        type="submit" 
                        disabled={regFormLoading} 
                        className="premium-btn-primary"
                        style={{ flex: 1 }}
                      >
                        {regFormLoading ? "Saving..." : editingRegStudent ? "🔄 Update Student" : "👤 Register Student"}
                      </button>
                      
                      {editingRegStudent && (
                        <button 
                          type="button" 
                          onClick={handleCancelRegEdit}
                          className="premium-input-field"
                          style={{ width: "auto", background: "var(--border)", border: "none", fontWeight: "700" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Course Access Assignment Card */}
                <div className="premium-form-card" style={{ height: "100%" }}>
                  <div className="scraper-card-header" style={{ marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ color: "var(--text)", fontWeight: "800", fontSize: "17px", fontFamily: "'Sora', sans-serif" }}>📚 Course Access Assignment</h4>
                      <p className="sub-text" style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px", fontFamily: "'Sora', sans-serif" }}>
                        Assign specific packages. Assigned courses unlock mock exams, video lessons, notes, and topic tests.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="premium-input-label">Select Course</label>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                      <select
                        value={regSelectedCourse}
                        onChange={(e) => setRegSelectedCourse(e.target.value)}
                        className="premium-input-field"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <option value="">-- Choose Course --</option>
                        {allCourses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title} ({course.category || "General"})
                          </option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={handleAddCourseToReg}
                        className="premium-btn-secondary"
                      >
                        ➕ Add Course
                      </button>
                    </div>
                    
                    <h5 style={{ fontSize: "13.5px", fontWeight: "800", color: "var(--text)", marginBottom: "12px", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", fontFamily: "'Sora', sans-serif" }}>
                      Assigned Courses ({regAssignedCourses.length})
                    </h5>
                    
                    {regAssignedCourses.length === 0 ? (
                      <p style={{ color: "var(--muted)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "24px 0", fontFamily: "'Sora', sans-serif" }}>
                        No courses assigned yet. Select a course above to assign access.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxHeight: "190px", overflowY: "auto", padding: "4px" }}>
                        {regAssignedCourses.map(courseId => {
                          const courseObj = allCourses.find(c => c.id === courseId);
                          return (
                            <div 
                              key={courseId} 
                              className="premium-chip-badge"
                              style={{ display: "flex", alignItems: "center", gap: "10px" }}
                            >
                              <span>
                                {courseObj ? courseObj.title : courseId}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveCourseFromReg(courseId)}
                                style={{ background: "transparent", border: "none", color: "#ef4444", fontWeight: "800", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Registered Students Table Section */}
              <div className="premium-form-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                  <div>
                    <h4 style={{ color: "var(--text)", fontWeight: "800", fontSize: "17px", marginBottom: "4px", fontFamily: "'Sora', sans-serif" }}>👤 Registered Students List</h4>
                    <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0, fontFamily: "'Sora', sans-serif" }}>View and manage student course access permissions in real time.</p>
                  </div>
                  
                  {/* Search and Filters */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div className="search-bar-admin" style={{ flex: 1, minWidth: "220px", marginBottom: 0, position: "relative" }}>
                      <Search className="search-icon-admin" size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                      <input 
                        type="text" 
                        placeholder="Search name, email, mobile..." 
                        value={regSearchTerm}
                        onChange={(e) => setRegSearchTerm(e.target.value)}
                        className="premium-input-field"
                        style={{ paddingLeft: "36px", paddingTop: "8px", paddingBottom: "8px" }}
                      />
                    </div>
                    
                    <select
                      value={regCourseFilter}
                      onChange={(e) => setRegCourseFilter(e.target.value)}
                      className="premium-input-field"
                      style={{ padding: "8px 12px", width: "auto", cursor: "pointer" }}
                    >
                      <option value="">All Courses</option>
                      {allCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>

                    <input 
                      type="date" 
                      value={regDateFilter}
                      onChange={(e) => setRegDateFilter(e.target.value)}
                      className="premium-input-field"
                      style={{ padding: "8px 12px", width: "auto", cursor: "pointer" }}
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div style={{ overflowX: "auto" }}>
                  <table className="superadmin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                      <tr style={{ background: "var(--border)", borderBottom: "2px solid var(--border)" }}>
                        <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "800", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Student Name</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "800", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Mobile</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "800", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Email</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "800", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Assigned Courses</th>
                        <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "800", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Created Date</th>
                        <th style={{ padding: "14px 12px", textAlign: "center", fontSize: "13px", fontWeight: "800", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = regStudents.filter(student => {
                          // Search check
                          const term = regSearchTerm.toLowerCase();
                          const matchesSearch = 
                            student.name.toLowerCase().includes(term) ||
                            student.email.toLowerCase().includes(term) ||
                            student.mobile.includes(term);
                          
                          // Course filter check
                          const matchesCourse = regCourseFilter ? (student.assignedCourses && student.assignedCourses.includes(regCourseFilter)) : true;

                          // Date filter check
                          let matchesDate = true;
                          if (regDateFilter) {
                            const studentDate = new Date(student.createdAt).toISOString().split('T')[0];
                            matchesDate = studentDate === regDateFilter;
                          }

                          return matchesSearch && matchesCourse && matchesDate;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: "13px", fontStyle: "italic", fontFamily: "'Sora', sans-serif" }}>
                                No registered students found.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(student => (
                          <tr key={student._id} style={{ borderBottom: "1px solid var(--border)", transition: "all 0.2s ease" }}>
                            <td style={{ padding: "14px 12px", fontSize: "13px", color: "var(--text)", fontWeight: "600", fontFamily: "'Sora', sans-serif" }}>{student.name}</td>
                            <td style={{ padding: "14px 12px", fontSize: "13px", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>{student.mobile}</td>
                            <td style={{ padding: "14px 12px", fontSize: "13px", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>{student.email}</td>
                            <td style={{ padding: "14px 12px", fontSize: "13px", color: "var(--text)" }}>
                              {student.assignedCourses && student.assignedCourses.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                  {student.assignedCourses.map(courseId => {
                                    const courseObj = allCourses.find(c => c.id === courseId);
                                    return (
                                      <span 
                                        key={courseId} 
                                        style={{ fontSize: "11px", fontWeight: "700", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", padding: "4px 8px", borderRadius: "6px", fontFamily: "'Sora', sans-serif" }}
                                      >
                                        {courseObj ? courseObj.title : courseId}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic", fontFamily: "'Sora', sans-serif" }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 12px", fontSize: "13px", color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>
                              {new Date(student.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </td>
                            <td style={{ padding: "14px 12px", textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                <button
                                  onClick={() => handleEditRegStudent(student)}
                                  style={{ padding: "6px 12px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "6px", color: "#3b82f6", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Sora', sans-serif" }}
                                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"}
                                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteRegStudent(student._id, student.name)}
                                  style={{ padding: "6px 12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Sora', sans-serif" }}
                                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Scrapers Control */}
          {activeTab === "scrapers" && (
            <div className="scrapers-tab">
              <div className="scrapers-grid-admin">
                {scrapers.map(scraper => (
                  <div key={scraper.name} className="scraper-card-admin">
                    <div className="scraper-card-header">
                      <div>
                        <h4>{scraper.name}</h4>
                        <span className="sub-text">Target: {scraper.name.replace("Scraper", "")} Recruitment updates</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={scraper.is_active} 
                          onChange={() => toggleScraperActive(scraper.name, scraper.is_active)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="scraper-card-body">
                      <div className="scraper-meta-item">
                        <span>Frequency</span>
                        <select 
                          className="scraper-interval-select"
                          value={scraper.interval_minutes} 
                          onChange={(e) => handleScraperIntervalChange(scraper.name, e.target.value)}
                        >
                          <option value="15">Every 15 mins</option>
                          <option value="30">Every 30 mins</option>
                          <option value="60">Every 1 hour</option>
                          <option value="360">Every 6 hours</option>
                          <option value="720">Every 12 hours</option>
                          <option value="1440">Every 24 hours</option>
                        </select>
                      </div>
                      <div className="scraper-meta-item">
                        <span>Last Run</span>
                        <strong>
                          {scraper.last_run_at ? new Date(scraper.last_run_at).toLocaleTimeString() : "Never"}
                        </strong>
                      </div>
                      <div className="scraper-meta-item">
                        <span>Latest Status</span>
                        <span className={`status-badge ${scraper.latest_run_status.toLowerCase()}`}>
                          {scraper.latest_run_status}
                        </span>
                      </div>
                      {scraper.latest_run_jobs_added > 0 && (
                        <div className="scraper-meta-item highlight">
                          <span>Jobs Added (Last Run)</span>
                          <strong>{scraper.latest_run_jobs_added}</strong>
                        </div>
                      )}
                    </div>

                    <div className="scraper-card-footer">
                      <button 
                        className="btn-trigger-scraper"
                        onClick={() => triggerScraper(scraper.name)}
                        disabled={runningScrapers[scraper.name]}
                      >
                        <Play size={14} /> 
                        {runningScrapers[scraper.name] ? "Crawling..." : "Trigger Scraper"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="all-runs-section">
                <div className="logs-filter-row">
                  <h3>Detailed Execution Logs</h3>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div className="logs-search-wrapper">
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Search logs by crawler name..." 
                        value={scraperLogSearch}
                        onChange={(e) => setScraperLogSearch(e.target.value)}
                      />
                    </div>
                    <div className="logs-status-filter-pills">
                      {["ALL", "SUCCESS", "FAILED"].map(status => (
                        <button 
                          key={status}
                          className={`logs-status-pill-btn ${scraperLogStatus === status ? "active" : ""}`}
                          onClick={() => setScraperLogStatus(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="scrapers-runs-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Started At</th>
                        <th>Scraper Name</th>
                        <th>Status</th>
                        <th>Jobs Found</th>
                        <th>Jobs Added</th>
                        <th>Error Logs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs
                        .filter(run => {
                          const matchesName = run.scraper_name.toLowerCase().includes(scraperLogSearch.toLowerCase());
                          const matchesStatus = scraperLogStatus === "ALL" || run.status.toUpperCase() === scraperLogStatus;
                          return matchesName && matchesStatus;
                        })
                        .map((run, idx) => (
                        <tr key={idx}>
                          <td>{new Date(run.started_at).toLocaleString()}</td>
                          <td><strong>{run.scraper_name}</strong></td>
                          <td>
                            <span className={`status-badge ${run.status.toLowerCase()}`}>
                              {run.status}
                            </span>
                          </td>
                          <td>{run.jobs_found}</td>
                          <td>{run.jobs_added}</td>
                          <td className="txt-red error-cell">{run.error_message || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Push Broadcast */}
          {activeTab === "broadcast" && (
            <div className="broadcast-tab">
              <div className="template-quick-section" style={{ marginBottom: "24px" }}>
                <h4 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "800", color: "#a78bfa" }}>⚡ Quick Message Templates</h4>
                <div className="template-quick-grid">
                  {[
                    { label: "📢 Exam Announcement", title: "SBI PO 2026 Notification Out!", msg: "SBI PO vacancies have been officially announced. Registrations start from tomorrow. Check official guidelines and eligibility now." },
                    { label: "📝 New Mock Test", title: "UPSC CSE Mains Mock Paper Added!", msg: "Practice the newly uploaded General Studies Mains Mock paper offline. Download the model answer sheet to grade your preparation." },
                    { label: "🛠️ System Maintenance", title: "Scheduled System Upgrade", msg: "We will perform standard maintenance on June 22nd at 2:00 AM IST. Free practice tests may experience brief connection delays." },
                    { label: "🏆 Results Release", title: "Mock Test Results Released!", msg: "The leaderboards and detailed results reports for SSC CGL Mock 12 are now live. View your rank and review incorrect answers." }
                  ].map((temp, index) => (
                    <button 
                      key={index} 
                      type="button" 
                      className="btn-template-pill"
                      onClick={() => {
                        setBroadcastTitle(temp.title);
                        setBroadcastMsg(temp.msg);
                      }}
                    >
                      {temp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="broadcast-wrapper-admin">
                <div className="broadcast-form-panel">
                  <h3>📢 Broadcast Push Alert</h3>
                  <p className="sub-description">Send an instant notification to all registered student devices. This supports mock/simulator console logging if service account keys are absent.</p>

                  <form onSubmit={sendBroadcast} className="broadcast-form">
                    <div className="form-group-admin">
                      <label>Broadcast Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g., RRB ALP Apply Deadline Extended!" 
                        required
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group-admin">
                      <label>Message Content</label>
                      <textarea 
                        placeholder="e.g., The RRB has extended the deadline to July 15th. Click here to verify official notification and submit application." 
                        required
                        rows="5"
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn-send-broadcast" disabled={broadcasting}>
                      <Send size={16} /> {broadcasting ? "Broadcasting..." : "Send Push Broadcast"}
                    </button>
                  </form>
                </div>

                <div className="broadcast-preview-panel">
                  <h3>Mock Device Preview</h3>
                  <div className="phone-preview-container">
                    <div className="phone-screen">
                      <div className="phone-header">
                        <span className="phone-time">10:09 PM</span>
                        <div className="phone-speaker"></div>
                        <span className="phone-battery">🔋 98%</span>
                      </div>
                      <div className="phone-body">
                        {broadcastTitle ? (
                          <div className="push-notif-preview-bubble">
                            <div className="push-notif-header">
                              <span className="app-icon-preview">🔔</span>
                              <strong>KR Institute of Learning</strong>
                              <span className="time">now</span>
                            </div>
                            <div className="push-notif-title">{broadcastTitle}</div>
                            <div className="push-notif-body">{broadcastMsg}</div>
                          </div>
                        ) : (
                          <div className="empty-phone-body">
                            <p>Type a title and message on the left or click a template to see the push notification live preview.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="broadcast-history-section">
                <h3>Sent Alerts History (Local Log)</h3>
                <div className="broadcast-history-list">
                  {broadcastHistory.map((alert) => (
                    <div key={alert.id} className="broadcast-history-item">
                      <div className="broadcast-history-item-header">
                        <span className="broadcast-history-title">{alert.title}</span>
                        <span className="broadcast-history-date">{alert.date}</span>
                      </div>
                      <div className="broadcast-history-msg">{alert.message}</div>
                    </div>
                  ))}
                  {broadcastHistory.length === 0 && (
                    <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "10px" }}>No broadcasts sent recently.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "bulk_parser" && (
            <div className="broadcast-tab" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <div className="broadcast-wrapper-admin" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                
                {/* Panel 1: Upload Form */}
                <div className="broadcast-form-panel" style={{ background: "rgba(26, 11, 54, 0.45)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "12px", border: "1px solid #4c2d82" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                    🚀 Universal PDF Ingestion Engine
                  </h3>
                  <p className="sub-description" style={{ color: "#a78bfa", fontSize: "14px", marginTop: "5px" }}>
                    Provide Questions and Keys PDFs to dynamically parse, validate, and preview exam papers before database import.
                  </p>

                  <form onSubmit={handleUpload} className="broadcast-form" style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div className="form-group-admin">
                      <label style={{ display: "block", marginBottom: "5px", color: "#e9d5ff", fontSize: "14px" }}>Exam Category / Type</label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        required
                        style={{ background: "#2d1b4e", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #4c2d82", width: "100%" }}
                      >
                        <option value="">-- Select Exam Type --</option>
                        <option value="SSC">SSC</option>
                        <option value="RRB">RRB</option>
                        <option value="Banking">Banking</option>
                        <option value="APPSC Groups">APPSC Groups</option>
                      </select>
                    </div>

                    <div className="form-group-admin">
                      <label style={{ display: "block", marginBottom: "5px", color: "#e9d5ff", fontSize: "14px" }}>Course (Sub-Type / Tier)</label>
                      <select
                        value={subType}
                        onChange={(e) => setSubType(e.target.value)}
                        required
                        style={{ background: "#2d1b4e", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #4c2d82", width: "100%" }}
                      >
                        <option value="">-- Select Course --</option>
                        {getFilteredCoursesForBulk().map(course => (
                          <option key={course.id} value={course.title}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ margin: "15px 0", padding: "12px", border: "1px dashed #6b21a8", borderRadius: "8px", background: "#1e1135" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e9d5ff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isFullMock}
                          onChange={(e) => setIsFullMock(e.target.checked)}
                          style={{ accentColor: "#8b5cf6" }}
                        />
                        Is Full Mock Exam (Multi-Section PDF)
                      </label>
                    </div>

                    {isFullMock ? (
                      <div className="form-group-admin" style={{ background: "#21153b", padding: "15px", borderRadius: "8px", border: "1.5px solid #581c87", marginBottom: "15px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#e9d5ff", fontSize: "14px" }}>Configure Sections & Question Ranges</h4>
                        {sectionRanges.map((sr, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                            <select
                              value={sr.name}
                              onChange={(e) => {
                                const copy = [...sectionRanges];
                                copy[idx].name = e.target.value;
                                setSectionRanges(copy);
                              }}
                              style={{ background: "#2d1b4e", color: "white", padding: "8px", borderRadius: "6px", border: "1px solid #4c2d82", flex: "2" }}
                            >
                              <option value="">-- Choose Section --</option>
                              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                              <option value="Reasoning Ability">Reasoning Ability</option>
                              <option value="English Language">English Language</option>
                              <option value="General English">General English</option>
                              <option value="General Awareness">General Awareness</option>
                              <option value="General Studies">General Studies</option>
                              <option value="Physics">Physics</option>
                              <option value="Chemistry">Chemistry</option>
                              <option value="Biology">Biology</option>
                              <option value="Mathematics">Mathematics</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Start Q#"
                              value={sr.start}
                              onChange={(e) => {
                                const copy = [...sectionRanges];
                                copy[idx].start = e.target.value;
                                setSectionRanges(copy);
                              }}
                              style={{ background: "#2d1b4e", color: "white", padding: "8px", borderRadius: "6px", border: "1px solid #4c2d82", width: "90px" }}
                            />
                            <span style={{ color: "#e9d5ff" }}>to</span>
                            <input
                              type="number"
                              placeholder="End Q#"
                              value={sr.end}
                              onChange={(e) => {
                                const copy = [...sectionRanges];
                                copy[idx].end = e.target.value;
                                setSectionRanges(copy);
                              }}
                              style={{ background: "#2d1b4e", color: "white", padding: "8px", borderRadius: "6px", border: "1px solid #4c2d82", width: "90px" }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = sectionRanges.filter((_, i) => i !== idx);
                                setSectionRanges(copy);
                              }}
                              style={{ background: "#ef4444", color: "white", padding: "8px 12px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSectionRanges([...sectionRanges, { name: "", start: "", end: "" }])}
                          style={{ background: "#8b5cf6", color: "white", padding: "8px 15px", borderRadius: "6px", border: "none", cursor: "pointer", marginTop: "5px", fontSize: "12px", fontWeight: "bold" }}
                        >
                          + Add Section Range
                        </button>
                      </div>
                    ) : (
                      <div className="form-group-admin">
                        <label style={{ display: "block", marginBottom: "5px", color: "#e9d5ff", fontSize: "14px" }}>Subject / Section</label>
                        <input
                          type="text"
                          placeholder="e.g. Quantitative Aptitude, Reasoning Ability, General Awareness"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                          style={{ background: "#2d1b4e", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #4c2d82", width: "100%" }}
                        />
                      </div>
                    )}

                    <div className="form-group-admin">
                      <label style={{ display: "block", marginBottom: "5px", color: "#e9d5ff", fontSize: "14px" }}>Import Deduplication Mode</label>
                      <select
                        value={importMode}
                        onChange={(e) => setImportMode(e.target.value)}
                        style={{ background: "#2d1b4e", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #4c2d82", width: "100%" }}
                      >
                        <option value="skip_duplicates">Skip Duplicates (Default)</option>
                        <option value="replace_existing">Overwrite Existing</option>
                        <option value="create_new_version">Create New Version</option>
                      </select>
                    </div>

                    <div className="form-group-admin" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#e9d5ff", fontSize: "12px" }}>Questions PDF</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setQuestionsFile(e.target.files[0])}
                          required
                          style={{ background: "#2d1b4e", color: "white", padding: "8px", borderRadius: "6px", border: "1px solid #4c2d82", width: "100%", fontSize: "12px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#e9d5ff", fontSize: "12px" }}>Keys & Explanations PDF</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setKeysFile(e.target.files[0])}
                          required
                          style={{ background: "#2d1b4e", color: "white", padding: "8px", borderRadius: "6px", border: "1px solid #4c2d82", width: "100%", fontSize: "12px" }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={parserLoading}
                      className="btn-send-broadcast"
                      style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: "#6d28d9", color: "white", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      <Upload size={16} />
                      {parserLoading ? `Processing (${uploadProgress}%)` : "Parse & Match PDFs"}
                    </button>
                  </form>
                </div>

                {/* Panel 2: Live Console Terminal */}
                <div className="broadcast-preview-panel" style={{ background: "rgba(26, 11, 54, 0.45)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "12px", border: "1px solid #4c2d82", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", color: "white" }}>📟 Live Process Terminal Output</h3>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    {uploadProgress > 0 && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "12px", color: "#a78bfa" }}>Upload Status:</span>
                          <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: "bold" }}>{uploadProgress}%</span>
                        </div>
                        <div style={{ background: "#3b1368", height: "8px", borderRadius: "4px", width: "100%", overflow: "hidden" }}>
                          <div style={{ background: "#10b981", height: "100%", width: `${uploadProgress}%`, transition: "width 0.2s" }}></div>
                        </div>
                      </div>
                    )}
                    <pre style={{
                      flex: 1,
                      background: "#0c051a",
                      color: "#10b981",
                      padding: "15px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "'Courier New', Courier, monospace",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      border: "1px solid #3b1368",
                      minHeight: "220px",
                      margin: 0
                    }}>
                      {terminalLogs || "Console logs will stream here during processing..."}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Ingestion Preview Table Section */}
              {previewData.length > 0 && (
                <div style={{ background: "rgba(26, 11, 54, 0.45)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "12px", border: "1px solid #4c2d82" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <div>
                      <h3 style={{ margin: 0, color: "white" }}>👀 Questions Preview & Verification</h3>
                      <p style={{ color: "#a78bfa", fontSize: "13px", margin: "5px 0 0 0" }}>
                        Verify the parsed layout. Correct fields are marked in green. Missing fields will trigger warnings.
                      </p>
                    </div>
                    <button
                      onClick={handleConfirmImport}
                      disabled={isConfirmingImport}
                      style={{ padding: "12px 24px", background: "#10b981", color: "white", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Check size={18} />
                      {isConfirmingImport ? "Confirming..." : "Confirm & Import to DB"}
                    </button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#e9d5ff", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: "#2d1b4e", borderBottom: "2px solid #4c2d82", textAlign: "left" }}>
                          <th style={{ padding: "12px" }}>Q.No</th>
                          <th style={{ padding: "12px" }}>Unique ID</th>
                          <th style={{ padding: "12px" }}>Correct Option</th>
                          <th style={{ padding: "12px" }}>Question Text</th>
                          <th style={{ padding: "12px" }}>Explanation Snippet</th>
                          <th style={{ padding: "12px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((q, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #2d1b4e", background: idx % 2 === 0 ? "rgba(45, 27, 78, 0.2)" : "transparent" }}>
                            <td style={{ padding: "12px", fontWeight: "bold" }}>{q.display_question_number}</td>
                            <td style={{ padding: "12px", fontFamily: "monospace" }}>{q.unique_id}</td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{ background: "#10b981", color: "white", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                                {q.correct_option}
                              </span>
                            </td>
                            <td style={{ padding: "12px", maxWidt: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {q.question}
                            </td>
                            <td style={{ padding: "12px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {q.explanation}
                            </td>
                            <td style={{ padding: "12px", color: "#10b981", fontWeight: "bold" }}>✅ Valid</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import History Panel */}
              <div style={{ background: "rgba(26, 11, 54, 0.45)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "12px", border: "1px solid #4c2d82" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "white" }}>📜 Ingestion History Logs</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: "#e9d5ff", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#2d1b4e", borderBottom: "2px solid #4c2d82", textAlign: "left" }}>
                        <th style={{ padding: "12px" }}>Uploaded At</th>
                        <th style={{ padding: "12px" }}>Import Session ID</th>
                        <th style={{ padding: "12px" }}>Course</th>
                        <th style={{ padding: "12px" }}>Subject</th>
                        <th style={{ padding: "12px" }}>Confidence Score</th>
                        <th style={{ padding: "12px" }}>Questions Imported</th>
                        <th style={{ padding: "12px" }}>Duplicates Skipped</th>
                        <th style={{ padding: "12px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importHistory.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: "20px", textAlign: "center", color: "#a78bfa" }}>
                            No ingestion history records found.
                          </td>
                        </tr>
                      ) : (
                        importHistory.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #2d1b4e", background: idx % 2 === 0 ? "rgba(45, 27, 78, 0.2)" : "transparent" }}>
                            <td style={{ padding: "12px" }}>{new Date(item.uploaded_at).toLocaleString()}</td>
                            <td style={{ padding: "12px", fontFamily: "monospace" }}>{item.import_id}</td>
                            <td style={{ padding: "12px" }}>{item.course}</td>
                            <td style={{ padding: "12px" }}>{item.subject}</td>
                            <td style={{ padding: "12px", color: item.confidence_score >= 95 ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
                              {item.confidence_score}%
                            </td>
                            <td style={{ padding: "12px", fontWeight: "bold", color: "#10b981" }}>{item.questions_imported}</td>
                            <td style={{ padding: "12px" }}>{item.duplicates_count}</td>
                            <td style={{ padding: "12px" }}>
                              <span style={{ background: item.status === "SUCCESS" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: item.status === "SUCCESS" ? "#10b981" : "#ef4444", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clear Question Bank Panel */}
              <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "25px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>⚠️ Danger Zone</h3>
                <p style={{ color: "#fca5a5", fontSize: "14px", margin: "0 0 15px 0" }}>
                  Permanently erase the entire centralized MongoDB Question Bank. This operation cannot be undone.
                </p>
                {!showClearModal ? (
                  <button
                    onClick={() => setShowClearModal(true)}
                    style={{ padding: "12px 20px", background: "#ef4444", color: "white", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Clear Question Bank
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Type CLEAR_QUESTION_BANK to confirm"
                      value={clearConfirmText}
                      onChange={(e) => setClearConfirmText(e.target.value)}
                      style={{ background: "#1f1f1f", color: "white", padding: "10px", borderRadius: "6px", border: "1px solid #ef4444", width: "300px" }}
                    />
                    <button
                      onClick={handleClearQuestionBank}
                      style={{ padding: "10px 20px", background: "#ef4444", color: "white", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Permanently Delete All Questions
                    </button>
                    <button
                      onClick={() => { setShowClearModal(false); setClearConfirmText(""); }}
                      style={{ padding: "10px 15px", background: "#3b3b3b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "review_queue" && (
            <ReviewQueue logout={logout} />
          )}
        </div>
      )}


    </div>
  );
}
