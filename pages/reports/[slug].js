import fs from 'fs'
import path from 'path'
import Head from 'next/head'
import Link from 'next/link'
import { marked } from 'marked'

const REPORTS_DIR = path.join(process.cwd(), 'reports')

const META = {
  'daily-cro-2026-06-11': { title: 'Daily CRO Report — Jun 11', tag: 'CRO', tagClass: 'tag-cro' },
  'daily-cro-2026-06-09': { title: 'Daily CRO Report — Jun 9', tag: 'CRO', tagClass: 'tag-cro' },
  'subcontractorhub':     { title: 'Full Audit — SubcontractorHub', tag: 'AUDIT', tagClass: 'tag-audit' },
  'utm-audit-2026-06-09': { title: 'UTM Coverage Audit', tag: 'UTM', tagClass: 'tag-utm' },
}

export async function getStaticPaths() {
  const files = fs.readdirSync(REPORTS_DIR)
  const paths = files
    .filter(f => f.endsWith('.md'))
    .map(f => ({ params: { slug: f.replace('.md', '') } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const filePath = path.join(REPORTS_DIR, `${params.slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf8')
  const html = marked(raw)
  return { props: { slug: params.slug, html } }
}

export default function ReportPage({ slug, html }) {
  const meta = META[slug] || { title: slug, tag: 'REPORT', tagClass: 'tag-audit' }

  return (
    <>
      <Head>
        <title>{meta.title} — SubcontractorHub CRO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

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

        <div className="report-header">
          <span className={`card-tag ${meta.tagClass}`} style={{ marginBottom: 12, display: 'inline-block' }}>
            {meta.tag}
          </span>
          <h1>{meta.title}</h1>
        </div>

        <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </>
  )
}
