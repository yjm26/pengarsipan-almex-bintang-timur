from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog, User
from schemas import AuditLogOut
from auth import get_current_user

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=dict)
def list_audit_logs(
    search: Optional[str] = None,
    type: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(AuditLog)
    if search:
        q = q.filter(AuditLog.action.ilike(f"%{search}%") | AuditLog.detail.ilike(f"%{search}%"))
    if type:
        q = q.filter(AuditLog.type == type)
    total = q.count()
    logs = q.order_by(AuditLog.timestamp.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "data": [AuditLogOut.model_validate(l) for l in logs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }
