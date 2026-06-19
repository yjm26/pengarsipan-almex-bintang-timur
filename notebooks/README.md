# README — Notebook Training Model Klasifikasi

## Apa Isi Notebook Ini?

Notebook ini berisi **seluruh proses training model AI** untuk mengklasifikasi dokumen surat PT Almex Bintang Timur. Isinya:

1. Import library yang dibutuhkan
2. Dataset (contoh data surat)
3. Preprocessing teks (membersihkan data)
4. Ekstraksi fitur TF-IDF (mengubah teks jadi angka)
5. Training model Naive Bayes
6. Evaluasi model (confusion matrix, classification report)
7. Cross-validation
8. Simpan model untuk dipakai di backend

---

## Cara Menjalankan

### 1. Buka Terminal / CMD

### 2. Masuk ke folder project
```bash
cd pengarsipan-almex-bintang-timur
```

### 3. Install library yang dibutuhkan (sekali aja)
```bash
pip install jupyter pandas numpy scikit-learn matplotlib seaborn sastrawi
```

### 4. Buka Jupyter Lab
```bash
jupyter lab
```

### 5. Browser terbuka otomatis, buka file:
```
notebooks/Training_Model_Klasifikasi.ipynb
```

### 6. Jalankan semua cell
Klik menu **Run** → **Run All Cells**

Atau tekan **Shift + Enter** satu per satu dari atas ke bawah.

---

## Konsep Dasar (Gampang Dipahami)

### Apa itu Preprocessing?

Bayangkan kamu punya surat yang isinya berantakan — ada huruf besar kecil campur, tanda baca, angka, dll. Preprocessing itu **membersihkan teks** supaya bisa diproses komputer.

**5 Tahap:**

| Tahap | Apa yang Dilakukan | Contoh |
|-------|-------------------|--------|
| **1. Case Folding** | Semua huruf jadi kecil | "SURAT Pesanan" → "surat pesanan" |
| **2. Cleaning** | Hapus tanda baca, angka, simbol | "No. 001/2025!" → "No 2025" |
| **3. Tokenizing** | Pecah jadi kata-kata | "surat pesanan" → ["surat", "pesanan"] |
| **4. Stopword Removal** | Hapus kata umum (yang, dan, di, untuk) | ["surat", "yang", "bagus"] → ["surat", "bagus"] |
| **5. Stemming** | Ubah kata berimbuhan jadi kata dasar | "pengklasifikasian" → "klasifikasi" |

Kenapa perlu? Karena "Pemesanan", "memesan", "dipesan" itu sebenernya **satu kata dasar** = "pesan". Komputer harus tau itu.

---

### Apa itu TF-IDF?

**TF-IDF = Term Frequency - Inverse Document Frequency**

Bayangkan kamu punya 100 surat. Kamu mau tau **kata mana yang paling penting** di setiap surat.

**TF (Term Frequency)** = Seberapa sering kata muncul di SATU dokumen.
- Kalau kata "purchase" muncul 5 kali di surat A → TF-nya tinggi

**IDF (Inverse Document Frequency)** = Seberapa jarang kata muncul di SEMUA dokumen.
- Kata "surat" muncul di hampir semua surat → IDF-nya **rendah** (gak penting, terlalu umum)
- Kata "purchase" cuma muncul di surat PO → IDF-nya **tinggi** (penting, spesifik)

**TF-IDF = TF × IDF**

Jadi kata yang **sering muncul di satu surat** tapi **jarang di surat lain** → bobotnya tinggi.

Contoh:
- Kata "purchase" di surat PO → TF-IDF tinggi ✅ (ini yang bikin surat PO beda dari Invoice)
- Kata "surat" di semua surat → TF-IDF rendah ❌ (gak bisa bedain kategori)

---

### Apa itu Naive Bayes?

**Naive Bayes** itu algoritma klasifikasi berdasarkan **probabilitas (peluang)**.

Bayangkan kamu mau nebak: **surat ini masuk kategori apa?**

Cara kerjanya:
1. Hitung peluang setiap kategori berdasarkan kata-kata yang ada
2. Pilih kategori dengan peluang tertinggi

**Contoh sederhana:**

Dokumen: *"Purchase Order pengadaan laptop server"*

Kata "purchase" dan "order" → sering muncul di kategori **Purchase Order**
Kata "invoice" → gak ada

Jadi: Peluang kategori Purchase Order = **tinggi** → Dokumen ini = **Purchase Order**

**Kenapa "Naive"?**

Karena algoritma ini **menganggap setiap kata saling independen** (gak berhubungan). Padahal di dunia nyata, kata "purchase" dan "order" sering muncul barengan. Tapi anggapan ini ternyata **tetep works** untuk klasifikasi teks!

**Laplace Smoothing (α = 1)**

Masalah: Kalau ada kata yang belum pernah muncul di training, peluangnya jadi 0. Kalikan semua peluang = 0. Hancur.

Solusi: Tambahkan +1 ke setiap kata. Jadi gak ada peluang yang bernilai 0.

---

### Apa itu Confusion Matrix?

**Confusion Matrix** = Tabel yang nunjukin **seberapa akurat** model menebak.

```
                    PREDIKSI
                   Masuk  Keluar
AKTUAL  Masuk  [  12    2  ]   ← 12 benar, 2 salah
        Keluar [   1   11  ]   ← 11 benar, 1 salah
```

- **Diagonal (kiri atas, kanan bawah)** = Tebakan **BENAR**
- **Diagonal lainnya** = Tebakan **SALAH**

Semakin banyak angka di diagonal → semakin bagus modelnya.

---

### Apa itu Accuracy, Precision, Recall, F1-Score?

| Metrik | Arti | Rumus Sederhana |
|--------|------|-----------------|
| **Accuracy** | Berapa % tebakan benar dari semua data | Benar / Total |
| **Precision** | Dari yang diprediksi "Masuk", berapa yang beneran Masuk | Benar Masuk / Semua yang diprediksi Masuk |
| **Recall** | Dari yang beneran Masuk, berapa yang ketebak | Benar Masuk / Semua yang beneran Masuk |
| **F1-Score** | Rata-rata Precision dan Recall | 2 × (P × R) / (P + R) |

**Analogi gampang:**
- **Precision** = "Jangan sampai salah prediksi" (minim false positive)
- **Recall** = "Jangan sampai ada yang ketelen" (minim false negative)
- **F1-Score** = Keseimbangan antara Precision dan Recall

---

### Apa itu Cross-Validation?

**Cross-Validation** = Membagi data jadi beberapa bagian (fold) untuk menguji model secara adil.

**5-Fold Cross-Validation:**
```
Data dibagi jadi 5 bagian:

Round 1: [TEST] [Train] [Train] [Train] [Train] → Akurasi: 0.85
Round 2: [Train] [TEST] [Train] [Train] [Train] → Akurasi: 0.90
Round 3: [Train] [Train] [TEST] [Train] [Train] → Akurasi: 0.80
Round 4: [Train] [Train] [Train] [TEST] [Train] → Akurasi: 0.88
Round 5: [Train] [Train] [Train] [Train] [TEST] → Akurasi: 0.87

Rata-rata = 0.86 ± 0.03
```

Kenapa perlu? Supaya hasil evaluasi **gak kebetulan**. Kalau cuma split sekali, bisa aja data test-nya gampang semua.

---

## Struktur Notebook

| Cell | Bagian | Yang Dilakukan |
|------|--------|----------------|
| 1 | Import Library | Load semua library Python |
| 2 | Dataset | 70 contoh dokumen surat (7 kategori × 10) |
| 3 | Preprocessing | Bersihkan teks (5 tahap) |
| 4 | TF-IDF | Ubah teks jadi angka |
| 5 | Split Data | 80% training, 20% testing |
| 6 | Training Arah | Latih model untuk prediksi Masuk/Keluar |
| 7 | Confusion Matrix Arah | Visualisasi akurasi arah |
| 8 | Training Jenis | Latih model untuk prediksi jenis surat |
| 9 | Confusion Matrix Jenis | Visualisasi akurasi jenis |
| 10 | Cross-Validation | Uji model 5 kali dengan data berbeda |
| 11 | Simpan Model | Export model ke file .pkl |
| 12 | Test Prediksi | Coba prediksi 5 dokumen baru |

---

## File yang Dihasilkan

Setelah menjalankan semua cell, akan muncul file:

| File | Isi | Dipakai di |
|------|-----|-----------|
| `confusion_matrix_arah.png` | Grafik confusion matrix arah | BAB 4 Skripsi |
| `confusion_matrix_jenis.png` | Grafik confusion matrix jenis | BAB 4 Skripsi |
| `cross_validation.png` | Grafik hasil cross-validation | BAB 4 Skripsi |
| `backend/ml_model/arah_pipeline.pkl` | Model klasifikasi arah | Backend sistem |
| `backend/ml_model/jenis_pipeline.pkl` | Model klasifikasi jenis | Backend sistem |
| `backend/ml_model/tfidf_vectorizer.pkl` | TF-IDF vectorizer | Backend sistem |

---

## Pertanyaan yang Sering Muncul di Sidang

**Q: Kenapa pakai Naive Bayes, bukan yang lain?**
A: Naive Bayes cocok untuk klasifikasi teks karena cepat, sederhana, dan hasilnya bagus untuk dokumen berlabel. Plus sesuai judul skripsi.

**Q: Kenapa TF-IDF, bukan Bag of Words?**
A: TF-IDF lebih pintar karena memperhitungkan seberapa penting kata tersebut. Bag of Words cuma hitung frekuensi, gak peduli kata itu umum atau spesifik.

**Q: Kenapa α = 1 di Laplace Smoothing?**
A: α = 1 adalah nilai default yang paling umum dipakai. Tujuannya supaya gak ada probabilitas nol yang merusak perhitungan.

**Q: Kenapa 80:20 untuk split data?**
A: Ini rasio standar di machine learning. 80% untuk belajar (training), 20% untuk ujian (testing). Cukup untuk evaluasi yang fair.

**Q: Kenapa pakai Sastrawi untuk stemming?**
A: Sastrawi adalah stemmer khusus bahasa Indonesia yang paling populer. Karena dokumen surat berbahasa Indonesia, kita butuh stemmer yang ngerti bahasa Indonesia.

**Q: Apa bedanya Arah Dokumen dan Jenis Dokumen?**
A: Arah = surat Masuk atau Keluar (2 kelas). Jenis = PO, Invoice, Kontrak, dll (7 kelas). Sistem klasifikasi 2 tingkat (2-level classification).

---

## Tools yang Dipakai

| Tool | Versi | Fungsi |
|------|-------|--------|
| Python | 3.12+ | Bahasa pemrograman |
| Jupyter Lab | - | Notebook environment |
| pandas | 2.2+ | Manipulasi data |
| numpy | 1.26+ | Komputasi numerik |
| scikit-learn | 1.4+ | Machine learning |
| matplotlib | 3.8+ | Visualisasi grafik |
| seaborn | 0.13+ | Visualisasi heatmap |
| Sastrawi | 3.0+ | Stemming bahasa Indonesia |
