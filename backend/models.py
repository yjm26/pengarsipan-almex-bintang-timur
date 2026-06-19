from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta, timezone
from database import Base

WIB = timezone(timedelta(hours=7))

def now_wib():
    return datetime.now(WIB)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nama_lengkap = Column(String(100), nullable=False)
    role = Column(String(20), default="admin")  # admin / super_admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_wib)
    documents = relationship("Document", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    nama_file = Column(String(255), nullable=False)
    nama_pt = Column(String(200), default="")
    tanggal_surat = Column(DateTime, nullable=True)
    tanggal_unggah = Column(DateTime, default=now_wib)
    arah = Column(String(20), default="Masuk")  # Masuk / Keluar
    jenis = Column(String(50), default="Lainnya")
    confidence = Column(Float, default=0.0)
    status = Column(String(20), default="pending")  # verified / review / pending
    ukuran = Column(Integer, default=0)  # bytes
    extracted_text = Column(Text, default="")
    file_path = Column(String(500), default="")
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=now_wib)
    user = relationship("User", back_populates="documents")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status = Column(String(20), default="Aktif")
    created_at = Column(DateTime, default=now_wib)
    children = relationship("Category", backref="parent", remote_side=[id], lazy="select")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    detail = Column(Text, default="")
    type = Column(String(20), default="auth")  # upload/auth/ai/user/category/settings
    timestamp = Column(DateTime, default=now_wib)
    user = relationship("User", back_populates="audit_logs")

class AIModel(Base):
    __tablename__ = "ai_model"
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(20), default="1.0.0")
    accuracy = Column(Float, default=0.0)
    precision_score = Column(Float, default=0.0)
    recall_score = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    training_data_count = Column(Integer, default=0)
    threshold = Column(Float, default=0.7)
    last_retrain = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=now_wib)
