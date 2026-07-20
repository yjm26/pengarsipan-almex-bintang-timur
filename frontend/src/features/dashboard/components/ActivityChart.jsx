import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardPanel from './DashboardPanel';

export default function ActivityChart({ stats, loading }) {
  const data = stats?.monthly_activity || [];

  return (
    <DashboardPanel
      title="Aktivitas Dokumen"
      description="Volume surat masuk dan keluar dalam 6 bulan terakhir"
      action={<span className="inline-flex h-7 items-center rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)]">Bulanan</span>}
    >
      {loading ? (
        <div className="h-[210px] p-4"><div className="h-full rounded bg-[var(--almex-muted)]" /></div>
      ) : data.length === 0 ? (
        <div className="flex h-[210px] items-center justify-center px-6 text-center text-xs text-[var(--almex-text-3)]">
          Aktivitas akan muncul setelah dokumen diunggah.
        </div>
      ) : (
        <div className="h-[240px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="masukGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#35a853" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#35a853" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="keluarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eeeeec" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9a9a9a' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9a9a9a' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #e2e2e0', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="masuk" name="Masuk" stroke="#35a853" strokeWidth={2} fill="url(#masukGradient)" />
              <Area type="monotone" dataKey="keluar" name="Keluar" stroke="#2563eb" strokeWidth={2} fill="url(#keluarGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
