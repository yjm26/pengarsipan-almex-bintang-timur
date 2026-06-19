from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models import Document, Category, User
from schemas import DashboardStats, DocumentOut, MonthlyActivity
from auth import get_current_user
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Document).count()
    masuk = db.query(Document).filter(Document.arah == "Masuk").count()
    keluar = db.query(Document).filter(Document.arah == "Keluar").count()
    perlu_verifikasi = db.query(Document).filter(Document.status == "pending").count()

    recent = db.query(Document).order_by(Document.created_at.desc()).limit(5).all()

    # Monthly activity - last 6 months
    monthly = []
    now = datetime.now(timezone(timedelta(hours=7)))
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

    # Category distribution
    cat_dist = {}
    for doc in db.query(Document).all():
        j = doc.jenis or "Lainnya"
        cat_dist[j] = cat_dist.get(j, 0) + 1

    return DashboardStats(
        total_documents=total,
        surat_masuk_count=masuk,
        surat_keluar_count=keluar,
        perlu_verifikasi_count=perlu_verifikasi,
        recent_documents=[DocumentOut.model_validate(r) for r in recent],
        monthly_activity=monthly,
        category_distribution=cat_dist
    )
