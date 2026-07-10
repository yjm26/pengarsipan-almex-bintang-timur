#!/usr/bin/env python3
"""
Training Model Produksi ALMEX
- Load dataset PDF
- Preprocessing (identik dengan backend/ml/classifier.py)
- Train pipeline: TF-IDF + MultinomialNB
- Save model ke ../backend/ml_model/

Tidak termasuk: evaluasi visual, confusion matrix, robustness test, cross-validation.
(Itu ada di Training_Model_Produksi.ipynb untuk Bab 4)
"""

import os, re, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
import joblib

warnings.filterwarnings('ignore')

# === KONFIGURASI ===
DATASET_DIR = Path('./dataset')
MODEL_DIR = Path('../backend/ml_model')
os.makedirs(MODEL_DIR, exist_ok=True)

JENIS_KE_ARAH = {
    'PurchaseOrder': 'Masuk',
    'Invoice': 'Keluar',
    'Penawaran': 'Keluar',
    'SalesOrder': 'Keluar',
    'SuratJalan': 'Keluar',
}

# === EXTRACT TEXT DARI PDF ===
def extract_text(file_path):
    """Extract text dari PDF pakai PyMuPDF. Fallback OCR (EasyOCR) kalau halaman kosong."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ''
    if ext == '.pdf':
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text().strip()
            if page_text:
                text += page_text + '\n'
            else:
                try:
                    import cv2
                    import easyocr
                    pix = page.get_pixmap(dpi=200)
                    img = cv2.imdecode(np.frombuffer(pix.tobytes('png'), np.uint8), cv2.IMREAD_COLOR)
                    if img is not None:
                        reader = easyocr.Reader(['id', 'en'], gpu=False)
                        results = reader.readtext(img, detail=0)
                        ocr = ' '.join(results)
                        if ocr:
                            text += ocr + '\n'
                except Exception:
                    pass
        doc.close()
    return text.strip()

# === LOAD DATASET ===
print('=' * 60)
print('1. LOAD DATASET')
print('=' * 60)

data = []
for folder in sorted(os.listdir(DATASET_DIR)):
    folder_path = DATASET_DIR / folder
    if not folder_path.is_dir():
        continue
    jenis = folder.replace(' ', '')
    arah = JENIS_KE_ARAH.get(jenis, 'Keluar')
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    for f in sorted(pdf_files):
        text = extract_text(str(folder_path / f))
        if text:
            data.append({'file': f, 'text': text, 'jenis': jenis, 'arah': arah})
            print(f'  [OK] {f}')
        else:
            print(f'  [EMPTY] {f} -> SKIP')

df = pd.DataFrame(data)
print(f'\nTotal terbaca: {len(df)} dokumen')
print(df['jenis'].value_counts())

# === PREPROCESSING (identik classifier.py) ===
print('\n' + '=' * 60)
print('2. PREPROCESSING')
print('=' * 60)

stemmer = StemmerFactory().create_stemmer()
stopwords = set(StopWordRemoverFactory().get_stop_words())
company_sw = {'pt', 'cv', 'tbk', 'abt', 'vi', 'nomor', 'perihal', 'lampiran', 'kepada', 'yth'}
domain_sw = {
    'rucika', 'pcs', 'batang', 'total', 'harga', 'diskon', 'tanggal', 'kode',
    'barang', 'nama', 'qty', 'satuan', 'rupiah', 'ribu', 'juta', 'indonesia',
    'tangerang', 'banten', 'kota', 'green', 'lake', 'city', 'ruko', 'timur',
    'bintang', 'almex', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu',
    'sep', 'okt', 'nov', 'des', 'no', 'jumlah', 'sub', 'lain', 'biaya', 'ppn',
    'dpp', 'net', 'cash', 'transfer', 'dibuat', 'disetujui', 'pengirim',
    'penerima', 'keterangan',
}
all_stopwords = stopwords | company_sw | domain_sw

def preprocess(text):
    text = text.lower()
    text = re.sub(r'\b\d{4}\b', ' ', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = [t for t in text.split() if t not in all_stopwords and len(t) > 2]
    if tokens:
        tokens = stemmer.stem(' '.join(tokens)).split()
    return ' '.join(tokens)

df['clean_text'] = df['text'].apply(preprocess)
df = df[df['clean_text'] != ''].reset_index(drop=True)
print(f'After cleaning: {len(df)} dokumen')

# === TRAIN PIPELINE (fit full dataset) ===
print('\n' + '=' * 60)
print('3. TRAINING')
print('=' * 60)

n_docs = len(df)
max_features = min(800, max(300, n_docs * 8))
min_df = 3 if n_docs >= 80 else 2
max_df = 0.70

pipe_arah = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=max_features, ngram_range=(1, 2),
                               min_df=min_df, max_df=max_df, sublinear_tf=True)),
    ('clf', MultinomialNB(alpha=1.0))
])
pipe_jenis = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=max_features, ngram_range=(1, 2),
                               min_df=min_df, max_df=max_df, sublinear_tf=True)),
    ('clf', MultinomialNB(alpha=1.0))
])

pipe_arah.fit(df['clean_text'], df['arah'])
pipe_jenis.fit(df['clean_text'], df['jenis'])

print('Training selesai.')

# === SAVE MODEL ===
print('\n' + '=' * 60)
print('4. SAVE MODEL')
print('=' * 60)

joblib.dump(pipe_arah, MODEL_DIR / 'arah_pipeline.pkl')
joblib.dump(pipe_jenis, MODEL_DIR / 'jenis_pipeline.pkl')

# Hapus file lama kalau masih ada
old = MODEL_DIR / 'tfidf_vectorizer.pkl'
if old.exists():
    old.unlink()
    print('Hapus tfidf_vectorizer.pkl lama')

print(f'Saved to {MODEL_DIR}: {os.listdir(MODEL_DIR)}')
print('Done!')
