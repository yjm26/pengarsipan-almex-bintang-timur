"""Initialize database: create tables, seed admin user, seed categories, train initial model."""
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
        print("✓ Admin user created (admin/admin)")
    else:
        print("✓ Admin user already exists")
    
    # Seed categories
    default_categories = [
        ("Purchase Order", None),
        ("Invoice", None),
        ("Surat Penawaran", None),
        ("Kontrak", None),
        ("Nota Dinas", None),
        ("MoU", None),
        ("Lainnya", None),
    ]
    if db.query(Category).count() == 0:
        for nama, parent_id in default_categories:
            cat = Category(nama=nama, parent_id=parent_id, status="Aktif", created_at=now_wib())
            db.add(cat)
        db.commit()
        print("✓ Default categories created")
    else:
        print("✓ Categories already exist")
    
    # Train initial model
    print("Training initial ML model...")
    from ml.classifier import classifier
    from ml.sample_data import get_training_data
    
    texts, arah_labels, jenis_labels = get_training_data()
    metrics = classifier.train(texts, arah_labels, jenis_labels)
    
    if not db.query(AIModel).first():
        model = AIModel(
            version="1.0.0",
            accuracy=metrics["accuracy"],
            precision_score=metrics["precision"],
            recall_score=metrics["recall"],
            f1_score=metrics["f1"],
            training_data_count=len(texts),
            threshold=0.7,
            last_retrain=now_wib(),
            created_at=now_wib()
        )
        db.add(model)
        db.commit()
        print(f"✓ Model v1.0.0 trained - Accuracy: {metrics['accuracy']:.2%}")
    else:
        print("✓ AI Model already exists")
    
    db.close()
    print("\nDatabase initialized successfully!")
    print(f"Database: {os.path.join(os.path.dirname(__file__), 'database', 'almex.db')}")
    print("Admin credentials: admin / admin")

if __name__ == "__main__":
    init()
