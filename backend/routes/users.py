from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, AuditLog, now_wib
from schemas import UserCreate, UserUpdate, UserOut
from auth import get_current_user, require_owner, hash_password

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_owner)):
    return db.query(User).all()

@router.post("", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_owner)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username sudah digunakan")
    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
        nama_lengkap=data.nama_lengkap,
        role=data.role,
        is_active=True,
        created_at=now_wib()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log = AuditLog(user_id=current_user.id, action="Tambah User", detail=f"Membuat user '{data.username}'", type="user", timestamp=now_wib())
    db.add(log)
    db.commit()
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_owner)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if data.username and data.username != user.username:
        if db.query(User).filter(User.username == data.username).first():
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
        user.username = data.username
    if data.password:
        user.password_hash = hash_password(data.password)
    if data.nama_lengkap:
        user.nama_lengkap = data.nama_lengkap
    if data.role:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_owner)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    user.is_active = False
    db.commit()
    return {"message": "User berhasil dinonaktifkan"}
