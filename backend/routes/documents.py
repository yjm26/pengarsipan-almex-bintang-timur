import os
import re
import shutil
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Document, User, AuditLog, now_wib
from schemas import DocumentOut, DocumentUpdate, BulkDeleteRequest
from auth import get_current_user
from ml.classifier import classifier

router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = "/root/pengarsipan-almex-bintang-timur/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_company_name(text: str) -> str:
    if not text:
        return ""
    
    # Improved patterns for company name extraction
    patterns = [
        # Pattern 1: PT/CV with dot and space, followed by uppercase name
        r'(?:PT|CV)\.\s*([A-Z][A-Z\s&.]+?)(?:\n|,|\s{2,}|JL\.|Jl\.|jl\.|Gedung|Gd\.|Kawasan|Jl\s)',
        # Pattern 2: PT/CV without dot, followed by space and name
        r'(?:PT|CV)\s+([A-Z][A-Z\s&.]+?)(?:\n|,|\s{2,}|JL\.|Jl\.|jl\.|Gedung|Gd\.|Kawasan|Jl\s)',
        # Pattern 3: After "Kepada" or "Yth"
        r'(?:kepada|yth\.?|ditujukan\s+kepada)\s*:?\s*(?:PT|CV)\s*\.?\s*([A-Za-z\s&.]+?)(?:\n|,)',
        # Pattern 4: PT/CV at end of line
        r'(?:PT|CV)\s*\.?\s*([A-Z][A-Za-z\s&.]+?)(?:\s*$)',
        # Pattern 5: More flexible - PT followed by any word characters
        r'(?:PT|CV)\s*\.?\s*([A-Za-z][A-Za-z\s&.]{2,}?)(?:\s*[-,]|\s*$|\n)',
    ]
    
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            company = m.group(1).strip()
            # Clean up: remove trailing whitespace, commas, etc
            company = re.sub(r'\s+$', '', company)
            # Filter out too short matches (likely false positives)
            if len(company) >= 3:
                return company[:200]
    
    return ""

def extract_date(text: str) -> Optional[datetime]:
    if not text:
        return None
    months = {
        'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6,
        'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6,
        'jul': 7, 'agu': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'des': 12
    }
    # Pattern 1: "12 Januari 2021" or "12 Jan 2021"
    m = re.search(r'(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agu|sep|okt|nov|des)\s+(\d{4})', text.lower())
    if m:
        try:
            return datetime(int(m.group(3)), months[m.group(2)], int(m.group(1)))
        except (ValueError, KeyError):
            pass
    # Pattern 2: "02-November-2021" or "02-Nov-2021"
    m = re.search(r'(\d{1,2})[-/](januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agu|sep|okt|nov|des)[-/](\d{4})', text.lower())
    if m:
        try:
            return datetime(int(m.group(3)), months[m.group(2)], int(m.group(1)))
        except (ValueError, KeyError):
            pass
    # Pattern 3: "12/01/2021" or "12-01-2021"
    m = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', text)
    if m:
        try:
            return datetime(int(m.group(3)), int(m.group(2)), int(m.group(1)))
        except ValueError:
            pass
    # Pattern 4: "2021-11-02"
    m = re.search(r'(\d{4})-(\d{2})-(\d{2})', text)
    if m:
        try:
            return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            pass
    return None

@router.post("/upload", response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    PDF_EXT = {".pdf"}
    IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}
    SUPPORTED_EXT = PDF_EXT | IMG_EXT
    ALLOWED_CONTENT_TYPES = {
        "application/pdf",
        "image/jpeg", "image/png", "image/bmp", "image/tiff",
    }
    
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in SUPPORTED_EXT:
        raise HTTPException(status_code=400, detail="Hanya file PDF dan gambar (JPG/PNG/BMP/TIFF) yang diizinkan")
    
    # Validate content type
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipe file tidak diizinkan: {file.content_type}")
    
    # Sanitize filename (remove path separators and special chars)
    import re
    safe_filename = re.sub(r'[^\w\s\-.]', '', os.path.basename(file.filename))
    safe_filename = re.sub(r'\s+', '_', safe_filename.strip())
    if not safe_filename:
        safe_filename = "document.pdf"

    # Save file
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_name = f"{timestamp}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    file_size = len(content)

    # Extract text (PyMuPDF + EasyOCR untuk scanned PDF & gambar)
    extracted_text = ""
    try:
        import fitz  # PyMuPDF
        import easyocr
        import cv2
        import numpy as np

        # Lazy-load EasyOCR reader (singleton)
        if not hasattr(upload_document, "_ocr_reader"):
            upload_document._ocr_reader = easyocr.Reader(["id", "en"], gpu=False)
        ocr_reader = upload_document._ocr_reader

        def ocr_image(img_np):
            try:
                results = ocr_reader.readtext(img_np, detail=0)
                return " ".join(results)
            except Exception:
                return ""

        if file_ext in PDF_EXT:
            doc = fitz.open(file_path)
            for page in doc:
                page_text = page.get_text().strip()
                if page_text:
                    extracted_text += page_text + "\n"
                else:
                    pix = page.get_pixmap(dpi=300)
                    img_bytes = pix.tobytes("png")
                    img_np = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
                    if img_np is not None:
                        extracted_text += ocr_image(img_np) + "\n"
            doc.close()

        elif file_ext in IMG_EXT:
            img_np = cv2.imread(file_path)
            if img_np is not None:
                extracted_text += ocr_image(img_np) + "\n"

    except Exception as e:
        import logging
        logging.error(f"OCR extraction error: {e}")
        extracted_text = ""

    # Classify
    arah_pred, arah_conf, jenis_pred, jenis_conf = "Keluar", 0.5, "Lainnya", 0.5
    if extracted_text.strip():
        try:
            arah_pred, arah_conf, jenis_pred, jenis_conf = classifier.predict(extracted_text)
        except Exception:
            pass

    confidence = round((arah_conf + jenis_conf) / 2, 4)

    # Extract metadata
    nama_pt = extract_company_name(extracted_text)
    tanggal_surat = extract_date(extracted_text)

    doc = Document(
        nama_file=file.filename,
        nama_pt=nama_pt,
        tanggal_surat=tanggal_surat,
        tanggal_unggah=now_wib(),
        arah=arah_pred,
        jenis=jenis_pred,
        confidence=confidence,
        status="draft",
        ukuran=file_size,
        extracted_text=extracted_text[:5000],
        file_path=file_path,
        user_id=current_user.id,
        created_at=now_wib()
    )
    db.add(doc)
    db.flush()

    log = AuditLog(user_id=current_user.id, action="Upload Dokumen", detail=f"Mengunggah '{file.filename}' - Klasifikasi: {arah_pred}, {jenis_pred} ({confidence:.1%})", type="upload", timestamp=now_wib())
    db.add(log)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/{doc_id}/confirm", response_model=DocumentOut)
def confirm_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.status == "draft").first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen draft tidak ditemukan")
    doc.status = "archived"
    log = AuditLog(user_id=current_user.id, action="Konfirmasi Arsip", detail=f"Menyimpan '{doc.nama_file}' ke arsip", type="upload", timestamp=now_wib())
    db.add(log)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("", response_model=dict)
def list_documents(
    search: Optional[str] = None,
    arah: Optional[str] = None,
    jenis: Optional[str] = None,
    company: Optional[str] = None,
    confidence_min: Optional[float] = None,
    confidence_max: Optional[float] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Document)
    if search:
        q = q.filter(Document.nama_file.ilike(f"%{search}%") | Document.nama_pt.ilike(f"%{search}%") | Document.extracted_text.ilike(f"%{search}%"))
    if arah:
        q = q.filter(Document.arah == arah)
    if jenis:
        q = q.filter(Document.jenis == jenis)
    if company:
        q = q.filter(Document.nama_pt.ilike(f"%{company}%"))
    if confidence_min is not None:
        q = q.filter(Document.confidence >= confidence_min)
    if confidence_max is not None:
        q = q.filter(Document.confidence <= confidence_max)
    if date_from:
        q = q.filter(Document.tanggal_unggah >= date_from)
    if date_to:
        q = q.filter(Document.tanggal_unggah <= date_to)
    if status:
        q = q.filter(Document.status == status)

    total = q.count()
    docs = q.order_by(Document.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "data": [DocumentOut.model_validate(d) for d in docs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }

@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")
    return doc

@router.get("/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    # Detect media type from extension
    ext = os.path.splitext(doc.file_path)[1].lower()
    media_map = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".bmp": "image/bmp",
        ".tiff": "image/tiff", ".tif": "image/tiff",
    }
    media_type = media_map.get(ext, "application/octet-stream")
    return FileResponse(doc.file_path, filename=doc.nama_file, media_type=media_type)

@router.get("/{doc_id}/preview")
def preview_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return document preview as image (first page for PDF, original for images)."""
    import fitz
    import io
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    ext = os.path.splitext(doc.file_path)[1].lower()
    if ext == ".pdf":
        # Convert first page to PNG
        pdf = fitz.open(doc.file_path)
        page = pdf[0]
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        pdf.close()
        return Response(content=img_bytes, media_type="image/png")
    elif ext in (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"):
        media_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".bmp": "image/bmp", ".tiff": "image/tiff", ".tif": "image/tiff"}
        with open(doc.file_path, "rb") as f:
            return Response(content=f.read(), media_type=media_map.get(ext, "image/png"))
    else:
        raise HTTPException(status_code=400, detail="Format tidak mendukung preview")

@router.put("/{doc_id}", response_model=DocumentOut)
def update_document(doc_id: int, data: DocumentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(doc, key, val)
    log = AuditLog(user_id=current_user.id, action="Edit Dokumen", detail=f"Mengedit dokumen '{doc.nama_file}' (ID: {doc_id})", type="upload", timestamp=now_wib())
    db.add(log)
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    log = AuditLog(user_id=current_user.id, action="Hapus Dokumen", detail=f"Menghapus '{doc.nama_file}' (ID: {doc_id})", type="upload", timestamp=now_wib())
    db.add(log)
    db.delete(doc)
    db.commit()
    return {"message": "Dokumen berhasil dihapus"}

@router.post("/bulk-delete")
def bulk_delete(data: BulkDeleteRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).filter(Document.id.in_(data.ids)).all()
    for doc in docs:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
        db.delete(doc)
    log = AuditLog(user_id=current_user.id, action="Hapus Massal", detail=f"Menghapus {len(docs)} dokumen", type="upload", timestamp=now_wib())
    db.add(log)
    db.commit()
    return {"message": f"{len(docs)} dokumen berhasil dihapus"}
