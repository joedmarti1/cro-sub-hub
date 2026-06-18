import { useState, useEffect } from 'react'
import '../styles/globals.css'

const DEMO_URL = 'https://app.subcontractorhub.com/sch-book-a-demo'
const DEMO_UTM = `${DEMO_URL}?utm_source=site&utm_medium=popup&utm_campaign=lead-capture`

// ── Popup modal ──────────────────────────────────────────────────────────────
function PopupModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9000, padding: 20,
      backdropFilter: 'blur(4px)',
      animation: 'scFadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', color: '#111', borderRadius: 18,
        padding: '40px 36px 32px', maxWidth: 440, width: '100%',
        position: 'relative', boxShadow: '0 28px 80px rgba(0,0,0,.45)',
        animation: 'scSlideUp .25s ease',
        textAlign: 'center',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 18, background: 'none',
          border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#bbb',
          lineHeight: 1, padding: '2px 6px',
        }}>×</button>

        <div style={{
          display: 'inline-block', marginBottom: 20, fontSize: '0.7rem',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em',
          color: '#6366f1', background: 'rgba(99,102,241,.1)',
          padding: '3px 12px', borderRadius: 4,
        }}>
          SubcontractorHub Platform
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.25, marginBottom: 12, color: '#111' }}>
          More Jobs. Less Chaos.
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: 28, lineHeight: 1.6 }}>
          The all-in-one platform for roofing, solar, and HVAC businesses — AI quoting, project management, and faster payments from one login.
        </p>

        <a href={`${DEMO_UTM}&utm_content=primary-modal`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'block', padding: '15px 24px', borderRadius: 10,
            background: '#6366f1', color: '#fff', fontWeight: 700,
            fontSize: '1.05rem', textDecoration: 'none', marginBottom: 12,
            boxShadow: '0 4px 18px rgba(99,102,241,.4)',
          }}>
          Book a Demo →
        </a>

        <p style={{ fontSize: '0.8rem', color: '#bbb', marginBottom: 16 }}>Free demo. No commitment.</p>

        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#ccc',
          fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline',
        }}>
          No thanks
        </button>
      </div>

      <style>{`
        @keyframes scFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes scSlideUp { from { transform:translateY(22px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
    </div>
  )
}

// ── Sticky footer bar (Zight-style) ──────────────────────────────────────────
function StickyFooter({ onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 8000,
      background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
      boxShadow: '0 -4px 24px rgba(99,102,241,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: '13px 24px',
      animation: 'scSlideFooter .35s cubic-bezier(.22,1,.36,1)',
    }}>
      {/* Copy */}
      <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
        More Jobs. Less Chaos.
      </span>
      <span style={{
        color: 'rgba(255,255,255,.75)', fontSize: '0.88rem',
        display: 'none',
      }}
        className="footer-sub"
      >
        AI quoting · project management · faster payments — one platform.
      </span>

      {/* CTA */}
      <a href={`${DEMO_UTM}&utm_content=sticky-footer-bar`}
        target="_blank" rel="noopener noreferrer"
        style={{
          background: '#fff', color: '#4f46e5', fontWeight: 700,
          fontSize: '0.875rem', padding: '8px 20px', borderRadius: 8,
          textDecoration: 'none', whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,.15)',
          transition: 'transform .15s',
        }}>
        Book a Demo
      </a>

      {/* Dismiss */}
      <button onClick={onDismiss} aria-label="Dismiss" style={{
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: 'rgba(255,255,255,.6)',
        fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1, padding: '4px 6px',
      }}>×</button>

      <style>{`
        @keyframes scSlideFooter { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @media (min-width: 680px) { .footer-sub { display: inline !important; } }
      `}</style>
    </div>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────
export default function App({ Component, pageProps }) {
  const [showPopup, setShowPopup]   = useState(false)
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    // Footer: show after 1.5s, once per session
    if (!sessionStorage.getItem('sc_footer_dismissed')) {
      const t = setTimeout(() => setShowFooter(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    // Popup: auto-fire after 4s, once per session
    if (!sessionStorage.getItem('sc_popup_seen')) {
      const t = setTimeout(() => {
        setShowPopup(true)
        sessionStorage.setItem('sc_popup_seen', '1')
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [])

  const dismissFooter = () => {
    setShowFooter(false)
    sessionStorage.setItem('sc_footer_dismissed', '1')
  }

  const closePopup = () => setShowPopup(false)

  return (
    <>
      <Component {...pageProps} />
      {showFooter && <StickyFooter onDismiss={dismissFooter} />}
      {showPopup  && <PopupModal  onClose={closePopup} />}
    </>
  )
}
