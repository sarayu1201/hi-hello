import { MapPin, Phone, Mail, Clock, Award, ShieldCheck } from "lucide-react";
import "./Footer.css";

// KR Institute of Learning Inline SVG Logo to match official branding
const KRLogo = () => (
  <svg viewBox="0 0 120 120" width="48" height="48" className="footer-logo-svg">
    {/* Base Blue Circle */}
    <circle cx="60" cy="55" r="38" fill="#1B365D"/>
    {/* Concentric Gold Rings */}
    <circle cx="60" cy="52" r="18" fill="none" stroke="#ECC036" strokeWidth="2.5"/>
    <circle cx="60" cy="52" r="12" fill="none" stroke="#ECC036" strokeWidth="2"/>
    <circle cx="60" cy="52" r="6" fill="#ECC036"/>
    
    {/* Golden Mortarboard (Graduation Cap) */}
    <polygon points="60,24 82,32 60,40 38,32" fill="#ECC036"/>
    <polygon points="48,34 48,42 60,46 72,42 72,34" fill="#D4AF37"/>
    {/* Tassel */}
    <line x1="78" y1="33" x2="82" y2="48" stroke="#ECC036" strokeWidth="2"/>
    <circle cx="82" cy="48" r="2" fill="#ECC036"/>

    {/* Gold Laurel Wreaths */}
    <path d="M 32,82 C 16,74 18,36 30,30" fill="none" stroke="#ECC036" strokeWidth="2"/>
    <path d="M 23,40 Q 18,36 16,42" fill="none" stroke="#ECC036" strokeWidth="1.5"/>
    <path d="M 20,54 Q 14,52 14,58" fill="none" stroke="#ECC036" strokeWidth="1.5"/>
    <path d="M 88,82 C 104,74 102,36 90,30" fill="none" stroke="#ECC036" strokeWidth="2"/>
    <path d="M 97,40 Q 102,36 104,42" fill="none" stroke="#ECC036" strokeWidth="1.5"/>
    <path d="M 100,54 Q 106,52 106,58" fill="none" stroke="#ECC036" strokeWidth="1.5"/>

    {/* Open Book at Bottom */}
    <path d="M38,82 Q50,78 60,86 Q70,78 82,82 L82,68 Q70,64 60,72 Q50,64 38,68 Z" fill="#FFFFFF" stroke="#364972" strokeWidth="1.5"/>
    {/* Letter K in Blue, R in Red */}
    <text x="49" y="77" fontSize="11" fontWeight="900" fill="#1B365D" textAnchor="middle" fontFamily="sans-serif">K</text>
    <text x="71" y="77" fontSize="11" fontWeight="900" fill="#E53935" textAnchor="middle" fontFamily="sans-serif">R</text>
  </svg>
);

export default function Footer({ navigate, setSelectedCategory, setSelectedCourse }) {
  const handleCategoryLink = (cat) => {
    setSelectedCategory(cat);
    if (setSelectedCourse) setSelectedCourse(null);
    navigate("courses");
    window.scrollTo(0, 0);
  };

  const handlePageLink = (page) => {
    if (page === "courses" && setSelectedCourse) {
      setSelectedCourse(null);
    }
    navigate(page);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="kr-footer">
      <div className="footer-container">
        {/* Column 1: Logo & Tagline */}
        <div className="footer-col brand-col">
          <div className="footer-logo-block" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '16px' }}>
            <img 
              src="/logo.png" 
              alt="KR Institute of Learning" 
              style={{ height: 62, objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white', fontFamily: "'Sora', sans-serif" }}>
              KR Institute of Learning
            </span>
          </div>
          <p className="footer-desc">
            Premium coaching center for Banking, SSC, Railways, State Exams, and spoken English fluency.
          </p>
          <div className="footer-badges-list">
            <div className="f-badge-item">
              <Award size={15} color="var(--accent)"/>
              <span>9 Years in Business</span>
            </div>
            <div className="f-badge-item">
              <ShieldCheck size={15} color="var(--accent)"/>
              <span>Trusted Selection Ratio</span>
            </div>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="footer-col">
          <h4>Quick Navigation</h4>
          <ul className="footer-links">
            <li><button onClick={() => handlePageLink("home")}>Home Page</button></li>
            <li><button onClick={() => handlePageLink("courses")}>Our Courses</button></li>
            <li><button onClick={() => handlePageLink("mocktests")}>Mock Exams</button></li>
            <li><button onClick={() => handlePageLink("results")}>Results Analytics</button></li>
            <li><button onClick={() => handlePageLink("admin")} style={{ color: "#ECC036", fontWeight: "bold" }}>Admin Console</button></li>
            <li><button onClick={() => handlePageLink("superadmin")} style={{ color: "#8B5CF6", fontWeight: "bold" }}>Superadmin Console</button></li>
          </ul>
        </div>

        {/* Column 3: Course Categories */}
        <div className="footer-col">
          <h4>Course Streams</h4>
          <ul className="footer-links">
            <li><button onClick={() => handleCategoryLink("Bank & Insurance")}>Banking & Insurance</button></li>
            <li><button onClick={() => handleCategoryLink("SSC Exams")}>SSC Recruitment</button></li>
            <li><button onClick={() => handleCategoryLink("Railways")}>Railways Board</button></li>
            <li><button onClick={() => handleCategoryLink("State Exams")}>State PSC & Police</button></li>
            <li><button onClick={() => handleCategoryLink("UPSC / Civil")}>UPSC Civil Services</button></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div className="footer-col contact-col">
          <h4>Contact & Location</h4>
          <ul className="contact-details-list">
            <li>
              <MapPin size={22} className="c-icon" color="var(--accent)"/>
              <span className="c-text">
                1st Floor, Alankar Residency, Near Chinna Anjaneya Swamy Temple, Danavaipeta, Rajahmundry.
              </span>
            </li>
            <li>
              <Phone size={16} className="c-icon" color="var(--accent)"/>
              <a href="tel:+918883026262" className="c-text">+91 88830 26262</a>
            </li>
            <li>
              <Mail size={16} className="c-icon" color="var(--accent)"/>
              <a href="mailto:info@kr-institute-of-learning.in" className="c-text">info@kr-institute-of-learning.in</a>
            </li>
            <li>
              <Clock size={16} className="c-icon" color="var(--accent)"/>
              <span className="c-text">
                Open Daily: 7:00 AM - 10:00 PM
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-copyright-bar">
        <div className="copyright-container">
          <span>&copy; {new Date().getFullYear()} KR Institute of Learning. All rights reserved.</span>
          <span className="designed-by" style={{ opacity: 0.65, fontSize: "11px", letterSpacing: "0.5px" }}>Designed by Innoxel</span>
        </div>
      </div>
    </footer>
  );
}
