import threading
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import AIModel, User, AuditLog, now_wib
from schemas import AIModelOut, ThresholdUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Model"])

retrain_status = {"running": False, "message": "", "progress": 0}

@router.get("/model", response_model=AIModelOut)
def get_model_info(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    model = db.query(AIModel).order_by(AIModel.id.desc()).first()
    if not model:
        # Return default placeholder jangan 404
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
            "split_note": "Model belum dilatih. Klik 'Retrain Model' untuk memulai.",
        }
    return model

@router.post("/retrain", status_code=202)
def trigger_retrain(background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if retrain_status["running"]:
        raise HTTPException(status_code=409, detail="Proses retrain sedang berjalan")
    background_tasks.add_task(do_retrain, current_user.id)
    return {"message": "Proses retrain dimulai"}

def do_retrain(user_id: int):
    global retrain_status
    retrain_status = {"running": True, "message": "Melatih model...", "progress": 10}
    try:
        from database import SessionLocal
        from ml.classifier import classifier
        from models import AIModel, Document
        from datetime import datetime, timedelta, timezone

        db = SessionLocal()

        # Use uploaded documents as training data
        docs = db.query(Document).filter(Document.extracted_text != '').all()
        if len(docs) < 10:
            retrain_status = {"running": False, "message": f"Data kurang ({len(docs)} dokumen). Minimal 10 dokumen diperlukan.", "progress": 0}
            db.close()
            return

        texts = [str(d.extracted_text) for d in docs]
        arah_labels = [str(d.arah) for d in docs]
        jenis_labels = [str(d.jenis) for d in docs]
        retrain_status["progress"] = 30

        metrics = classifier.train(texts, arah_labels, jenis_labels)
        retrain_status["progress"] = 80

        model_info = db.query(AIModel).order_by(AIModel.id.desc()).first()
        ver = "1.0.0"
        if model_info:
            parts = model_info.version.split(".")
            ver = f"{parts[0]}.{parts[1]}.{int(parts[2]) + 1}"

        new_model = AIModel(
            version=ver,
            accuracy=metrics["accuracy"],
            precision_score=metrics["precision"],
            recall_score=metrics["recall"],
            f1_score=metrics["f1"],
            training_data_count=metrics["train_size"] + metrics["test_size"],
            threshold=0.7,
            last_retrain=datetime.now(timezone(timedelta(hours=7))),
            created_at=datetime.now(timezone(timedelta(hours=7)))
        )
        db.add(new_model)
        log = AuditLog(user_id=user_id, action="Retrain Model AI", detail=f"Model v{ver} - Akurasi: {metrics['accuracy']:.2%} (arah: {metrics['arah']['accuracy']:.2%}, jenis: {metrics['jenis']['accuracy']:.2%})", type="ai", timestamp=datetime.now(timezone(timedelta(hours=7))))
        db.add(log)
        db.commit()
        db.close()

        retrain_status = {"running": False, "message": f"Retrain selesai. Model v{ver}", "progress": 100}
    except Exception as e:
        retrain_status = {"running": False, "message": f"Error: {str(e)}", "progress": 0}

@router.get("/retrain/status")
def get_retrain_status(current_user: User = Depends(get_current_user)):
    return retrain_status

@router.put("/threshold", response_model=AIModelOut)
def update_threshold(data: ThresholdUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.threshold < 0.5 or data.threshold > 0.95:
        raise HTTPException(status_code=400, detail="Threshold harus antara 50% - 95%")
    model = db.query(AIModel).order_by(AIModel.id.desc()).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model AI belum dilatih")
    model.threshold = data.threshold
    db.commit()
    db.refresh(model)
    return model
