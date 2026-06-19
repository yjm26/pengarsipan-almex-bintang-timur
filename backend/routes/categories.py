from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Category, User, AuditLog, now_wib
from schemas import CategoryCreate, CategoryUpdate, CategoryOut
from auth import get_current_user

router = APIRouter(prefix="/api/categories", tags=["Categories"])

def build_tree(categories, parent_id=None):
    result = []
    for cat in categories:
        if cat.parent_id == parent_id:
            item = CategoryOut(
                id=cat.id,
                nama=cat.nama,
                parent_id=cat.parent_id,
                status=cat.status,
                created_at=cat.created_at,
                children=build_tree(categories, cat.id)
            )
            result.append(item)
    return result

@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cats = db.query(Category).all()
    return build_tree(cats)

@router.post("", response_model=CategoryOut)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cat = Category(nama=data.nama, parent_id=data.parent_id, status=data.status, created_at=now_wib())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/{cat_id}", response_model=CategoryOut)
def update_category(cat_id: int, data: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, val)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    db.delete(cat)
    db.commit()
    return {"message": "Kategori berhasil dihapus"}
