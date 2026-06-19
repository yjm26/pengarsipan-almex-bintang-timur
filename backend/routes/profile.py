from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, AuditLog, now_wib
from schemas import UserOut, ProfileUpdate
from auth import get_current_user, hash_password

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("", response_model=UserOut)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.nama_lengkap:
        current_user.nama_lengkap = data.nama_lengkap
    if data.password:
        current_user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(current_user)
    return current_user
