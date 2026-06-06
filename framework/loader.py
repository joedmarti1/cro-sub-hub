"""Load test suites and target configs from YAML."""

import os
import glob
import yaml

from .models import Test, Target

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TESTS_DIR = os.path.join(ROOT, "tests")
TARGETS_DIR = os.path.join(ROOT, "targets")


def load_suites(only=None):
    """Load all test suite YAML files in tests/.

    `only` is an optional list of suite names to keep.
    Returns a flat list of Test objects.
    """
    tests = []
    for path in sorted(glob.glob(os.path.join(TESTS_DIR, "*.yaml"))):
        with open(path) as fh:
            data = yaml.safe_load(fh) or {}
        suite = data.get("suite") or os.path.splitext(os.path.basename(path))[0]
        if only and suite not in only:
            continue
        for raw in data.get("tests", []):
            tests.append(Test(
                id=raw["id"],
                name=raw["name"],
                suite=suite,
                category=raw.get("category", "general"),
                weight=float(raw.get("weight", 0)),
                method=raw.get("method", "auto"),
                rationale=raw.get("rationale", "").strip(),
                check=raw.get("check"),
                agent_prompt=(raw.get("agent_prompt") or None),
                pass_criteria=raw.get("pass_criteria", "").strip(),
            ))
    return tests


def load_target(name):
    """Load a single target config by name (file stem)."""
    path = os.path.join(TARGETS_DIR, f"{name}.yaml")
    if not os.path.exists(path):
        raise FileNotFoundError(f"No target config at {path}")
    with open(path) as fh:
        data = yaml.safe_load(fh) or {}
    return Target(
        name=data.get("name", name),
        url=data.get("url", ""),
        label=data.get("label", ""),
        suites=data.get("suites", []),
        notes=data.get("notes", ""),
        rendered_html_path=data.get("rendered_html_path"),
        auth=data.get("auth", {}) or {},
    )
