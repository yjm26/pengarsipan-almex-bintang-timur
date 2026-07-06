#!/usr/bin/env python3
"""
Training Model Final + Robustness Test
Dataset: NgeData (167 PDF) dengan EasyOCR fallback
Output: Model .pkl + metrik evaluasi + robustness test
"""

import os, re, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, f1_score, accuracy_score
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
import joblib

warnings.filterwarnings('ignore')

# === KONFIGURASI ===
# Ganti path ini sesuai lokasi dataset di laptop
# Default: folder './dataset/' di repo root (camelCase folders)
DATASET_DIR = Path('./dataset')
MODEL_DIR = Path('/root/pengarsipan-almex-bintang-timur/backend/ml_model')
os.makedirs(MODEL_DIR, exist_ok=True)

JENIS_KE_ARAH = {
    'PurchaseOrder': 'Masuk',
    'Invoice': 'Keluar',
    'Penawaran': 'Keluar',
    'SalesOrder': 'Keluar',
    'SuratJalan': 'Keluar',
}

# === OCR FALLBACK (Tesseract - lebih ringan RAM) ===
from PIL import Image
import pytesseract

def ocr_image(img_np):
    """OCR pakai Tesseract (pytesseract). img_np = numpy array (OpenCV BGR)."""
    try:
        img_rgb = Image.fromarray(img_np[:, :, ::-1])  # BGR to RGB
        return pytesseract.image_to_string(img_rgb, lang='ind').strip()
    except Exception as e:
        return ''

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ''
    if ext == '.pdf':
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text().strip()
            if page_text:
                text += page_text + '\n'
            else:
                import cv2
                pix = page.get_pixmap(dpi=200)
                img = cv2.imdecode(np.frombuffer(pix.tobytes('png'), np.uint8), cv2.IMREAD_COLOR)
                if img is not None:
                    ocr = ocr_image(img)
                    if ocr:
                        text += ocr + '\n'
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

# === PREPROCESSING ===
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

# === SPLIT ===
X = df['clean_text']
y_arah = df['arah']
y_jenis = df['jenis']

X_train, X_test, y_train_arah, y_test_arah, y_train_jenis, y_test_jenis = train_test_split(
    X, y_arah, y_jenis, test_size=0.2, random_state=42, stratify=y_jenis
)

# === TF-IDF PARAMS ===
n_docs = len(df)
max_features = min(800, max(300, n_docs * 8))
min_df = 3 if n_docs >= 80 else 2
max_df = 0.70

# === TRAIN ===
print('\n' + '=' * 60)
print('3. TRAINING MODEL')
print('=' * 60)

tfidf = TfidfVectorizer(max_features=max_features, ngram_range=(1, 2),
                        min_df=min_df, max_df=max_df, sublinear_tf=True)
X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

model_arah = MultinomialNB(alpha=1.0)
model_arah.fit(X_train_tfidf, y_train_arah)

model_jenis = MultinomialNB(alpha=1.0)
model_jenis.fit(X_train_tfidf, y_train_jenis)

# === EVALUASI ===
print('\n' + '=' * 60)
print('4. EVALUASI TEST SET')
print('=' * 60)

y_pred_arah = model_arah.predict(X_test_tfidf)
y_pred_jenis = model_jenis.predict(X_test_tfidf)

print(f'Accuracy Arah : {accuracy_score(y_test_arah, y_pred_arah):.4f}')
print(f'F1 Arah       : {f1_score(y_test_arah, y_pred_arah, average="weighted"):.4f}')
print(f'Accuracy Jenis: {accuracy_score(y_test_jenis, y_pred_jenis):.4f}')
print(f'F1 Jenis      : {f1_score(y_test_jenis, y_pred_jenis, average="weighted"):.4f}')
print('\nClassification Report - Jenis:')
print(classification_report(y_test_jenis, y_pred_jenis))

# === CV ===
print('\n' + '=' * 60)
print('5. CROSS-VALIDATION (5-Fold)')
print('=' * 60)

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

cv_arah = cross_val_score(pipe_arah, X, y_arah, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), scoring='f1_weighted')
cv_jenis = cross_val_score(pipe_jenis, X, y_jenis, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), scoring='f1_weighted')

print(f'Arah : Mean={cv_arah.mean():.4f}, Std={cv_arah.std():.4f}')
print(f'Jenis: Mean={cv_jenis.mean():.4f}, Std={cv_jenis.std():.4f}')

# === ROBUSTNESS TEST ===
print('\n' + '=' * 60)
print('6. ROBUSTNESS TEST')
print('=' * 60)

KEYWORDS = {
    'purchaseorder': ['purchase order', 'po', 'pesanan', 'pengadaan', 'pemesanan', 'order', 'pesan'],
    'invoice': ['invoice', 'faktur', 'tagihan', 'inv', 'pembayaran', 'bill', 'tagih'],
    'penawaran': ['penawaran', 'harga', 'kerjasama', 'proposal', 'offer', 'quotation', 'tawar'],
    'salesorder': ['sales order', 'so', 'penjualan', 'delivery order', 'jual'],
    'suratjalan': ['surat jalan', 'pengiriman', 'delivery', 'sj', 'pengantar', 'kirim'],
}

def remove_keywords(text, jenis):
    """Hapus keyword spesifik sesuai jenis dokumen (simulasi header tidak standar)."""
    words = text.lower().split()
    kws = KEYWORDS.get(jenis.lower(), [])
    return ' '.join([w for w in words if not any(kw in w or w in kw for kw in kws)])

# Skenario C: hapus header 25% (simulasi template berubah, header tidak standar)
def remove_header(text, ratio=0.25):
    words = text.split()
    start = int(len(words) * ratio)  # skip 25% awal
    return ' '.join(words[start:])   # sisa 75% body+footer

# Skenario D: OCR error 10%
import random
random.seed(42)
def ocr_error(text, rate=0.10):
    words = text.split()
    out = []
    for w in words:
        if random.random() < rate:
            c = random.choice(['del', 'swap', 'jumble'])
            if c == 'del': continue
            elif c == 'swap' and len(w) > 2:
                ch = list(w); i = random.randint(0, len(ch)-2); ch[i], ch[i+1] = ch[i+1], ch[i]
                out.append(''.join(ch))
            elif c == 'jumble' and len(w) > 3:
                ch = list(w); random.shuffle(ch); out.append(''.join(ch))
            else:
                out.append(w)
        else:
            out.append(w)
    return ' '.join(out)

# Fit pipelines dulu
pipe_arah.fit(X, y_arah)
pipe_jenis.fit(X, y_jenis)

# Prediksi skenario
y_true_jenis = y_jenis
y_true_arah = y_arah

# A. Full text
p_full_j = pipe_jenis.predict(X)
p_full_a = pipe_arah.predict(X)

# B. No keyword
df['no_kw'] = df.apply(lambda r: remove_keywords(r['text'], r['jenis']), axis=1)
df['clean_no_kw'] = df['no_kw'].apply(preprocess)
p_nokw_j = pipe_jenis.predict(df['clean_no_kw'])
p_nokw_a = pipe_arah.predict(df['clean_no_kw'])

# C. Hapus Header 25%
df['no_header'] = df['text'].apply(lambda t: remove_header(t, 0.25))
df['clean_no_header'] = df['no_header'].apply(preprocess)
p_noh_j = pipe_jenis.predict(df['clean_no_header'])
p_noh_a = pipe_arah.predict(df['clean_no_header'])

# D. OCR error
df['ocr'] = df['text'].apply(ocr_error)
df['clean_ocr'] = df['ocr'].apply(preprocess)
p_ocr_j = pipe_jenis.predict(df['clean_ocr'])
p_ocr_a = pipe_arah.predict(df['clean_ocr'])

# Print ringkasan
print(f'\n{"Skenario":<40} {"Acc Arah":<10} {"F1 Arah":<10} {"Acc Jenis":<10} {"F1 Jenis":<10}')
print('-' * 70)
for name, pa, pj in [
    ('A. Data Lengkap', p_full_a, p_full_j),
    ('B. Tanpa Kata Kunci', p_nokw_a, p_nokw_j),
    ('C. Hapus Header 25%', p_noh_a, p_noh_j),
    ('D. OCR Error 10%', p_ocr_a, p_ocr_j),
]:
    print(f'{name:<40} {accuracy_score(y_true_arah, pa):<10.4f} {f1_score(y_true_arah, pa, average="weighted"):<10.4f} '
          f'{accuracy_score(y_true_jenis, pj):<10.4f} {f1_score(y_true_jenis, pj, average="weighted"):<10.4f}')

# === SAVE MODEL ===
print('\n' + '=' * 60)
print('7. SAVE MODEL')
print('=' * 60)

joblib.dump(model_arah, MODEL_DIR / 'arah_pipeline.pkl')
joblib.dump(model_jenis, MODEL_DIR / 'jenis_pipeline.pkl')
joblib.dump(tfidf, MODEL_DIR / 'tfidf_vectorizer.pkl')
print(f'Saved to {MODEL_DIR}')
print('Done!')
