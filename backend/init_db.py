"""Initialize database: create tables, seed admin user, seed categories."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal, Base
from models import User, Category, AIModel, now_wib
from auth import hash_password

def init():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Seed admin user
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(
            username="admin",
            password_hash=hash_password("admin"),
            nama_lengkap="Super Administrator",
            role="super_admin",
            is_active=True,
            created_at=now_wib()
        )
        db.add(admin)
        db.commit()
        print("[OK] Admin user created (admin/admin)")
    else:
        print("[OK] Admin user already exists")
    
    # Seed categories
    # Seed categories (HARDCODED 5 kategori + Lainnya)
    default_categories = [
        ("PurchaseOrder", None),
        ("Invoice", None),
        ("Penawaran", None),
        ("SalesOrder", None),
        ("SuratJalan", None),
        ("Lainnya", None),
    ]
    if db.query(Category).count() == 0:
        for nama, parent_id in default_categories:
            cat = Category(nama=nama, parent_id=parent_id, status="Aktif", created_at=now_wib())
            db.add(cat)
        db.commit()
        print("[OK] Default categories created")
    else:
        print("[OK] Categories already exist")
    
    # Check if trained model exists
    model_dir = os.path.join(os.path.dirname(__file__), "ml_model")
    arah_path = os.path.join(model_dir, "arah_pipeline.pkl")
    jenis_path = os.path.join(model_dir, "jenis_pipeline.pkl")
    
    if os.path.exists(arah_path) and os.path.exists(jenis_path):
        if not db.query(AIModel).first():
            import json
            model = AIModel(
                version="1.0.0",
                accuracy=0.0,
                precision_score=0.0,
                recall_score=0.0,
                f1_score=0.0,
                training_data_count=0,
                threshold=0.7,
                last_retrain=None,
                created_at=now_wib(),
                arah_metrics_json=json.dumps({"accuracy":0,"precision":0,"recall":0,"f1":0,"cv":0}),
                jenis_metrics_json=json.dumps({"accuracy":0,"precision":0,"recall":0,"f1":0,"cv":0}),
                train_size=0,
                test_size=0,
                split_note="Model belum ditrain. Latih via notebook Training_Model_Produksi.ipynb (149 dokumen, 80/20 split).",
            )
            db.add(model)
            db.commit()
            print("[OK] AI Model entry created (model files found, metrics placeholder)")
        else:
            print("[OK] AI Model already exists")
        print("[OK] Trained model files found in ml_model/")
    else:
        print("[WARN] No trained model found. Train model via Jupyter notebook first!")
        print("       Run: notebooks/Training_Model_Produksi.ipynb")
        # Create placeholder even without model files
        if not db.query(AIModel).first():
            model = AIModel(
                version="Belum dilatih",
                accuracy=0.0,
                precision_score=0.0,
                recall_score=0.0,
                f1_score=0.0,
                training_data_count=0,
                threshold=0.7,
                last_retrain=None,
                created_at=now_wib(),
                arah_metrics_json=None,
                jenis_metrics_json=None,
                train_size=0,
                test_size=0,
                split_note="Model belum dilatih. Jalankan notebook training terlebih dahulu.",
            )
            db.add(model)
            db.commit()
            print("[OK] AI Model placeholder created")
    
    db.close()
    print("\nDatabase initialized successfully!")
    print(f"Database: {os.path.join(os.path.dirname(__file__), 'database', 'almex.db')}")
    print("Admin credentials: admin / admin")

if __name__ == "__main__":
    init()
