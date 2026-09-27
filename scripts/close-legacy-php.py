#!/usr/bin/env python3
"""Close two confirmed source-exposing legacy endpoints, preserving /api/lead."""
from pathlib import Path
import shutil, subprocess, datetime
p=Path('/etc/nginx/sites-available/loops');s=p.read_text()
marker='# Close inert legacy PHP source endpoints 2026-09-27'
if marker not in s:
    needle='    index index.html;'
    assert s.count(needle)==2 and 'server_name loops.uz www.loops.uz;' in s
    backup=p.with_name('loops.bak-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-legacy-php')
    shutil.copy2(p,backup)
    block='''

    # Close inert legacy PHP source endpoints 2026-09-27
    location = /api/chat.php { return 404; }
    location = /api/telegram.php { return 404; }
'''
    p.write_text(s.replace(needle,needle+block))
    try:
        subprocess.run(['nginx','-t'],check=True)
        subprocess.run(['systemctl','reload','nginx'],check=True)
    except BaseException:
        shutil.copy2(backup,p)
        subprocess.run(['nginx','-t'],check=True)
        subprocess.run(['systemctl','reload','nginx'],check=True)
        raise
    print('Legacy PHP URLs closed; backup:',backup)
else:
    print('Legacy PHP URLs already closed')
