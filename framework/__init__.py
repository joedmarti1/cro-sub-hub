"""CRO + Lead-Capture test framework.

A target-agnostic harness for auditing the conversion and lead-capture
behaviour of a marketing site. Automated checks run in-process; tests that
require human/agent judgement or live interaction are emitted as an agent
task manifest for Claude to complete.
"""

__version__ = "0.1.0"
