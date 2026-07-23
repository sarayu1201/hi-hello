import { 
  Home, BookOpen, FileText, Award, GraduationCap, ChevronRight, X, 
  Layers, BarChart2, Activity, PenTool, BookOpenCheck, Bell, ShieldAlert
} from "lucide-react";
import "./Sidebar.css";

// KR Institute of Learning — Premium Logo matching the official brand
export const KRLogo = ({ className = "" }) => (
  <img 
    src="/logo.png" 
    alt="KR Institute of Learning" 
    className={`brand-logo-img ${className}`} 
    style={{ objectFit: 'contain' }}
  />
);

const MENU_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "mocktests", label: "Mock Tests", icon: FileText, showFreeBadge: true },
  { id: "practice", label: "Practice", icon: BookOpenCheck },
  { id: "jobalerts", label: "Job Alerts", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart2 }
];

const CATEGORIES_ITEMS = [
  "Bank & Insurance",
  "SSC Exams",
  "RRB & Railways",
  "UPSC / Civil",
  "NEET / JEE",
  "State Exams"
];

export default function Sidebar({ page, navigate, open, onClose, selectedCategory, setSelectedCategory, setSelectedCourse, navigateToPractice, user }) {
  const displayMenuItems = [...MENU_ITEMS];
  if (user && user.email) {
    const emailLower = user.email.toLowerCase();
    if (emailLower.includes("superadmin")) {
      displayMenuItems.push({ id: "superadmin", label: "Superadmin Panel", icon: ShieldAlert });
    } else if (emailLower.includes("admin")) {
      displayMenuItems.push({ id: "admin", label: "Admin Panel", icon: ShieldAlert });
    }
  }
  
  const handleMenuClick = (menuId) => {
    if (onClose) onClose();
    if (menuId === "practice") {
      if (navigateToPractice) {
        navigateToPractice();
      } else {
        if (setSelectedCourse) setSelectedCourse(null);
        navigate("courses");
      }
    } else if (menuId === "courses") {
      if (setSelectedCourse) setSelectedCourse(null);
      navigate("courses");
    } else if (menuId === "analytics") {
      navigate("results");
    } else {
      navigate(menuId);
    }
  };

  const handleCategoryClick = (catName) => {
    if (onClose) onClose();
    setSelectedCategory(catName);
    if (setSelectedCourse) setSelectedCourse(null);
    navigate("courses");
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      {/* Brand logo space in Sidebar */}
      <div className="sidebar-logo-container-premium">
        <button className="sidebar-close-btn" onClick={onClose}><X size={20}/></button>
        <KRLogo className="sidebar-logo-img-large" />
        <div className="sidebar-logo-brand-text">
          KR Institute of Learning
        </div>
      </div>

      <div className="sidebar-scrollable-content">
        {/* Menu Section */}
        <div className="sidebar-section-label">MENU</div>
        <nav className="sidebar-nav">
          {displayMenuItems.map((item) => {
            let isActive = page === item.id;
            if (item.id === "practice" && page === "courses") isActive = false; 
            if (item.id === "analytics" && page === "results") isActive = true;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <item.icon size={18} strokeWidth={2}/>
                <span className="nav-item-label">{item.label}</span>
                {item.showFreeBadge && <span className="free-pill">Free</span>}
                <ChevronRight size={13} className="nav-arrow"/>
              </button>
            );
          })}
        </nav>

        {/* Categories Section */}
        <div className="sidebar-section-label">CATEGORIES</div>
        <nav className="sidebar-nav">
          {CATEGORIES_ITEMS.map((cat) => {
            const isCatActive = page === "courses" && selectedCategory === cat;
            return (
              <button
                key={cat}
                className={`nav-item ${isCatActive ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <Layers size={17} strokeWidth={2}/>
                <span className="nav-item-label">{cat}</span>
                <ChevronRight size={13} className="nav-arrow"/>
              </button>
            );
          })}
        </nav>

        {/* Standalone Link */}
        <div className="sidebar-divider" />
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${page === "results" ? "active" : ""}`}
            onClick={() => navigate("results")}
          >
            <Award size={18} strokeWidth={2}/>
            <span className="nav-item-label">My Results</span>
            <ChevronRight size={13} className="nav-arrow"/>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div style={{color:'rgba(212,175,55,0.6)', fontWeight:600, fontSize:'10px', letterSpacing:'0.5px', marginBottom:4}}>KR INSTITUTE OF LEARNING</div>
        <a href="tel:+918883026262">📞 Call Support</a>
      </div>
    </aside>
  );
}
