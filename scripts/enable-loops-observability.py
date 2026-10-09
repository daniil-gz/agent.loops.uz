#!/usr/bin/env python3
"""Install Loops-only nginx logs, with config validation and rollback."""
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess

VHOST = Path('/etc/nginx/sites-available/loops')
FORMAT = Path('/etc/nginx/conf.d/loops-observability.conf')
FORMAT_TEXT = '''# Loops diagnostics: no query strings, cookies or client addresses.
map $request_uri $loops_request_path {
    ~^(?<loops_path_without_query>[^?]*) $loops_path_without_query;
}
log_format loops_access_json escape=json
    '{"time":"$time_iso8601","host":"$host","method":"$request_method",'
    '"path":"$loops_request_path","status":$status,"request_seconds":$request_time,'
    '"bytes":$body_bytes_sent,"cf_ray":"$http_cf_ray","port":"$server_port"}';
'''
ANCHOR = '    server_name loops.uz www.loops.uz;'
LOGS = '''
    # Per-site diagnostics; rotation uses the existing /var/log/nginx/*.log policy.
    access_log /var/log/nginx/loops-access.log loops_access_json;
    error_log /var/log/nginx/loops-error.log warn;'''


def updated(text):
    if text.count(ANCHOR) != 2:
        raise RuntimeError('Expected exactly two Loops vhosts; inspect config drift.')
    if text.count(ANCHOR + LOGS) == 2:
        return text
    if 'loops-access.log' in text or 'loops-error.log' in text:
        raise RuntimeError('Partial or different Loops logging configuration exists.')
    return text.replace(ANCHOR, ANCHOR + LOGS)


def main():
    original = VHOST.read_text()
    replacement = updated(original)
    prior_format = FORMAT.read_text() if FORMAT.exists() else None
    if prior_format is not None and prior_format != FORMAT_TEXT:
        raise RuntimeError('Existing log-format file differs; inspect before replacing.')
    if original == replacement and prior_format == FORMAT_TEXT:
        print('Loops logging already installed.')
        return
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
    backup = VHOST.with_name(VHOST.name + '.bak-' + stamp + '-observability')
    shutil.copy2(VHOST, backup)
    try:
        FORMAT.write_text(FORMAT_TEXT)
        VHOST.write_text(replacement)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    except Exception:
        shutil.copy2(backup, VHOST)
        if prior_format is None:
            FORMAT.unlink(missing_ok=True)
        else:
            FORMAT.write_text(prior_format)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        raise
    print('Loops logging installed. Backup:', backup)


if __name__ == '__main__':
    main()
