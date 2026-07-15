from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import AIModel, User, now_wib
from schemas import ThresholdUpdate
from auth import get_current_user
import os
import json

router = APIRouter(prefix="/api/ai", tags=["AI Model"])

def _check_model_active():
    model_dir = os.path.join(os.path.dirname(__file__), "..", "ml_model")
    arah_path = os.path.join(model_dir, "arah_pipeline.pkl")
    jenis_path = os.path.join(model_dir, "jenis_pipeline.pkl")
    return os.path.exists(arah_path) and os.path.exists(jenis_path)

@router.get("/model")
def get_model_info(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return static model info. Model trained offline via notebook/train_and_evaluate.py"""
    model = db.query(AIModel).order_by(AIModel.id.desc()).first()
    is_active = _check_model_active()
    if not model:
        return {
            "id": 0,
            "version": "Belum dilatih",
            "accuracy": 0.0,
            "precision_score": 0.0,
            "recall_score": 0.0,
            "f1_score": 0.0,
            "training_data_count": 0,
            "threshold": 0.7,
            "last_retrain": None,
            "created_at": None,
            "arah_metrics": None,
            "jenis_metrics": None,
            "train_size": 0,
            "test_size": 0,
            "is_active": is_active,
            "split_note": "Model klasifikasi aktif. Hubungi admin untuk update terbaru.",
        }
    arah = json.loads(model.arah_metrics_json) if model.arah_metrics_json else None
    jenis = json.loads(model.jenis_metrics_json) if model.jenis_metrics_json else None
    return {
        "id": model.id,
        "version": model.version,
        "accuracy": model.accuracy,
        "precision_score": model.precision_score,
        "recall_score": model.recall_score,
        "f1_score": model.f1_score,
        "training_data_count": model.training_data_count,
        "threshold": model.threshold,
        "last_retrain": model.last_retrain.isoformat() if model.last_retrain else None,
        "created_at": model.created_at.isoformat() if model.created_at else None,
        "arah_metrics": arah,
        "jenis_metrics": jenis,
        "train_size": model.train_size,
        "test_size": model.test_size,
        "is_active": is_active,
        "split_note": model.split_note,
    }

@router.put("/threshold")
def update_threshold(data: ThresholdUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.threshold < 0.5 or data.threshold > 0.95:
        raise HTTPException(status_code=400, detail="Threshold harus antara 50% - 95%")
    model = db.query(AIModel).order_by(AIModel.id.desc()).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model AI belum dilatih")
    model.threshold = data.threshold
    db.commit()
    db.refresh(model)
    return {
        "id": model.id,
        "version": model.version,
        "accuracy": model.accuracy,
        "precision_score": model.precision_score,
        "recall_score": model.recall_score,
        "f1_score": model.f1_score,
        "training_data_count": model.training_data_count,
        "threshold": model.threshold,
        "is_active": _check_model_active(),
    }
