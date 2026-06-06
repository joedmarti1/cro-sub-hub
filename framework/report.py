"""Render run results to JSON and Markdown."""

import json

from .models import NA, PASS, WARN, FAIL
from . import scoring

STATUS_ICON = {PASS: "✅", WARN: "⚠️", FAIL: "❌", NA: "⏳"}


def _grade(score):
    if score is None:
        return "—"
    if score >= 85:
        return "A"
    if score >= 75:
        return "B"
    if score >= 65:
        return "C"
    if score >= 50:
        return "D"
    return "F"


def to_dict(target, results):
    suites = scoring.suite_scores(results)
    overall = scoring.overall_score(suites)
    return {
        "target": {"name": target.name, "url": target.url, "label": target.label},
        "overall_score": overall,
        "grade": _grade(overall),
        "suites": {
            name: {**{k: v for k, v in s.items() if k != "weighted_sum"},
                   "grade": _grade(s["score"])}
            for name, s in suites.items()
        },
        "results": [
            {
                "id": r.test.id, "name": r.test.name, "suite": r.test.suite,
                "category": r.test.category, "weight": r.test.weight,
                "method": r.test.method, "score": r.result.score,
                "status": r.result.status, "evidence": r.result.evidence,
                "notes": r.result.notes,
            } for r in results
        ],
    }


def to_markdown(target, results, generated_on=None):
    data = to_dict(target, results)
    suites = data["suites"]
    L = []
    L.append(f"# CRO + Lead-Capture Audit — {target.label or target.name}")
    L.append("")
    L.append(f"**Target:** {target.url or '(url pending)'}  ")
    if generated_on:
        L.append(f"**Generated:** {generated_on}  ")
    ov = data["overall_score"]
    L.append(f"**Overall score:** {'—' if ov is None else ov} / 100  "
             f"(**{data['grade']}**)")
    L.append("")

    # Suite summary table
    L.append("## Suite scores")
    L.append("")
    L.append("| Suite | Score | Grade | Evaluated |")
    L.append("|---|---|---|---|")
    for name, s in suites.items():
        sc = "—" if s["score"] is None else s["score"]
        L.append(f"| {name} | {sc} | {s['grade']} | "
                 f"{s['evaluated']}/{s['total']} |")
    L.append("")

    # Per-suite detail
    by_suite = {}
    for r in results:
        by_suite.setdefault(r.test.suite, []).append(r)

    for suite, rs in by_suite.items():
        L.append(f"## {suite} — detail")
        L.append("")
        L.append("| | Test | Wt | Score | Notes |")
        L.append("|---|---|---|---|---|")
        for r in sorted(rs, key=lambda x: (x.result.status != FAIL, -x.test.weight)):
            icon = STATUS_ICON.get(r.result.status, "")
            sc = "—" if r.result.status == NA else int(r.result.score)
            note = (r.result.notes or "").replace("\n", " ")
            L.append(f"| {icon} | {r.test.name} | {r.test.weight:g} | {sc} | {note} |")
        L.append("")
        # Evidence block
        ev_lines = [r for r in rs if r.result.evidence]
        if ev_lines:
            L.append("<details><summary>Evidence</summary>")
            L.append("")
            for r in ev_lines:
                L.append(f"- **{r.test.name}**")
                for e in r.result.evidence:
                    L.append(f"  - {e}")
            L.append("")
            L.append("</details>")
            L.append("")

    # Prioritized recommendations (auto tests only, by weighted gap)
    fixes = sorted(
        [r for r in results if r.result.status in (FAIL, WARN)],
        key=lambda r: r.gap, reverse=True)
    if fixes:
        L.append("## Prioritized fixes (highest impact first)")
        L.append("")
        for r in fixes:
            L.append(f"1. **{r.test.name}** "
                     f"(+{r.gap:.1f} pts) — {r.result.notes}")
        L.append("")

    # Agent task manifest
    pending = [r for r in results
               if r.test.method != "auto" or r.result.status == NA]
    if pending:
        L.append("## Agent task manifest (manual / interactive)")
        L.append("")
        L.append("These tests need judgement or live interaction. Claude should "
                 "complete each, then the scores can be back-filled.")
        L.append("")
        for r in pending:
            L.append(f"### {r.test.name}  `({r.test.id})`")
            if r.test.pass_criteria:
                L.append(f"- **Pass criteria:** {r.test.pass_criteria}")
            prompt = r.test.agent_prompt or r.result.notes
            if prompt:
                L.append(f"- **Task:** {prompt}")
            L.append("")

    return "\n".join(L)


def write(target, results, out_dir, stem, generated_on=None):
    import os
    os.makedirs(out_dir, exist_ok=True)
    md = to_markdown(target, results, generated_on)
    js = to_dict(target, results)
    md_path = os.path.join(out_dir, f"{stem}.md")
    js_path = os.path.join(out_dir, f"{stem}.json")
    with open(md_path, "w") as fh:
        fh.write(md)
    with open(js_path, "w") as fh:
        json.dump(js, fh, indent=2)
    return md_path, js_path
