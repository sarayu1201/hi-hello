import React, { useState, useEffect } from "react";
import { ShieldAlert, Mail, Lock, LogOut, ArrowLeft, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import "./AdminPortal.css";

export default function AdminPortal({ user, setUser, navigate, logout }) {
  const [email, setEmail] = useState("admin@kr-institute-of-learning.in");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Theme toggling for System Administration Panel
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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Save admin user session
        localStorage.setItem("kr_user", JSON.stringify(data));
        setUser(data);
      } else {
        setError(data.error || "Invalid administrator credentials.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("kr_user");
    setUser(null);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const isAdmin = user && user.email && user.email.toLowerCase().includes("admin") && !user.email.toLowerCase().includes("superadmin");

  if (isAdmin) {
    return (
      <div className={`admin-portal-fullscreen ${theme === 'dark' ? 'dark-theme' : ''}`}>
        <header className="admin-portal-header">
          <div className="header-left">
            <div className="admin-badge-icon">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1>KR Institute of Learning</h1>
              <span className="subtitle">System Administration Panel</span>
            </div>
          </div>
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
            <button className="btn-portal-exit" onClick={() => navigate("home")}>
              <ArrowLeft size={16} /> Exit to Student Site
            </button>
            <button className="btn-portal-logout" onClick={handleAdminLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>
        <main className="admin-portal-content">
          <AdminDashboard user={user} navigate={navigate} logout={logout} />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-login-fullscreen">
      <div className="admin-login-mesh"></div>
      
      <div className="admin-login-card">
        <div className="card-header-emblem">
          <KeyRound size={32} />
        </div>
        
        <h2>KR Institute of Learning</h2>
        <p className="subtitle">Administrator Console Access</p>

        {error && (
          <div className="admin-login-error-card">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label>System Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon-left" />
              <input 
                type="email" 
                placeholder="e.g. admin@kr-institute-of-learning.in" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Access Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-admin-submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" /> Authenticating Console...
              </>
            ) : (
              "Sign In to Console"
            )}
          </button>
        </form>

        <button className="btn-back-to-student" onClick={() => navigate("home")}>
          <ArrowLeft size={14} /> Back to student portal
        </button>
      </div>
    </div>
  );
}
