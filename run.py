#!/usr/bin/env python3
"""CRO + Lead-Capture audit runner.

Usage:
    python3 run.py --target subcontractorhub
    python3 run.py --target subcontractorhub --url https://site.com/lp
    python3 run.py --target subcontractorhub --html captures/page.html
    python3 run.py --list

Runs the automated checks for the target's suites, writes a Markdown + JSON
report to reports/, prints a summary, and lists the agent/interactive tests
still pending.
"""

import argparse
import os
import sys

from framework import loader, scoring, probe as probe_mod, report
from framework.models import NA, PASS, WARN, FAIL

ROOT = os.path.dirname(os.path.abspath(__file__))


def cmd_list():
    print("Targets:")
    for f in sorted(os.listdir(os.path.join(ROOT, "targets"))):
        if f.endswith(".yaml") and not f.startswith("_"):
            print(f"  - {f[:-5]}")
    print("\nSuites / tests:")
    for t in loader.load_suites():
        print(f"  [{t.suite}] {t.id}  (wt {t.weight:g}, {t.method})")


def main():
    ap = argparse.ArgumentParser(description="CRO + Lead-Capture audit runner")
    ap.add_argument("--target", help="target config name (file stem in targets/)")
    ap.add_argument("--url", help="override the target URL")
    ap.add_argument("--html", help="use pre-captured rendered HTML file instead of fetching")
    ap.add_argument("--out", default=os.path.join(ROOT, "reports"), help="output dir")
    ap.add_argument("--list", action="store_true", help="list targets, suites, and tests")
    args = ap.parse_args()

    if args.list:
        cmd_list()
        return 0

    if not args.target:
        ap.error("--target is required (or use --list)")

    target = loader.load_target(args.target)
    url = args.url or target.url
    html_path = args.html or target.rendered_html_path

    tests = loader.load_suites(only=target.suites or None)

    # Build the probe: prefer pre-captured rendered HTML when given.
    if html_path:
        if not os.path.isabs(html_path):
            html_path = os.path.join(ROOT, html_path)
        if not os.path.exists(html_path):
            print(f"ERROR: rendered HTML not found: {html_path}", file=sys.stderr)
            return 2
        pr = probe_mod.from_file(url or html_path, html_path)
        print(f"Source: rendered HTML ({html_path})")
    elif url:
        try:
            pr = probe_mod.fetch(url)
        except Exception as exc:
            print(f"ERROR fetching {url}: {exc}", file=sys.stderr)
            return 2
        print(f"Source: HTTP {pr.status_code} in {pr.elapsed_ms} ms — {url}")
    else:
        print("No URL or --html provided. The target config has no url yet.")
        print("Set targets/%s.yaml url, or pass --url / --html." % args.target)
        print("\nThe framework is ready — here is what WILL run once you supply access:\n")
        for t in tests:
            print(f"  [{t.suite}] {t.name}  ({t.method})")
        return 0

    results = scoring.run_all(tests, pr)
    suites = scoring.suite_scores(results)
    overall = scoring.overall_score(suites)

    stem = args.target
    md_path, js_path = report.write(target, results, args.out, stem)

    # Console summary
    print("\n" + "=" * 60)
    print(f"  {target.label or target.name}")
    print("=" * 60)
    for name, s in suites.items():
        sc = "—" if s["score"] is None else s["score"]
        print(f"  {name:<14} {str(sc):>5}/100   ({s['evaluated']}/{s['total']} evaluated)")
    print("-" * 60)
    print(f"  OVERALL        {('—' if overall is None else overall):>5}/100")
    print("=" * 60)

    icons = {PASS: "PASS", WARN: "WARN", FAIL: "FAIL", NA: "PEND"}
    pend = [r for r in results if r.result.status == NA or r.test.method != "auto"]
    fails = [r for r in results if r.result.status == FAIL]
    if fails:
        print("\nTop failures:")
        for r in sorted(fails, key=lambda x: x.gap, reverse=True)[:5]:
            print(f"  ❌ {r.test.name} — {r.result.notes}")
    if pend:
        print(f"\n{len(pend)} agent/interactive test(s) pending — see report manifest.")

    print(f"\nReport:  {md_path}")
    print(f"JSON:    {js_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
