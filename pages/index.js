import Head from 'next/head'
import Link from 'next/link'

const REPORTS = [
  {
    slug: 'cro-daily-2026-06-14',
    title: 'Daily CRO Report — Jun 14',
    description: '81.0/100 overall (+2.8). Exit-intent popup implemented (role-qualifier), scroll-depth popup at 40%, page exclusion list, 24h cookie guards. Full popup cascade live.',
    tag: 'cro',
    tagLabel: 'CRO',
    date: '2026-06-14',
    latest: true,
  },
  {
    slug: 'daily-cro-2026-06-11',
    title: 'Daily CRO Report — Jun 11',
    description: 'Live audit: 75.6/100 overall. Readability at Flesch 6, exit-intent gap, Intercom bot detected. Popup A/B test calendar for W1–W4.',
    tag: 'cro',
    tagLabel: 'CRO',
    date: '2026-06-11',
  },
  {
    slug: 'daily-cro-2026-06-09',
    title: 'Daily CRO Report — Jun 9',
    description: 'Strategy report pre-live-access: popup offer framework, bot conversation flow, A/B test variants A–C, and popup copy bank.',
    tag: 'cro',
    tagLabel: 'CRO',
    date: '2026-06-09',
  },
  {
    slug: 'subcontractorhub',
    title: 'Full Audit — SubcontractorHub',
    description: 'Comprehensive CRO + lead-capture audit. Suite breakdown, per-test scores, evidence log, prioritized fix list, and agent task manifest.',
    tag: 'audit',
    tagLabel: 'AUDIT',
    date: '2026-06-11',
  },
  {
    slug: 'utm-audit-2026-06-09',
    title: 'UTM Coverage Audit',
    description: '0/100 UTM coverage across 22 form-pointing links on 50 crawled pages. Full fix-it guide with recommended utm_content values.',
    tag: 'utm',
    tagLabel: 'UTM',
    date: '2026-06-09',
  },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>SubcontractorHub — CRO Plans</title>
        <meta name="description" content="Conversion rate optimization plans and lead capture audits for SubcontractorHub" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="site-header">
        <span className="logo">Sub<span>Hub</span> CRO</span>
        <nav>
          <Link href="/">Reports</Link>
          <Link href="/banners">Banners</Link>
        </nav>
      </header>

      <main className="page">
        <div className="hero">
          <h1>CRO Plans — SubcontractorHub</h1>
          <p>Conversion optimization reports, popup strategies, and lead-capture audits.</p>
        </div>

        {/* Live score card */}
        <div className="score-hero">
          <div>
            <div className="score-label">Overall Score (Jun 14)</div>
            <div className="score-big">81.0 <span className="grade">B+</span></div>
          </div>
          <div className="score-detail">
            <div className="score-label">Suite breakdown</div>
            <div className="suite-scores">
              <div className="suite-score">
                <span className="val" style={{ color: 'var(--accent2)' }}>84.2</span>
                <span className="name">CRO</span>
              </div>
              <div className="suite-score">
                <span className="val" style={{ color: 'var(--accent2)' }}>76.4</span>
                <span className="name">Lead Capture</span>
              </div>
            </div>
          </div>
          <div className="score-detail" style={{ marginLeft: 'auto' }}>
            <div className="score-label">Top fix</div>
            <div style={{ fontSize: '0.9rem', maxWidth: 260, color: 'var(--text)' }}>
              Deploy banner.js to Vercel — 4 popup improvements staged but not live
            </div>
          </div>
        </div>

        <div className="section-title">All reports</div>
        <div className="cards">
          {REPORTS.map((r) => (
            <Link key={r.slug} href={`/reports/${r.slug}`} className="card">
              <span className={`card-tag tag-${r.tag}`}>
                {r.tagLabel}
                {r.latest && ' · LATEST'}
              </span>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
              <div className="card-date">{r.date}</div>
            </Link>
          ))}

          {/* Banners card */}
          <Link href="/banners" className="card">
            <span className="card-tag tag-banner">BANNERS</span>
            <h3>Popup &amp; Banner Copy Bank</h3>
            <p>3 ready-to-deploy popup variants — primary lead-capture, exit-intent, and scroll-depth — plus the W1–W4 A/B test calendar.</p>
            <div className="card-date">Updated 2026-06-11</div>
          </Link>
        </div>

        <div className="section-title">Quick reference — prioritized fixes</div>
        <table className="ab-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fix</th>
              <th>Pts</th>
              <th>Effort</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><strong>Deploy banner.js to Vercel/CDN</strong> — 4 new popups + blog banners staged, not live</td>
              <td>+4.0</td>
              <td>git push (5 min)</td>
            </tr>
            <tr>
              <td>2</td>
              <td><strong>Add mobile exit-intent</strong> — scroll-up spike trigger (desktop-only now)</td>
              <td>+2.5</td>
              <td>~30 min dev</td>
            </tr>
            <tr>
              <td>3</td>
              <td><strong>Reduce demo form</strong> — 13 fields → 3 required + new heading</td>
              <td>+3.5</td>
              <td>2h (app access needed)</td>
            </tr>
            <tr>
              <td>4</td>
              <td><strong>Rewrite homepage copy</strong> — Flesch 6 → target 60+</td>
              <td>+3.6</td>
              <td>Copywriting, no dev</td>
            </tr>
            <tr>
              <td>5</td>
              <td><strong>Add consent checkbox</strong> — near Intercom capture form</td>
              <td>+2.8</td>
              <td>15 min dev</td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  )
}
