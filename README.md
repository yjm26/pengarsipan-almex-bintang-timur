# Sistem Pengarsipan Dokumen Cerdas - PT. Almex Bintang Timur

Sistem pengarsipan dokumen berbasis web yang terintegrasi dengan klasifikasi otomatis menggunakan *Multinomial Naive Bayes* dan *TF-IDF*.

## Tech Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite
- **Machine Learning:** Scikit-learn

## Struktur Folder
- `backend/`: Kode Python untuk API dan logika ML.
- `frontend/`: Antarmuka pengguna (UI).
- `backend/ml_model/`: Menyimpan model `.pkl` hasil training.
- `backend/uploads/`: Tempat penyimpanan fisik dokumen yang diunggah.
