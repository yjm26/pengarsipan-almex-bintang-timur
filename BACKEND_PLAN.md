# BACKEND_PLAN.md

## Backend Implementation Plan

Dokumen ini berisi catatan implementasi backend yang belum dibangun (saat ini frontend menggunakan mock data).

## Tech Stack
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **ML:** scikit-learn, pandas, numpy
- **Docs:** pdfplumber

## Async AI Retraining
Fitur **Retrain Model AI** HARUS berjalan secara **asynchronous** di background:
- Endpoint `POST /api/ai/retrain` trigger background job dan langsung return `202 Accepted`.
- Frontend polling status via `GET /api/ai/retrain/status`.
- Proses training (TF-IDF fitting + Naïve Bayes) tidak boleh blocking request lain.
- Log proses retrain dicatat ke `LOG_AKTIVITAS`.

## API Endpoint TODOs
- [ ] `POST /api/auth/login` (JWT generation)
- [ ] `GET /api/dashboard/stats` (KPI aggregation)
- [ ] `POST /api/documents/upload` (Multipart upload + trigger classification)
- [ ] `GET /api/documents` (Search, filter, pagination)
- [ ] `GET /api/documents/{id}/download` (File stream)
- [ ] `DELETE /api/documents/{id}`
- [ ] `POST /api/ai/retrain` (Async job)
- [ ] `GET /api/users` (CRUD for Super Admin)
- [ ] `POST /api/export/csv`, `POST /api/export/excel`
