import csv
import io
import shutil
import sqlite3
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Document, User
from auth import get_current_user
import os

router = APIRouter(prefix="/api/export", tags=["Export"])

BACKUP_DIR = "/root/pengarsipan-almex-bintang-timur/backend/backups"
DB_PATH = "/root/pengarsipan-almex-bintang-timur/backend/database/almex.db"
UPLOADS_DIR = "/root/pengarsipan-almex-bintang-timur/backend/uploads"

@router.post("/csv")
def export_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Nama File", "Nama PT", "Tanggal Surat", "Tanggal Unggah", "Arah", "Jenis", "Confidence", "Status", "Ukuran (bytes)"])
    for doc in docs:
        writer.writerow([
            doc.id, doc.nama_file, doc.nama_pt,
            doc.tanggal_surat.strftime("%d/%m/%Y") if doc.tanggal_surat else "",
            doc.tanggal_unggah.strftime("%d/%m/%Y") if doc.tanggal_unggah else "",
            doc.arah, doc.jenis, f"{doc.confidence:.2%}", doc.status, doc.ukuran
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dokumen_almex.csv"}
    )

@router.post("/excel")
def export_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from openpyxl import Workbook
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    wb = Workbook()
    ws = wb.active
    ws.title = "Dokumen"
    ws.append(["ID", "Nama File", "Nama PT", "Tanggal Surat", "Tanggal Unggah", "Arah", "Jenis", "Confidence", "Status", "Ukuran (bytes)"])
    for doc in docs:
        ws.append([
            doc.id, doc.nama_file, doc.nama_pt,
            doc.tanggal_surat.strftime("%d/%m/%Y") if doc.tanggal_surat else "",
            doc.tanggal_unggah.strftime("%d/%m/%Y") if doc.tanggal_unggah else "",
            doc.arah, doc.jenis, f"{doc.confidence:.2%}", doc.status, doc.ukuran
        ])
    filepath = "/tmp/dokumen_almex.xlsx"
    wb.save(filepath)
    return FileResponse(filepath, filename="dokumen_almex.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@router.post("/backup")
def backup_database(current_user: User = Depends(get_current_user)):
    """Manual backup database + uploads. Super Admin only."""
    if current_user.role != "super_admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Hanya Super Admin yang bisa backup")
    
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    results = []
    
    # Backup database
    db_backup = os.path.join(BACKUP_DIR, f"almex_{ts}.db")
    try:
        src = sqlite3.connect(DB_PATH)
        dst = sqlite3.connect(db_backup)
        src.backup(dst)
        src.close()
        dst.close()
        results.append(f"Database: {os.path.basename(db_backup)}")
    except Exception as e:
        results.append(f"Database ERROR: {e}")
    
    # Backup uploads
    uploads_backup = os.path.join(BACKUP_DIR, f"uploads_{ts}")
    try:
        shutil.make_archive(uploads_backup, 'gztar', UPLOADS_DIR)
        results.append(f"Uploads: {os.path.basename(uploads_backup)}.tar.gz")
    except Exception as e:
        results.append(f"Uploads ERROR: {e}")
    
    # Cleanup old backups (keep last 7 days)
    cutoff = datetime.now().timestamp() - (7 * 86400)
    removed = 0
    for f in os.listdir(BACKUP_DIR):
        fp = os.path.join(BACKUP_DIR, f)
        if os.path.isfile(fp) and os.path.getmtime(fp) < cutoff:
            os.remove(fp)
            removed += 1
    
    return {
        "status": "success",
        "timestamp": ts,
        "backups": results,
        "cleaned_up": removed
    }

@router.get("/backups")
def list_backups(current_user: User = Depends(get_current_user)):
    """List available backups."""
    if current_user.role != "super_admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Hanya Super Admin")
    
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backups = []
    for f in sorted(os.listdir(BACKUP_DIR), reverse=True):
        fp = os.path.join(BACKUP_DIR, f)
        if os.path.isfile(fp):
            backups.append({
                "name": f,
                "size_mb": round(os.path.getsize(fp) / 1024 / 1024, 2),
                "created": datetime.fromtimestamp(os.path.getmtime(fp)).isoformat(),
            })
    return {"backups": backups}
