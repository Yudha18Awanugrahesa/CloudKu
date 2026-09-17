import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatIDR, fmtDateShort, daysBetween } from '../lib/format';

function periodRange(period, custFrom, custTo) {
  const today = new Date(); const iso = (d) => d.toISOString().slice(0, 10);
  if (period === 'hari') return { from: iso(today), to: iso(today) };
  if (period === 'minggu') { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return { from: iso(d), to: iso(today) }; }
  if (period === 'bulan') { const d = new Date(today.getFullYear(), today.getMonth(), 1); return { from: iso(d), to: iso(today) }; }
  if (period === 'bulan_lalu') { const d1 = new Date(today.getFullYear(), today.getMonth() - 1, 1); const d2 = new Date(today.getFullYear(), today.getMonth(), 0); return { from: iso(d1), to: iso(d2) }; }
  return { from: custFrom, to: custTo };
}

export default function CashFlow() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState('bulan');
  const todayStr = new Date().toISOString().slice(0, 10);
  const [custFrom, setCustFrom] = useState(todayStr);
  const [custTo, setCustTo] = useState(todayStr);

  useEffect(() => {
    if (!user) return;
    supabase.from('transactions').select('*').eq('user_id', user.id).then(({ data }) => setTransactions(data || []));
  }, [user]);

  const { from, to } = periodRange(period, custFrom, custTo);
  const inRange = transactions.filter(t => t.date >= from && t.date <= to);
  const totalIn = inRange.filter(t => t.type === 'pemasukan').reduce((s, t) => s + Number(t.nominal), 0);
  const totalOut = inRange.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.nominal), 0);
  const net = totalIn - totalOut;
  const saldoAwal = transactions.filter(t => t.date < from).reduce((s, t) => s + (t.type === 'pemasukan' ? Number(t.nominal) : -Number(t.nominal)), 0);
  const saldoAkhir = saldoAwal + net;

  const chartData = useMemo(() => {
    const days = Math.max(1, daysBetween(from, to) + 1);
    const arr = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const dayTx = transactions.filter(t => t.date === key);
      arr.push({ tanggal: fmtDateShort(key), Pemasukan: dayTx.filter(t => t.type === 'pemasukan').reduce((s, t) => s + Number(t.nominal), 0), Pengeluaran: dayTx.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.nominal), 0) });
    }
    return arr;
  }, [transactions, from, to]);

  const PERIODS = [['hari', 'Hari ini'], ['minggu', 'Minggu ini'], ['bulan', 'Bulan ini'], ['bulan_lalu', 'Bulan lalu'], ['custom', 'Custom']];

  return (
    <Layout>
      <h2 className="text-lg font-extrabold mb-4">Cash Flow</h2>
      <div className="flex gap-2 flex-wrap mb-4">
        {PERIODS.map(([k, l]) => (
          <button key={k} onClick={() => setPeriod(k)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${period === k ? 'border-primary bg-primary-soft text-primary' : 'border-gray-200 text-gray-500'}`}>{l}</button>
        ))}
        {period === 'custom' && (
          <>
            <input type="date" value={custFrom} onChange={e => setCustFrom(e.target.value)} className="input-field w-36" />
            <input type="date" value={custTo} onChange={e => setCustTo(e.target.value)} className="input-field w-36" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <SummaryCard label="Total Pemasukan" value={formatIDR(totalIn)} icon={TrendingUp} tone="good" />
        <SummaryCard label="Total Pengeluaran" value={formatIDR(totalOut)} icon={TrendingDown} tone="bad" />
        <SummaryCard label="Saldo Awal" value={formatIDR(saldoAwal)} icon={Wallet} />
        <SummaryCard label="Saldo Akhir" value={formatIDR(saldoAkhir)} icon={Wallet} tone={saldoAkhir >= 0 ? 'good' : 'bad'} />
      </div>

      <div className="flex items-center gap-2.5 mb-4 text-sm text-gray-500 font-semibold">
        Net Cash Flow: <b className="text-gray-900">{formatIDR(net)}</b>
        <Badge text={net >= 0 ? 'Surplus' : 'Defisit'} tone={net >= 0 ? 'good' : 'bad'} />
      </div>

      <div className="card p-4">
        <div className="text-sm font-bold mb-2">Grafik Cash Flow</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(chartData.length / 10))} />
            <YAxis tick={{ fontSize: 10 }} width={40} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000000 ? v / 1000000 + 'jt' : v >= 1000 ? v / 1000 + 'rb' : v)} />
            <Tooltip formatter={(v) => formatIDR(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Pemasukan" fill="#12523F" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Pengeluaran" fill="#B8433A" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}
