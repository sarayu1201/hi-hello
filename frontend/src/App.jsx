import { useState, useEffect, lazy, Suspense } from "react";
import Sidebar, { KRLogo } from "./components/Sidebar";
import Footer from "./components/Footer";
import { Sun, Moon } from "lucide-react";
import "./App.css";

// Lazy-load page components for production bundle code-splitting
const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const MockTests = lazy(() => import("./pages/MockTests"));
const Results = lazy(() => import("./pages/Results"));
const Contact = lazy(() => import("./pages/Contact"));

const JobAlerts = lazy(() => import("./pages/JobAlerts"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const SuperadminPortal = lazy(() => import("./pages/SuperadminPortal"));

const BACKEND_URL = import.meta.env.VITE_API_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.'))
  ? (window.location.protocol + "//" + window.location.hostname + ":5000")
  : "");

export default function App() {
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("kr_user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // 'signup' | 'login'
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [selectedCategory, setSelectedCategory] = useState("Bank & Insurance");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [authCallback, setAuthCallback] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [practiceMode, setPracticeMode] = useState(false);

  // Theme states — always default to light; let user toggle
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("kr_theme");
    return (saved === "light" || saved === "dark") ? saved : "light";
  });
  
  // Profile Drawer state
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // OTP Signup verification states
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLinkCopied, setOtpLinkCopied] = useState(false);

  // Apply theme class to document element on changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("kr_theme", theme);
  }, [theme]);

  // Load MathJax globally for mathematical LaTeX parsing
  useEffect(() => {
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        options: {
          ignoreHtmlClass: 'no-mathjax',
          processHtmlClass: 'mathjax-process'
        },
        chtml: {
          scale: 1.0
        }
      };

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  // Custom mock analytics state for the Results Analytics Dashboard
  const [attemptHistory, setAttemptHistory] = useState(() => {
    const saved = localStorage.getItem("kr_attempt_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("kr_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const checkHash = () => {
      if (window.location.hash === "#admin") {
        setPage("admin");
      } else if (window.location.hash === "#superadmin") {
        setPage("superadmin");
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // Synchronize student profile and course unlocks dynamically on page transitions
  useEffect(() => {
    if (user) {
      fetch(`${BACKEND_URL}/api/users/profile`, {
        headers: {
          "x-user-email": user.email,
          "Authorization": user.token ? `Bearer ${user.token}` : ""
        }
      })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            logout();
            throw new Error("Stale/invalid session detected");
          }
          if (!res.ok) throw new Error("Profile verify failed");
          return res.json();
        })
        .then(data => {
          if (data && !data.error) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem("kr_user", JSON.stringify(updatedUser));
          }
        })
        .catch(err => console.error("Error verifying profile session:", err));
    }
  }, [page]);

  // Load attempts from backend, fallback to localStorage
  useEffect(() => {
    const loadAttempts = async () => {
      if (!user) {
        const saved = localStorage.getItem("kr_attempt_history");
        setAttemptHistory(saved ? JSON.parse(saved) : []);
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/attempts?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const serverAttempts = await res.json();
          setAttemptHistory(serverAttempts);
          try {
            localStorage.setItem("kr_attempt_history", JSON.stringify(serverAttempts));
          } catch (e) {
            console.warn("Failed to cache attempts in localStorage:", e);
          }
        }
      } catch (err) {
        console.warn("Backend API not reachable to load attempts. Using local storage cache.");
      }
    };
    loadAttempts();
  }, [user]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/notifications`);
        if (res.ok) {
          const serverNotifications = await res.json();
          setNotifications(serverNotifications);
        }
      } catch (err) {
        console.warn("Backend API not reachable to load notifications. Using offline fallback.");
        setNotifications([
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
          }
        ]);
      }
    };
    loadNotifications();
  }, []);

  const navigate = (p) => {
    setPage(p);
    setSidebarOpen(false);
    if (p !== "courses") setPracticeMode(false);
  };

  const navigateToPractice = () => {
    setPracticeMode(true);
    setSelectedCourse(null);
    setPage("courses");
    setSidebarOpen(false);
  };

  const requestAuth = (onSuccessCallback) => {
    if (user) {
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      setAuthCallback(() => onSuccessCallback);
      setAuthMode("signup");
      setShowAuthModal(true);
      return false;
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authMode === "signup") {
      if (!formData.name || !formData.email || !formData.phone) {
        alert("Please fill in all details");
        return;
      }
      
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } catch (networkErr) {
        console.error("Backend Auth down:", networkErr.message);
        alert(`⚠️ Signup Network Error: ${networkErr.message}. Please check if the backend server is running and try again.`);
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Signup failed");
        return;
      }

      setShowOtpScreen(true);
      setOtpError("");
    } else {
      if (!formData.email) {
        alert("Please enter your email");
        return;
      }
      
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
      } catch (networkErr) {
        console.error("Backend Login down:", networkErr.message);
        alert(`⚠️ Login Network Error: ${networkErr.message}. Please check if the backend server is running and try again.`);
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Login failed");
        return;
      }

      const data = await res.json();
      if (data.requiresOtp) {
        setShowOtpScreen(true);
        setOtpError("");
      } else {
        setUser(data);
        localStorage.setItem("kr_user", JSON.stringify(data));
        setShowAuthModal(false);
        if (authCallback) {
          authCallback();
          setAuthCallback(null);
        }
      }
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpError("");
    const verifyEndpoint = authMode === "login"
      ? `${BACKEND_URL}/api/auth/verify-login`
      : `${BACKEND_URL}/api/auth/verify`;

    try {
      const res = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: enteredOtp })
      });
      if (res.ok) {
        const verifiedUser = await res.json();
        setUser(verifiedUser);
        localStorage.setItem("kr_user", JSON.stringify(verifiedUser));
        setShowAuthModal(false);
        setShowOtpScreen(false);
        setEnteredOtp("");
        if (authCallback) {
          authCallback();
          setAuthCallback(null);
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Verification failed");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setOtpError(err.message || "Incorrect OTP entered. Try again.");
    }
  };

  function logout() {
    setUser(null);
    localStorage.removeItem("kr_user");
    navigate("home");
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Str = reader.result;
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/profile-image`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
            "Authorization": user.token ? `Bearer ${user.token}` : ""
          },
          body: JSON.stringify({ profileImage: base64Str })
        });
        
        if (res.ok) {
          const updatedUser = { ...user, profileImage: base64Str };
          setUser(updatedUser);
          localStorage.setItem("kr_user", JSON.stringify(updatedUser));
        } else {
          const updatedUser = { ...user, profileImage: base64Str };
          setUser(updatedUser);
          localStorage.setItem("kr_user", JSON.stringify(updatedUser));
        }
      } catch (err) {
        const updatedUser = { ...user, profileImage: base64Str };
        setUser(updatedUser);
        localStorage.setItem("kr_user", JSON.stringify(updatedUser));
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value to allow uploading the same file multiple times
    e.target.value = "";
  };

  const handleImageDelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to remove your profile picture?");
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/profile-image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
          "Authorization": user.token ? `Bearer ${user.token}` : ""
        },
        body: JSON.stringify({ profileImage: "" })
      });
      
      if (res.ok) {
        const updatedUser = { ...user, profileImage: "" };
        setUser(updatedUser);
        localStorage.setItem("kr_user", JSON.stringify(updatedUser));
      } else {
        const updatedUser = { ...user, profileImage: "" };
        setUser(updatedUser);
        localStorage.setItem("kr_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      const updatedUser = { ...user, profileImage: "" };
      setUser(updatedUser);
      localStorage.setItem("kr_user", JSON.stringify(updatedUser));
    }
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordChangeSuccess(false);
    setPasswordChangeError("");
    
    if (!newPassword || newPassword.trim().length < 4) {
      setPasswordChangeError("New password must be at least 4 characters long.");
      return;
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/change-password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": user.email,
          "Authorization": user.token ? `Bearer ${user.token}` : ""
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordChangeSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        const updatedUser = { ...user, password: newPassword };
        setUser(updatedUser);
        localStorage.setItem("kr_user", JSON.stringify(updatedUser));
      } else {
        setPasswordChangeError(data.error || "Failed to change password.");
      }
    } catch (err) {
      setPasswordChangeError("Network connection failed.");
    }
  };

  const addTestAttempt = async (attempt) => {
    const attemptWithId = {
      id: attempt.id || `attempt_${Date.now()}`,
      date: attempt.date || new Date().toISOString().split("T")[0],
      ...attempt,
      email: user?.email || null
    };
    let savedAttempt = attemptWithId;
    try {
      const res = await fetch(`${BACKEND_URL}/api/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptWithId)
      });
      if (res.ok) {
        savedAttempt = await res.json();
      }
    } catch (err) {
      console.warn("Backend API not reachable to save attempt, writing locally:", err);
    }
    setAttemptHistory(prev => {
      const updated = [savedAttempt, ...prev];
      try {
        localStorage.setItem("kr_attempt_history", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to cache attempts in localStorage:", e);
      }
      return updated;
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (page !== "courses" && page !== "mocktests") {
      navigate("courses");
    }
  };

  const pages = {
    home: <Home navigate={navigate} user={user} requestAuth={requestAuth} setSelectedCourse={setSelectedCourse} setSelectedCategory={setSelectedCategory} notifications={notifications} />,
    courses: <Courses user={user} setUser={setUser} requestAuth={requestAuth} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} activeCourse={selectedCourse} setActiveCourse={setSelectedCourse} navigate={navigate} practiceMode={practiceMode} onPracticeModeConsumed={() => setPracticeMode(false)} />,
    mocktests: <MockTests user={user} setUser={setUser} requestAuth={requestAuth} onAddAttempt={addTestAttempt} navigate={navigate} initialCourseId={selectedCourse ? selectedCourse.id : ""} />,
    results: <Results user={user} attemptHistory={attemptHistory} requestAuth={requestAuth} navigate={navigate} />,

    jobalerts: <JobAlerts user={user} requestAuth={requestAuth} navigate={navigate} />,
    contact: <Contact navigate={navigate} />
  };

  if (page === "admin") {
    return (
      <Suspense fallback={<div style={{ background: "#0B0F19", color: "#FFFFFF", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading console...</div>}>
        <AdminPortal 
          user={user} 
          setUser={setUser} 
          navigate={navigate} 
          logout={logout}
        />
      </Suspense>
    );
  }

  if (page === "superadmin") {
    return (
      <Suspense fallback={<div style={{ background: "#090B11", color: "#FFFFFF", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading master console...</div>}>
        <SuperadminPortal 
          user={user} 
          setUser={setUser} 
          navigate={navigate} 
          logout={logout}
        />
      </Suspense>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar 
        page={page} 
        navigate={navigate} 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setSelectedCourse={setSelectedCourse}
        navigateToPractice={navigateToPractice}
        user={user}
      />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left-block">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span /><span /><span />
            </button>
            <div className="topbar-logo-container" onClick={() => navigate("home")} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <img 
                src="/logo.png" 
                alt="KR Institute of Learning" 
                className="brand-logo-img"
              />
              <span className="topbar-logo-text" style={{ fontWeight: 800, fontSize: '1.25rem', color: '#FFFFFF', fontFamily: "'Sora', sans-serif" }}>
                KR Institute of Learning
              </span>
            </div>
          </div>
          
          <div className="topbar-search-wrapper">
            <input 
              type="text" 
              placeholder="Search courses, tests..." 
              className="topbar-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="topbar-right">
            <button className="btn-theme-toggle" onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")} title="Toggle Light/Dark Theme">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {user ? (
              <div className="user-profile" onClick={() => setProfileDrawerOpen(true)}>
                <div className="user-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="user-avatar-img" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
            ) : (
              <div className="topbar-auth-btns">
                <button className="btn-login-text" onClick={() => { setAuthMode("login"); setAuthCallback(null); setShowAuthModal(true); setShowOtpScreen(false); }}>
                  Log in
                </button>
                <button className="btn-signup-pill" onClick={() => { setAuthMode("signup"); setAuthCallback(null); setShowAuthModal(true); setShowOtpScreen(false); }}>
                  Sign up free
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Global Exam Notifications Rolling Marquee Ticker */}
        <div className="global-notification-marquee no-print">
          <div className="marquee-content">
            {/* KR Institute of Learning Address */}
            <span className="marquee-item" onClick={() => navigate("contact")}>
              <span className="marquee-badge address">Address</span>
              📍 <strong>1st Floor, Alankar Residency, Near Chinna Anjaneya Swamy Temple, Danavaipeta, Rajahmundry</strong>
            </span>

            {/* KR Institute of Learning Phone Support */}
            <span className="marquee-item" onClick={() => navigate("contact")}>
              <span className="marquee-badge contact">Call Support</span>
              📞 <strong>+91 88830 26262</strong> &bull; Email: <strong>info@kr-institute-of-learning.in</strong>
            </span>

            {/* Government Exam Notifications */}
            {notifications.map((n, i) => {
              const getAbsoluteUrl = (url, examBoard) => {
                const org = (examBoard || '').toUpperCase().trim();
                
                const getDirectPortal = (orgName) => {
                  if (orgName.includes('SBI')) return 'https://sbi.co.in/web/careers';
                  if (orgName.includes('IBPS')) return 'https://www.ibps.in';
                  if (orgName.includes('SSC')) return 'https://ssc.gov.in';
                  if (orgName.includes('RRB') || orgName.includes('RAILWAY')) return 'https://www.rrbapply.gov.in';
                  if (orgName.includes('UPSC')) return 'https://upsconline.nic.in';
                  if (orgName.includes('APPSC')) return 'https://psc.ap.gov.in';
                  if (orgName.includes('TSPSC')) return 'https://websitenew.tspsc.gov.in';
                  if (orgName.includes('AP POLICE') || orgName.includes('AP_POLICE')) return 'https://slprb.ap.gov.in';
                  if (orgName.includes('TS POLICE') || orgName.includes('TS_POLICE')) return 'https://www.tslprb.in';
                  if (orgName.includes('LIC')) return 'https://licindia.in/careers';
                  if (orgName.includes('RBI')) return 'https://opportunities.rbi.org.in';
                  return null;
                };

                if (!url || url === "#" || url.includes('/apply/') || url.includes('/notifications/')) {
                  return getDirectPortal(org) || 'https://www.india.gov.in';
                }

                return url;
              };

              const targetUrl = getAbsoluteUrl(n.applyUrl || n.officialPdfUrl, n.examBoard);

              return (
                <a 
                  key={i} 
                  href={targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="marquee-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span className="marquee-badge notification">{n.badge}</span>
                  🔔 <strong>{n.title}</strong> - Apply Ends: {n.applyEnd ? new Date(n.applyEnd).toLocaleDateString() : 'Refer Notice'}
                </a>
              );
            })}
          </div>
        </div>
        
        <main className="page-content">
          <Suspense fallback={<div className="page-loading-spinner" style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontWeight: "bold" }}>Loading page content...</div>}>
            {pages[page] || pages.home}
          </Suspense>
        </main>
        
        <Footer navigate={navigate} setSelectedCategory={setSelectedCategory} setSelectedCourse={setSelectedCourse} />
      </div>
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Right-Side Profile Drawer Overlay */}
      <div className={`profile-drawer-overlay ${profileDrawerOpen ? "open" : ""}`} onClick={() => setProfileDrawerOpen(false)} />
      <div className={`profile-drawer ${profileDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>My Profile & Analytics</h3>
          <button className="btn-drawer-close" onClick={() => setProfileDrawerOpen(false)}>&times;</button>
        </div>
        <div className="drawer-content">
          {user && (
            <>
              <div className="drawer-user-info">
                <div className="drawer-avatar-container" style={{ position: "relative" }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="drawer-avatar-img" />
                  ) : (
                    <div className="drawer-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  )}
                  <label htmlFor="profile-image-upload" className="btn-avatar-upload" title="Upload Photo">
                    +
                  </label>
                  <input 
                    type="file" 
                    id="profile-image-upload" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: "none" }} 
                  />
                  {user.profileImage && (
                    <button className="btn-avatar-delete" onClick={handleImageDelete} title="Delete Photo">
                      -
                    </button>
                  )}
                </div>
                <div className="drawer-user-details">
                  <h4>{user.name}</h4>
                  <p>📧 {user.email}</p>
                  <p>📞 {user.phone}</p>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Overall Analytics</span>
                <div className="drawer-stats-grid">
                  <div className="drawer-stat-card">
                    <span className="drawer-stat-num">{attemptHistory.length}</span>
                    <span className="drawer-stat-lbl">Mocks Attempted</span>
                  </div>
                  <div className="drawer-stat-card">
                    <span className="drawer-stat-num">
                      {attemptHistory.length > 0 
                        ? Math.round(attemptHistory.reduce((sum, a) => sum + a.score, 0) / attemptHistory.length) 
                        : 0}%
                    </span>
                    <span className="drawer-stat-lbl">Avg Score</span>
                  </div>
                  <div className="drawer-stat-card">
                    <span className="drawer-stat-num">
                      {attemptHistory.length > 0 
                        ? Math.round(attemptHistory.reduce((sum, a) => sum + a.accuracy, 0) / attemptHistory.length) 
                        : 0}%
                    </span>
                    <span className="drawer-stat-lbl">Avg Accuracy</span>
                  </div>
                  <div className="drawer-stat-card">
                    <span className="drawer-stat-num">
                      {attemptHistory.length > 0 
                        ? Math.round(attemptHistory.reduce((sum, a) => sum + a.timeSpent, 0) / attemptHistory.length) 
                        : 0}m
                    </span>
                    <span className="drawer-stat-lbl">Avg Time Spent</span>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Recent Test Attempts</span>
                <div className="drawer-history-list">
                  {attemptHistory.slice(0, 5).map((att) => (
                    <div key={att.id} className="drawer-history-item">
                      <div className="drawer-history-item-left">
                        <span className="drawer-history-test-name">{att.testName}</span>
                        <span className="drawer-history-date">{att.date}</span>
                      </div>
                      <div className="drawer-history-item-right">
                        {att.score}%
                      </div>
                    </div>
                  ))}
                  {attemptHistory.length === 0 && (
                    <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "10px" }}>No attempts recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Edit Password Section */}
              <div className="drawer-section">
                <span className="drawer-section-title">Change Account Password</span>
                <div className="drawer-password-change-form" style={{ marginTop: "12px" }}>
                  {passwordChangeSuccess && (
                    <div className="pwd-success-msg" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--green)", color: "var(--green)", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px", fontWeight: "bold" }}>
                      ✓ Password updated successfully!
                    </div>
                  )}
                  {passwordChangeError && (
                    <div className="pwd-error-msg" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--red)", color: "var(--red)", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px", fontWeight: "bold" }}>
                      ⚠️ {passwordChangeError}
                    </div>
                  )}
                  
                  <div className="form-group-pwd" style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "12px", display: "block", marginBottom: "4px", fontWeight: "600", color: "var(--text)" }}>Current Password</label>
                    <input 
                      type="password"
                      className="pwd-input"
                      placeholder={user.password ? "Enter current password" : "Leave blank (no password set)"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "13px" }}
                    />
                  </div>
                  
                  <div className="form-group-pwd" style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "12px", display: "block", marginBottom: "4px", fontWeight: "600", color: "var(--text)" }}>New Password</label>
                    <input 
                      type="password"
                      className="pwd-input"
                      placeholder="At least 4 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "13px" }}
                    />
                  </div>
                  
                  <button 
                    onClick={handleChangePasswordSubmit}
                    style={{ background: "var(--blue)", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s ease" }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="drawer-footer">
          <button className="btn-drawer-logout" onClick={() => { logout(); setProfileDrawerOpen(false); }}>Logout</button>
        </div>
      </div>

      {/* Modern Signup/Login Modal */}
      {showAuthModal && (
        <div className="auth-overlay" onClick={() => { setShowAuthModal(false); setShowOtpScreen(false); setAuthCallback(null); }}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={() => { setShowAuthModal(false); setShowOtpScreen(false); setAuthCallback(null); }}>&times;</button>
            
            {showOtpScreen ? (
              <div className="otp-verification-flow">
                <div className="auth-header">
                  <h2>Verify Your Account</h2>
                  <p>We have sent a 6-digit OTP verification code to <strong>{formData.email || "your email"}</strong>.</p>
                </div>
                
                <form onSubmit={handleOtpVerify} className="auth-form">
                  <div className="otp-container">
                    <div className="otp-inputs">
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter 6-Digit OTP"
                        className="otp-field"
                        style={{ width: "100%", letterSpacing: "8px" }}
                        required
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      />
                    </div>
                    {otpError && <p style={{ color: "var(--red)", fontSize: "13px", fontWeight: "700" }}>{otpError}</p>}
                  </div>
                  
                  <button type="submit" className="auth-submit-btn">
                    Confirm OTP & Verify
                  </button>
                  

                </form>
              </div>
            ) : (
              <>
                <div className="auth-header">
                  <h2>{authMode === "signup" ? "Create Free Account" : "Welcome Back"}</h2>
                  <p>{authMode === "signup" ? "Get instant access to free mocks, syllabus, and AI practice" : "Access your practice history and results"}</p>
                </div>
                
                <form onSubmit={handleAuthSubmit} className="auth-form">
                  {authMode === "signup" && (
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {authMode === "signup" && (
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  
                  <button type="submit" className="auth-submit-btn">
                    {authMode === "signup" ? "Sign Up & Start Learning" : "Sign In"}
                  </button>
                </form>

                <div className="auth-toggle">
                  {authMode === "signup" ? (
                    <span>Already have an account? <button onClick={() => setAuthMode("login")}>Sign In</button></span>
                  ) : (
                    <span>New to KR Institute of Learning? <button onClick={() => setAuthMode("signup")}>Sign Up</button></span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating WhatsApp circular widget */}
      <a
        href="https://wa.me/918247717876"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.747 1.451 5.436.002 9.858-4.395 9.86-9.813.001-2.624-1.017-5.093-2.868-6.948-1.851-1.854-4.312-2.873-6.932-2.874-5.438 0-9.86 4.397-9.863 9.815-.001 1.704.453 3.37 1.316 4.815l-.995 3.637 3.735-.98zm11.367-7.25c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </a>
    </div>
  );
}
