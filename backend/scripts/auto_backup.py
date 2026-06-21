#!/usr/bin/env python3
"""Auto-backup ALMEX database + uploads. Keeps last 7 daily backups."""
import os
import shutil
import sqlite3
from datetime import datetime

BACKUP_DIR = "/root/pengarsipan-almex-bintang-timur/backend/backups"
DB_PATH = "/root/pengarsipan-almex-bintang-timur/backend/database/almex.db"
UPLOADS_DIR = "/root/pengarsipan-almex-bintang-timur/backend/uploads"
KEEP_DAYS = 7

os.makedirs(BACKUP_DIR, exist_ok=True)

# Generate timestamp
ts = datetime.now().strftime("%Y%m%d_%H%M%S")

# 1. Backup database (hot backup via sqlite3)
db_backup = os.path.join(BACKUP_DIR, f"almex_{ts}.db")
try:
    src = sqlite3.connect(DB_PATH)
    dst = sqlite3.connect(db_backup)
    src.backup(dst)
    src.close()
    dst.close()
    print(f"[OK] Database backup: {db_backup}")
except Exception as e:
    print(f"[ERROR] Database backup failed: {e}")

# 2. Backup uploads folder
uploads_backup = os.path.join(BACKUP_DIR, f"uploads_{ts}.tar.gz")
try:
    shutil.make_archive(
        uploads_backup.replace('.tar.gz', ''),
        'gztar',
        UPLOADS_DIR
    )
    print(f"[OK] Uploads backup: {uploads_backup}")
except Exception as e:
    print(f"[ERROR] Uploads backup failed: {e}")

# 3. Cleanup old backups (keep last KEEP_DAYS)
cutoff = datetime.now().timestamp() - (KEEP_DAYS * 86400)
removed = 0
for f in os.listdir(BACKUP_DIR):
    fp = os.path.join(BACKUP_DIR, f)
    if os.path.getmtime(fp) < cutoff:
        os.remove(fp)
        removed += 1

if removed:
    print(f"[CLEANUP] Removed {removed} old backup(s)")

print(f"[DONE] Backup complete at {datetime.now().isoformat()}")
