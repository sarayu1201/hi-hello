import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Star, Users, Award, BookOpen, TrendingUp, CheckCircle, ChevronRight } from "lucide-react";
import { ExamLogo, ALL_EXAMS, STANDARD_SYLLABUS, STANDARD_PRACTICE } from "../data/exams";
import "./Home.css";
import "./Courses.css"; // Pull in shared exam grid styling

// Import Swiper and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, Keyboard } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CAROUSEL_JOBS = [
  {
    id: "cjob_1",
    examBoard: "SSC",
    title: "SSC CGL 2026 RECRUITMENT",
    category: "SSC Exams",
    badge: "NEW",
    badgeType: "success",
    vacancies: 14582,
    applyEnd: "2026-07-30",
    description: "Applications are now open for Group B & C services. Apply online before the deadline.",
    officialPdfUrl: "https://ssc.gov.in",
    applyUrl: "https://ssc.gov.in",
    bgImage: "/mega_batch_bg.png"
  },
  {
    id: "cjob_2",
    examBoard: "IBPS",
    title: "IBPS PO 2026 RECRUITMENT",
    category: "Bank & Insurance",
    badge: "NEW",
    badgeType: "success",
    vacancies: 4455,
    applyEnd: "2026-08-22",
    description: "National recruitment drive for Probationary Officers in participating public sector banks.",
    officialPdfUrl: "https://www.ibps.in",
    applyUrl: "https://www.ibps.in",
    bgImage: "/success_bg.png"
  },
  {
    id: "cjob_3",
    examBoard: "RRB",
    title: "RRB NTPC 2026 RECRUITMENT",
    category: "RRB & Railways",
    badge: "URGENT",
    badgeType: "danger",
    vacancies: 11558,
    applyEnd: "2026-09-15",
    description: "Non-Technical Popular Categories vacancies for graduates and under-graduates.",
    officialPdfUrl: "https://www.rrbapply.gov.in",
    applyUrl: "https://www.rrbapply.gov.in",
    bgImage: "/celebration_bg.png"
  },
  {
    id: "cjob_4",
    examBoard: "SBI",
    title: "SBI CLERK 2026 RECRUITMENT",
    category: "Bank & Insurance",
    badge: "LIVE",
    badgeType: "warning",
    vacancies: 8283,
    applyEnd: "2026-08-10",
    description: "Recruitment of Junior Associates (Customer Support & Sales). Applications now live.",
    officialPdfUrl: "https://sbi.co.in/web/careers",
    applyUrl: "https://sbi.co.in/web/careers",
    bgImage: "/mega_batch_bg.png"
  },
  {
    id: "cjob_5",
    examBoard: "APPSC",
    title: "APPSC GROUP 2 RECRUITMENT",
    category: "State Exams",
    badge: "LIVE",
    badgeType: "warning",
    vacancies: 905,
    applyEnd: "2026-09-05",
    description: "Andhra Pradesh PSC Executive and Non-Executive services recruitment notification.",
    officialPdfUrl: "https://psc.ap.gov.in",
    applyUrl: "https://psc.ap.gov.in",
    bgImage: "/results_bg.png"
  },
  {
    id: "cjob_6",
    examBoard: "UPSC",
    title: "UPSC TECHNICAL ASSISTANT",
    category: "UPSC / Civil",
    badge: "NEW",
    badgeType: "success",
    vacancies: 120,
    applyEnd: "2026-07-12",
    description: "Technical Assistant posts in central ministries. Written exam and interview schema.",
    officialPdfUrl: "https://upsconline.nic.in",
    applyUrl: "https://upsconline.nic.in",
    bgImage: "/success_bg.png"
  },
  {
    id: "cjob_7",
    examBoard: "LIC",
    title: "LIC AAO 2026 RECRUITMENT",
    category: "Bank & Insurance",
    badge: "NEW",
    badgeType: "success",
    vacancies: 300,
    applyEnd: "2026-08-18",
    description: "Assistant Administrative Officers (Generalist) notification out. Join LIC of India.",
    officialPdfUrl: "https://licindia.in/careers",
    applyUrl: "https://licindia.in/careers",
    bgImage: "/celebration_bg.png"
  },
  {
    id: "cjob_8",
    examBoard: "RRB",
    title: "RAILWAY TECHNICIAN GRADE III",
    category: "RRB & Railways",
    badge: "URGENT",
    badgeType: "danger",
    vacancies: 9144,
    applyEnd: "2026-07-28",
    description: "Technician Grade III recruitment open across all Railway Recruitment Boards (RRBs).",
    officialPdfUrl: "https://www.rrbapply.gov.in",
    applyUrl: "https://www.rrbapply.gov.in",
    bgImage: "/results_bg.png"
  },
  {
    id: "cjob_9",
    examBoard: "FCI",
    title: "FCI MANAGER RECRUITMENT 2026",
    category: "Others",
    badge: "LIVE",
    badgeType: "warning",
    vacancies: 113,
    applyEnd: "2026-08-02",
    description: "Managerial posts in general administration, movement, accounts, and engineering.",
    officialPdfUrl: "https://www.india.gov.in",
    applyUrl: "https://www.india.gov.in",
    bgImage: "/mega_batch_bg.png"
  },
  {
    id: "cjob_10",
    examBoard: "AP_POLICE",
    title: "STATE POLICE SI RECRUITMENT",
    category: "State Exams",
    badge: "NEW",
    badgeType: "success",
    vacancies: 411,
    applyEnd: "2026-08-20",
    description: "Sub-Inspectors of Police (Civil and APSP) in state police services recruitment drive.",
    officialPdfUrl: "https://slprb.ap.gov.in",
    applyUrl: "https://slprb.ap.gov.in",
    bgImage: "/success_bg.png"
  }
];



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

  // If there's no URL or if it's a mock suffix, redirect to the direct portal
  if (!url || url === "#" || url.includes('/apply/') || url.includes('/notifications/')) {
    return getDirectPortal(org) || 'https://www.india.gov.in';
  }

  return url;
};

const getCategoryClass = (examBoard) => {
  const eb = (examBoard || "").toUpperCase();
  if (eb.includes("UPSC")) return "theme-charcoal-gold";
  if (eb.includes("SSC")) return "theme-copper-rust";
  if (eb.includes("SBI") || eb.includes("IBPS") || eb.includes("LIC") || eb.includes("BANK")) return "theme-amber-gold";
  return "theme-emerald-green";
};

const STATS = [
  { value: "5000+", label: "Students Enrolled", icon: Users },
  { value: "500+",  label: "Govt Selections", icon: TrendingUp },
  { value: "98%",   label: "Student Satisfaction", icon: Star },
];

const CATEGORIES = [
  "Bank & Insurance",
  "SSC Exams",
  "RRB & Railways",
  "UPSC / Civil",
  "NEET / JEE",
  "State Exams"
];


const FEATURES = [
  "Expert Faculty with Proven Track Record",
  "Comprehensive Study Material in Telugu & English",
  "Daily Mock Tests & Previous Year Papers",
  "Doubt Clearing Sessions",
  "Performance Analysis & Reports",
  "Special Batches for Working Professionals",
];

const TESTIMONIALS = [
  { name: "Ravi Kumar", exam: "SBI PO 2023", text: "KR Institute of Learning's structured approach and expert guidance helped me crack SBI PO in my first attempt.", rating: 5 },
  { name: "Priya Reddy", exam: "SSC CGL 2023", text: "The mock tests and analysis here are top-notch. Faculty is very supportive and always available.", rating: 5 },
  { name: "Suresh Babu", exam: "RRB NTPC 2022", text: "Joined KR Institute of Learning after failing twice. Their strategy classes changed everything. Cleared with flying colors!", rating: 5 },
];

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft("Closed");
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="countdown-time">{timeLeft}</span>;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (window.location.protocol + "//" + window.location.hostname + ":5000") : "");

export default function Home({ navigate, user, requestAuth, setSelectedCourse, setSelectedCategory, notifications }) {
  const [activeTab, setActiveTab] = useState("Bank & Insurance");
  const [activeTickerTab, setActiveTickerTab] = useState("New Batches");
  
  // Real-time dynamic state data with static fallbacks
  const [carouselJobs, setCarouselJobs] = useState(CAROUSEL_JOBS);
  const [courses, setCourses] = useState(ALL_EXAMS);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const fetchHomeData = async () => {
    try {
      const jobsRes = await fetch(`${BACKEND_URL}/api/jobs/latest`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData && jobsData.length > 0) {
          const bgImages = ["/mega_batch_bg.png", "/success_bg.png", "/celebration_bg.png", "/results_bg.png"];
          const formattedJobs = jobsData.map((job, idx) => {
            let badge = "NEW";
            let badgeType = "success";
            const lastDate = job.application_last_date ? new Date(job.application_last_date) : null;
            if (lastDate) {
              const diffTime = lastDate.getTime() - new Date().getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays <= 7 && diffDays > 0) {
                badge = "URGENT";
                badgeType = "danger";
              } else if (diffDays <= 0) {
                badge = "EXPIRED";
                badgeType = "danger";
              } else if (idx % 3 === 0) {
                badge = "LIVE";
                badgeType = "warning";
              }
            }

            return {
              id: job._id || job.id,
              examBoard: job.organization || "SSC",
              title: job.title || "RECRUITMENT 2026",
              category: job.category || "Central Exams",
              badge,
              badgeType,
              vacancies: job.vacancies || 100,
              applyEnd: job.application_last_date || "2026-12-31",
              description: job.summary_english || "Official recruitment notification. Apply before the deadline.",
              officialPdfUrl: job.official_notification_url || "https://ssc.gov.in",
              applyUrl: job.official_apply_url || "https://ssc.gov.in",
              bgImage: bgImages[idx % bgImages.length]
            };
          });
          setCarouselJobs(formattedJobs);
        }
      }
    } catch (e) {
      console.error("Error loading jobs:", e);
    } finally {
      setLoadingJobs(false);
    }

    try {
      const coursesRes = await fetch(`${BACKEND_URL}/api/courses`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        if (coursesData && coursesData.length > 0) {
          setCourses(coursesData);
        }
      }
    } catch (e) {
      console.error("Error loading courses:", e);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
    const refreshTimer = setInterval(fetchHomeData, 300000); // 5 minutes refresh
    return () => clearInterval(refreshTimer);
  }, []);

  const liveJobsMarquee = (notifications && notifications.length > 0)
    ? notifications.map((n, idx) => `[${idx + 1}] 📢 ${n.title} (Apply last date: ${new Date(n.applyEnd).toLocaleDateString()})`).join("   |   ")
    : "No active exam notifications at this moment.";

  const TICKER_MESSAGES = {
    "New Batches": "🔥 Bank Clerks/POs/LIC batches start on 2-7-2026 (6.30 am - 9.30 am) @ RAJAHMUNDRY | 🚀 RRB (ALP/ TECHNICIAN / NTPC / GROUP-D / JE / RPF) BATCH Start on 3-7-2026 (8.00 am - 11.00 am) @ RAJAHMUNDRY | 📚 SSC CGL/CHSL Focus batches starting next Monday.",
    "Flash News": `📢 LIVE JOB VACANCIES: ${liveJobsMarquee}`,
    "Our Results": "🎉 31 Years of Excellence: Over 30,000+ selections since 1995! | 🌟 AP Police Sub-Inspector recruitments - 8 final selections this season! | 🎓 RRB ALP Psychometric Topper awards function on July 10.",
    "Live Schedules": "📅 Live Online Grand Test explanation: Quantitative Aptitude Prelims today at 5:00 PM. | 📝 Mock interview sessions for SBI PO candidates scheduled this Saturday."
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(exam => exam.category === activeTab);
  }, [activeTab, courses]);

  const handleCourseClick = (exam) => {
    requestAuth(() => {
      const courseDetails = {
        ...exam,
        syllabus: exam.syllabus && exam.syllabus.length > 0 ? exam.syllabus : STANDARD_SYLLABUS,
        practiceModules: exam.practiceModules || STANDARD_PRACTICE
      };
      setSelectedCourse(courseDetails);
      setSelectedCategory(exam.category);
      navigate("courses");
    });
  };

  const handlePillClick = (pillLabel) => {
    requestAuth(() => {
      setSelectedCourse(null);
      if (pillLabel === "RRB Exams" || pillLabel === "Railway Exams") {
        setSelectedCategory("RRB & Railways");
      } else if (pillLabel === "SSC Exams") {
        setSelectedCategory("SSC Exams");
      } else if (pillLabel === "Banking Exams") {
        setSelectedCategory("Bank & Insurance");
      } else if (pillLabel === "Civil Services") {
        setSelectedCategory("UPSC / Civil");
      } else if (pillLabel === "Government Exams") {
        setSelectedCategory("State Exams");
      } else if (pillLabel === "AP Police") {
        setSelectedCategory("State Exams");
      } else if (pillLabel === "Telangana Police") {
        setSelectedCategory("State Exams");
      }
      navigate("courses");
    });
  };

  return (
    <div className="home">
      {/* Premium Poster-Style Job Notification Carousel (Full Screen Hero) */}
      <section className="home-notifications-section">
        <div className="carousel-wrapper">
          <Swiper
            modules={[Autoplay, Navigation, Pagination, Keyboard]}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            keyboard={{ enabled: true }}
            speed={800}
            loop={true}
            navigation={{
              nextEl: '.carousel-nav-next',
              prevEl: '.carousel-nav-prev',
            }}
            pagination={{
              clickable: true,
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 16,
                centeredSlides: false
              },
              992: {
                slidesPerView: 1.12,
                spaceBetween: 24,
                centeredSlides: true
              }
            }}
            className="jobs-swiper"
          >
            {carouselJobs.map((job) => (
              <SwiperSlide key={job.id}>
                <div className={`poster-slide ${getCategoryClass(job.examBoard)}`}>
                  <div className="card-texture-overlay" style={{ backgroundImage: `url(${job.bgImage})` }} />
                  {/* Left Column: Info & Logo */}
                  <div className="poster-main-info">
                    <div className="poster-logo-container">
                      <ExamLogo type={job.examBoard} />
                      <span className={`org-badge-styled ${job.examBoard.toLowerCase()}`}>
                        {job.examBoard}
                      </span>
                    </div>
                    
                    <h2 className="poster-job-title">{job.title}</h2>
                    
                    <div className="poster-badges-row">
                      <span className={`badge-status ${job.badgeType}`}>{job.badge}</span>
                      <span className="badge-category">{job.category}</span>
                    </div>
                    
                    <p className="poster-short-description">{job.description}</p>
                  </div>
                  
                  {/* Right Column: Key Details & Actions */}
                  <div className="poster-details-side">
                    <ul className="poster-bullets-list">
                      <li>
                        <span className="bullet-checkmark">✔</span>
                        <strong>{job.vacancies.toLocaleString("en-IN")} Vacancies</strong>
                      </li>
                      <li>
                        <span className="bullet-checkmark">✔</span>
                        <strong>Last Date: {new Date(job.applyEnd).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                      </li>
                      <li>
                        <span className="bullet-checkmark">✔</span>
                        <span>Applications are now open</span>
                      </li>
                    </ul>
                    
                    <div className="poster-buttons-group">
                      <a 
                        href={getAbsoluteUrl(job.officialPdfUrl, job.examBoard)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="poster-btn-secondary"
                      >
                        Download Notification
                      </a>
                      <a 
                        href={getAbsoluteUrl(job.applyUrl, job.examBoard)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="poster-btn-primary"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls */}
          <button className="carousel-nav-btn carousel-nav-prev" aria-label="Previous slide">
            &lt;
          </button>
          <button className="carousel-nav-btn carousel-nav-next" aria-label="Next slide">
            &gt;
          </button>
        </div>
      </section>

      {/* Hero Split Layout */}
      <section className="hero">
        <div className="hero-split-container">
          <div className="hero-left-pane">
            <video 
              className="hero-omr-video" 
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
            >
              <source 
                src="/classroom.mp4" 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="hero-right-pane">
            <h1 className="hero-title">
              Achieve Your <span className="hero-highlight">Dream Govt Job</span>
            </h1>
            <p className="hero-sub">
              Access the most comprehensive online test series, proctored mock tests, and structured concept notes designed for Banking, SSC, Railways, UPSC, and State Police examinations.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("courses")}>
                Explore All Courses <ArrowRight size={17}/>
              </button>
              <button className="btn-secondary" onClick={() => navigate("mocktests")}>
                Try Free Mock Test
              </button>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars">
                <div className="avatar">A</div>
                <div className="avatar">B</div>
                <div className="avatar">C</div>
                <div className="avatar">D</div>
              </div>
              <span>Join over <strong>5,000+</strong> students already preparing.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sreedhar's CCE Style Marquee Ticker */}
      <section className="news-ticker-section">
        <div className="nt-tabs-nav">
          <ul className="nt-tabs-list">
            {["New Batches", "Flash News", "Our Results", "Live Schedules"].map(tab => (
              <li 
                key={tab} 
                className={`nt-tab-item nt-tab-${tab.toLowerCase().replace(" ", "-")} ${activeTickerTab === tab ? "nt-tab-item--active" : ""}`}
              >
                <button 
                  className="nt-tab-btn" 
                  onClick={() => setActiveTickerTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="nt-ticker">
          <div className="nt-ticker-inner" key={activeTickerTab}>
            {TICKER_MESSAGES[activeTickerTab]}
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="section home-exams-section">
        <div className="section-header">
          <h2>Exams We Cover</h2>
          <p>Select your target exam to access syllabus details, concepts, and interactive practice sets.</p>
        </div>

        {/* Tab Selector */}
        <div className="home-category-tabs">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`home-tab-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exams Badges Grid (Dynamic) */}
        <div className="exams-badges-grid home-badges-grid">
          {filteredCourses.map((course) => (
            <div 
              className="exam-badge-card" 
              key={course.id}
              onClick={() => handleCourseClick(course)}
            >
              <ExamLogo type={course.logoType} />
              <span className="exam-badge-title">{course.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" style={{ marginTop: '30px', marginBottom: '40px' }}>
        {STATS.map(({ value, label, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon"><Icon size={22}/></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-left">
          <h2>Why Choose KR Institute of Learning?</h2>
          <p>We don't just teach — we build exam-ready students with the right strategy, material, and mindset.</p>
          <button className="btn-primary" onClick={() => navigate("contact")}>
            Talk to Us <ArrowRight size={17}/>
          </button>
        </div>
        <div className="features-right">
          {FEATURES.map(f => (
            <div className="feature-item" key={f}>
              <CheckCircle size={19} color="var(--green)"/>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="section-header">
          <h2>Student Success Stories</h2>
          <p>Real results from real students</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="t-stars">{"★".repeat(t.rating)}</div>
              <p className="t-text">"{t.text}"</p>
              <div className="t-author">
                <div className="t-avatar">{t.name[0]}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-exam">{t.exam}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <BookOpen size={40} color="rgba(255,255,255,0.3)"/>
        <h2>Start Your Preparation Today</h2>
        <p>Limited seats available. Enroll now and get free study material worth ₹2000.</p>
        <button className="btn-white" onClick={() => { setSelectedCourse(null); navigate("courses"); }}>
          View All Courses <ArrowRight size={18}/>
        </button>
      </section>
    </div>
  );
}
