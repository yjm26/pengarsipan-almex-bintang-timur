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

ARAH_LABELS = ["Masuk", "Keluar"]
JENIS_LABELS = ["purchaseOrder", "invoice", "penawaran", "SalesOrder", "suratJalan"]

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
        # Custom additions for company letter context
        _stopword_set = base | {
            'pt', 'cv', 'tbk', 'abt', 'vi', '2025',
            'nomor', 'perihal', 'lampiran', 'kepada', 'yth',
            'yang', 'dan', 'di', 'dengan', 'untuk', 'pada', 'dari',
            'ini', 'itu', 'adalah', 'ke', 'oleh', 'sebagai', 'juga',
            'akan', 'telah', 'sudah', 'atau', 'dalam', 'tidak',
            'ada', 'dapat', 'bisa', 'lebih',
            # Domain stopwords (dari notebook Training_Model_Produksi)
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
            return "Masuk", 0.5, "Lainnya", 0.5

        arah_probs = self.arah_pipeline.predict_proba([processed])[0]
        arah_idx = np.argmax(arah_probs)
        arah = self.arah_pipeline.classes_[arah_idx]
        arah_conf = float(arah_probs[arah_idx])

        jenis_probs = self.jenis_pipeline.predict_proba([processed])[0]
        jenis_idx = np.argmax(jenis_probs)
        jenis = self.jenis_pipeline.classes_[jenis_idx]
        jenis_conf = float(jenis_probs[jenis_idx])

        return arah, round(arah_conf, 4), jenis, round(jenis_conf, 4)


classifier = DocumentClassifier()
