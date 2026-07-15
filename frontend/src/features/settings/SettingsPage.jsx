import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, FolderTree, ClipboardList, Database, User } from 'lucide-react';
import UserManagement from './components/UserManagement';
import CategoryManagement from './components/CategoryManagement';
import AuditLog from './components/AuditLog';
import BackupExport from './components/BackupExport';
import ProfileSettings from './components/ProfileSettings';

const tabs = [
  { id: 'profile', label: 'Profil Saya', icon: User },
  { id: 'users', label: 'Manajemen User', icon: Users },
  { id: 'categories', label: 'Kategori', icon: FolderTree },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
  { id: 'backup', label: 'Backup & Export', icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D49A28]/10 border border-[#D49A28]/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#D49A28]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pengaturan</h1>
            <p className="text-sm text-zinc-500 mt-1.5 font-light">Kelola user, kategori, model klasifikasi, dan data sistem.</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-xl border border-zinc-200/60 p-1.5">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.2 }}
      >
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'audit' && <AuditLog />}
        {activeTab === 'backup' && <BackupExport />}
      </motion.div>
    </div>
  );
}
