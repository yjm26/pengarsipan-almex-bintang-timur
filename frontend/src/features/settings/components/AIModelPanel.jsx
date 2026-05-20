import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart3, RotateCw, CheckCircle2, Clock, Target, Database } from 'lucide-react';

export default function AIModelPanel() {
  const [retraining, setRetraining] = useState(false);
  const [retrainDone, setRetrainDone] = useState(false);
  const [threshold, setThreshold] = useState(75);

  const modelStats = {
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.5,
    f1Score: 94.1,
    trainingData: 1245,
    lastRetrain: '18 Mei 2025, 14:30',
    modelVersion: 'v2.4.1',
    algorithm: 'Multinomial Naïve Bayes + TF-IDF',
  };

  const handleRetrain = () => {
    setRetraining(true);
    setRetrainDone(false);
    setTimeout(() => {
      setRetraining(false);
      setRetrainDone(true);
      setTimeout(() => setRetrainDone(false), 4000);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Model Info */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#D49A28]/10 border border-[#D49A28]/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#D49A28]" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Status Model AI</h2>
            <p className="text-sm text-zinc-500 mt-1">Model {modelStats.modelVersion} — {modelStats.algorithm}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Akurasi', value: `${modelStats.accuracy}%`, icon: Target, color: 'text-emerald-600' },
            { label: 'Precision', value: `${modelStats.precision}%`, icon: BarChart3, color: 'text-blue-600' },
            { label: 'Recall', value: `${modelStats.recall}%`, icon: Database, color: 'text-violet-600' },
            { label: 'F1-Score', value: `${modelStats.f1Score}%`, icon: Zap, color: 'text-[#D49A28]' },
          ].map((metric, i) => (
            <div key={i} className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
              <metric.icon className={`w-4 h-4 ${metric.color} mb-2`} />
              <p className={`text-2xl font-semibold tracking-tight ${metric.color}`}>{metric.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-zinc-100">
          <div className="flex items-center gap-3 text-sm">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Data Training:</span>
            <span className="font-medium text-zinc-900">{modelStats.trainingData} dokumen</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Terakhir Retrain:</span>
            <span className="font-medium text-zinc-900">{modelStats.lastRetrain}</span>
          </div>
        </div>

        {/* Retraining Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-zinc-900">Retrain Model</h3>
            <p className="text-xs text-zinc-500 mt-1">Latih ulang model menggunakan data dokumen yang sudah terverifikasi.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRetrain}
            disabled={retraining}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              retraining
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-[#D49A28] text-white hover:bg-[#C08A20]'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
            {retraining ? 'Sedang Training...' : retrainDone ? 'Selesai ✓' : 'Retrain Model'}
          </motion.button>
        </div>

        {retrainDone && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700">Model berhasil di-retrain! Akurasi terbaru: 95.1%</span>
          </motion.div>
        )}
      </div>

      {/* Threshold Settings */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 mb-1">Confidence Threshold</h2>
        <p className="text-sm text-zinc-500 mt-1 mb-6">Minimum confidence score agar dokumen dianggap "terverifikasi" otomatis.</p>

        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">Threshold: <span className="text-[#D49A28] text-lg">{threshold}%</span></span>
            <span className="text-xs text-zinc-400">
              {threshold >= 90 ? 'Strict — lebih banyak manual review' : threshold >= 75 ? 'Balanced' : 'Loose — lebih banyak auto-verify'}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#D49A28]"
          />
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>50%</span>
            <span>95%</span>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} className="px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors">
            Simpan Threshold
          </motion.button>
        </div>
      </div>
    </div>
  );
}
