#!/usr/bin/env python3
"""Run on the Loops host via SSH: add the confirmed moved case URL only."""
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess

CONFIG = Path('/etc/nginx/sites-available/loops')
RULE = '    location = /cases/case-dco.html { return 301 https://loops.uz/cases/case-dco/$is_args$args; }'
ANCHOR = '    # Loops root migration 2026-09-27'


def updated(text):
    if RULE in text:
        return text
    if '/cases/case-dco.html' in text:
        raise RuntimeError('Existing DCO routing differs; inspect before changing it.')
    if text.count(ANCHOR) != 1:
        raise RuntimeError('Expected Loops config anchor missing or duplicated.')
    return text.replace(ANCHOR, '    # Preserve the legacy DCO case URL, 2026-10-09\n' + RULE + '\n\n' + ANCHOR)


def main():
    original = CONFIG.read_text()
    replacement = updated(original)
    if replacement == original:
        print('DCO redirect already present; no change.')
        return
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
    backup = CONFIG.with_name(CONFIG.name + '.bak-' + stamp + '-dco-redirect')
    shutil.copy2(CONFIG, backup)
    try:
        CONFIG.write_text(replacement)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    except Exception:
        shutil.copy2(backup, CONFIG)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        raise
    print('DCO redirect applied. Backup:', backup)


if __name__ == '__main__':
    main()
