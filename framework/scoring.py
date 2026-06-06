"""Run checks against a probe and compute weighted scores."""

from . import checks as checks_mod
from .models import CheckResult, TestResult, NA


def run_test(test, probe):
    """Execute one Test against the probe, returning a TestResult.

    Auto tests dispatch to checks.py. Agent/interactive tests return an NA
    placeholder (score 0, status NA) and surface in the agent manifest.
    """
    if test.method != "auto" or not test.check:
        return TestResult(test, CheckResult(
            score=0, status=NA,
            notes="Pending agent/interactive evaluation — see manifest."))

    fn = getattr(checks_mod, test.check, None)
    if fn is None:
        return TestResult(test, CheckResult(
            score=0, status=NA,
            notes=f"No check implementation named '{test.check}'."))
    try:
        res = fn(probe)
    except Exception as exc:  # a broken check must not sink the whole run
        res = CheckResult(score=0, status=NA, notes=f"Check error: {exc!r}")
    return TestResult(test, res)


def run_all(tests, probe):
    return [run_test(t, probe) for t in tests]


def suite_scores(results):
    """Aggregate weighted scores per suite, excluding NA tests from the base.

    Returns {suite: {"score": float, "weight_evaluated": float,
                     "weight_total": float, "evaluated": int, "total": int}}
    """
    out = {}
    for r in results:
        s = out.setdefault(r.test.suite, {
            "weighted_sum": 0.0, "weight_evaluated": 0.0,
            "weight_total": 0.0, "evaluated": 0, "total": 0})
        s["weight_total"] += r.test.weight
        s["total"] += 1
        if r.result.status == NA:
            continue
        s["weighted_sum"] += r.weighted
        s["weight_evaluated"] += r.test.weight
        s["evaluated"] += 1

    for suite, s in out.items():
        we = s["weight_evaluated"]
        # Normalize to 0-100 over the weight actually evaluated.
        s["score"] = round(100 * s["weighted_sum"] / we, 1) if we else None
    return out


def overall_score(suite_data):
    evaluated = [s for s in suite_data.values() if s["score"] is not None]
    if not evaluated:
        return None
    total_w = sum(s["weight_evaluated"] for s in evaluated)
    if not total_w:
        return None
    return round(sum(s["score"] * s["weight_evaluated"] for s in evaluated) / total_w, 1)
