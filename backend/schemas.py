from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Auth
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    username: str
    nama_lengkap: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Document
class DocumentOut(BaseModel):
    id: int
    nama_file: str
    nama_pt: str
    tanggal_surat: Optional[datetime] = None
    tanggal_unggah: Optional[datetime] = None
    arah: str
    jenis: str
    confidence: float
    status: str
    ukuran: int
    extracted_text: str
    file_path: str
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    nama_pt: Optional[str] = None
    tanggal_surat: Optional[datetime] = None
    arah: Optional[str] = None
    jenis: Optional[str] = None
    status: Optional[str] = None

# Category
class CategoryCreate(BaseModel):
    nama: str
    parent_id: Optional[int] = None
    status: str = "Aktif"

class CategoryUpdate(BaseModel):
    nama: Optional[str] = None
    parent_id: Optional[int] = None
    status: Optional[str] = None

class CategoryOut(BaseModel):
    id: int
    nama: str
    parent_id: Optional[int] = None
    status: str
    created_at: Optional[datetime] = None
    document_count: int = 0
    children: List["CategoryOut"] = []
    class Config:
        from_attributes = True

# User
class UserCreate(BaseModel):
    username: str
    password: str
    nama_lengkap: str
    role: str = "admin"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    nama_lengkap: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# Profile
class ProfileUpdate(BaseModel):
    nama_lengkap: Optional[str] = None
    password: Optional[str] = None

# Threshold
class ThresholdUpdate(BaseModel):
    threshold: float

# AI Model
class AIModelOut(BaseModel):
    id: int
    version: str
    accuracy: float
    precision_score: float
    recall_score: float
    f1_score: float
    training_data_count: int
    threshold: float
    last_retrain: Optional[datetime] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Audit
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    detail: str
    type: str
    timestamp: Optional[datetime] = None
    class Config:
        from_attributes = True

# Dashboard
class MonthlyActivity(BaseModel):
    month: str
    masuk: int
    keluar: int

class DashboardStats(BaseModel):
    total_documents: int
    surat_masuk_count: int
    surat_keluar_count: int
    perlu_verifikasi_count: int
    recent_documents: List[DocumentOut]
    monthly_activity: List[MonthlyActivity]
    category_distribution: dict

# Bulk delete
class BulkDeleteRequest(BaseModel):
    ids: List[int]

CategoryOut.model_rebuild()
