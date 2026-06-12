import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

// All popups push to the demo request form
const DEMO_URL = 'https://app.subcontractorhub.com/sch-book-a-demo'

const BANNERS = [
  {
    id: 'primary',
    label: 'Primary — All-in-One Platform (Page Load)',
    trigger: { label: 'Page load', detail: '3 second delay — auto-fires when you land on this page' },
    headline: 'More Jobs. Less Chaos.',
    sub: 'SubcontractorHub is the all-in-one platform for roofing, solar, and HVAC businesses — AI quoting, project management, and faster payments from one login.',
    cta: 'Book a Demo →',
    micro: 'Free demo. No commitment.',
    utmContent: 'primary-load-popup',
    status: 'ready',
    autoDelay: 3000,
  },
  {
    id: 'exit',
    label: 'Exit-Intent — EasyQuote Feature Hook',
    trigger: { label: 'Exit intent', detail: 'Mouse exits toward browser chrome (desktop) · scroll-up spike (mobile) · only after 15s on page' },
    headline: 'Quote faster. Close more.',
    sub: 'EasyQuote generates AI-powered proposals with financing built in — and sends them before your competition even calls back.',
    cta: 'Start Selling Smarter →',
    micro: 'Takes 2 minutes to see.',
    utmContent: 'exit-intent-popup',
    status: 'ready',
  },
  {
    id: 'scroll',
    label: 'Mid-Page — Scale Angle',
    trigger: { label: 'Scroll depth', detail: '40% scroll on page · suppressed if primary popup already shown' },
    headline: 'Scale without the chaos.',
    sub: 'Take on more jobs without hiring more admin. SubcontractorHub handles quoting, project tracking, and payments — all from one platform.',
    cta: 'Get Started →',
    micro: 'Built for roofing, solar, and HVAC.',
    utmContent: 'scroll-depth-popup',
    status: 'ready',
  },
  {
    id: 'bot-gc',
    label: 'Bot Greeting — Project Visibility (Variant A)',
    trigger: { label: 'Intercom', detail: '4 second delay · Variant A — project management angle (W1 test)' },
    headline: 'Every job on track. No surprises.',
    sub: 'Automated task scheduling, real-time customer updates, and milestone tracking — from the moment the deal is signed.',
    cta: 'See the Platform →',
    micro: 'Variant A — project management angle',
    utmContent: 'bot-gc-flow-popup',
    status: 'test-w1',
  },
  {
    id: 'bot-sales',
    label: 'Bot Greeting — Sales Velocity (Variant B)',
    trigger: { label: 'Intercom', detail: 'Variant B — sales pipeline angle · compare click-through vs Variant A' },
    headline: 'Stop losing deals to slow follow-up.',
    sub: 'Sales Velocity automates your pipeline, sends dynamic proposals, and compares financing options in real time so your team closes faster.',
    cta: 'Boost Your Sales →',
    micro: 'Variant B — sales acceleration angle',
    utmContent: 'bot-sales-flow-popup',
    status: 'test-w1',
  },
]

const AB_TESTS = [
  { week: 'W1 — This week', test: 'Bot greeting: GC project-visibility angle (A) vs. sales-acceleration angle (B)', metric: 'Demo request click-through rate', sample: '50 conversations', status: 'active' },
  { week: 'W2', test: 'Trigger timing: 3s page-load vs. scroll-40% vs. exit-intent', metric: 'Popup → demo request rate', sample: '200 popup views', status: 'queued' },
  { week: 'W3', test: 'Primary headline: "You do the work. We handle the rest." vs. "More Jobs. Less Chaos." vs. "Quote faster, close more"', metric: 'CTA click rate', sample: '200 popup views', status: 'queued' },
  { week: 'W4', test: 'Page H1: current vs. "You do the work. We handle the rest." vs. "Scale without the chaos."', metric: 'Scroll depth + CTA click rate', sample: '500 sessions', status: 'queued' },
]

function StatusBadge({ status }) {
  const map = {
    ready:    { label: 'Ready to deploy', color: 'var(--accent2)' },
    'test-w1':{ label: 'W1 test',         color: 'var(--accent)'  },
    active:   { label: 'Active',           color: 'var(--accent2)' },
    queued:   { label: 'Queued',           color: 'var(--muted)'   },
  }
  const s = map[status] || { label: status, color: 'var(--muted)' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '.06em', background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

function buildDemoUrl(utmContent) {
  return `${DEMO_URL}?utm_source=site&utm_medium=popup&utm_campaign=lead-capture&utm_content=${utmContent}`
}

function PopupModal({ banner, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const demoUrl = buildDemoUrl(banner.utmContent)

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', color: '#111', borderRadius: 16,
        padding: '36px 32px 28px', maxWidth: 420, width: '100%',
        position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,.5)',
        animation: 'slideUp .25s ease',
        textAlign: 'center',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 16, background: 'none',
          border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#aaa',
          lineHeight: 1, padding: '4px 8px',
        }}>×</button>

        {/* Label pill */}
        <div style={{
          display: 'inline-block', marginBottom: 20,
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.08em', color: '#6366f1',
          background: 'rgba(99,102,241,.1)', padding: '3px 10px', borderRadius: 4,
        }}>
          {banner.label}
        </div>

        <h2 style={{
          fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.3,
          marginBottom: 12, color: '#111',
        }}>
          {banner.headline}
        </h2>

        <p style={{
          fontSize: '0.92rem', color: '#555', marginBottom: 28,
          lineHeight: 1.55,
        }}>
          {banner.sub}
        </p>

        {/* Single CTA → demo form */}
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', padding: '14px 24px', borderRadius: 9,
            background: '#6366f1', color: '#fff', fontWeight: 700,
            fontSize: '1rem', textDecoration: 'none',
            transition: 'background .15s', marginBottom: 12,
            boxShadow: '0 4px 16px rgba(99,102,241,.35)',
          }}
        >
          {banner.cta}
        </a>

        <p style={{ fontSize: '0.78rem', color: '#bbb', marginBottom: 20 }}>
          {banner.micro}
        </p>

        {/* dismiss */}
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#ccc',
          fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline',
        }}>
          No thanks
        </button>

        <div style={{
          marginTop: 20, paddingTop: 14, borderTop: '1px solid #f3f4f6',
          fontSize: '0.7rem', color: '#ccc', textAlign: 'center',
        }}>
          <strong style={{ color: '#bbb' }}>{banner.trigger.label}</strong> — {banner.trigger.detail}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  )
}

export default function BannersPage() {
  const [activePopup, setActivePopup] = useState(null)

  // Auto-fire primary popup after 3s
  useEffect(() => {
    const timer = setTimeout(() => setActivePopup('primary'), 3000)
    return () => clearTimeout(timer)
  }, [])

  const activeBanner = BANNERS.find(b => b.id === activePopup)

  return (
    <>
      <Head>
        <title>Popup &amp; Banner Copy Bank — SubcontractorHub CRO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {activeBanner && <PopupModal banner={activeBanner} onClose={() => setActivePopup(null)} />}

      <header className="site-header">
        <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
          Sub<span style={{ color: 'var(--accent)' }}>Hub</span> CRO
        </Link>
        <nav>
          <Link href="/">Reports</Link>
          <Link href="/banners">Banners</Link>
        </nav>
      </header>

      <main className="page">
        <Link href="/" className="back-link">← All reports</Link>

        <div className="hero">
          <h1>Popup &amp; Banner Copy Bank</h1>
          <p>All popups push to the <strong>demo request form</strong>. Click <strong>▶ Preview</strong> on any card to see it live — the primary popup auto-fires after 3 seconds.</p>
        </div>

        <div className="section-title">Popup variants — 3 ready, 2 in W1 test</div>
        <div className="banner-grid">
          {BANNERS.map((b) => (
            <div className="banner-card" key={b.id}>
              <div className="banner-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{b.label} · <StatusBadge status={b.status} /></span>
              </div>
              <div className="banner-card-body">
                <div className="banner-headline">{b.headline}</div>
                <div className="banner-sub">{b.sub}</div>

                {/* CTA preview */}
                <div style={{
                  margin: '16px 0 8px',
                  padding: '10px 16px',
                  background: 'rgba(99,102,241,.1)',
                  border: '1px solid rgba(99,102,241,.2)',
                  borderRadius: 7,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  textAlign: 'center',
                }}>
                  {b.cta}
                </div>
                <div className="banner-micro">{b.micro}</div>

                <button
                  onClick={() => setActivePopup(b.id)}
                  style={{
                    marginTop: 14, width: '100%', padding: '10px 0',
                    background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.3)',
                    borderRadius: 7, color: 'var(--accent)', fontWeight: 600,
                    fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                >
                  ▶ Preview popup
                </button>

                <div className="banner-trigger">
                  <strong>{b.trigger.label}</strong> — {b.trigger.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">A/B test calendar — W1 through W4</div>
        <table className="ab-table" style={{ marginBottom: 48 }}>
          <thead>
            <tr>
              <th>Week</th>
              <th>Test</th>
              <th>Primary metric</th>
              <th>Min sample</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {AB_TESTS.map((t) => (
              <tr key={t.week}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--accent)', fontWeight: 600 }}>{t.week}</td>
                <td>{t.test}</td>
                <td style={{ color: 'var(--muted)' }}>{t.metric}</td>
                <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{t.sample}</td>
                <td><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="section-title">UTM tracking — demo form destination</div>
        <div className="md-content">
          <p>Every popup CTA hits the demo form with a unique <code>utm_content</code> value so you can measure which popup drives the most demo requests:</p>
          <table>
            <thead><tr><th>Popup</th><th>UTM link</th></tr></thead>
            <tbody>
              {BANNERS.map(b => (
                <tr key={b.id}>
                  <td>{b.label}</td>
                  <td><code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{buildDemoUrl(b.utmContent)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
