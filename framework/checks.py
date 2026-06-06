"""Automated check implementations.

Each public check takes a Probe and returns a CheckResult. The function name
must match the `check:` field in the test suite YAML. Keep checks honest:
when a page is JS-rendered and the signal can't be seen, return status NA
rather than a false FAIL.
"""

import re

from .models import CheckResult, PASS, WARN, FAIL, NA
from . import probe as probe_mod

CTA_WORDS = [
    "get started", "start free", "sign up", "signup", "book a demo",
    "request a demo", "get a quote", "get quote", "request quote",
    "contact us", "try free", "try for free", "free trial", "download",
    "get my", "claim", "schedule", "talk to", "see pricing", "join now",
    "create account", "register",
]


# --------------------------------------------------------------------------
# small utilities
# --------------------------------------------------------------------------

def _result(score, status, evidence=None, notes=""):
    return CheckResult(score=score, status=status,
                       evidence=evidence or [], notes=notes)


def _count_syllables(word):
    word = word.lower()
    word = re.sub(r"[^a-z]", "", word)
    if not word:
        return 0
    groups = re.findall(r"[aeiouy]+", word)
    n = len(groups)
    if word.endswith("e"):
        n -= 1
    return max(1, n)


def _flesch(text):
    sentences = max(1, len(re.findall(r"[.!?]+", text)))
    words = re.findall(r"[A-Za-z]+", text)
    if len(words) < 30:
        return None
    syll = sum(_count_syllables(w) for w in words)
    wc = len(words)
    return 206.835 - 1.015 * (wc / sentences) - 84.6 * (syll / wc)


# --------------------------------------------------------------------------
# CRO / conversion checks
# --------------------------------------------------------------------------

def value_prop_above_fold(probe):
    h1 = probe.soup.find("h1")
    if not h1:
        return _result(20, FAIL, notes="No <h1> found — no clear page-level headline.")
    text = h1.get_text(" ", strip=True)
    if not text:
        return _result(30, FAIL, notes="<h1> is empty.")
    words = len(text.split())
    # A strong value prop is concise and benefit-led, not a brand name dump.
    if 3 <= words <= 14:
        return _result(85, PASS, evidence=[f"H1: “{text}”"],
                       notes="Headline length is in the scannable range. "
                             "Have an agent confirm it is benefit-led.")
    if words < 3:
        return _result(55, WARN, evidence=[f"H1: “{text}”"],
                       notes="Headline is very short — may be a brand name, not a value prop.")
    return _result(60, WARN, evidence=[f"H1: “{text}”"],
                   notes="Headline is long — likely burying the core benefit.")


def primary_cta_present(probe):
    candidates = []
    for el in probe.soup.find_all(["a", "button"]):
        label = el.get_text(" ", strip=True).lower()
        if any(w in label for w in CTA_WORDS):
            candidates.append(el.get_text(" ", strip=True))
    if candidates:
        score = 90 if len(candidates) >= 1 else 60
        return _result(score, PASS,
                       evidence=[f"CTA-like: “{c}”" for c in candidates[:6]],
                       notes=f"{len(candidates)} action-oriented CTA(s) detected.")
    return _result(25, FAIL,
                   notes="No conversion-oriented CTA copy detected (get started, "
                         "book a demo, get a quote, etc.).")


def cta_focus(probe):
    labels = []
    for el in probe.soup.find_all(["a", "button"]):
        label = el.get_text(" ", strip=True).lower()
        if any(w in label for w in CTA_WORDS):
            labels.append(label)
    distinct = set(labels)
    n = len(distinct)
    if n == 0:
        return _result(40, NA, notes="No CTAs to evaluate for focus.")
    if n <= 2:
        return _result(90, PASS, evidence=sorted(distinct),
                       notes="Tight set of conversion actions — good focus.")
    if n <= 4:
        return _result(65, WARN, evidence=sorted(distinct),
                       notes="Several competing CTAs — risk of choice paralysis.")
    return _result(40, FAIL, evidence=sorted(distinct),
                   notes=f"{n} distinct CTAs — diluted primary action.")


def social_proof(probe):
    hits = probe.count_patterns(probe_mod.SOCIAL_PROOF_PATTERNS)
    if hits:
        score = min(90, 50 + 8 * len(hits))
        return _result(score, PASS, evidence=[f"{k} ×{v}" for k, v in hits.items()],
                       notes="Social-proof signals present.")
    return _result(20, FAIL, notes="No testimonials / reviews / 'trusted by' signals found.")


def trust_signals(probe):
    hits = probe.count_patterns(probe_mod.TRUST_PATTERNS)
    if hits:
        score = min(90, 45 + 9 * len(hits))
        return _result(score, PASS, evidence=[f"{k} ×{v}" for k, v in hits.items()],
                       notes="Risk-reduction / trust signals present.")
    return _result(30, WARN, notes="No guarantee / security / 'no credit card' style trust signals found.")


def urgency_scarcity(probe):
    hits = probe.count_patterns(probe_mod.URGENCY_PATTERNS)
    # Urgency is a bonus, not a requirement; absence is a soft warn.
    if hits:
        return _result(85, PASS, evidence=[f"{k} ×{v}" for k, v in hits.items()],
                       notes="Some urgency/scarcity cues present.")
    return _result(60, WARN, notes="No urgency/scarcity cues — consider adding (use ethically).")


def page_speed(probe):
    if probe.source != "http" or probe.elapsed_ms is None:
        return _result(0, NA, notes="No live timing (rendered/offline source).")
    ms = probe.elapsed_ms
    bytes_ = len(probe.html.encode("utf-8"))
    kb = bytes_ // 1024
    ev = [f"HTML fetch {ms} ms", f"HTML payload {kb} KB"]
    if ms <= 800:
        s = 90
    elif ms <= 1500:
        s = 75
    elif ms <= 3000:
        s = 55
    else:
        s = 30
    status = PASS if s >= 75 else (WARN if s >= 50 else FAIL)
    return _result(s, status, evidence=ev,
                   notes="Server response time only (HTML). Run a full Core Web "
                         "Vitals pass for LCP/INP/CLS.")


def mobile_viewport(probe):
    vp = probe.soup.find("meta", attrs={"name": "viewport"})
    if vp and "width=device-width" in (vp.get("content") or "").lower():
        return _result(90, PASS, evidence=[vp.get("content", "")],
                       notes="Responsive viewport meta present.")
    if vp:
        return _result(55, WARN, evidence=[vp.get("content", "")],
                       notes="Viewport meta present but not width=device-width.")
    return _result(20, FAIL, notes="No responsive viewport meta tag.")


def form_friction(probe):
    forms = probe.forms
    if not forms:
        return _result(0, NA, notes="No <form> found (may be JS-rendered — capture rendered HTML).")
    # Evaluate the form with the most visible fields (likely the main capture).
    counts = [(f, len(probe.visible_inputs(f))) for f in forms]
    counts.sort(key=lambda x: x[1], reverse=True)
    main, n = counts[0]
    ev = [f"{len(forms)} form(s); largest has {n} visible field(s)"]
    if n == 0:
        return _result(50, NA, evidence=ev, notes="Form has no visible inputs detected.")
    if n <= 3:
        return _result(90, PASS, evidence=ev, notes="Low-friction form (≤3 fields).")
    if n <= 5:
        return _result(70, WARN, evidence=ev, notes="Moderate friction — trim to essentials.")
    return _result(40, FAIL, evidence=ev, notes=f"{n} fields — high friction, expect drop-off.")


def readability(probe):
    score = _flesch(probe.text)
    if score is None:
        return _result(0, NA, notes="Not enough body text to score readability.")
    ev = [f"Flesch Reading Ease ≈ {score:.0f}"]
    if score >= 60:
        return _result(88, PASS, evidence=ev, notes="Easy to read (plain language).")
    if score >= 45:
        return _result(68, WARN, evidence=ev, notes="Fairly hard — simplify sentences.")
    return _result(40, FAIL, evidence=ev, notes="Hard to read — dense copy hurts conversion.")


# --------------------------------------------------------------------------
# Lead-capture / bot-UX checks
# --------------------------------------------------------------------------

def lead_magnet_offer(probe):
    # Look for offer language near a CTA: free guide/checklist/quote/audit/etc.
    offer_words = ["free guide", "free checklist", "free quote", "free estimate",
                   "free audit", "free trial", "free demo", "download", "ebook",
                   "e-book", "template", "calculator", "free consultation",
                   "get a quote", "free sample"]
    hits = probe.count_patterns(offer_words)
    if hits:
        return _result(85, PASS, evidence=[f"{k} ×{v}" for k, v in hits.items()],
                       notes="A lead magnet / offer is present.")
    return _result(30, FAIL, notes="No clear lead-magnet offer (free guide, quote, audit, etc.).")


def capture_form_present(probe):
    forms = probe.forms
    # Also count standalone email inputs not wrapped in a <form>.
    email_inputs = probe.soup.find_all("input", attrs={"type": "email"})
    if forms or email_inputs:
        ev = [f"{len(forms)} form(s), {len(email_inputs)} email input(s)"]
        return _result(85, PASS, evidence=ev, notes="A capture mechanism is present.")
    return _result(20, FAIL, notes="No form or email input found (check for JS-rendered capture).")


def form_field_minimization(probe):
    # Reuse the friction logic but framed as a separate scored test.
    forms = probe.forms
    if not forms:
        return _result(0, NA, notes="No form to evaluate.")
    n = max(len(probe.visible_inputs(f)) for f in forms)
    if n <= 2:
        return _result(92, PASS, notes=f"Main form asks ~{n} field(s) — minimal ask.")
    if n <= 4:
        return _result(70, WARN, notes=f"~{n} fields — defensible but trimmable.")
    return _result(45, FAIL, notes=f"~{n} fields — over-asking for a first touch.")


def chatbot_present(probe):
    found = probe.detect_widgets(probe_mod.CHATBOT_SIGNATURES)
    if found:
        return _result(85, PASS, evidence=found,
                       notes="Live-chat / bot widget detected. Verify it responds and qualifies.")
    return _result(40, WARN,
                   notes="No known chat/bot widget detected. A qualifying bot can lift capture.")


def exit_intent(probe):
    found = probe.detect_widgets({"exit-intent": probe_mod.EXIT_INTENT_SIGNATURES})
    raw = [s for s in probe.scripts if any(x in s.lower() for x in probe_mod.EXIT_INTENT_SIGNATURES)]
    if found or raw:
        return _result(80, PASS, evidence=raw or found,
                       notes="Exit-intent / popup capture tooling detected.")
    return _result(55, WARN,
                   notes="No exit-intent capture detected — a recovery offer can save abandoners.")


def consent_compliance(probe):
    # Look for a consent checkbox or a privacy link near the capture.
    has_checkbox = bool(probe.soup.find("input", attrs={"type": "checkbox"}))
    privacy_link = any("privacy" in (a.get("href", "") + a.get_text(" ", strip=True)).lower()
                       for a in probe.soup.find_all("a"))
    ev = []
    if has_checkbox:
        ev.append("consent checkbox present")
    if privacy_link:
        ev.append("privacy policy link present")
    if has_checkbox and privacy_link:
        return _result(88, PASS, evidence=ev, notes="Consent + privacy disclosure present.")
    if privacy_link:
        return _result(65, WARN, evidence=ev,
                       notes="Privacy link present but no explicit consent checkbox by the form.")
    return _result(35, FAIL, notes="No privacy link or consent control found near capture.")


def email_validation(probe):
    email_inputs = probe.soup.find_all("input", attrs={"type": "email"})
    required = [i for i in email_inputs if i.has_attr("required")]
    if email_inputs and required:
        return _result(85, PASS,
                       evidence=[f"{len(email_inputs)} email input(s), {len(required)} required"],
                       notes="Typed + required email input — basic validation in place.")
    if email_inputs:
        return _result(60, WARN, notes="Email input present but not marked required.")
    # A generic text input might still collect email; can't confirm.
    return _result(0, NA, notes="No type=email input found to validate.")
