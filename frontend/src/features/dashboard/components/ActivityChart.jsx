import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: '01 Mei', masuk: 12, keluar: 8 },
  { date: '03 Mei', masuk: 18, keluar: 11 },
  { date: '05 Mei', masuk: 8, keluar: 15 },
  { date: '07 Mei', masuk: 22, keluar: 9 },
  { date: '09 Mei', masuk: 15, keluar: 18 },
  { date: '11 Mei', masuk: 25, keluar: 12 },
  { date: '13 Mei', masuk: 20, keluar: 14 },
  { date: '15 Mei', masuk: 30, keluar: 20 },
  { date: '17 Mei', masuk: 18, keluar: 16 },
  { date: '19 Mei', masuk: 28, keluar: 22 },
  { date: '21 Mei', masuk: 35, keluar: 19 },
  { date: '23 Mei', masuk: 24, keluar: 25 },
  { date: '25 Mei', masuk: 32, keluar: 21 },
  { date: '27 Mei', masuk: 26, keluar: 17 },
];

export default function ActivityChart() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900">Tren Aktivitas Dokumen</h3>
        <p className="text-sm text-zinc-500 mt-0.5">Volume surat masuk & keluar 30 hari terakhir</p>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#D49A28]" />
          <span className="text-xs font-medium text-zinc-600">Surat Masuk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-zinc-400" />
          <span className="text-xs font-medium text-zinc-600">Surat Keluar</span>
        </div>
      </div>

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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            dx={-8}
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
            stroke="#D49A28"
            strokeWidth={2}
            fill="url(#colorMasuk)"
          />
          <Area
            type="monotone"
            dataKey="keluar"
            stroke="#a1a1aa"
            strokeWidth={2}
            fill="url(#colorKeluar)"
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
