#!/usr/bin/env python3
"""UTM coverage crawler.

Walks all pages on a domain (up to --max-pages) and reports every CTA /
form-pointing link that is missing utm_source, utm_medium, or utm_campaign.

Usage:
    python3 utm_audit.py --url https://subcontractorhub.com
    python3 utm_audit.py --url https://subcontractorhub.com --max-pages 50
    python3 utm_audit.py --url https://subcontractorhub.com --out reports/utm-audit.md
"""

import argparse
import sys
import time
from collections import deque
from urllib.parse import urljoin, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# Mirror the same lists used in checks.py so behavior is consistent.
FORM_PATHS = [
    "/signup", "/sign-up", "/sign_up", "/register", "/contact", "/contact-us",
    "/demo", "/request-demo", "/book-demo", "/get-demo", "/schedule-demo",
    "/quote", "/get-quote", "/request-quote", "/free-quote",
    "/schedule", "/book", "/booking", "/trial", "/free-trial",
    "/start", "/get-started", "/join", "/apply", "/enroll", "/onboarding",
    "/lead", "/form", "/inquiry",
]

CTA_WORDS = [
    "get started", "start free", "sign up", "signup", "book a demo",
    "request a demo", "get a quote", "get quote", "request quote",
    "contact us", "try free", "try for free", "free trial", "download",
    "get my", "claim", "schedule", "talk to", "see pricing", "join now",
    "create account", "register",
]

UTM_REQUIRED = ["utm_source", "utm_medium", "utm_campaign"]
UTM_RECOMMENDED = ["utm_content"]


def _is_form_link(href, link_text, base_host):
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return False
    parsed = urlparse(href)
    path = parsed.path.lower()
    host = parsed.netloc.lower()
    text = link_text.lower()
    if any(fp in path for fp in FORM_PATHS):
        return True
    if host and host != base_host and any(w in text for w in CTA_WORDS):
        return True
    if any(w in text for w in CTA_WORDS):
        return True
    return False


def _check_utm(href):
    """Return (missing_required, missing_recommended)."""
    params = parse_qs(urlparse(href).query)
    missing_req = [p for p in UTM_REQUIRED if p not in params]
    missing_rec = [p for p in UTM_RECOMMENDED if p not in params]
    return missing_req, missing_rec


def _fetch(url, timeout=15):
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout,
                         allow_redirects=True)
        return r.text, r.url  # r.url = final URL after redirects
    except Exception as exc:
        return None, str(exc)


def _same_domain(url, base_host):
    host = urlparse(url).netloc.lower()
    return host == base_host or host.endswith("." + base_host)


def crawl(start_url, max_pages=30, delay=0.5):
    """BFS crawl. Returns list of finding dicts."""
    base_host = urlparse(start_url).netloc.lower()
    queue = deque([start_url])
    visited = set()
    findings = []  # {page, href, text, missing_required, missing_recommended}

    while queue and len(visited) < max_pages:
        url = queue.popleft()
        if url in visited:
            continue
        visited.add(url)
        print(f"  [{len(visited):>3}/{max_pages}] {url}", flush=True)

        html, final_url = _fetch(url)
        if not html:
            print(f"         ⚠  fetch failed: {final_url}")
            continue

        soup = BeautifulSoup(html, "html.parser")

        # Collect CTA links on this page.
        for a in soup.find_all("a", href=True):
            href = a.get("href", "").strip()
            text = a.get_text(" ", strip=True)
            abs_href = urljoin(final_url, href)

            if _is_form_link(abs_href, text, base_host):
                missing_req, missing_rec = _check_utm(abs_href)
                findings.append({
                    "page": final_url,
                    "href": abs_href,
                    "text": text[:80],
                    "missing_required": missing_req,
                    "missing_recommended": missing_rec,
                })

            # Enqueue same-domain links for crawling.
            if _same_domain(abs_href, base_host) and abs_href not in visited:
                parsed = urlparse(abs_href)
                # Skip non-HTML resources.
                if not parsed.path.lower().endswith(
                        (".pdf", ".png", ".jpg", ".jpeg", ".gif", ".svg",
                         ".css", ".js", ".ico", ".xml", ".zip")):
                    queue.append(abs_href)

        if delay:
            time.sleep(delay)

    return findings, visited


def _dedupe(findings):
    """One entry per unique (href, page) — suppress repeated nav links per page."""
    seen = set()
    out = []
    for f in findings:
        key = (f["page"], f["href"])
        if key not in seen:
            seen.add(key)
            out.append(f)
    return out


def render_report(findings, visited, start_url):
    lines = []
    lines.append(f"# UTM Coverage Audit — {start_url}")
    lines.append(f"\n**Pages crawled:** {len(visited)}  ")

    bad = [f for f in findings if f["missing_required"]]
    warn = [f for f in findings if not f["missing_required"] and f["missing_recommended"]]
    ok = [f for f in findings if not f["missing_required"] and not f["missing_recommended"]]

    total = len(findings)
    lines.append(f"**Form-pointing links found:** {total}  ")
    lines.append(f"**Missing required UTMs (❌):** {len(bad)}  ")
    lines.append(f"**Missing recommended UTMs (⚠️):** {len(warn)}  ")
    lines.append(f"**Fully tagged (✅):** {len(ok)}  ")

    score = round(100 * len(ok) / total) if total else 0
    lines.append(f"**UTM coverage score:** {score}/100\n")

    if bad:
        lines.append("## ❌ Missing Required UTMs\n")
        lines.append("| Page | Link text | Destination | Missing |\n|---|---|---|---|")
        for f in bad:
            page = f["page"]
            text = f["text"].replace("|", "\\|")
            href = f["href"].replace("|", "\\|")
            missing = ", ".join(f["missing_required"])
            lines.append(f"| {page} | {text} | {href} | `{missing}` |")
        lines.append("")

    if warn:
        lines.append("## ⚠️  Missing Recommended UTMs\n")
        lines.append("| Page | Link text | Destination | Missing |\n|---|---|---|---|")
        for f in warn:
            page = f["page"]
            text = f["text"].replace("|", "\\|")
            href = f["href"].replace("|", "\\|")
            missing = ", ".join(f["missing_recommended"])
            lines.append(f"| {page} | {text} | {href} | `{missing}` |")
        lines.append("")

    if ok:
        lines.append("## ✅ Fully Tagged\n")
        lines.append("| Page | Link text | Destination |\n|---|---|---|")
        for f in ok:
            page_t = f["text"].replace("|", "\\|")
            page_h = f["href"].replace("|", "\\|")
            lines.append(f"| {f['page']} | {page_t} | {page_h} |")
        lines.append("")

    # Remediation table: one row per unique bad href with the fix.
    if bad:
        lines.append("## Fix-it guide\n")
        lines.append("Add these query params to each flagged link. "
                     "If the link is set in a tag manager, add them as tag variables.\n")
        lines.append("| Current href | Suggested addition |\n|---|---|")
        seen_hrefs = set()
        for f in bad:
            if f["href"] in seen_hrefs:
                continue
            seen_hrefs.add(f["href"])
            sep = "&" if "?" in f["href"] else "?"
            suggestion = sep + "&".join(
                f"{p}={{value}}" for p in f["missing_required"]
            )
            lines.append(f"| `{f['href']}` | `{suggestion}` |")
        lines.append("")
        lines.append("**utm_content** is also recommended on popup/button-level "
                     "links so you can A/B test creative variations:\n")
        lines.append("```\nutm_content=hero-cta       ← hero section primary button\n"
                     "utm_content=sticky-nav-cta  ← sticky navigation button\n"
                     "utm_content=exit-popup-cta  ← exit-intent popup\n"
                     "utm_content=footer-cta      ← footer link\n```\n")

    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description="UTM coverage crawl")
    ap.add_argument("--url", required=True, help="Starting URL to crawl")
    ap.add_argument("--max-pages", type=int, default=30,
                    help="Max pages to crawl (default 30)")
    ap.add_argument("--delay", type=float, default=0.5,
                    help="Seconds between requests (default 0.5)")
    ap.add_argument("--out", default=None,
                    help="Output .md file path (default: prints to stdout)")
    args = ap.parse_args()

    print(f"Crawling {args.url} (up to {args.max_pages} pages)…\n")
    raw_findings, visited = crawl(args.url, max_pages=args.max_pages, delay=args.delay)
    findings = _dedupe(raw_findings)

    report = render_report(findings, visited, args.url)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(report)
        print(f"\nReport written to {args.out}")
    else:
        print("\n" + report)


if __name__ == "__main__":
    sys.exit(main())
