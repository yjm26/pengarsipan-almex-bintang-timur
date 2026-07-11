import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText, Clock, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../../lib/api';

import { useToast } from '../../../contexts/ToastContext.jsx';

function getConfidenceBadge(score) {
  const pct = Math.round(score * 100);
  if (pct >= 75) {
    return {
      bg: '#00AA00',
      text: 'text-white',
      icon: CheckCircle2,
      label: 'Akurat',
    };
  }
  if (pct >= 50) {
    return {
      bg: '#D4A000',
      text: 'text-white',
      icon: AlertTriangle,
      label: 'Cukup',
    };
  }
  return {
    bg: '#DD0000',
    text: 'text-white',
    icon: AlertTriangle,
    label: 'Tidak Akurat',
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function RecentDocuments() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await api.getDashboardStats();
        setDocuments(stats.recent_documents || []);
      } catch (err) {
        addToast('Gagal memuat dokumen terbaru: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/60">
        <div className="px-8 pt-8 pb-5">
          <div className="h-6 w-48 bg-zinc-100 rounded animate-pulse" />
        </div>
        <div className="px-8 pb-8 space-y-3">
          {[0,1,2].map(i => (
            <div key={i} className="h-16 bg-zinc-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-zinc-100">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">Dokumen Terbaru</h3>
          <p className="text-sm text-zinc-500 mt-1">5 dokumen yang baru diunggah</p>
        </div>
      </div>

      {/* Table */}
      {documents.length === 0 ? (
        <div className="px-8 py-12 text-center text-zinc-400 text-sm">
          Belum ada dokumen diarsipkan
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {documents.map((doc, i) => {
            const badge = getConfidenceBadge(doc.confidence);
            const BadgeIcon = badge.icon;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-8 py-4 hover:bg-zinc-50/50 transition-colors"
              >
                {/* File icon */}
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-zinc-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{doc.nama_file}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {doc.arah} · {doc.jenis}
                    {doc.nama_pt ? ` · ${doc.nama_pt}` : ''}
                  </p>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: badge.bg }}>
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0 w-24">
                  <p className="text-xs text-zinc-900">{formatDate(doc.tanggal_unggah)}</p>
                  <p className="text-[11px] text-zinc-400">{formatTime(doc.tanggal_unggah)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
