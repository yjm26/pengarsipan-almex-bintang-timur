import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, engine
from models import Document, Category, User
from schemas import DashboardStats, DocumentOut, MonthlyActivity
from auth import get_current_user
from datetime import datetime, timedelta, timezone

DB_PATH = "/root/pengarsipan-almex-bintang-timur/backend/database/almex.db"
UPLOADS_DIR = "/root/pengarsipan-almex-bintang-timur/backend/uploads"

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/storage")
def get_storage_stats(current_user: User = Depends(get_current_user)):
    total_docs = 0
    total_bytes = 0
    db_size = 0
    uploads_size = 0
    
    with Session(engine) as db:
        total_docs = db.query(Document).count()
        total_bytes = db.query(func.sum(Document.ukuran)).scalar() or 0
    
    try:
        db_size = os.path.getsize(DB_PATH)
    except OSError:
        pass
    
    try:
        for root, dirs, files in os.walk(UPLOADS_DIR):
            for f in files:
                fp = os.path.join(root, f)
                uploads_size += os.path.getsize(fp)
    except OSError:
        pass
    
    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1024 * 1024: return f"{b / 1024:.1f} KB"
        if b < 1024 * 1024 * 1024: return f"{b / 1024 / 1024:.1f} MB"
        return f"{b / 1024 / 1024 / 1024:.1f} GB"
    
    total = db_size + uploads_size
    return {
        "total_documents": total_docs,
        "total_size": fmt(total),
        "used_percent": min(100, round(total / (15 * 1024 * 1024 * 1024) * 100)),
        "database_size": fmt(db_size),
        "file_storage": fmt(uploads_size),
        "last_backup": "Belum ada backup otomatis",
    }

@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Document).count()
    masuk = db.query(Document).filter(Document.arah == "Masuk").count()
    keluar = db.query(Document).filter(Document.arah == "Keluar").count()

    now = datetime.now(timezone(timedelta(hours=7)))
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now.month == 12:
        month_end = month_start.replace(year=now.year + 1, month=1)
    else:
        month_end = month_start.replace(month=now.month + 1)
    documents_this_month = db.query(Document).filter(
        Document.tanggal_unggah >= month_start,
        Document.tanggal_unggah < month_end
    ).count()

    recent = db.query(Document).order_by(Document.created_at.desc()).limit(5).all()

    # Monthly activity - last 6 months
    monthly = []
    for i in range(5, -1, -1):
        d = now - timedelta(days=i * 30)
        month_start = d.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if d.month == 12:
            month_end = month_start.replace(year=d.year + 1, month=1)
        else:
            month_end = month_start.replace(month=d.month + 1)
        m_count = db.query(Document).filter(
            Document.arah == "Masuk",
            Document.tanggal_unggah >= month_start,
            Document.tanggal_unggah < month_end
        ).count()
        k_count = db.query(Document).filter(
            Document.arah == "Keluar",
            Document.tanggal_unggah >= month_start,
            Document.tanggal_unggah < month_end
        ).count()
        monthly.append(MonthlyActivity(month=d.strftime("%b %Y"), masuk=m_count, keluar=k_count))

    # Category distribution - keep all skripsi categories visible, even when count is 0
    category_order = ["PurchaseOrder", "Invoice", "Penawaran", "SalesOrder", "SuratJalan", "Lainnya"]
    cat_dist = {name: 0 for name in category_order}
    for doc in db.query(Document).all():
        j = doc.jenis or "Lainnya"
        cat_dist[j if j in cat_dist else "Lainnya"] += 1

    return DashboardStats(
        total_documents=total,
        surat_masuk_count=masuk,
        surat_keluar_count=keluar,
        documents_this_month_count=documents_this_month,
        recent_documents=[DocumentOut.model_validate(r) for r in recent],
        monthly_activity=monthly,
        category_distribution=cat_dist
    )
