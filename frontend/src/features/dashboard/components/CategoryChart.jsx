import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../lib/api';

import { useToast } from '../../../contexts/ToastContext.jsx';

const COLORS = ['#D49A28', '#71717a', '#18181b', '#d4d4d8', '#e4e4e7', '#a1a1aa'];

export default function CategoryChart() {
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await api.getDashboardStats();
        const dist = stats.category_distribution || {};
        const chartData = Object.entries(dist).map(([name, value], i) => ({
          name,
          value,
          color: COLORS[i % COLORS.length],
        }));
        setData(chartData);
      } catch (err) {
        addToast('Gagal memuat data kategori: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="h-6 w-40 bg-zinc-100 rounded animate-pulse mb-4" />
        <div className="h-48 bg-zinc-50 rounded-full w-48 mx-auto animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
      <div className="mb-6">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900">Distribusi Kategori</h3>
        <p className="text-sm text-zinc-500 mt-1">Komposisi jenis dokumen</p>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-zinc-400 text-sm">
          Belum ada data dokumen
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} dokumen`, '']}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-3 mt-6 pt-6 border-t border-zinc-100">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-zinc-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-900">{item.value}</span>
                  <span className="text-[10px] text-zinc-400 w-10 text-right">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
