import { useMemo } from 'react';
import DashboardPanel from './DashboardPanel';

const CATEGORY_ORDER = ['PurchaseOrder', 'Invoice', 'Penawaran', 'SalesOrder', 'SuratJalan', 'Lainnya'];

export default function CategoryChart({ stats, loading }) {
  const data = useMemo(() => {
    const dist = stats?.category_distribution || {};
    return CATEGORY_ORDER.map((name) => ({ name, value: Number(dist[name] || 0) }));
  }, [stats]);

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <DashboardPanel title="Kategori Dokumen" description="Komposisi arsip aktif">
      <div className="grid gap-2 px-3.5 py-3">
        {loading ? (
          CATEGORY_ORDER.map((name) => (
            <div key={name} className="h-8 rounded bg-[var(--almex-muted)]" />
          ))
        ) : (
          data.map((item) => (
            <div key={item.name} className="grid min-h-8 grid-cols-[1fr_auto] items-center gap-3 text-xs text-[var(--almex-text-2)]">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span>{item.name}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--almex-muted)]">
                  <div className="h-full rounded-full bg-[var(--almex-accent)]" style={{ width: `${(item.value / maxValue) * 100}%` }} />
                </div>
              </div>
              <strong className="text-xs font-semibold text-[var(--almex-text)]">{item.value}</strong>
            </div>
          ))
        )}
      </div>
    </DashboardPanel>
  );
}
