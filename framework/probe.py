"""Fetch a target page and pre-compute reusable signals for checks.

Note: this uses a plain HTTP GET, so client-rendered (SPA) content will be
missing. For JS-heavy pages, pre-capture rendered HTML (e.g. via the Chrome
MCP or Playwright) and point the target's `rendered_html_path` at it; the
probe will prefer that over the raw fetch.
"""

import re
import time

import requests
from bs4 import BeautifulSoup

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# Known third-party widgets we can fingerprint from script/src or inline code.
CHATBOT_SIGNATURES = {
    "Intercom": ["intercom", "widget.intercom.io"],
    "Drift": ["drift.com", "js.driftt.com"],
    "Tidio": ["tidio"],
    "Tawk.to": ["tawk.to"],
    "HubSpot Chat": ["js.hs-scripts.com", "hubspot"],
    "Crisp": ["crisp.chat"],
    "LiveChat": ["livechatinc", "livechat"],
    "Zendesk": ["zdassets", "zopim", "zendesk"],
    "Facebook Messenger": ["facebook.com/customer_chat", "fb-customerchat"],
    "ManyChat": ["manychat"],
    "Landbot": ["landbot"],
}

EXIT_INTENT_SIGNATURES = [
    "exit-intent", "exitintent", "exit_intent", "ouibounce", "optinmonster",
    "privy", "sumo", "sleeknote", "mailmunch", "popupally", "wisepops",
]

SOCIAL_PROOF_PATTERNS = [
    "testimonial", "review", "rating", "stars", "trusted by", "customers",
    "case study", "case-study", "as seen", "5-star", "5 star", "g2", "capterra",
    "clutch", "verified", "loved by", "join thousands", "join over",
]

TRUST_PATTERNS = [
    "guarantee", "money-back", "money back", "secure", "ssl", "encrypted",
    "no credit card", "cancel anytime", "soc 2", "soc2", "gdpr", "privacy",
    "bbb", "accredited", "certified", "warranty", "refund",
]

URGENCY_PATTERNS = [
    "limited time", "today only", "ends soon", "hurry", "last chance",
    "only ", "spots left", "seats left", "expires", "deadline", "now",
]


class Probe:
    """Holds everything the checks need about one fetched page."""

    def __init__(self, url, html, status_code=None, headers=None,
                 elapsed_ms=None, source="http"):
        self.url = url
        self.html = html or ""
        self.status_code = status_code
        self.headers = headers or {}
        self.elapsed_ms = elapsed_ms
        self.source = source  # "http" | "rendered"
        self.soup = BeautifulSoup(self.html, "html.parser")
        self.lower = self.html.lower()
        self._text = None

    # --- lazily-computed views -------------------------------------------

    @property
    def text(self):
        if self._text is None:
            self._text = self.soup.get_text(" ", strip=True)
        return self._text

    @property
    def scripts(self):
        return [s.get("src", "") for s in self.soup.find_all("script")]

    @property
    def forms(self):
        return self.soup.find_all("form")

    # --- helpers ----------------------------------------------------------

    def count_patterns(self, patterns):
        """Return {pattern: count} for patterns present in the page text."""
        hits = {}
        for p in patterns:
            c = self.lower.count(p)
            if c:
                hits[p] = c
        return hits

    def detect_widgets(self, signatures):
        """signatures: {name: [needles]} -> list of detected names."""
        found = []
        for name, needles in signatures.items():
            if any(n in self.lower for n in needles):
                found.append(name)
        return found

    def visible_inputs(self, form):
        """Real, user-facing inputs in a form (excludes hidden/submit)."""
        out = []
        for inp in form.find_all(["input", "select", "textarea"]):
            t = (inp.get("type") or "").lower()
            if inp.name == "input" and t in ("hidden", "submit", "button", "image"):
                continue
            out.append(inp)
        return out


def fetch(url, timeout=20):
    """HTTP GET a URL into a Probe (measures wall-clock TTFB+download)."""
    start = time.time()
    resp = requests.get(url, headers={"User-Agent": UA}, timeout=timeout)
    elapsed_ms = int((time.time() - start) * 1000)
    return Probe(
        url=url,
        html=resp.text,
        status_code=resp.status_code,
        headers=dict(resp.headers),
        elapsed_ms=elapsed_ms,
        source="http",
    )


def from_file(url, path):
    """Build a Probe from pre-captured rendered HTML."""
    with open(path, encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    return Probe(url=url, html=html, source="rendered")
