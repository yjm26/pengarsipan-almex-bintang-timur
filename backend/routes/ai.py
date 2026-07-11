from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import AIModel, User, now_wib
from schemas import ThresholdUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Model"])

@router.get("/model")
def get_model_info(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return static model info. Model trained offline via notebook/train_and_evaluate.py"""
    model = db.query(AIModel).order_by(AIModel.id.desc()).first()
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
            "split_note": "Model dilatih offline menggunakan notebook Training_Model_Produksi.ipynb (149 dokumen, 80/20 split). Metrics di-update manual oleh admin.",
        }
    import json
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
    }
