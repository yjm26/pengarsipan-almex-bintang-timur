import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, FolderTree, FolderOpen, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({ nama: '', parent: null });
  const [expandedParent, setExpandedParent] = useState(null);
  const [saving, setSaving] = useState(false);

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
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = (parentId = null) => {
    setEditCategory(null);
    setFormData({ nama: '', parent: parentId });
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setEditCategory(cat);
    setFormData({ nama: cat.nama, parent: cat.parent });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editCategory) {
        const updated = await api.updateCategory(editCategory.id, { nama: formData.nama, parent_id: formData.parent });
        setCategories(categories.map((c) => (c.id === editCategory.id ? { ...c, nama: formData.nama, parent: formData.parent } : c)));
      } else {
        const created = await api.createCategory({ nama: formData.nama, parent_id: formData.parent });
        setCategories([...categories, {
          id: created.id,
          nama: created.nama || formData.nama,
          parent: created.parent_id ?? formData.parent,
          count: created.count ?? 0,
          status: created.status || 'Aktif',
        }]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save category:', err);
    } finally {
      setSaving(false);
    }
  };

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
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">Manajemen Kategori</h2>
              <p className="text-sm text-zinc-500 mt-1">Kelola hierarki kategori untuk klasifikasi dokumen.</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </motion.button>
        </div>

        {/* Category Tree */}
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
                <div className="flex items-center gap-3 px-6 py-3.5 rounded-lg hover:bg-zinc-50/50 transition-colors group">
                  <button onClick={() => setExpandedParent(isExpanded ? null : parent.id)} className="p-1 rounded hover:bg-zinc-200/50 transition-colors">
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(parent)} className="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleAdd(parent.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600 transition-all" title="Tambah Sub-kategori">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(parent.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {isExpanded && childList.length > 0 && (
                  <div className="ml-8 border-l-2 border-zinc-100 pl-4 mt-1 space-y-1">
                    {childList.map((child, ci) => (
                      <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50/50 transition-colors group">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-700 flex-1">{child.nama}</span>
                        <span className="text-xs text-zinc-400">{child.count}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(child)} className="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(child.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
            <strong>Perhatian:</strong> Mengubah atau menghapus kategori yang sudah digunakan oleh dokumen dapat mempengaruhi hasil klasifikasi. Pastikan untuk meninjau dokumen terkait sebelum melakukan perubahan.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl border border-zinc-200/60 p-8 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-6">
              {editCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Nama Kategori</label>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Purchase Order" className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all placeholder:text-zinc-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Parent (Opsional)</label>
                <select value={formData.parent || ''} onChange={(e) => setFormData({ ...formData, parent: e.target.value || null })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all">
                  <option value="">— Tidak ada (Level 1) —</option>
                  {categories.filter((c) => c.parent === null).map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-400 mt-1">Level 1 = Arah (Masuk/Keluar), Level 2 = Jenis Surat</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">Batal</button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
