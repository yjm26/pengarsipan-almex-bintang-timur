from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, AuditLog
from schemas import LoginRequest, Token, UserOut
from auth import verify_password, create_access_token, hash_password, get_current_user
from models import now_wib

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Username atau password salah")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Akun tidak aktif")
    token = create_access_token({"sub": str(user.id)})
    log = AuditLog(user_id=user.id, action="Login", detail=f"User {user.username} berhasil login", type="auth", timestamp=now_wib())
    db.add(log)
    db.commit()
    return {"access_token": token, "nama_lengkap": user.nama_lengkap, "role": user.role}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
