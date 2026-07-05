#!/usr/bin/env python3
"""
Robustness Test untuk Model Klasifikasi Dokumen Surat
Studi Kasus: PT. Almex Bintang Timur

Skenario:
A. Data Lengkap (baseline)
B. Tanpa Kata Kunci Spesifik (simulasi header hilang)
C. Hanya Bagian Tengah Dokumen (simulasi dokumen terpotong)
D. Simulasi OCR Error (10% kata berantakan)

Output: Perbandingan F1-score dan classification report per skenario.
"""

import os
import re
from pathlib import Path
import numpy as np
import pandas as pd
import fitz
import joblib
from sklearn.metrics import classification_report, f1_score, accuracy_score

# === KONFIGURASI ===
MODEL_DIR = Path('/root/pengarsipan-almex-bintang-timur/backend/ml_model')
DATASET_DIR = Path('/root/data_skripsi/Main-data')

JENIS_KE_ARAH = {
    'purchaseOrder': 'Masuk',
    'invoice': 'Keluar',
    'penawaran': 'Keluar',
    'SalesOrder': 'Keluar',
    'suratJalan': 'Keluar',
}

# Kata kunci spesifik per jenis (buat simulasi hapus header)
KEYWORDS = {
    'purchaseOrder': ['purchase order', 'po', 'pesanan', 'pengadaan', 'pemesanan', 'order', 'pesan'],
    'invoice': ['invoice', 'faktur', 'tagihan', 'inv', 'pembayaran', 'bill', 'tagih'],
    'penawaran': ['penawaran', 'harga', 'kerjasama', 'proposal', 'offer', 'quotation', 'tawar'],
    'SalesOrder': ['sales order', 'so', 'penjualan', 'delivery order', 'jual'],
    'suratJalan': ['surat jalan', 'pengiriman', 'delivery', 'sj', 'pengantar', 'kirim'],
}


def extract_text(file_path):
    """Ekstrak teks dari PDF."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def remove_keywords(text, jenis):
    """Hapus kata kunci spesifik per jenis dari teks."""
    words = text.lower().split()
    keywords = KEYWORDS.get(jenis, [])
    filtered = []
    for w in words:
        keep = True
        for kw in keywords:
            if kw in w or w in kw:
                keep = False
                break
        if keep:
            filtered.append(w)
    return ' '.join(filtered)


def middle_only(text, cut_ratio=0.4):
    """Ambil hanya bagian tengah dokumen, hapus awal dan akhir."""
    words = text.split()
    start = int(len(words) * cut_ratio)
    end = int(len(words) * (1 - cut_ratio))
    if end <= start:
        return text
    return ' '.join(words[start:end])


def ocr_error(text, error_rate=0.10, seed=42):
    """Simulasi OCR error: hapus, swap karakter, atau acak kata."""
    import random
    random.seed(seed)
    words = text.split()
    result = []
    for w in words:
        if random.random() < error_rate:
            choice = random.choice(['delete', 'swap', 'jumble'])
            if choice == 'delete':
                continue
            elif choice == 'swap' and len(w) > 2:
                chars = list(w)
                i = random.randint(0, len(chars) - 2)
                chars[i], chars[i + 1] = chars[i + 1], chars[i]
                result.append(''.join(chars))
            elif choice == 'jumble' and len(w) > 3:
                chars = list(w)
                random.shuffle(chars)
                result.append(''.join(chars))
            else:
                result.append(w)
        else:
            result.append(w)
    return ' '.join(result)


def run_robustness_test():
    # === LOAD MODEL ===
    print("Loading model...")
    pipe_arah = joblib.load(MODEL_DIR / 'arah_pipeline.pkl')
    pipe_jenis = joblib.load(MODEL_DIR / 'jenis_pipeline.pkl')
    print("Model loaded!\n")

    # === LOAD DATASET ===
    print("Loading dataset...")
    data = []
    for folder in sorted(os.listdir(DATASET_DIR)):
        folder_path = DATASET_DIR / folder
        if not folder_path.is_dir():
            continue
        jenis = folder
        arah = JENIS_KE_ARAH.get(jenis, 'Keluar')
        pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
        for f in sorted(pdf_files):
            text = extract_text(str(folder_path / f))
            if text:
                data.append({'file': f, 'text': text, 'jenis': jenis, 'arah': arah})

    df = pd.DataFrame(data)
    print(f"Total dokumen: {len(df)}")
    print(f"Distribusi jenis:\n{df['jenis'].value_counts()}\n")

    y_true_jenis = df['jenis']
    y_true_arah = df['arah']

    # === SKENARIO A: DATA LENGKAP ===
    print("=" * 70)
    print("SKENARIO A: DATA LENGKAP (FULL TEXT)")
    print("=" * 70)
    y_pred_jenis_full = pipe_jenis.predict(df['text'])
    y_pred_arah_full = pipe_arah.predict(df['text'])
    f1_jenis_full = f1_score(y_true_jenis, y_pred_jenis_full, average='weighted')
    f1_arah_full = f1_score(y_true_arah, y_pred_arah_full, average='weighted')
    acc_jenis_full = accuracy_score(y_true_jenis, y_pred_jenis_full)
    acc_arah_full = accuracy_score(y_true_arah, y_pred_arah_full)
    print(f"Accuracy Arah : {acc_arah_full:.4f}")
    print(f"F1 Arah       : {f1_arah_full:.4f}")
    print(f"Accuracy Jenis: {acc_jenis_full:.4f}")
    print(f"F1 Jenis      : {f1_jenis_full:.4f}")
    print(classification_report(y_true_jenis, y_pred_jenis_full))

    # === SKENARIO B: TANPA KATA KUNCI ===
    print("=" * 70)
    print("SKENARIO B: TANPA KATA KUNCI SPESIFIK (SIMULASI HEADER HILANG)")
    print("=" * 70)
    df['text_no_keyword'] = df.apply(lambda row: remove_keywords(row['text'], row['jenis']), axis=1)
    original_words = df['text'].apply(lambda x: len(x.split()))
    remaining_words = df['text_no_keyword'].apply(lambda x: len(x.split()))
    print(f"Rata-rata kata: {original_words.mean():.1f} -> {remaining_words.mean():.1f}")
    y_pred_jenis_nokw = pipe_jenis.predict(df['text_no_keyword'])
    y_pred_arah_nokw = pipe_arah.predict(df['text_no_keyword'])
    f1_jenis_nokw = f1_score(y_true_jenis, y_pred_jenis_nokw, average='weighted')
    f1_arah_nokw = f1_score(y_true_arah, y_pred_arah_nokw, average='weighted')
    acc_jenis_nokw = accuracy_score(y_true_jenis, y_pred_jenis_nokw)
    acc_arah_nokw = accuracy_score(y_true_arah, y_pred_arah_nokw)
    print(f"Accuracy Arah : {acc_arah_nokw:.4f}")
    print(f"F1 Arah       : {f1_arah_nokw:.4f}")
    print(f"Accuracy Jenis: {acc_jenis_nokw:.4f}")
    print(f"F1 Jenis      : {f1_jenis_nokw:.4f}")
    print(classification_report(y_true_jenis, y_pred_jenis_nokw))

    # === SKENARIO C: HANYA BAGIAN TENGAH ===
    print("=" * 70)
    print("SKENARIO C: HANYA BAGIAN TENGAH DOKUMEN (40% AWAL & AKHIR DIHAPUS)")
    print("=" * 70)
    df['text_middle'] = df['text'].apply(lambda t: middle_only(t, 0.4))
    remaining_words_mid = df['text_middle'].apply(lambda x: len(x.split()))
    print(f"Rata-rata kata tersisa: {remaining_words_mid.mean():.1f}")
    y_pred_jenis_mid = pipe_jenis.predict(df['text_middle'])
    y_pred_arah_mid = pipe_arah.predict(df['text_middle'])
    f1_jenis_mid = f1_score(y_true_jenis, y_pred_jenis_mid, average='weighted')
    f1_arah_mid = f1_score(y_true_arah, y_pred_arah_mid, average='weighted')
    acc_jenis_mid = accuracy_score(y_true_jenis, y_pred_jenis_mid)
    acc_arah_mid = accuracy_score(y_true_arah, y_pred_arah_mid)
    print(f"Accuracy Arah : {acc_arah_mid:.4f}")
    print(f"F1 Arah       : {f1_arah_mid:.4f}")
    print(f"Accuracy Jenis: {acc_jenis_mid:.4f}")
    print(f"F1 Jenis      : {f1_jenis_mid:.4f}")
    print(classification_report(y_true_jenis, y_pred_jenis_mid))

    # === SKENARIO D: SIMULASI OCR ERROR ===
    print("=" * 70)
    print("SKENARIO D: SIMULASI OCR ERROR (10% KATA BERANTAKAN)")
    print("=" * 70)
    df['text_ocr'] = df['text'].apply(lambda t: ocr_error(t, 0.10))
    y_pred_jenis_ocr = pipe_jenis.predict(df['text_ocr'])
    y_pred_arah_ocr = pipe_arah.predict(df['text_ocr'])
    f1_jenis_ocr = f1_score(y_true_jenis, y_pred_jenis_ocr, average='weighted')
    f1_arah_ocr = f1_score(y_true_arah, y_pred_arah_ocr, average='weighted')
    acc_jenis_ocr = accuracy_score(y_true_jenis, y_pred_jenis_ocr)
    acc_arah_ocr = accuracy_score(y_true_arah, y_pred_arah_ocr)
    print(f"Accuracy Arah : {acc_arah_ocr:.4f}")
    print(f"F1 Arah       : {f1_arah_ocr:.4f}")
    print(f"Accuracy Jenis: {acc_jenis_ocr:.4f}")
    print(f"F1 Jenis      : {f1_jenis_ocr:.4f}")
    print(classification_report(y_true_jenis, y_pred_jenis_ocr))

    # === RINGKASAN ===
    print("\n" + "=" * 70)
    print("RINGKASAN PERBANDINGAN ROBUSTNESS TEST")
    print("=" * 70)
    print(f"{'Skenario':<45} {'Acc Arah':<10} {'F1 Arah':<10} {'Acc Jenis':<10} {'F1 Jenis':<10}")
    print("-" * 70)
    print(f"{'A. Data Lengkap':<45} {acc_arah_full:<10.4f} {f1_arah_full:<10.4f} {acc_jenis_full:<10.4f} {f1_jenis_full:<10.4f}")
    print(f"{'B. Tanpa Kata Kunci (Header Hilang)':<45} {acc_arah_nokw:<10.4f} {f1_arah_nokw:<10.4f} {acc_jenis_nokw:<10.4f} {f1_jenis_nokw:<10.4f}")
    print(f"{'C. Hanya Bagian Tengah (Dok. Terpotong)':<45} {acc_arah_mid:<10.4f} {f1_arah_mid:<10.4f} {acc_jenis_mid:<10.4f} {f1_jenis_mid:<10.4f}")
    print(f"{'D. Simulasi OCR Error (10% kata salah)':<45} {acc_arah_ocr:<10.4f} {f1_arah_ocr:<10.4f} {acc_jenis_ocr:<10.4f} {f1_jenis_ocr:<10.4f}")
    print("=" * 70)


if __name__ == '__main__':
    run_robustness_test()
