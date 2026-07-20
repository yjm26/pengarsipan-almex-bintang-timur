function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

const statItems = [
  { key: 'total_documents', label: 'Total Dokumen', note: 'Seluruh arsip aktif' },
  { key: 'surat_masuk_count', label: 'Surat Masuk', note: 'Total surat masuk' },
  { key: 'surat_keluar_count', label: 'Surat Keluar', note: 'Total surat keluar' },
  { key: 'documents_this_month_count', label: 'Dokumen Bulan Ini', note: 'Dokumen yang ditambahkan bulan ini' },
];

export default function DashboardStats({ stats, loading }) {
  return (
    <section className="grid overflow-hidden rounded-[10px] border border-[var(--almex-border)] bg-[var(--almex-surface)] sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <div
          key={item.key}
          className={`min-h-[88px] p-4 ${index < statItems.length - 1 ? 'border-b border-[var(--almex-border)] sm:border-r lg:border-b-0' : ''}`}
        >
          {loading ? (
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-[var(--almex-muted)]" />
              <div className="h-7 w-14 rounded bg-[var(--almex-muted)]" />
              <div className="h-3 w-32 rounded bg-[var(--almex-muted)]" />
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--almex-text-2)]">{item.label}</p>
              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.03em] text-[var(--almex-text)]">
                {formatNumber(stats?.[item.key])}
              </p>
              <p className="mt-1 text-[11px] text-[var(--almex-text-3)]">{item.note}</p>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
