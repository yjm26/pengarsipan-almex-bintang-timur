import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, BarChart3, Database, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle2, Info,
  TrendingUp, Target, Activity, ArrowRight
} from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext.jsx';

const METRIC_CONFIG = [
  { key: 'accuracy', label: 'Akurasi', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { key: 'precision', label: 'Precision', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'recall', label: 'Recall', icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  { key: 'f1Score', label: 'F1-Score', icon: Zap, color: 'text-[#D49A28]', bg: 'bg-amber-50', border: 'border-amber-100' },
];

const CLASS_METRIC_KEYS = [
  { label: 'Akurasi', key: 'accuracy' },
  { label: 'Precision', key: 'precision' },
  { label: 'Recall', key: 'recall' },
  { label: 'F1-Score', key: 'f1' },
  { label: 'CV Score', key: 'cv' },
];

export default function AIModelPanel() {
  const { addToast } = useToast();
  const [threshold, setThreshold] = useState(75);
  const [modelStats, setModelStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const data = await api.getAIModel();
        setModelStats({
          accuracy: data.accuracy != null ? (data.accuracy * 100).toFixed(1) : '0.0',
          precision: data.precision_score != null ? (data.precision_score * 100).toFixed(1) : '0.0',
          recall: data.recall_score != null ? (data.recall_score * 100).toFixed(1) : '0.0',
          f1Score: data.f1_score != null ? (data.f1_score * 100).toFixed(1) : '0.0',
          trainingData: data.training_data_count ?? 0,
          lastRetrain: data.last_retrain ?? '-',
          modelVersion: data.version ?? '-',
          arahMetrics: data.arah_metrics,
          jenisMetrics: data.jenis_metrics,
          trainSize: data.train_size ?? 0,
          testSize: data.test_size ?? 0,
          splitNote: data.split_note ?? '',
          isUntrained: data.version === 'Belum dilatih' || data.id === 0 || (data.accuracy || 0) === 0,
        });
        if (data.threshold != null) {
          setThreshold(Math.round(data.threshold * 100));
        }
      } catch (err) {
        addToast('Gagal memuat statistik model: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
  }, [addToast]);

  const handleSaveThreshold = async () => {
    setSavingThreshold(true);
    try {
      await api.updateThreshold(threshold / 100);
      addToast('Threshold berhasil disimpan', 'success');
    } catch (err) {
      addToast('Gagal menyimpan threshold: ' + err.message, 'error');
    } finally {
      setSavingThreshold(false);
    }
  };

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-56 bg-zinc-100 rounded animate-pulse" />
              <div className="h-4 w-80 bg-zinc-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {METRIC_CONFIG.map((m) => (
              <div key={m.key} className="p-6 rounded-xl bg-zinc-50 border border-zinc-100 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-zinc-200 mb-4" />
                <div className="h-8 w-20 bg-zinc-200 rounded mb-2" />
                <div className="h-3 w-16 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error State (API failure / null) ──
  if (!modelStats) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-red-100/60 p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Gagal Memuat Model</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-4">
              Tidak dapat terhubung ke server backend. Cek koneksi atau restart backend.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>

        {/* Threshold tetap ada */}
        <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 mb-1">Confidence Threshold</h2>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Akan aktif setelah model terpasang.</p>
          <div className="max-w-md space-y-4 opacity-50">
            <input type="range" min="50" max="95" value={75} disabled className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-not-allowed" />
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty State ──
  if (modelStats.isUntrained) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <Brain className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">Status Model Klasifikasi</h2>
              <p className="text-sm text-zinc-500 mt-1">Model belum dilatih</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6">
              <TrendingUp className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Model Belum Aktif</h3>
            <p className="text-sm text-zinc-500 max-w-md mb-6">
              Model klasifikasi dilatih secara offline menggunakan dataset 149 dokumen. 
              Hubungi administrator untuk mengaktifkan model.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-500">
              <Info className="w-3.5 h-3.5" />
              Model: v{modelStats.modelVersion} · Data: {modelStats.trainingData} dokumen
            </div>
          </div>
        </div>

        {/* Threshold tetap ada */}
        <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 mb-1">Confidence Threshold</h2>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Akan aktif setelah model terpasang.</p>
          <div className="max-w-md space-y-4 opacity-50">
            <input type="range" min="50" max="95" value={75} disabled className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-not-allowed" />
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main View ──
  return (
    <div className="space-y-8">
      {/* Model Info Card */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#D49A28]/10 border border-[#D49A28]/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#D49A28]" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Status Model Klasifikasi</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Model {modelStats.modelVersion} — Klasifikasi Dokumen (5 Jenis)
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRIC_CONFIG.map((m) => {
            const value = modelStats[m.key];
            return (
              <div
                key={m.key}
                className={`p-6 rounded-xl ${m.bg} border ${m.border} transition-all duration-200 hover:shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg bg-white border ${m.border} flex items-center justify-center`}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{m.label}</span>
                </div>
                <p className={`text-3xl font-bold tracking-tight ${m.color}`}>
                  {value}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Split Note Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 mb-1">
              {modelStats.splitNote || 'Evaluasi menggunakan 80/20 stratified split'}
            </p>
            {modelStats.trainSize > 0 && (
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <span>Training: <strong>{modelStats.trainSize}</strong> dokumen</span>
                <span>Test: <strong>{modelStats.testSize}</strong> dokumen</span>
                <span>Total: <strong>{modelStats.trainingData}</strong> dokumen</span>
              </div>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 pb-8 border-b border-zinc-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50/50">
            <Database className="w-4 h-4 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Data Training</p>
              <p className="text-sm font-semibold text-zinc-900">{modelStats.trainingData} dokumen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-xs text-zinc-500">Status</p>
              <p className="text-sm font-semibold text-emerald-600">Aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50/50">
            <ArrowRight className="w-4 h-4 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-500">Versi</p>
              <p className="text-sm font-semibold text-zinc-900">{modelStats.modelVersion}</p>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="group flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors mb-2"
        >
          <span className="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center transition-colors">
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
          Detail per klasifikasi
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Arah */}
                <div className="p-6 rounded-xl border border-zinc-100 bg-zinc-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="text-sm font-semibold text-zinc-800">Arah Dokumen</h4>
                    <span className="text-xs text-zinc-400 ml-auto">Masuk / Keluar</span>
                  </div>
                  {modelStats.arahMetrics ? (
                    <div className="space-y-3">
                      {CLASS_METRIC_KEYS.map((mk) => (
                        <div key={mk.key} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">{mk.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min((modelStats.arahMetrics[mk.key] || 0) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-zinc-900 w-12 text-right">
                              {((modelStats.arahMetrics[mk.key] || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">Belum tersedia</p>
                  )}
                </div>

                {/* Jenis */}
                <div className="p-6 rounded-xl border border-zinc-100 bg-zinc-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#D49A28]" />
                    <h4 className="text-sm font-semibold text-zinc-800">Jenis Surat</h4>
                    <span className="text-xs text-zinc-400 ml-auto">5 Kategori</span>
                  </div>
                  {modelStats.jenisMetrics ? (
                    <div className="space-y-3">
                      {CLASS_METRIC_KEYS.map((mk) => (
                        <div key={mk.key} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">{mk.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D49A28] rounded-full"
                                style={{ width: `${Math.min((modelStats.jenisMetrics[mk.key] || 0) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-zinc-900 w-12 text-right">
                              {((modelStats.jenisMetrics[mk.key] || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">Belum tersedia</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Threshold Card */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Confidence Threshold</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Minimum confidence score agar dokumen dianggap terverifikasi otomatis.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
            <span className="text-lg font-bold text-[#D49A28]">{threshold}%</span>
          </div>
        </div>

        <div className="max-w-lg space-y-6">
          {/* Slider Track */}
          <div className="relative pt-2">
            <input
              type="range"
              min="50"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#D49A28] bg-zinc-200"
            />
            <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
              <span>50% (Loose)</span>
              <span className="font-medium text-zinc-600">
                {threshold >= 90 ? 'Strict — lebih banyak manual review' :
                 threshold >= 75 ? 'Balanced — rekomendasi default' :
                 'Loose — lebih banyak auto-verify'}
              </span>
              <span>95% (Strict)</span>
            </div>
          </div>

          {/* Threshold Presets */}
          <div className="flex items-center gap-2">
            {[50, 75, 90].map((t) => (
              <button
                key={t}
                onClick={() => setThreshold(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  threshold === t
                    ? 'bg-[#D49A28] text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveThreshold}
            disabled={savingThreshold}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors disabled:opacity-60"
          >
            {savingThreshold ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Simpan Threshold
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
