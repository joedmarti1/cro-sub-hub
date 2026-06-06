"""Core data structures shared across the framework."""

from dataclasses import dataclass, field
from typing import Optional


# Status taxonomy for a single check result.
PASS = "pass"   # meets the bar
WARN = "warn"   # partial / needs attention
FAIL = "fail"   # missing or broken
NA = "na"       # could not be evaluated automatically (e.g. JS-rendered, needs agent)

STATUS_ORDER = {FAIL: 0, WARN: 1, PASS: 2, NA: 3}


@dataclass
class Test:
    """A single test definition, loaded from a suite YAML file."""
    id: str
    name: str
    suite: str
    category: str
    weight: float
    method: str            # "auto" | "agent" | "interactive"
    rationale: str = ""
    check: Optional[str] = None        # function name in checks.py (auto only)
    agent_prompt: Optional[str] = None # instruction for agent/interactive tests
    pass_criteria: str = ""


@dataclass
class CheckResult:
    """Outcome of running one automated check."""
    score: float                       # 0-100
    status: str                        # PASS / WARN / FAIL / NA
    evidence: list = field(default_factory=list)
    notes: str = ""


@dataclass
class TestResult:
    """A Test paired with its CheckResult (or pending agent task)."""
    test: Test
    result: CheckResult

    @property
    def weighted(self) -> float:
        return self.result.score * self.test.weight / 100.0

    @property
    def gap(self) -> float:
        """Weighted points left on the table — drives recommendation priority."""
        return (100.0 - self.result.score) * self.test.weight / 100.0


@dataclass
class Target:
    """A site under test, loaded from targets/<name>.yaml."""
    name: str
    url: str
    label: str = ""
    suites: list = field(default_factory=list)   # which suites to run
    notes: str = ""
    # Optional pre-captured rendered HTML (for JS-heavy pages) and auth.
    rendered_html_path: Optional[str] = None
    auth: dict = field(default_factory=dict)
