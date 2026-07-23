import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, Phone } from 'lucide-react'

const navExams = [
  { category: 'Banking & Insurance', items: ['SBI PO', 'IBPS PO', 'IBPS Clerk', 'RBI Grade B', 'LIC AAO', 'NIACL AO'] },
  { category: 'SSC Exams', items: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC CPO'] },
  { category: 'Railway Exams', items: ['RRB NTPC', 'RRB Group D', 'RRB GD', 'RRB JE', 'RRB ALP'] },
  { category: 'State PSC', items: ['APPSC', 'TSPSC', 'UPSC CSE', 'AP Police'] },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [examOpen, setExamOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'white' : 'rgba(11,31,75,0.97)',
      boxShadow: scrolled ? '0 2px 20px rgba(11,31,75,0.12)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68, gap: 32 }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="KR Institute of Learning" 
            style={{ height: 56, objectFit: 'contain' }} 
          />
          <span style={{ 
            fontWeight: 800, 
            fontSize: '1.25rem', 
            color: scrolled ? '#0B1F4B' : 'white', 
            fontFamily: "'Sora', sans-serif",
            letterSpacing: '-0.3px'
          }}>
            KR Institute of Learning
          </span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }} className="desktop-nav">
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setExamOpen(true)}
            onMouseLeave={() => setExamOpen(false)}>
            <button style={{
              background: 'none', display: 'flex', alignItems: 'center', gap: 4,
              color: scrolled ? '#1A1A2E' : 'white', fontWeight: 600, fontSize: '0.9rem', padding: '8px 12px',
              borderRadius: 6
            }}>
              Exams <ChevronDown size={16} />
            </button>
            {examOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0,
                background: 'white', boxShadow: '0 8px 32px rgba(11,31,75,0.18)',
                borderRadius: 12, padding: 20, minWidth: 680, display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, zIndex: 100,
                animation: 'fadeIn 0.15s ease'
              }}>
                {navExams.map(cat => (
                  <div key={cat.category}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1553C7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{cat.category}</div>
                    {cat.items.map(item => (
                      <a key={item} href="#courses" style={{ display: 'block', fontSize: '0.88rem', color: '#374151', padding: '4px 0', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.target.style.color = '#1553C7'}
                        onMouseLeave={e => e.target.style.color = '#374151'}>{item}</a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          {['Mock Tests', 'Study Material', 'Results', 'About Us'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} style={{
              color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)', fontWeight: 500,
              fontSize: '0.9rem', padding: '8px 12px', borderRadius: 6,
              transition: 'color 0.15s'
            }}>{link}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <a href="tel:+918883XXXXXX" className="header-phone-link" style={{ display: 'flex', alignItems: 'center', gap: 6, color: scrolled ? '#1553C7' : 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Phone size={16} /> +91 88830 XXXXX
          </a>
          <a href="#contact" className="header-enroll-btn btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Enroll Now</a>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', color: scrolled ? '#0B1F4B' : 'white', display: 'none' }} className="mobile-menu-btn">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: 68,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          zIndex: 999,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto'
        }}>
          {navExams.map(cat => (
            <div key={cat.category} style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1553C7', textTransform: 'uppercase', marginBottom: 8 }}>{cat.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cat.items.map(item => (
                  <a key={item} href="#courses" onClick={() => setMobileOpen(false)} style={{ fontSize: '0.85rem', color: '#374151', background: '#F3F4F6', padding: '6px 12px', borderRadius: 8, fontWeight: 500 }}>{item}</a>
                ))}
              </div>
            </div>
          ))}
          {['Mock Tests', 'Study Material', 'Results', 'About Us'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileOpen(false)} style={{
              fontSize: '1rem', fontWeight: 600, color: '#1A1A2E', padding: '8px 0', borderBottom: '1px solid #F3F4F6'
            }}>{link}</a>
          ))}
          <a href="#contact" onClick={() => setMobileOpen(false)} className="btn-gold" style={{ textAlign: 'center', marginTop: 12, padding: '12px', fontSize: '1rem' }}>Enroll Now →</a>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 600px) {
          .header-phone-link { display: none !important; }
          .header-enroll-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
