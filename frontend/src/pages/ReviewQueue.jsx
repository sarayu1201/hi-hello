import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Filter, AlertTriangle, CheckCircle2, Trash2, Edit3, X, RefreshCw, 
  ChevronLeft, ChevronRight, Save, Plus, ArrowLeft, ArrowRight, FileText, Check, 
  Trash, ArrowUp, ArrowDown, Clock
} from "lucide-react";
import axios from "axios";

export default function ReviewQueue({ logout }) {
  // Navigation & view states
  const [viewMode, setViewMode] = useState("list"); // "list" | "workspace"
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("needs_review");
  const [filterExam, setFilterExam] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [filterConfidenceMin, setFilterConfidenceMin] = useState("");
  const [filterConfidenceMax, setFilterConfidenceMax] = useState("");
  const [filterPdf, setFilterPdf] = useState("");
  const [filterParser, setFilterParser] = useState("");

  // Workspace Specific States
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [editForm, setEditForm] = useState({
    q: "",
    section: "",
    correct_letter: "",
    options: [],
    explanation: "",
    difficulty: "Medium",
    topic: "",
    tags: "",
    review_notes: ""
  });
  const [draftNotice, setDraftNotice] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  
  // Autosave status
  const [autosaveNotice, setAutosaveNotice] = useState("");

  const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? (window.location.protocol + "//" + window.location.hostname + ":5000") 
    : "");
  const getUserToken = () => {
    const userStr = localStorage.getItem("kr_user");
    const user = userStr ? JSON.parse(userStr) : null;
    return user ? user.token : "";
  };
  const getHeaders = () => {
    const userStr = localStorage.getItem("kr_user");
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user ? user.token : "";
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Fetch paginated and filtered questions from backend
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${BACKEND_URL}/api/review?page=${page}&limit=${limit}&status=${filterStatus}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterExam) url += `&exam_type=${filterExam}`;
      if (filterReason) url += `&review_reason=${filterReason}`;
      if (filterConfidenceMin) url += `&confidence_min=${filterConfidenceMin}`;
      if (filterConfidenceMax) url += `&confidence_max=${filterConfidenceMax}`;
      if (filterPdf) url += `&paper_name=${encodeURIComponent(filterPdf)}`;
      if (filterParser) url += `&parser_version=${filterParser}`;

      const res = await axios.get(url, getHeaders());
      if (res.data && res.data.success) {
        setQuestions(res.data.questions || []);
        setTotal(res.data.total || 0);
      } else {
        setQuestions([]);
        setError("Invalid response format from server.");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (logout) logout();
        return;
      }
      setError(err.response?.data?.error || "Failed to load moderation queue.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    setSelectedIds(new Set());
  }, [page, limit, filterStatus, filterExam, filterReason, filterConfidenceMin, filterConfidenceMax, filterPdf, filterParser]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  // Bulk selectors
  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(questions.map(q => q._id));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to APPROVE & PUBLISH all ${selectedIds.size} selected questions?`)) return;
    setBulkApproving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/review/bulk-approve`, {
        ids: Array.from(selectedIds)
      }, getHeaders());
      if (res.data.success) {
        setSuccessMsg(`Successfully approved and published ${res.data.approvedCount} questions.`);
        setSelectedIds(new Set());
        fetchQuestions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to bulk approve questions.");
    } finally {
      setBulkApproving(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to REJECT all ${selectedIds.size} selected questions?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/review/bulk-reject`, {
        ids: Array.from(selectedIds)
      }, getHeaders());
      if (res.data.success) {
        setSuccessMsg(`Successfully marked ${res.data.rejectedCount} questions as rejected.`);
        setSelectedIds(new Set());
        fetchQuestions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to bulk reject questions.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE all ${selectedIds.size} selected questions?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/review/bulk-delete`, {
        ids: Array.from(selectedIds)
      }, getHeaders());
      if (res.data.success) {
        setSuccessMsg(`Successfully deleted ${res.data.deletedCount} questions.`);
        setSelectedIds(new Set());
        fetchQuestions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to bulk delete questions.");
    }
  };

  // Export selected to JSON
  const handleBulkExport = () => {
    if (selectedIds.size === 0) return;
    const exportData = questions.filter(q => selectedIds.has(q._id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `exported_questions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Enter side-by-side workspace
  const openWorkspace = (q, idx) => {
    setSelectedQuestion(q);
    setSelectedIdx(idx);
    setDraftNotice(false);
    setAuditLogs(q.audit_history || []);
    setShowAuditLogs(false);
    
    // Load existing autosaved draft if exists
    const savedDraft = localStorage.getItem(`kr_moderation_draft_${q._id}`);
    if (savedDraft) {
      setDraftNotice(true);
    }

    setEditForm({
      q: q.q || "",
      section: q.section || "",
      correct_letter: q.correct_letter || "A",
      options: (q.options || []).map((o, index) => {
        if (o && typeof o === "object") {
          return { id: o.id || ["a","b","c","d","e"][index] || String(index), text: o.text || "" };
        }
        return { id: ["a","b","c","d","e"][index] || String(index), text: String(o || "") };
      }),
      explanation: q.explanation || "",
      difficulty: q.difficulty || "Medium",
      topic: q.topic || "",
      tags: Array.isArray(q.tags) ? q.tags.join(", ") : String(q.tags || ""),
      review_notes: q.review_notes || ""
    });

    setViewMode("workspace");
  };

  const closeWorkspace = () => {
    setViewMode("list");
    setSelectedQuestion(null);
    setSelectedIdx(-1);
    setDraftNotice(false);
    setError(null);
    setSuccessMsg(null);
  };

  // Restore autosaved draft
  const restoreDraft = () => {
    if (!selectedQuestion) return;
    const saved = localStorage.getItem(`kr_moderation_draft_${selectedQuestion._id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEditForm(parsed);
        setDraftNotice(false);
        setAutosaveNotice("Draft restored successfully.");
        setTimeout(() => setAutosaveNotice(""), 3000);
      } catch (err) {
        console.error("Failed to parse draft", err);
      }
    }
  };

  // Discard autosaved draft
  const discardDraft = () => {
    if (!selectedQuestion) return;
    localStorage.removeItem(`kr_moderation_draft_${selectedQuestion._id}`);
    setDraftNotice(false);
  };

  // Option modifications
  const handleOptionChange = (idx, text) => {
    const newOptions = [...editForm.options];
    newOptions[idx] = { ...newOptions[idx], text };
    setEditForm({ ...editForm, options: newOptions });
  };

  const handleOptionIdChange = (idx, id) => {
    const newOptions = [...editForm.options];
    newOptions[idx] = { ...newOptions[idx], id: id.toLowerCase() };
    setEditForm({ ...editForm, options: newOptions });
  };

  const addOption = () => {
    const nextLetter = ["a", "b", "c", "d", "e", "f", "g"][editForm.options.length] || "x";
    setEditForm({
      ...editForm,
      options: [...editForm.options, { id: nextLetter, text: "" }]
    });
  };

  const removeOption = (idx) => {
    const newOptions = editForm.options.filter((_, i) => i !== idx);
    setEditForm({ ...editForm, options: newOptions });
  };

  const moveOption = (idx, direction) => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === editForm.options.length - 1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOptions = [...editForm.options];
    const temp = newOptions[idx];
    newOptions[idx] = newOptions[targetIdx];
    newOptions[targetIdx] = temp;
    setEditForm({ ...editForm, options: newOptions });
  };

  // Validate current form fields
  const validateForm = () => {
    if (!editForm.q || !editForm.q.trim()) return "Question text cannot be empty.";
    if (!editForm.options || editForm.options.length < 2) return "Must have at least 2 options.";
    for (let i = 0; i < editForm.options.length; i++) {
      if (!editForm.options[i].text || !editForm.options[i].text.trim()) {
        return `Option ${editForm.options[i].id.toUpperCase()} text cannot be empty.`;
      }
    }
    const ids = editForm.options.map(o => o.id.toLowerCase());
    if (new Set(ids).size !== ids.length) return "Option letters/IDs must be unique.";
    if (!editForm.correct_letter || !ids.includes(editForm.correct_letter.toLowerCase())) {
      return "Correct answer must match one of the option letters.";
    }
    return null;
  };

  // Save Draft (keeps status as needs_review)
  const handleSaveDraft = async () => {
    if (!selectedQuestion) return;
    setError(null);
    setSuccessMsg(null);
    
    // Prepare payload
    const tagsArray = editForm.tags 
      ? editForm.tags.split(",").map(t => t.trim()).filter(Boolean) 
      : [];

    const payload = {
      ...editForm,
      tags: tagsArray,
      edit_reason: "Manual Review Draft Edit"
    };

    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/review/${selectedQuestion._id}`,
        payload,
        getHeaders()
      );
      if (res.data.success) {
        setSuccessMsg("Draft saved successfully.");
        localStorage.removeItem(`kr_moderation_draft_${selectedQuestion._id}`);
        
        // Refresh local data record
        const updatedQ = res.data.question;
        const newQuestions = [...questions];
        newQuestions[selectedIdx] = updatedQ;
        setQuestions(newQuestions);
        setSelectedQuestion(updatedQ);
        setAuditLogs(updatedQ.audit_history || []);
        
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save draft.");
    }
  };

  // Approve & Publish
  const handleApprove = async () => {
    if (!selectedQuestion) return;
    setError(null);
    setSuccessMsg(null);

    const validationErr = validateForm();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    const tagsArray = editForm.tags 
      ? editForm.tags.split(",").map(t => t.trim()).filter(Boolean) 
      : [];

    const payload = {
      ...editForm,
      tags: tagsArray
    };

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/review/${selectedQuestion._id}/approve`,
        payload,
        getHeaders()
      );
      if (res.data.success) {
        setSuccessMsg("Question approved and published successfully.");
        localStorage.removeItem(`kr_moderation_draft_${selectedQuestion._id}`);
        
        // Remove from local list or update status
        const newQuestions = questions.filter(q => q._id !== selectedQuestion._id);
        setQuestions(newQuestions);
        setTotal(prev => Math.max(0, prev - 1));

        // Go to next question automatically if available
        if (newQuestions.length > 0) {
          const nextIdx = selectedIdx >= newQuestions.length ? newQuestions.length - 1 : selectedIdx;
          openWorkspace(newQuestions[nextIdx], nextIdx);
        } else {
          closeWorkspace();
          fetchQuestions();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve question.");
    }
  };

  // Reject
  const handleReject = async () => {
    if (!selectedQuestion) return;
    if (!window.confirm("Reject this question? It will not be shown to students but will remain searchable in history.")) return;
    
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/review/${selectedQuestion._id}/reject`,
        { edit_reason: "Manual review rejected" },
        getHeaders()
      );
      if (res.data.success) {
        setSuccessMsg("Question marked as rejected.");
        localStorage.removeItem(`kr_moderation_draft_${selectedQuestion._id}`);
        
        const newQuestions = questions.filter(q => q._id !== selectedQuestion._id);
        setQuestions(newQuestions);
        setTotal(prev => Math.max(0, prev - 1));

        if (newQuestions.length > 0) {
          const nextIdx = selectedIdx >= newQuestions.length ? newQuestions.length - 1 : selectedIdx;
          openWorkspace(newQuestions[nextIdx], nextIdx);
        } else {
          closeWorkspace();
          fetchQuestions();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject question.");
    }
  };

  // Single Delete / Discard
  const handleDeleteSingle = async () => {
    if (!selectedQuestion) return;
    if (!window.confirm("Are you sure you want to discard this question permanently? This action is irreversible.")) return;

    setError(null);
    setSuccessMsg(null);

    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/papers/review-queue/${selectedQuestion._id}`,
        getHeaders()
      );
      if (res.data.success) {
        setSuccessMsg("Question discarded permanently.");
        localStorage.removeItem(`kr_moderation_draft_${selectedQuestion._id}`);
        
        const newQuestions = questions.filter(q => q._id !== selectedQuestion._id);
        setQuestions(newQuestions);
        setTotal(prev => Math.max(0, prev - 1));

        if (newQuestions.length > 0) {
          const nextIdx = selectedIdx >= newQuestions.length ? newQuestions.length - 1 : selectedIdx;
          openWorkspace(newQuestions[nextIdx], nextIdx);
        } else {
          closeWorkspace();
          fetchQuestions();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to discard question.");
    }
  };

  // Navigating through questions inside the workspace
  const handlePrevQuestion = () => {
    if (selectedIdx > 0) {
      openWorkspace(questions[selectedIdx - 1], selectedIdx - 1);
    }
  };

  const handleNextQuestion = () => {
    if (selectedIdx < questions.length - 1) {
      openWorkspace(questions[selectedIdx + 1], selectedIdx + 1);
    }
  };

  // Auto-Save Effect (Every 15 seconds)
  useEffect(() => {
    if (viewMode !== "workspace" || !selectedQuestion) return;
    
    const interval = setInterval(() => {
      localStorage.setItem(
        `kr_moderation_draft_${selectedQuestion._id}`,
        JSON.stringify(editForm)
      );
      setAutosaveNotice(`Autosaved locally at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => setAutosaveNotice(""), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, [editForm, viewMode, selectedQuestion]);

  // Keyboard Shortcuts Effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== "workspace") return;

      // Ctrl + S -> Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }

      // Ctrl + Enter -> Approve & Publish
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleApprove();
      }

      // Arrow Up -> Previous Question (when not inside typing text elements)
      if (e.key === "ArrowUp" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        handlePrevQuestion();
      }

      // Arrow Down -> Next Question (when not inside typing text elements)
      if (e.key === "ArrowDown" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, editForm, selectedIdx, questions]);

  return (
    <div className="broadcast-tab" style={{ padding: "10px 0" }}>
      <div className="broadcast-wrapper-admin" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", margin: "0 auto" }}>
        
        {/* Global Notifications */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            color: "#fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><X size={16} /></button>
          </div>
        )}
        {successMsg && (
          <div style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid #10b981",
            color: "#a7f3d0",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>✔️ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><X size={16} /></button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. LIST VIEW MODE                                                         */}
        {/* ========================================================================= */}
        {viewMode === "list" && (
          <>
            {/* Header / Filter Panel */}
            <div style={{
              background: "var(--navy2, #152547)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid var(--border, #1E3462)",
              boxShadow: "var(--shadow)"
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "var(--accent, #D4AF37)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                    📝 Question Moderation System
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--muted, #8A9BB8)", marginTop: "4px", marginBottom: 0 }}>
                    Verify, format, and audit questions extracted by the multi-engine parser pipeline.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button 
                    onClick={fetchQuestions}
                    className="btn-send-broadcast"
                    style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", background: "var(--navy3, #1E3462)", border: "1px solid var(--border, #1E3462)" }}
                  >
                    <RefreshCw size={14} className={loading ? "spin" : ""} />
                    Refresh Queue
                  </button>
                </div>
              </div>

              {/* Advanced Filter Inputs */}
              <form onSubmit={handleSearchSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>Search query</label>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--muted)" }} />
                    <input
                      type="text"
                      placeholder="Keyword, Section, PDF Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: "var(--navy, #0D1B3E)",
                        color: "white",
                        padding: "8px 10px 8px 30px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "12.5px",
                        width: "100%"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>Moderation Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    style={{
                      background: "var(--navy, #0D1B3E)",
                      color: "white",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "12.5px",
                      width: "100%"
                    }}
                  >
                    <option value="needs_review">Flagged (Needs Review)</option>
                    <option value="ok">Approved & Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>Exam Profile</label>
                  <select
                    value={filterExam}
                    onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}
                    style={{
                      background: "var(--navy, #0D1B3E)",
                      color: "white",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "12.5px",
                      width: "100%"
                    }}
                  >
                    <option value="">-- All Exams --</option>
                    <option value="SSC_CGL">SSC CGL</option>
                    <option value="SSC_CHSL">SSC CHSL</option>
                    <option value="RRB">RRB / Railways</option>
                    <option value="TSPSC">TSPSC</option>
                    <option value="APPSC">APPSC</option>
                    <option value="SI_POLICE">SI Police</option>
                    <option value="TET">TET</option>
                    <option value="DSC">DSC</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>Review Reason</label>
                  <select
                    value={filterReason}
                    onChange={(e) => { setFilterReason(e.target.value); setPage(1); }}
                    style={{
                      background: "var(--navy, #0D1B3E)",
                      color: "white",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "12.5px",
                      width: "100%"
                    }}
                  >
                    <option value="">-- All Issues --</option>
                    <option value="missing_options">Missing Options</option>
                    <option value="duplicate_options">Duplicate Options</option>
                    <option value="missing_answer_key">Missing Answer</option>
                    <option value="low_confidence">Low Confidence</option>
                    <option value="bad_formatting">Bad Formatting</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>Min Confidence (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min"
                    value={filterConfidenceMin}
                    onChange={(e) => { setFilterConfidenceMin(e.target.value); setPage(1); }}
                    style={{
                      background: "var(--navy, #0D1B3E)",
                      color: "white",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "12.5px",
                      width: "100%"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    type="submit"
                    className="btn-send-broadcast"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterExam("");
                      setFilterReason("");
                      setFilterConfidenceMin("");
                      setFilterConfidenceMax("");
                      setFilterPdf("");
                      setFilterParser("");
                      setPage(1);
                    }}
                    style={{
                      padding: "8px 12px",
                      background: "transparent",
                      color: "white",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Bulk Actions Header */}
            {selectedIds.size > 0 && (
              <div style={{
                background: "#231808",
                border: "1px solid var(--accent, #D4AF37)",
                borderRadius: "8px",
                padding: "12px 20px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px"
              }}>
                <span style={{ fontSize: "13.5px", fontWeight: "bold", color: "#fef08a" }}>
                  ⚡ Bulk Actions ({selectedIds.size} questions selected)
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleBulkApprove}
                    disabled={bulkApproving}
                    style={{
                      background: "#059669",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <CheckCircle2 size={14} /> {bulkApproving ? "Approving..." : "Approve & Publish"}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    onClick={handleBulkExport}
                    style={{
                      background: "var(--blue, #1A56DB)",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <FileText size={14} /> Export JSON
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* Questions Grid Table */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div className="spinner" style={{ margin: "0 auto 15px auto" }}></div>
                <p style={{ color: "var(--muted)", fontSize: "14px" }}>Loading questions database...</p>
              </div>
            ) : questions.length === 0 ? (
              <div style={{
                background: "var(--navy2, #152547)",
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                padding: "60px 20px",
                textAlign: "center"
              }}>
                <CheckCircle2 size={48} style={{ color: "#059669", margin: "0 auto 15px auto" }} />
                <h3 style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>No questions match criteria</h3>
                <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "5px", marginBottom: 0 }}>
                  Try changing your status filters or adjusting search queries.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{
                  background: "var(--navy2, #152547)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden"
                }}>
                  {/* Table Header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "40px 80px 100px 140px 1fr 140px 120px 100px",
                    alignItems: "center",
                    padding: "12px 15px",
                    background: "var(--navy, #0D1B3E)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--accent)"
                  }}>
                    <input type="checkbox" checked={selectedIds.size === questions.length} onChange={toggleSelectAll} style={{ cursor: "pointer" }} />
                    <span>Conf.</span>
                    <span>Q. Num</span>
                    <span>Exam / Sec</span>
                    <span>Question Statement</span>
                    <span>PDF Source</span>
                    <span>Review Reason</span>
                    <span>Actions</span>
                  </div>

                  {/* Table Rows */}
                  {questions.map((q, idx) => {
                    const confColor = q.confidence_score >= 90 ? "#10b981" : q.confidence_score >= 70 ? "#d4af37" : "#ef4444";
                    return (
                      <div key={q._id} style={{
                        display: "grid",
                        gridTemplateColumns: "40px 80px 100px 140px 1fr 140px 120px 100px",
                        alignItems: "center",
                        padding: "12px 15px",
                        borderBottom: idx === questions.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)",
                        fontSize: "13px",
                        color: "white",
                        background: selectedIds.has(q._id) ? "rgba(212,175,55,0.04)" : "transparent",
                        transition: "background 0.2s"
                      }}>
                        <input type="checkbox" checked={selectedIds.has(q._id)} onChange={() => toggleSelectOne(q._id)} style={{ cursor: "pointer" }} />
                        <span style={{ color: confColor, fontWeight: "bold" }}>{q.confidence_score ?? 100}%</span>
                        <div>
                          <div style={{ color: "var(--muted)", fontWeight: "bold" }}>Q. {q.question_number || idx + 1} (Pg.{q.page_number || 1})</div>
                          <span style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "var(--light)",
                            fontSize: "10px",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            display: "inline-block",
                            marginTop: "2px"
                          }}>
                            {q.document_type || "pdf"}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#e9d5ff" }}>{q.exam_type}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.section || "General"}</div>
                        </div>
                        <span style={{ paddingRight: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#d8b4fe" }}>
                          {q.q}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.source_pdf}>
                          {q.source_pdf || (q.source_file ? q.source_file.split(/[\\/]/).pop() : "Unknown")}
                        </span>
                        <div>
                          {q.review_reasons && q.review_reasons.map((r, rIdx) => (
                            <span key={rIdx} style={{
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#f87171",
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              marginRight: "4px",
                              display: "inline-block"
                            }}>
                              {String(r).replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => openWorkspace(q, idx)}
                          style={{
                            background: "var(--blue, #1A56DB)",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Edit3 size={12} /> Moderate
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Footer */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0"
                }}>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of <strong>{total}</strong> questions
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      style={{
                        padding: "6px 12px",
                        background: page === 1 ? "rgba(255,255,255,0.03)" : "var(--navy3, #1E3462)",
                        color: page === 1 ? "var(--muted)" : "white",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        cursor: page === 1 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12.5px"
                      }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span style={{ fontSize: "13px", color: "white" }}>
                      Page <strong>{page}</strong> of {Math.ceil(total / limit) || 1}
                    </span>
                    <button
                      disabled={page >= Math.ceil(total / limit)}
                      onClick={() => setPage(p => p + 1)}
                      style={{
                        padding: "6px 12px",
                        background: page >= Math.ceil(total / limit) ? "rgba(255,255,255,0.03)" : "var(--navy3, #1E3462)",
                        color: page >= Math.ceil(total / limit) ? "var(--muted)" : "white",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        cursor: page >= Math.ceil(total / limit) ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12.5px"
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 2. SPLIT WORKSPACE MODE                                                    */}
        {/* ========================================================================= */}
        {viewMode === "workspace" && selectedQuestion && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "calc(100vh - 120px)" }}>
            
            {/* Workspace Header */}
            <div style={{
              background: "var(--navy2, #152547)",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={closeWorkspace}
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px"
                  }}
                >
                  <ArrowLeft size={14} /> Back to List
                </button>
                <div style={{ height: "20px", width: "1px", background: "var(--border)" }}></div>
                <div>
                  <h3 style={{ fontSize: "15px", color: "white", margin: 0, fontWeight: "bold" }}>
                    Moderating Q.{selectedQuestion.question_number}
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Source PDF: {selectedQuestion.source_pdf} | Expected Page: {selectedQuestion.page_number}
                  </span>
                </div>
              </div>

              {/* Center status warnings / notices */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{
                  background: selectedQuestion.confidence_score >= 90 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: selectedQuestion.confidence_score >= 90 ? "#34d399" : "#f87171",
                  border: `1px solid ${selectedQuestion.confidence_score >= 90 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: "bold"
                }}>
                  Confidence: {selectedQuestion.confidence_score}%
                </span>
                <span style={{
                  background: "rgba(212,175,55,0.15)",
                  color: "#fef08a",
                  border: "1px solid rgba(212,175,55,0.3)",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: "bold"
                }}>
                  Parser: {selectedQuestion.parser_strategy || "SscStrategy"} ({selectedQuestion.parser_version || "V2.0.0"})
                </span>
              </div>

              {/* Prev / Next controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  disabled={selectedIdx <= 0}
                  onClick={handlePrevQuestion}
                  style={{
                    background: selectedIdx <= 0 ? "rgba(255,255,255,0.02)" : "var(--navy3, #1E3462)",
                    color: selectedIdx <= 0 ? "var(--muted)" : "white",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    cursor: selectedIdx <= 0 ? "not-allowed" : "pointer"
                  }}
                  title="Previous Question (Arrow Up)"
                >
                  <ArrowUp size={14} />
                </button>
                <span style={{ fontSize: "12.5px", color: "white", padding: "0 5px" }}>
                  <strong>{selectedIdx + 1}</strong> of {questions.length}
                </span>
                <button
                  disabled={selectedIdx >= questions.length - 1}
                  onClick={handleNextQuestion}
                  style={{
                    background: selectedIdx >= questions.length - 1 ? "rgba(255,255,255,0.02)" : "var(--navy3, #1E3462)",
                    color: selectedIdx >= questions.length - 1 ? "var(--muted)" : "white",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    cursor: selectedIdx >= questions.length - 1 ? "not-allowed" : "pointer"
                  }}
                  title="Next Question (Arrow Down)"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            {/* Autosave / Draft Restore Banner */}
            {(draftNotice || autosaveNotice) && (
              <div style={{
                background: "#1e1b4b",
                border: "1px solid #4f46e5",
                borderRadius: "8px",
                padding: "10px 15px",
                fontSize: "13px",
                color: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>
                  {draftNotice 
                    ? "📢 An autosaved local draft exists for this question from your previous session." 
                    : `💾 ${autosaveNotice}`
                  }
                </span>
                {draftNotice && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={restoreDraft}
                      style={{ background: "#4f46e5", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Restore Draft
                    </button>
                    <button
                      onClick={discardDraft}
                      style={{ background: "transparent", color: "#a5b4fc", border: "1px solid #4f46e5", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Split layout Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              flex: 1,
              minHeight: 0
            }}>
              {/* Left Column: Embedded PDF Viewer */}
              <div style={{
                background: "var(--navy2, #152547)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}>
                <div style={{
                  background: "var(--navy, #0D1B3E)",
                  padding: "8px 15px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12.5px"
                }}>
                  <span style={{ color: "white", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={14} style={{ color: "var(--accent)" }} />
                    Original PDF Document Page Reference
                  </span>
                  <a
                    href={`${BACKEND_URL}${selectedQuestion.source_pdf_path}?token=${getUserToken()}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#5B9BD5",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textDecoration: "underline"
                    }}
                  >
                    Open PDF in New Tab ↗
                  </a>
                </div>
                
                <div style={{ flex: 1, position: "relative", background: "#333" }}>
                  {selectedQuestion.source_pdf_path ? (
                    <iframe
                      src={`${BACKEND_URL}${selectedQuestion.source_pdf_path}?token=${getUserToken()}#page=${selectedQuestion.page_number || 1}`}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="PDF View"
                    />
                  ) : (
                    <div style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#a78bfa",
                      padding: "20px",
                      textAlign: "center"
                    }}>
                      <AlertTriangle size={36} style={{ marginBottom: "10px" }} />
                      <strong>PDF file reference is missing or not archived.</strong>
                      <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "5px" }}>
                        Make sure the PDF was processed using the updated archiving pipeline.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Complete Question Editor */}
              <div style={{
                background: "var(--navy2, #152547)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                padding: "20px",
                gap: "15px"
              }}>
                {/* Flags alert if review reasons exist */}
                {selectedQuestion.review_reasons && selectedQuestion.review_reasons.length > 0 && (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "8px",
                    padding: "10px 15px"
                  }}>
                    <span style={{ fontSize: "11.5px", fontWeight: "bold", color: "#f87171", display: "block", marginBottom: "4px" }}>
                      ⚠️ Parser Flags Blocked Auto-Acceptance:
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {selectedQuestion.review_reasons.map((r, i) => (
                        <span key={i} style={{ background: "rgba(239, 68, 68, 0.12)", color: "#f87171", fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px" }}>
                          {String(r).replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>
                      Subject / Section
                    </label>
                    <input
                      type="text"
                      value={editForm.section}
                      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      style={{
                        background: "var(--navy, #0D1B3E)",
                        color: "white",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "12.5px",
                        width: "100%"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>
                      Topic
                    </label>
                    <input
                      type="text"
                      value={editForm.topic}
                      placeholder="e.g. Percentage, Direct Speech"
                      onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                      style={{
                        background: "var(--navy, #0D1B3E)",
                        color: "white",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "12.5px",
                        width: "100%"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>
                      Difficulty Level
                    </label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      style={{
                        background: "var(--navy, #0D1B3E)",
                        color: "white",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "12.5px",
                        width: "100%"
                      }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "11.5px", 
                    color: selectedQuestion.review_question_text ? "#f87171" : "white", 
                    marginBottom: "5px", 
                    fontWeight: "600" 
                  }}>
                    Question Text {selectedQuestion.review_question_text && <span style={{ color: "#ef4444" }}>(Review Required)</span>}
                  </label>
                  <textarea
                    value={editForm.q}
                    onChange={(e) => setEditForm({ ...editForm, q: e.target.value })}
                    rows={6}
                    style={{
                      background: "var(--navy, #0D1B3E)",
                      color: "white",
                      padding: "10px",
                      borderRadius: "6px",
                      border: selectedQuestion.review_question_text ? "1px solid #ef4444" : "1px solid var(--border)",
                      width: "100%",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                {/* Options List Layout */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ 
                      fontSize: "11.5px", 
                      color: selectedQuestion.review_options ? "#f87171" : "white", 
                      fontWeight: "600",
                      margin: 0
                    }}>
                      Options Card List {selectedQuestion.review_options && <span style={{ color: "#ef4444" }}>(Review Required)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      style={{
                        background: "transparent",
                        color: "var(--accent)",
                        border: "1px dashed var(--accent)",
                        borderRadius: "4px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                    >
                      <Plus size={12} /> Add Option Card
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {editForm.options.map((opt, oidx) => {
                      const isOptionCorrect = editForm.correct_letter.toLowerCase() === opt.id.toLowerCase();
                      return (
                        <div key={oidx} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: isOptionCorrect ? "rgba(16, 185, 129, 0.04)" : "rgba(255,255,255,0.01)",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: isOptionCorrect ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(255,255,255,0.05)"
                        }}>
                          {/* Radio Answer Selector */}
                          <input
                            type="radio"
                            name="correct_answer_radio"
                            checked={isOptionCorrect}
                            onChange={() => setEditForm({ ...editForm, correct_letter: opt.id.toUpperCase() })}
                            title="Mark as correct answer"
                            style={{ cursor: "pointer" }}
                          />
                          
                          {/* Option label input */}
                          <input
                            type="text"
                            value={opt.id.toUpperCase()}
                            onChange={(e) => handleOptionIdChange(oidx, e.target.value)}
                            style={{
                              background: "var(--navy, #0D1B3E)",
                              color: isOptionCorrect ? "var(--green)" : "white",
                              width: "28px",
                              padding: "4px 0",
                              textAlign: "center",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                              fontWeight: "bold",
                              fontSize: "12px"
                            }}
                            title="Option ID letter"
                          />

                          {/* Option text input */}
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionChange(oidx, e.target.value)}
                            placeholder={`Text for option card ${opt.id.toUpperCase()}`}
                            style={{
                              background: "var(--navy, #0D1B3E)",
                              color: "white",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                              flex: 1,
                              fontSize: "12.5px"
                            }}
                          />

                          {/* Card Reordering / Deleting */}
                          <div style={{ display: "flex", gap: "2px" }}>
                            <button
                              type="button"
                              onClick={() => moveOption(oidx, "up")}
                              disabled={oidx === 0}
                              style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", opacity: oidx === 0 ? 0.3 : 1 }}
                            ><ArrowUp size={12} /></button>
                            <button
                              type="button"
                              onClick={() => moveOption(oidx, "down")}
                              disabled={oidx === editForm.options.length - 1}
                              style={{ background: "transparent", color: "white", border: "none", cursor: "pointer", opacity: oidx === editForm.options.length - 1 ? 0.3 : 1 }}
                            ><ArrowDown size={12} /></button>
                            <button
                              type="button"
                              onClick={() => removeOption(oidx)}
                              style={{ background: "transparent", color: "#f87171", border: "none", cursor: "pointer" }}
                              title="Delete option card"
                            ><Trash size={12} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation text */}
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", color: "white", marginBottom: "4px", fontWeight: "600" }}>
                    Explanation / Solved Steps
                  </label>
                  <textarea
                    value={editForm.explanation}
                    onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                    rows={3}
                    placeholder="Enter mathematical steps or grammatical rules explanation..."
                    style={{
                      background: "var(--navy, #0D1B3E)",
                      color: "white",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      width: "100%",
                      fontSize: "12.5px",
                      lineHeight: "1.5",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                {/* Classification and notes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={editForm.tags}
                      placeholder="geometry, formula, pyq"
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      style={{
                        background: "var(--navy, #0D1B3E)",
                        color: "white",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "12.5px",
                        width: "100%"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px", fontWeight: "600" }}>
                      Moderation Notes / Comments
                    </label>
                    <input
                      type="text"
                      value={editForm.review_notes}
                      placeholder="Add moderation context..."
                      onChange={(e) => setEditForm({ ...editForm, review_notes: e.target.value })}
                      style={{
                        background: "var(--navy, #0D1B3E)",
                        color: "white",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "12.5px",
                        width: "100%"
                      }}
                    />
                  </div>
                </div>

                {/* Workspace Action Buttons */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "15px",
                  marginTop: "5px"
                }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={handleDeleteSingle}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Trash2 size={14} /> Discard Item
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      style={{
                        background: "transparent",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      Reject
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      style={{
                        background: "transparent",
                        color: "white",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      title="Save Draft (Ctrl + S)"
                    >
                      <Save size={14} /> Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      style={{
                        background: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 20px",
                        fontSize: "13.5px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      title="Approve & Publish to Mock (Ctrl + Enter)"
                    >
                      <CheckCircle2 size={14} /> Approve & Publish
                    </button>
                  </div>
                </div>

                {/* Audit History Logs (Collapsible) */}
                <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "10px", marginTop: "5px" }}>
                  <button
                    type="button"
                    onClick={() => setShowAuditLogs(!showAuditLogs)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: 0
                    }}
                  >
                    <Clock size={13} /> 
                    {showAuditLogs ? "Hide Audit History Logs" : `Show Audit History Logs (${auditLogs.length})`}
                  </button>
                  
                  {showAuditLogs && (
                    <div style={{ 
                      marginTop: "10px", 
                      background: "rgba(0,0,0,0.15)", 
                      borderRadius: "6px", 
                      padding: "10px",
                      maxHeight: "150px",
                      overflowY: "auto",
                      fontSize: "11.5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}>
                      {auditLogs.length === 0 ? (
                        <div style={{ color: "var(--muted)", textAlign: "center" }}>No logs recorded yet.</div>
                      ) : (
                        auditLogs.map((log, idx) => (
                          <div key={idx} style={{ borderBottom: idx === auditLogs.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#c084fc", fontWeight: "bold" }}>
                              <span>👤 {log.edited_by}</span>
                              <span>📅 {new Date(log.edited_time).toLocaleString()}</span>
                            </div>
                            <div style={{ color: "#a7f3d0", marginTop: "2px" }}>Reason: {log.reason}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
