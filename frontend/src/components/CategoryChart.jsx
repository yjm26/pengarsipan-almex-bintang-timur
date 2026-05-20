import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Surat Masuk', value: 420, color: '#D49A28' },
  { name: 'Surat Keluar', value: 315, color: '#71717a' },
  { name: 'Penawaran', value: 186, color: '#18181b' },
  { name: 'Invoice', value: 142, color: '#d4d4d8' },
  { name: 'Lainnya', value: 89, color: '#e4e4e7' },
];

export default function CategoryChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900">Distribusi Kategori</h3>
        <p className="text-sm text-zinc-500 mt-0.5">Komposisi jenis dokumen</p>
      </div>

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
      <div className="space-y-2 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-zinc-600">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-900">{item.value}</span>
              <span className="text-xs text-zinc-400 w-10 text-right">{Math.round((item.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
