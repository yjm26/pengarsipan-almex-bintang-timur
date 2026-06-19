import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Document, User
from auth import get_current_user
import os

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.post("/csv")
def export_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Nama File", "Nama PT", "Tanggal Surat", "Tanggal Unggah", "Arah", "Jenis", "Confidence", "Status", "Ukuran (bytes)"])
    for doc in docs:
        writer.writerow([
            doc.id, doc.nama_file, doc.nama_pt,
            doc.tanggal_surat.strftime("%d/%m/%Y") if doc.tanggal_surat else "",
            doc.tanggal_unggah.strftime("%d/%m/%Y") if doc.tanggal_unggah else "",
            doc.arah, doc.jenis, f"{doc.confidence:.2%}", doc.status, doc.ukuran
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dokumen_almex.csv"}
    )

@router.post("/excel")
def export_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from openpyxl import Workbook
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    wb = Workbook()
    ws = wb.active
    ws.title = "Dokumen"
    ws.append(["ID", "Nama File", "Nama PT", "Tanggal Surat", "Tanggal Unggah", "Arah", "Jenis", "Confidence", "Status", "Ukuran (bytes)"])
    for doc in docs:
        ws.append([
            doc.id, doc.nama_file, doc.nama_pt,
            doc.tanggal_surat.strftime("%d/%m/%Y") if doc.tanggal_surat else "",
            doc.tanggal_unggah.strftime("%d/%m/%Y") if doc.tanggal_unggah else "",
            doc.arah, doc.jenis, f"{doc.confidence:.2%}", doc.status, doc.ukuran
        ])
    filepath = "/tmp/dokumen_almex.xlsx"
    wb.save(filepath)
    return FileResponse(filepath, filename="dokumen_almex.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
