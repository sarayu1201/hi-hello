import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, LogOut, ArrowLeft, Users, ShieldAlert, PlusCircle, Trash2, KeyRound, Mail, Lock,
  Search, Database, Settings, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import "./SuperadminPortal.css";

export default function SuperadminPortal({ user, setUser, navigate, logout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [studentsList, setStudentsList] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search filters
  const [adminSearch, setAdminSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Simulated owner settings
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem("kr_sys_maintenance") === "true";
  });
  const [registrationsOpen, setRegistrationsOpen] = useState(() => {
    return localStorage.getItem("kr_sys_registrations") !== "false";
  });

  // Backup simulator states
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState("");

  // Password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Superadmin Login Credentials
  const [loginEmail, setLoginEmail] = useState("superadmin@kr-institute-of-learning.in");
  const [loginPassword, setLoginPassword] = useState("superadmin");
  const [loginError, setLoginError] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);

  // New Admin Form States
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Theme toggling for Superadmin Authority Console
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("kr_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("kr_theme", theme);
  }, [theme]);

  const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (window.location.protocol + "//" + window.location.hostname + ":5000") : "");
  const isSuperadmin = user && user.email && user.email.toLowerCase().includes("superadmin");

  useEffect(() => {
    if (isSuperadmin) {
      fetchUsers();
    }
  }, [user]);

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

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/superadmin/users`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data.students || []);
        setAdminsList(data.admins || []);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to load database records.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuperadminLogin = async (e) => {
    e.preventDefault();
    setAuthenticating(true);
    setLoginError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/superadmin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("kr_user", JSON.stringify(data));
        setUser(data);
      } else {
        setLoginError(data.error || "Invalid superadministrator credentials.");
      }
    } catch (err) {
      setLoginError("Failed to connect to backend server.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSuperadminLogout = () => {
    localStorage.removeItem("kr_user");
    setUser(null);
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);

    if (!newAdminEmail.toLowerCase().includes("admin")) {
      setCreateError("Administrator email addresses must contain the word 'admin'.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/superadmin/create-admin`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          phone: newAdminPhone
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCreateSuccess(true);
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        setNewAdminPhone("");
        fetchUsers();
      } else {
        setCreateError(data.error || "Failed to create administrator account.");
      }
    } catch (err) {
      setCreateError("Server connection failed.");
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to permanently delete account: ${email}? This will erase all test attempts.`)) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/superadmin/delete-user/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        alert("Account successfully deleted.");
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete account.");
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  };

  const handleBackupTrigger = () => {
    if (backupRunning) return;
    setBackupRunning(true);
    setBackupProgress(0);
    setBackupStatus("Connecting to primary database node...");
    
    const steps = [
      { progress: 15, status: "Verifying authority credentials..." },
      { progress: 35, status: "Reading collections: Users, Attempts, Jobs..." },
      { progress: 60, status: "Compressing schema tables and logs..." },
      { progress: 85, status: "Compiling JSON backup package..." },
      { progress: 100, status: "Backup compiled successfully! Triggering download..." }
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setBackupProgress(step.progress);
        setBackupStatus(step.status);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Trigger download
        const backupData = {
          exportDate: new Date().toISOString(),
          version: "2.1.0",
          owner: user.email,
          databaseDump: {
            studentsCount: studentsList.length,
            adminsCount: adminsList.length,
            students: studentsList.map(s => ({
              name: s.name,
              email: s.email,
              phone: s.phone,
              attemptsCount: s.attemptsCount,
              avgScore: s.avgScore
            })),
            admins: adminsList.map(a => ({
              name: a.name,
              email: a.email,
              phone: a.phone,
              registeredOn: a.created_at
            }))
          }
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `KR_Academy_Primary_DB_Backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          setBackupRunning(false);
          setBackupProgress(0);
          setBackupStatus("");
        }, 1500);
      }
    }, 600);
  };

  const handleToggleMaintenance = (checked) => {
    setMaintenanceMode(checked);
    localStorage.setItem("kr_sys_maintenance", checked ? "true" : "false");
  };

  const handleToggleRegistrations = (checked) => {
    setRegistrationsOpen(checked);
    localStorage.setItem("kr_sys_registrations", checked ? "true" : "false");
  };

  if (!isSuperadmin) {
    return (
      <div className="superadmin-login-fullscreen">
        <div className="superadmin-login-mesh"></div>
        <div className="superadmin-login-card">
          <div className="card-header-emblem">
            <ShieldCheck size={36} />
          </div>
          <h2>SUPER CONSOLE</h2>
          <p className="subtitle">System Owner Access Protection</p>

          {loginError && (
            <div className="super-login-error">
              <ShieldAlert size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSuperadminLogin} className="superadmin-login-form">
            <div className="super-form-group">
              <label>Superadmin Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon-left" style={{ position: "absolute", left: "14px", color: "#8b5cf6" }} />
                <input 
                  type="email" 
                  placeholder="e.g. superadmin@kr-institute-of-learning.in" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            <div className="super-form-group">
              <label>System Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon-left" style={{ position: "absolute", left: "14px", color: "#8b5cf6" }} />
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  placeholder="Enter master password" 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: "44px", paddingRight: "44px" }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  title={showLoginPassword ? "Hide password" : "Show password"}
                  style={{ position: "absolute", right: "14px", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-super-submit" disabled={authenticating}>
              {authenticating ? "Validating Owner Credentials..." : "Authenticate Master Console"}
            </button>
          </form>

          <button className="btn-super-back" onClick={() => navigate("home")}>
            <ArrowLeft size={14} /> Return to student site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`superadmin-portal-fullscreen ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <header className="superadmin-header">
        <div className="header-left">
          <div className="super-badge-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1>KR Institute of Learning</h1>
            <span className="subtitle">Superadmin Authority Console</span>
          </div>
        </div>

        <nav className="superadmin-tabs">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            Authority Overview
          </button>
          <button className={`tab-btn ${activeTab === "admins" ? "active" : ""}`} onClick={() => setActiveTab("admins")}>
            Manage System Admins ({adminsList.length})
          </button>
          <button className={`tab-btn ${activeTab === "students" ? "active" : ""}`} onClick={() => setActiveTab("students")}>
            Manage Students ({studentsList.length})
          </button>
          <button className={`tab-btn ${activeTab === "create" ? "active" : ""}`} onClick={() => setActiveTab("create")}>
            Register New Admin
          </button>
        </nav>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-portal-theme-toggle" 
            onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            title="Toggle Light/Dark Theme"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              fontSize: "13px"
            }}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button className="btn-exit" onClick={() => navigate("home")}>
            <ArrowLeft size={16} /> Exit to Site
          </button>
          <button className="btn-logout" onClick={handleSuperadminLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="super-global-error">
          <ShieldAlert size={20} />
          <p>{error}</p>
          <button onClick={fetchUsers}>Retry Fetch</button>
        </div>
      )}

      <main className="superadmin-content">
        {loading ? (
          <div className="super-loading">
            <div className="super-spinner"></div>
            <p>Retrieving master database tables...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="super-tab-view">
                {maintenanceMode && (
                  <div className="system-status-banner">
                    <AlertTriangle size={18} />
                    <span>⚠️ SYSTEM MAINTENANCE MODE IS ACTIVE — Public pages display standard alert notices.</span>
                  </div>
                )}

                <div className="super-stats-grid">
                  <div className="stat-card students">
                    <Users size={32} />
                    <h3>{studentsList.length}</h3>
                    <p>Total Active Students</p>
                  </div>
                  <div className="stat-card admins">
                    <ShieldCheck size={32} />
                    <h3>{adminsList.length}</h3>
                    <p>Registered Site Admins</p>
                  </div>
                  <div className="stat-card authority">
                    <KeyRound size={32} />
                    <h3>Owner</h3>
                    <p>Superadmin Authority Mode</p>
                  </div>
                </div>

                <div className="system-settings-wrapper" style={{ marginBottom: "24px" }}>
                  <h3>⚙️ Owner System Configuration Simulator</h3>
                  <div className="system-settings-grid">
                    <div className="setting-card">
                      <div className="setting-card-info">
                        <h5>Standard Maintenance Mode</h5>
                        <p>Simulate taking student mock systems offline.</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={maintenanceMode}
                          onChange={(e) => handleToggleMaintenance(e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="setting-card">
                      <div className="setting-card-info">
                        <h5>Public Registrations Open</h5>
                        <p>Control whether new students can sign up.</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={registrationsOpen}
                          onChange={(e) => handleToggleRegistrations(e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="backup-simulator-card" style={{ marginBottom: "24px" }}>
                  <h4><Database size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#a78bfa' }} /> Primary Database Backup Simulation</h4>
                  <p>Compile current Mongoose collections (Students records, Administrators registry, scraper logs) into a single downloadable JSON backup profile.</p>
                  
                  <button 
                    onClick={handleBackupTrigger} 
                    className="btn-backup-trigger"
                    disabled={backupRunning}
                  >
                    {backupRunning ? "Backing up collections..." : "Backup & Export Database"}
                  </button>

                  {backupRunning && (
                    <div className="backup-progress-container">
                      <div className="backup-progress-bar">
                        <div className="backup-progress-fill" style={{ width: `${backupProgress}%` }}></div>
                      </div>
                      <div className="backup-progress-text">
                        <span>{backupStatus}</span>
                        <span>{backupProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="system-overview-card">
                  <h3>Owner Controls Reference Guidelines</h3>
                  <ul>
                    <li><strong>Admins List:</strong> Site admins have the authority to trigger background job crawlers, configure crawlers intervals, and broadcast FCM alerts to student devices.</li>
                    <li><strong>Account Deletion:</strong> Deleting a student deletes their profile and removes all their mock test results from the database.</li>
                    <li><strong>Primary Security:</strong> Default seed accounts (`admin@kr-academy.in` and `superadmin@kr-academy.in`) cannot be deleted to prevent locking out management roles.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Admins List */}
            {activeTab === "admins" && (
              <div className="super-tab-view">
                <div className="table-card-super">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <h3 style={{ margin: 0 }}>System Administrators</h3>
                    <div className="superadmin-search-row" style={{ marginBottom: 0 }}>
                      <Search size={16} />
                      <input 
                        type="text" 
                        className="superadmin-search-input"
                        placeholder="Search admins..." 
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="super-table">
                    <thead>
                      <tr>
                        <th>Administrator</th>
                        <th>Phone</th>
                        <th>Registered On</th>
                        <th>Danger Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredAdmins = adminsList.filter(admin => 
                          admin.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          admin.email.toLowerCase().includes(adminSearch.toLowerCase())
                        );

                        if (adminsList.length === 0) {
                          return <tr><td colSpan="4" className="text-center">No administrators registered.</td></tr>;
                        }
                        if (filteredAdmins.length === 0) {
                          return <tr><td colSpan="4" className="text-center">No administrators found matching "{adminSearch}".</td></tr>;
                        }

                        return filteredAdmins.map((admin) => (
                          <tr key={admin._id}>
                            <td>
                              <strong>{admin.name}</strong>
                              <div className="sub-text">{admin.email}</div>
                            </td>
                            <td>{admin.phone}</td>
                            <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                            <td>
                              <button 
                                className="btn-delete"
                                disabled={admin.email === "admin@kr-academy.in"}
                                onClick={() => handleDeleteUser(admin._id, admin.email)}
                              >
                                <Trash2 size={14} /> Revoke &amp; Delete
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Students List */}
            {activeTab === "students" && (
              <div className="super-tab-view">
                <div className="table-card-super">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <h3 style={{ margin: 0 }}>Registered Students</h3>
                    <div className="superadmin-search-row" style={{ marginBottom: 0 }}>
                      <Search size={16} />
                      <input 
                        type="text" 
                        className="superadmin-search-input"
                        placeholder="Search students..." 
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="super-table">
                    <thead>
                      <tr>
                        <th>Student Profile</th>
                        <th>Phone</th>
                        <th>Tests Taken</th>
                        <th>Average Score</th>
                        <th>Danger Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredStudents = studentsList.filter(student => 
                          student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          student.email.toLowerCase().includes(studentSearch.toLowerCase())
                        );

                        if (studentsList.length === 0) {
                          return <tr><td colSpan="5" className="text-center">No students registered yet.</td></tr>;
                        }
                        if (filteredStudents.length === 0) {
                          return <tr><td colSpan="5" className="text-center">No students found matching "{studentSearch}".</td></tr>;
                        }

                        return filteredStudents.map((student) => (
                          <tr key={student._id}>
                            <td>
                              <strong>{student.name}</strong>
                              <div className="sub-text">{student.email}</div>
                            </td>
                            <td>{student.phone}</td>
                            <td>{student.attemptsCount}</td>
                            <td><strong className="score-super">{student.avgScore}%</strong></td>
                            <td>
                              <button 
                                className="btn-delete"
                                onClick={() => handleDeleteUser(student._id, student.email)}
                              >
                                <Trash2 size={14} /> Delete Profile
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Register Admin */}
            {activeTab === "create" && (
              <div className="super-tab-view">
                <div className="create-admin-card">
                  <h3>🔑 Create New System Administrator</h3>
                  <p className="description">Add credentials for a new administrator. They will be granted full access to the Scraper settings, analytics dashboard, and push notifications.</p>

                  {createError && (
                    <div className="create-message-box error">
                      <ShieldAlert size={16} />
                      <span>{createError}</span>
                    </div>
                  )}

                  {createSuccess && (
                    <div className="create-message-box success">
                      <ShieldCheck size={16} />
                      <span>Administrator account created successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateAdmin} className="create-admin-form">
                    <div className="form-row-super">
                      <div className="form-group-super">
                        <label>Admin Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. John Doe" 
                          required
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                        />
                      </div>
                      <div className="form-group-super">
                        <label>Admin Email (must contain 'admin')</label>
                        <input 
                          type="email" 
                          placeholder="e.g. john.admin@kr-academy.in" 
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-super">
                      <div className="form-group-super">
                        <label>Access Password</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter password" 
                            required
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            style={{ width: "100%", paddingRight: "44px" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                            style={{ position: "absolute", right: "14px", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="form-group-super">
                        <label>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 9876543210" 
                          required
                          value={newAdminPhone}
                          onChange={(e) => setNewAdminPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-create-admin-submit">
                      <PlusCircle size={16} /> Save Admin Account
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
