import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Bell, Bookmark, Settings, Award, Clock, FileText, X, Play, Send 
} from "lucide-react";
import "./JobAlerts.css";
import { ExamLogo } from "../data/exams";
const getAbsoluteUrl = (url, organization) => {
  const org = (organization || '').toUpperCase().trim();
  
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

  // If there's no URL or if it's a mock suffix, redirect to the direct portal
  if (!url || url === "#" || url.includes('/apply/') || url.includes('/notifications/')) {
    return getDirectPortal(org) || 'https://www.india.gov.in';
  }

  return url;
};

export default function JobAlerts({ user, requestAuth, navigate }) {
  const [activeTab, setActiveTab] = useState("feed");
  const [jobs, setJobs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filter states
  const [filterOrg, setFilterOrg] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterQual, setFilterQual] = useState("");
  const [filterOptions, setFilterOptions] = useState({ states: [], qualifications: [], organizations: [] });
  
  // Modal states
  const [activeJob, setActiveJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("english");
  
  // Preferences states
  const [prefEmail, setPrefEmail] = useState("");
  const [prefFcm, setPrefFcm] = useState("");
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedQuals, setSelectedQuals] = useState([]);
  
  // Toasts state
  const [toasts, setToasts] = useState([]);
  
  const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (window.location.protocol + "//" + window.location.hostname + ":5000") : "");

  // Headers helper
  const getHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (user) {
      headers["x-user-email"] = user.email;
      if (user.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
    }
    return headers;
  };

  useEffect(() => {
    // Generate simulated FCM Token
    let token = localStorage.getItem("kr_jobs_fcm_token");
    if (!token) {
      token = "mock_fcm_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("kr_jobs_fcm_token", token);
    }
    setPrefFcm(token);
    
    // Register token/user with backend
    const registerDevice = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/users/register-jobs`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            email: user?.email || null,
            fcm_token: token
          })
        });
      } catch (e) {
        console.warn("Register device failed: ", e);
      }
    };
    registerDevice();
    
    loadFilterOptions();
    fetchJobs();
    fetchBookmarks();
  }, [user]);

  useEffect(() => {
    if (activeTab === "feed") {
      fetchJobs();
    } else if (activeTab === "bookmarks") {
      fetchBookmarks();
    } else if (activeTab === "preferences") {
      loadPreferences();
    }
  }, [activeTab, filterOrg, filterState, filterQual]);

  // Toast dispatch helper
  const showToast = (title, body) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, body }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  };

  const loadFilterOptions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/jobs/filters`);
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
      }
    } catch (e) {}
  };

  const fetchJobs = async () => {
    setLoading(true);
    let url = `${BACKEND_URL}/api/jobs?limit=40`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filterOrg) url += `&organization=${encodeURIComponent(filterOrg)}`;
    if (filterState) url += `&state=${encodeURIComponent(filterState)}`;
    if (filterQual) url += `&qualification=${encodeURIComponent(filterQual)}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/jobs/bookmarks`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (e) {}
  };

  const loadPreferences = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/me-jobs`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPrefEmail(data.email || "");
        setSelectedOrgs(data.organizations || []);
        setSelectedStates(data.states || []);
        setSelectedQuals(data.qualifications || []);
      }
    } catch (e) {}
  };

  const savePreferences = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/preferences-jobs`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          states: selectedStates,
          qualifications: selectedQuals,
          organizations: selectedOrgs
        })
      });
      if (res.ok) {
        alert("Alert settings saved successfully! You will receive push notifications matching your settings.");
      }
    } catch (e) {
      alert("Failed to save preferences.");
    }
  };

  const toggleBookmark = async (e, jobId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${BACKEND_URL}/api/jobs/bookmarks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ job_id: jobId })
      });
      if (res.ok) {
        await fetchBookmarks();
        await fetchJobs();
      }
    } catch (e) {}
  };

  const openJobModal = async (job) => {
    setActiveJob(job);
    setModalOpen(true);
    setModalTab("english");
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchJobs();
    }
  };



  const handleCheckboxChange = (group, value) => {
    if (group === "orgs") {
      setSelectedOrgs(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (group === "states") {
      setSelectedStates(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (group === "quals") {
      setSelectedQuals(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    }
  };

  return (
    <div className="jobalerts-container">
      {/* Toast Notifications */}
      <div className="toast-alerts-area">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-popup">
            <div className="toast-header">
              <span className="toast-tag">🔔 Instant Job Alert</span>
              <button className="toast-close-btn" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>&times;</button>
            </div>
            <div className="toast-body">
              <strong>{toast.title}</strong>
              <p>{toast.body}</p>
            </div>
          </div>
        ))}
      </div>

      <header className="jobalerts-header">
        <div className="title-area">
          <span className="fire-icon">🔥</span>
          <h2>Government Job alerts</h2>
          <span className="live-pill">Live Aggregator</span>
        </div>
        
        <nav className="tab-navigation">
          <button className={`tab-link ${activeTab === "feed" ? "active" : ""}`} onClick={() => setActiveTab("feed")}>
            Alerts Feed
          </button>
          <button className={`tab-link ${activeTab === "bookmarks" ? "active" : ""}`} onClick={() => setActiveTab("bookmarks")}>
            Bookmarks
          </button>
          <button className={`tab-link ${activeTab === "preferences" ? "active" : ""}`} onClick={() => setActiveTab("preferences")}>
            Preferences
          </button>

        </nav>
      </header>

      {/* Tab 1: Feed */}
      {activeTab === "feed" && (
        <section className="jobs-feed-view">
          <div className="search-and-filters">
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search recruitments, exams..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
              <button className="search-btn" onClick={fetchJobs}>Search</button>
            </div>

            <div className="dropdowns-panel">
              <div className="select-group">
                <label>Organization</label>
                <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)}>
                  <option value="">All Organizations</option>
                  {filterOptions.organizations.map(org => <option key={org} value={org}>{org}</option>)}
                </select>
              </div>

              <div className="select-group">
                <label>State</label>
                <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                  <option value="">All States</option>
                  {filterOptions.states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>

              <div className="select-group">
                <label>Qualification</label>
                <select value={filterQual} onChange={(e) => setFilterQual(e.target.value)}>
                  <option value="">All Qualifications</option>
                  {filterOptions.qualifications.map(qual => <option key={qual} value={qual}>{qual}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="section-title-bar">
            <h3>Latest Notifications</h3>
            <span className="notif-count">{jobs.length} postings</span>
          </div>

          {loading ? (
            <div className="table-loader-shimmer">
              <div className="shimmer-row"></div>
              <div className="shimmer-row"></div>
              <div className="shimmer-row"></div>
            </div>
          ) : (
            <div className="notifications-table-wrapper">
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>Organisation</th>
                    <th>Post Details / Title</th>
                    <th>Qualification</th>
                    <th>Vacancies</th>
                    <th>Last Date to Apply</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => {
                    const isSaved = bookmarks.some(b => b._id === job._id);
                    return (
                      <tr key={job._id} className="notification-row" onClick={() => openJobModal(job)}>
                        <td className="col-org">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ExamLogo type={job.organization} />
                            <span className={`org-badge-styled ${job.organization.toLowerCase()}`}>{job.organization}</span>
                          </div>
                        </td>
                        <td className="col-title">
                          <div className="notification-title-container">
                            <span className="notif-title-text">{job.title}</span>
                            <span className="notif-state-text">{job.state || "All India"}</span>
                          </div>
                        </td>
                        <td className="col-qual">
                          <span className="qual-text-styled">{job.qualification || "As per rules"}</span>
                        </td>
                        <td className="col-vacancies">
                          <span className="vacancies-count-styled">
                            {job.vacancies ? job.vacancies.toLocaleString("en-IN") : "Refer Notice"}
                          </span>
                        </td>
                        <td className="col-date">
                          <span className="last-date-styled">
                            {job.application_last_date ? new Date(job.application_last_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Refer Notice"}
                          </span>
                        </td>
                        <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons-group">
                            <a 
                              href={getAbsoluteUrl(job.official_apply_url, job.organization)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="action-btn-apply"
                            >
                              Apply Now
                            </a>
                            <button 
                              className="action-btn-details"
                              onClick={() => openJobModal(job)}
                            >
                              Details
                            </button>
                            <button 
                              className={`action-btn-bookmark ${isSaved ? 'active' : ''}`}
                              onClick={(e) => toggleBookmark(e, job._id)}
                            >
                              <Bookmark size={14} fill={isSaved ? "red" : "none"} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {jobs.length === 0 && (
                <div className="empty-panel">
                  <p>No job updates match your filters. Run scrapers from the admin panel to seed live updates.</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Bookmarks */}
      {activeTab === "bookmarks" && (
        <section className="bookmarks-view">
          <div className="section-title-bar">
            <h3>Bookmarked Notifications</h3>
            <span className="notif-count">{bookmarks.length} saved</span>
          </div>

          <div className="notifications-table-wrapper">
            <table className="notifications-table">
              <thead>
                <tr>
                  <th>Organisation</th>
                  <th>Post Details / Title</th>
                  <th>Qualification</th>
                  <th>Vacancies</th>
                  <th>Last Date to Apply</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookmarks.map(job => (
                  <tr key={job._id} className="notification-row" onClick={() => openJobModal(job)}>
                    <td className="col-org">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ExamLogo type={job.organization} />
                        <span className={`org-badge-styled ${job.organization.toLowerCase()}`}>{job.organization}</span>
                      </div>
                    </td>
                    <td className="col-title">
                      <div className="notification-title-container">
                        <span className="notif-title-text">{job.title}</span>
                        <span className="notif-state-text">{job.state || "All India"}</span>
                      </div>
                    </td>
                    <td className="col-qual">
                      <span className="qual-text-styled">{job.qualification || "As per rules"}</span>
                    </td>
                    <td className="col-vacancies">
                      <span className="vacancies-count-styled">
                        {job.vacancies ? job.vacancies.toLocaleString("en-IN") : "Refer Notice"}
                      </span>
                    </td>
                    <td className="col-date">
                      <span className="last-date-styled">
                        {job.application_last_date ? new Date(job.application_last_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Refer Notice"}
                      </span>
                    </td>
                    <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons-group">
                        <a 
                          href={getAbsoluteUrl(job.official_apply_url, job.organization)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="action-btn-apply"
                        >
                          Apply Now
                        </a>
                        <button 
                          className="action-btn-details"
                          onClick={() => openJobModal(job)}
                        >
                          Details
                        </button>
                        <button 
                          className="action-btn-bookmark active"
                          onClick={(e) => toggleBookmark(e, job._id)}
                        >
                          <Bookmark size={14} fill="red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookmarks.length === 0 && (
              <div className="empty-panel">
                <Bookmark size={48} className="empty-icon" />
                <p>No bookmarked alerts. Bookmarked jobs will appear here.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === "preferences" && (
        <section className="preferences-view">
          <div className="panel-wrapper">
            <h3>Alert Subscriptions Settings</h3>
            <p className="sub-description">Configure your notification preferences. You will receive customized dispatches when job postings match your filters.</p>
            
            <form onSubmit={savePreferences} className="pref-form">
              <div className="pref-row">
                <div className="pref-group">
                  <label>Email Address</label>
                  <input type="email" value={prefEmail} readOnly placeholder="Register account to update..." />
                </div>
                <div className="pref-group">
                  <label>Push Notification Token (Simulated)</label>
                  <input type="text" value={prefFcm} readOnly />
                </div>
              </div>

              <div className="preferences-section">
                <h4>Organizations</h4>
                <div className="checkboxes-matrix">
                  {filterOptions.organizations.map(org => (
                    <label key={org} className={`checkbox-pill ${selectedOrgs.includes(org) ? 'checked' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedOrgs.includes(org)} 
                        onChange={() => handleCheckboxChange("orgs", org)}
                      />
                      <span>{org}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="preferences-section">
                <h4>States</h4>
                <div className="checkboxes-matrix">
                  {filterOptions.states.map(state => (
                    <label key={state} className={`checkbox-pill ${selectedStates.includes(state) ? 'checked' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedStates.includes(state)} 
                        onChange={() => handleCheckboxChange("states", state)}
                      />
                      <span>{state}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="preferences-section">
                <h4>Qualifications</h4>
                <div className="checkboxes-matrix">
                  {filterOptions.qualifications.map(qual => (
                    <label key={qual} className={`checkbox-pill ${selectedQuals.includes(qual) ? 'checked' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedQuals.includes(qual)} 
                        onChange={() => handleCheckboxChange("quals", qual)}
                      />
                      <span>{qual}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="save-settings-btn">Save Preference Settings</button>
            </form>
          </div>
        </section>
      )}



      {/* Modal Popup: Job Details & AI Summary */}
      {modalOpen && activeJob && (
        <div className="modal-overlay-react" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-top">
              <div className="badges">
                <span className="org-chip">{activeJob.organization}</span>
                <span className="state-chip">{activeJob.state}</span>
              </div>
              <h3>{activeJob.title}</h3>
              
              <div className="meta-grid">
                <div><span>Vacancies:</span> <strong>{activeJob.vacancies ? activeJob.vacancies.toLocaleString("en-IN") : "Not Specified"}</strong></div>
                <div><span>Last Date:</span> <strong>{activeJob.application_last_date ? new Date(activeJob.application_last_date).toLocaleDateString() : "Refer Notice"}</strong></div>
                <div><span>Category:</span> <strong>{activeJob.category || "General"}</strong></div>
                <div><span>Qualification:</span> <strong>{activeJob.qualification || "As per rules"}</strong></div>
              </div>
            </div>

            <div className="modal-body-react">
              <div className="modal-tabs-header">
                <button className={`tab-btn ${modalTab === "english" ? "active" : ""}`} onClick={() => setModalTab("english")}>English Summary</button>
                <button className={`tab-btn ${modalTab === "telugu" ? "active" : ""}`} onClick={() => setModalTab("telugu")}>Telugu (తెలుగు)</button>
                <button className={`tab-btn ${modalTab === "eligibility" ? "active" : ""}`} onClick={() => setModalTab("eligibility")}>Eligibility</button>
                <button className={`tab-btn ${modalTab === "dates" ? "active" : ""}`} onClick={() => setModalTab("dates")}>Timeline</button>
              </div>

              <div className="modal-tab-content">
                {modalTab === "english" && <p>{activeJob.summary_english || "Loading summary..."}</p>}
                {modalTab === "telugu" && <p className="telugu-line">{activeJob.summary_telugu || "అందుబాటులో లేదు."}</p>}
                
                {modalTab === "eligibility" && (
                  <ul className="bullet-list">
                    {(activeJob.eligibility_summary || "• Check official notification PDF.").split('\n').map((line, idx) => (
                      <li key={idx}>{line.replace(/^[•\-\s]+/, "")}</li>
                    ))}
                  </ul>
                )}

                {modalTab === "dates" && (
                  <ul className="bullet-list">
                    {(activeJob.important_dates_summary || "• Check official apply URL.").split('\n').map((line, idx) => (
                      <li key={idx}>{line.replace(/^[•\-\s]+/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="modal-footer-react">
              <div className="action-links">
                <a href={getAbsoluteUrl(activeJob.official_notification_url, activeJob.organization)} target="_blank" rel="noopener noreferrer" className="btn-pdf">Notification PDF</a>
                <a href={getAbsoluteUrl(activeJob.official_apply_url, activeJob.organization)} target="_blank" rel="noopener noreferrer" className="btn-apply">Apply Online</a>
              </div>
              <button 
                className={`bookmark-btn-modal ${bookmarks.some(b => b._id === activeJob._id) ? 'active' : ''}`}
                onClick={(e) => toggleBookmark(e, activeJob._id)}
              >
                <Bookmark size={16} /> <span>Save Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
