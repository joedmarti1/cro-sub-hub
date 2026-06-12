import Head from 'next/head'
import Link from 'next/link'

const REPORTS = [
  {
    slug: 'daily-cro-2026-06-11',
    title: 'Daily CRO Report — Jun 11',
    description: 'Live audit: 75.6/100 overall. Readability at Flesch 6, exit-intent gap, Intercom bot detected. Popup A/B test calendar for W1–W4.',
    tag: 'cro',
    tagLabel: 'CRO',
    date: '2026-06-11',
    latest: true,
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
            <div className="score-label">Overall Score (Jun 11 live run)</div>
            <div className="score-big">75.6 <span className="grade">B</span></div>
          </div>
          <div className="score-detail">
            <div className="score-label">Suite breakdown</div>
            <div className="suite-scores">
              <div className="suite-score">
                <span className="val" style={{ color: 'var(--accent2)' }}>82.1</span>
                <span className="name">CRO</span>
              </div>
              <div className="suite-score">
                <span className="val" style={{ color: 'var(--fail)' }}>64.6</span>
                <span className="name">Lead Capture</span>
              </div>
            </div>
          </div>
          <div className="score-detail" style={{ marginLeft: 'auto' }}>
            <div className="score-label">Top fix</div>
            <div style={{ fontSize: '0.9rem', maxWidth: 260, color: 'var(--text)' }}>
              Readability at Flesch 6 — rewrite copy to plain language (+3.6 pts)
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
              <td><strong>Rewrite homepage copy</strong> — Flesch 6 → target 60+</td>
              <td>+3.6</td>
              <td>Copywriting, no dev</td>
            </tr>
            <tr>
              <td>2</td>
              <td><strong>Add consent checkbox</strong> — near Intercom capture form</td>
              <td>+2.8</td>
              <td>15 min dev</td>
            </tr>
            <tr>
              <td>3</td>
              <td><strong>Add exit-intent popup</strong> — binary qualifier + email</td>
              <td>+2.2</td>
              <td>2 hr dev</td>
            </tr>
            <tr>
              <td>4</td>
              <td><strong>Tag all 22 form-pointing links with UTMs</strong></td>
              <td>tracking</td>
              <td>GTM update</td>
            </tr>
            <tr>
              <td>5</td>
              <td><strong>Capture rendered HTML</strong> — unlock 4 NA checks</td>
              <td>+8.0 potential</td>
              <td>Playwright capture</td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  )
}
