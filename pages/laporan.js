import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatIDR, fmtDateShort } from '../lib/format';
import { CAT_COLORS } from '../lib/categories';

export default function Laporan() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState('semua');

  useEffect(() => {
    if (!user) return;
    supabase.from('transactions').select('*').eq('user_id', user.id).then(({ data }) => setTransactions(data || []));
  }, [user]);

  const filtered = transactions.filter(t => t.date >= from && t.date <= to && (type === 'semua' || t.type === type));
  const totalIn = filtered.filter(t => t.type === 'pemasukan').reduce((s, t) => s + Number(t.nominal), 0);
  const totalOut = filtered.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.nominal), 0);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.nominal); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Deskripsi', 'Metode', 'Catatan'];
    const rows = filtered.map(t => [t.date, t.type, t.category, t.nominal, t.description, t.method, t.note]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `laporan_cloudtrack_${from}_${to}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-extrabold">Laporan Keuangan</h2>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-1.5"><Download size={15} /> Export CSV</button>
      </div>
      <div className="card p-3.5 mb-4 flex gap-2.5 flex-wrap">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-field w-40" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-field w-40" />
        <select value={type} onChange={e => setType(e.target.value)} className="input-field w-44">
          <option value="semua">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <SummaryCard label="Total Pemasukan" value={formatIDR(totalIn)} icon={TrendingUp} tone="good" />
        <SummaryCard label="Total Pengeluaran" value={formatIDR(totalOut)} icon={TrendingDown} tone="bad" />
        <SummaryCard label="Net Cash Flow" value={formatIDR(totalIn - totalOut)} icon={Wallet} tone={totalIn - totalOut >= 0 ? 'good' : 'bad'} />
      </div>

      <div className="card p-4 mb-4">
        <div className="text-sm font-bold mb-2">Total per Kategori</div>
        {byCategory.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">Tidak ada data.</p> : (
          <ResponsiveContainer width="100%" height={Math.max(180, byCategory.length * 34)}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000000 ? v / 1000000 + 'jt' : v >= 1000 ? v / 1000 + 'rb' : v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatIDR(v)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {byCategory.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <div className="text-sm font-bold px-4 pt-4">Rincian Transaksi ({filtered.length})</div>
        <div className="px-4 pb-4 pt-2 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">Tidak ada transaksi.</p> : [...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(t => (
            <div key={t.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-xs">
              <span className="text-gray-400">{fmtDateShort(t.date)}</span>
              <span className="flex-1 ml-2.5 truncate">{t.category}{t.description ? ' — ' + t.description : ''}</span>
              <b className={t.type === 'pemasukan' ? 'text-primary' : 'text-danger'}>{t.type === 'pemasukan' ? '+' : '-'}{formatIDR(t.nominal)}</b>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
