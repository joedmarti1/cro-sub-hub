# CRO + Lead-Capture Test Framework

A reusable harness for auditing the **conversion** and **lead-capture / bot UX**
of a marketing site — the playbook learned from the lead-magnet bots, applied
target-by-target. First target: **SubcontractorHub**.

## What it does

- **Automated checks** run in-process against a fetched (or pre-captured) page:
  value prop, CTA presence/focus, social proof, trust signals, form friction,
  readability, mobile viewport, speed, lead-magnet offer, capture mechanism,
  field minimization, email validation, consent/privacy, chatbot detection,
  exit-intent.
- **Agent / interactive tests** (bot conversation quality, confirmation flow,
  follow-up sequence, visual hierarchy, message match) can't be judged by a
  script — they're emitted as an **agent task manifest** for Claude to complete
  live, then back-filled into the score.
- A **weighted scoring engine** produces per-suite and overall scores (0–100,
  A–F), normalized over the tests actually evaluated (NA tests don't unfairly
  sink the score).
- **Reports** in Markdown + JSON, with prioritized fixes ranked by weighted
  impact.

## Layout

```
run.py                  CLI entry point
tests/
  cro.yaml              CRO / conversion test definitions
  lead_capture.yaml     Lead-magnet & bot/UX test definitions
targets/
  _template.yaml        Copy this for a new target
  subcontractorhub.yaml First target (URL pending access)
framework/
  models.py             Test / Target / Result dataclasses
  loader.py             Load suites + targets from YAML
  probe.py              Fetch page, fingerprint widgets, pre-compute signals
  checks.py             Automated check implementations
  scoring.py            Run checks + weighted aggregation
  report.py             Markdown + JSON renderers
reports/                Output (gitignored)
captures/               Pre-captured rendered HTML for SPA pages (gitignored)
```

## Usage

```bash
pip install -r requirements.txt

# List targets, suites, and every test
python3 run.py --list

# Audit a target (uses URL from its config)
python3 run.py --target subcontractorhub

# Override the URL (e.g. a specific landing page)
python3 run.py --target subcontractorhub --url https://app.example.com/lp

# Use pre-captured rendered HTML (for JS-heavy / SPA pages)
python3 run.py --target subcontractorhub --html captures/sch-home.html
```

## Adding a test

1. Add an entry to `tests/cro.yaml` or `tests/lead_capture.yaml`.
   - `method: auto` → also add a function of the same `check:` name in
     `framework/checks.py` taking a `Probe` and returning a `CheckResult`.
   - `method: agent` / `interactive` → provide an `agent_prompt`; it lands in
     the report's manifest for Claude to run.
2. Re-run. Weights are normalized automatically, so they don't need to sum to 100.

## Adding a target

Copy `targets/_template.yaml` to `targets/<name>.yaml`, set `url` and `suites`.
For gated pages, keep real credentials in `targets/<name>.secret.yaml`
(gitignored) and reference via `auth`.

## Notes on accuracy

- The default probe is a plain HTTP GET, so **client-rendered content is
  invisible** to it (you'll see `NA` / "may be JS-rendered"). For SPA pages,
  capture rendered HTML (Chrome MCP or Playwright) into `captures/` and pass
  `--html`.
- `page_speed` is a coarse HTML-timing proxy. Pair it with a real Core Web
  Vitals run for LCP / INP / CLS.
