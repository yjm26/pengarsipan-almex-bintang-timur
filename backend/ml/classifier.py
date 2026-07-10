import re
import os
import string
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.pipeline import Pipeline

MODEL_DIR = "/root/pengarsipan-almex-bintang-timur/backend/ml_model"
os.makedirs(MODEL_DIR, exist_ok=True)

JENIS_KEYWORDS = {
    'PurchaseOrder': ['purchase', 'order', 'po', 'pembelian', 'beli', 'permintaan'],
    'Invoice': ['invoice', 'faktur', 'tagihan', 'bill', 'inv'],
    'Penawaran': ['penawaran', 'quotation', 'quote', 'harga', 'offer'],
    'SalesOrder': ['sales', 'order', 'so', 'penjualan', 'jual'],
    'SuratJalan': ['surat', 'jalan', 'sj', 'pengiriman', 'delivery', 'do'],
}
ARAH_KEYWORDS = {
    'Masuk': ['masuk', 'diterima', 'dari', 'supplier', 'vendor', 'penawaran'],
    'Keluar': ['keluar', 'dikirim', 'kepada', 'customer', 'client', 'invoice', 'faktur'],
}

# Sastrawi stopwords (lazy load — same approach as notebook)
_stopword_set = None
def get_stopwords():
    global _stopword_set
    if _stopword_set is None:
        try:
            from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
            factory = StopWordRemoverFactory()
            base = set(factory.getStopWords())
        except Exception:
            base = set()
        # Custom additions for company letter context (MUST match training script)
        _stopword_set = base | {
            'pt', 'cv', 'tbk', 'abt', 'vi', '2025',
            'nomor', 'perihal', 'lampiran', 'kepada', 'yth',
            'yang', 'dan', 'di', 'dengan', 'untuk', 'pada', 'dari',
            'ini', 'itu', 'adalah', 'ke', 'oleh', 'sebagai', 'juga',
            'akan', 'telah', 'sudah', 'atau', 'dalam', 'tidak',
            'ada', 'dapat', 'bisa', 'lebih',
            # Domain stopwords (MUST match train_and_evaluate.py)
            'rucika', 'pcs', 'batang', 'total', 'harga', 'diskon', 'tanggal', 'kode',
            'barang', 'nama', 'qty', 'satuan', 'rupiah', 'ribu', 'juta', 'indonesia',
            'tangerang', 'banten', 'kota', 'green', 'lake', 'city', 'ruko', 'timur',
            'bintang', 'almex', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu',
            'sep', 'okt', 'nov', 'des', 'no', 'jumlah', 'sub', 'lain', 'biaya', 'ppn',
            'dpp', 'net', 'cash', 'transfer', 'dibuat', 'disetujui', 'pengirim',
            'penerima', 'keterangan',
        }
    return _stopword_set

# Sastrawi stemmer (lazy load)
_stemmer = None
def get_stemmer():
    global _stemmer
    if _stemmer is None:
        try:
            from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
            factory = StemmerFactory()
            _stemmer = factory.createStemmer()
        except Exception:
            _stemmer = None
    return _stemmer

def preprocess_text(text: str) -> str:
    """Full preprocessing: case folding → cleaning → tokenizing → stopword removal → stemming"""
    if not text:
        return ""
    # Case folding
    # Case folding
    text = text.lower()
    # Cleaning: remove years (4 digits), punctuation, numbers, special chars
    text = re.sub(r'\b\d{4}\b', ' ', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    # Tokenizing
    tokens = text.split()
    # Stopword removal
    tokens = [t for t in tokens if t not in get_stopwords() and len(t) > 2]
    # Stemming
    stemmer = get_stemmer()
    if stemmer:
        tokens = stemmer.stem(' '.join(tokens)).split()
    return ' '.join(tokens)


def keyword_classify(text: str) -> tuple[str, str]:
    """Keyword heuristic untuk dokumen hasil OCR jelek."""
    t = text.lower()
    jenis_scores = {}
    for jenis, keywords in JENIS_KEYWORDS.items():
        jenis_scores[jenis] = sum(1 for kw in keywords if kw in t)
    best_jenis = max(jenis_scores, key=jenis_scores.get)
    if jenis_scores[best_jenis] == 0:
        best_jenis = "Lainnya"

    # Map jenis ke arah langsung (hardcoded 5 kategori)
    JENIS_KE_ARAH = {
        'PurchaseOrder': 'Masuk',
        'Invoice': 'Keluar',
        'Penawaran': 'Keluar',
        'SalesOrder': 'Keluar',
        'SuratJalan': 'Keluar',
    }
    best_arah = JENIS_KE_ARAH.get(best_jenis, 'Keluar')

    # Override kalau ada keyword arah yang kuat di text
    arah_scores = {}
    for arah, keywords in ARAH_KEYWORDS.items():
        arah_scores[arah] = sum(1 for kw in keywords if kw in t)
    if arah_scores.get('Masuk', 0) > arah_scores.get('Keluar', 0):
        best_arah = 'Masuk'
    elif arah_scores.get('Keluar', 0) > arah_scores.get('Masuk', 0):
        best_arah = 'Keluar'

    return best_arah, best_jenis


class DocumentClassifier:
    def __init__(self):
        self.arah_pipeline = None
        self.jenis_pipeline = None
        self._load_or_create()

    def _load_or_create(self):
        arah_path = os.path.join(MODEL_DIR, "arah_pipeline.pkl")
        jenis_path = os.path.join(MODEL_DIR, "jenis_pipeline.pkl")
        if os.path.exists(arah_path) and os.path.exists(jenis_path):
            self.arah_pipeline = joblib.load(arah_path)
            self.jenis_pipeline = joblib.load(jenis_path)
        else:
            # Create empty pipelines (will be trained)
            self.arah_pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
                ('clf', MultinomialNB(alpha=1.0))
            ])
            self.jenis_pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
                ('clf', MultinomialNB(alpha=1.0))
            ])

    def train(self, texts: list[str], arah_labels: list[str], jenis_labels: list[str]) -> dict:
        """Train both pipelines and return metrics."""
        processed = [preprocess_text(t) for t in texts]

        # Train arah classifier
        self.arah_pipeline.fit(processed, arah_labels)
        arah_pred = self.arah_pipeline.predict(processed)

        # Train jenis classifier
        self.jenis_pipeline.fit(processed, jenis_labels)
        jenis_pred = self.jenis_pipeline.predict(processed)

        # Cross-validation for metrics
        arah_scores = cross_val_score(self.arah_pipeline, processed, arah_labels, cv=min(3, len(set(arah_labels))), scoring='accuracy') if len(set(arah_labels)) > 1 else [1.0]
        jenis_scores = cross_val_score(self.jenis_pipeline, processed, jenis_labels, cv=min(3, len(set(jenis_labels))), scoring='accuracy') if len(set(jenis_labels)) > 1 else [1.0]

        avg_accuracy = (np.mean(arah_scores) + np.mean(jenis_scores)) / 2

        # Compute per-class metrics on training data
        from sklearn.preprocessing import label_binarize
        arah_acc = accuracy_score(arah_labels, arah_pred)
        jenis_acc = accuracy_score(jenis_labels, jenis_pred)

        avg_prec = (precision_score(arah_labels, arah_pred, average='weighted', zero_division=0) + precision_score(jenis_labels, jenis_pred, average='weighted', zero_division=0)) / 2
        avg_rec = (recall_score(arah_labels, arah_pred, average='weighted', zero_division=0) + recall_score(jenis_labels, jenis_pred, average='weighted', zero_division=0)) / 2
        avg_f1 = (f1_score(arah_labels, arah_pred, average='weighted', zero_division=0) + f1_score(jenis_labels, jenis_pred, average='weighted', zero_division=0)) / 2

        # Save models
        joblib.dump(self.arah_pipeline, os.path.join(MODEL_DIR, "arah_pipeline.pkl"))
        joblib.dump(self.jenis_pipeline, os.path.join(MODEL_DIR, "jenis_pipeline.pkl"))

        return {
            "accuracy": round(float(avg_accuracy), 4),
            "precision": round(float(avg_prec), 4),
            "recall": round(float(avg_rec), 4),
            "f1": round(float(avg_f1), 4),
        }

    def predict(self, text: str) -> tuple[str, float, str, float]:
        """Predict arah and jenis. Returns (arah, arah_confidence, jenis, jenis_confidence)."""
        processed = preprocess_text(text)
        if not processed.strip():
            # Fallback keyword heuristic untuk text kosong dari preprocessing
            arah_kw, jenis_kw = keyword_classify(text)
            return arah_kw, 0.4, jenis_kw, 0.4

        arah_probs = self.arah_pipeline.predict_proba([processed])[0]
        arah_idx = np.argmax(arah_probs)
        arah = self.arah_pipeline.classes_[arah_idx]
        arah_conf = float(arah_probs[arah_idx])

        jenis_probs = self.jenis_pipeline.predict_proba([processed])[0]
        jenis_idx = np.argmax(jenis_probs)
        jenis = self.jenis_pipeline.classes_[jenis_idx]
        jenis_conf = float(jenis_probs[jenis_idx])

        # Kalau confidence rendah, blend dengan keyword heuristic
        if arah_conf < 0.5 or jenis_conf < 0.5:
            arah_kw, jenis_kw = keyword_classify(text)
            if arah_conf < 0.5:
                arah = arah_kw
                arah_conf = 0.5
            if jenis_conf < 0.5:
                jenis = jenis_kw
                jenis_conf = 0.5

        return arah, round(arah_conf, 4), jenis, round(jenis_conf, 4)


classifier = DocumentClassifier()
