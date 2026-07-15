import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderTree, FolderOpen, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext.jsx';

export default function CategoryManagement() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedParent, setExpandedParent] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      // Flatten hierarchical response into a flat list
      const flat = [];
      const flatten = (items, parentId = null) => {
        for (const item of items) {
          flat.push({
            id: item.id,
            nama: item.nama || item.name || '',
            parent: item.parent_id ?? parentId ?? null,
            count: item.count ?? item.document_count ?? 0,
            status: item.status || 'Aktif',
          });
          if (item.children && item.children.length > 0) {
            flatten(item.children, item.id);
          }
        }
      };
      flatten(data);
      setCategories(flat);
    } catch (err) {
      addToast('Gagal memuat kategori: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const parents = categories.filter((c) => c.parent === null);
  const children = (parentId) => categories.filter((c) => c.parent === parentId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
          <div className="h-6 w-48 bg-zinc-100 rounded animate-pulse mb-6" />
          {[0,1,2,3].map((i) => <div key={i} className="h-10 bg-zinc-50 rounded-lg animate-pulse mb-2" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">Kategori Dokumen</h2>
              <p className="text-sm text-zinc-500 mt-1">Jenis dokumen yang dapat diklasifikasikan oleh model.</p>
            </div>
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {parents.map((parent, i) => {
            const childList = children(parent.id);
            const isExpanded = expandedParent === parent.id;

            return (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Parent Row */}
                <div className="flex items-center gap-3 px-6 py-3.5 rounded-lg hover:bg-zinc-50/50 transition-colors">
                  <button onClick={() => setExpandedParent(isExpanded ? null : parent.id)} className="p-1 rounded hover:bg-zinc-200/50 transition-colors" aria-label={isExpanded ? 'Tutup sub-kategori' : 'Buka sub-kategori'} title={isExpanded ? 'Tutup sub-kategori' : 'Buka sub-kategori'}>
                    {childList.length > 0 ? (
                      isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <span className="w-4" />
                    )}
                  </button>
                  <FolderOpen className="w-5 h-5 text-[#D49A28]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{parent.nama}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{parent.count} dokumen</span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{parent.status}</span>
                </div>

                {/* Children */}
                {isExpanded && childList.length > 0 && (
                  <div className="ml-8 border-l-2 border-zinc-100 pl-4 mt-1 space-y-1">
                    {childList.map((child, ci) => (
                      <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50/50 transition-colors">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-700 flex-1">{child.nama}</span>
                        <span className="text-xs text-zinc-400">{child.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-lg bg-amber-50/50 border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Catatan:</strong> Kategori ditentukan oleh model klasifikasi. Dokumen yang tidak cocok dengan 5 jenis di atas akan masuk ke kategori <strong>Lainnya</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
