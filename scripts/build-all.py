#!/usr/bin/env python3
"""Build the whole site in the right order, then run every check.

  python3 scripts/build-all.py          build + checks
  python3 scripts/build-all.py --check  checks only (no build)

Order matters: cases -> marketing (reads case-links.json) -> editorial
(reads cases and industries; writes sitemap.xml and llms.txt last).
Exit code 0 = ready to release (scripts/release.py).
"""
import subprocess, sys
from pathlib import Path

R = Path(__file__).resolve().parents[1]
S = R / 'scripts'
BUILD = [['python3', S / 'build-cases.py'], ['python3', S / 'build-marketing.py'], ['python3', S / 'build-editorial.py']]
CHECKS = [
    ['python3', '-m', 'unittest', 'discover', '-s', S, '-p', 'test_*.py'],
    ['node', S / 'test-site-events.cjs'],
    ['python3', S / 'audit-public.py', '--summary'],
]


def run(cmd):
    print('→', ' '.join(str(c.relative_to(R)) if isinstance(c, Path) else c for c in cmd), flush=True)
    return subprocess.run([str(c) for c in cmd], cwd=R).returncode


steps = CHECKS if '--check' in sys.argv else BUILD + CHECKS
for cmd in steps:
    if run(cmd):
        sys.exit(f'STOP: failed — {cmd[-1] if isinstance(cmd[-1], str) else cmd[1].name}')
print('OK: site built and checked. Next: python3 scripts/release.py --dry-run')
