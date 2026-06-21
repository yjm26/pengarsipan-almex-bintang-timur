import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../../lib/api';

export default function ActivityChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await api.getDashboardStats();
        setData(stats.monthly_activity || []);
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="h-6 w-40 bg-zinc-100 rounded animate-pulse mb-4" />
        <div className="h-64 bg-zinc-50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
      <div className="mb-8">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900">Tren Aktivitas Dokumen</h3>
        <p className="text-sm text-zinc-500 mt-1">Volume surat masuk & keluar 6 bulan terakhir</p>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#D49A28]" />
          <span className="text-xs font-medium text-zinc-600">Surat Masuk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-zinc-400" />
          <span className="text-xs font-medium text-zinc-600">Surat Keluar</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">
          Belum ada data aktivitas
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D49A28" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#D49A28" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={false}
              axisLine={{ stroke: '#e4e4e7' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="masuk"
              name="Masuk"
              stroke="#D49A28"
              strokeWidth={2}
              fill="url(#colorMasuk)"
            />
            <Area
              type="monotone"
              dataKey="keluar"
              name="Keluar"
              stroke="#a1a1aa"
              strokeWidth={2}
              fill="url(#colorKeluar)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
