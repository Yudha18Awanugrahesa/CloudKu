import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Target, PiggyBank, CheckCircle2, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatIDR, currentMonthKey, monthKeyOf, fmtDateShort } from '../lib/format';
import { CAT_COLORS } from '../lib/categories';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: tx }, { data: gl }] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', user.id),
      ]);
      setTransactions(tx || []);
      setGoals(gl || []);
      setLoadingData(false);
    })();
  }, [user]);

  const mk = currentMonthKey();
  const monthTx = transactions.filter(t => monthKeyOf(t.date) === mk);
  const incomeMonth = monthTx.filter(t => t.type === 'pemasukan').reduce((s, t) => s + Number(t.nominal), 0);
  const expenseMonth = monthTx.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.nominal), 0);
  const saldo = transactions.reduce((s, t) => s + (t.type === 'pemasukan' ? Number(t.nominal) : -Number(t.nominal)), 0);
  const sisaCashflow = incomeMonth - expenseMonth;
  const totalTargetGoal = goals.reduce((s, g) => s + Number(g.target), 0) || 1;
  const totalCollectedGoal = goals.reduce((s, g) => s + Number(g.collected), 0);
  const goalPct = Math.round((totalCollectedGoal / totalTargetGoal) * 100);

  const last14 = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayTx = transactions.filter(t => t.date === key);
      arr.push({
        tanggal: fmtDateShort(key),
        Pemasukan: dayTx.filter(t => t.type === 'pemasukan').reduce((s, t) => s + Number(t.nominal), 0),
        Pengeluaran: dayTx.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.nominal), 0),
      });
    }
    return arr;
  }, [transactions]);

  const byCategory = useMemo(() => {
    const map = {};
    monthTx.filter(t => t.type === 'pengeluaran').forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.nominal); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recent = transactions.slice(0, 6);

  return (
    <Layout>
      {loadingData ? <p className="text-sm text-gray-400">Memuat data...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <SummaryCard label="Total Saldo" value={formatIDR(saldo)} icon={Wallet} hero />
            <SummaryCard label="Pemasukan Bulan Ini" value={formatIDR(incomeMonth)} icon={TrendingUp} tone="good" />
            <SummaryCard label="Pengeluaran Bulan Ini" value={formatIDR(expenseMonth)} icon={TrendingDown} tone="bad" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <SummaryCard label="Sisa Cash Flow Bulan Ini" value={formatIDR(sisaCashflow)} icon={ArrowLeftRight} tone={sisaCashflow >= 0 ? 'good' : 'bad'} />
            <SummaryCard label="Target Tabungan (total)" value={formatIDR(totalTargetGoal)} icon={Target} />
            <SummaryCard label="Pencapaian Target" value={goalPct + '%'} icon={PiggyBank} tone="good" />
          </div>

          <div className="mb-5">
            {sisaCashflow >= 0 ? (
              <div className="flex items-center gap-2 bg-primary-soft text-primary px-3.5 py-2.5 rounded-lg text-sm font-bold">
                <CheckCircle2 size={16} /> Kondisi keuangan bulan ini Surplus.
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-danger-soft text-danger px-3.5 py-2.5 rounded-lg text-sm font-bold">
                <AlertTriangle size={16} /> Kondisi keuangan bulan ini Defisit.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-5">
            <div className="card p-4">
              <div className="text-sm font-bold mb-2">Cash Flow — 14 Hari Terakhir</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={last14}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#12523F" stopOpacity={0.4} /><stop offset="100%" stopColor="#12523F" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B8433A" stopOpacity={0.35} /><stop offset="100%" stopColor="#B8433A" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} interval={2} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} width={40} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000000 ? v / 1000000 + 'jt' : v >= 1000 ? v / 1000 + 'rb' : v)} />
                  <Tooltip formatter={(v) => formatIDR(v)} />
                  <Area type="monotone" dataKey="Pemasukan" stroke="#12523F" fill="url(#gIn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Pengeluaran" stroke="#B8433A" fill="url(#gOut)" strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <div className="text-sm font-bold mb-2">Pengeluaran per Kategori</div>
              {byCategory.length === 0 ? <p className="text-sm text-gray-400 py-10 text-center">Belum ada pengeluaran bulan ini.</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={2}>
                      {byCategory.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatIDR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-bold mb-2">Transaksi Terbaru</div>
            {recent.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">Belum ada transaksi.</p> : recent.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{t.description || t.category}</div>
                  <div className="text-xs text-gray-400">{t.category} · {fmtDateShort(t.date)}</div>
                </div>
                <div className={`font-bold text-sm flex-shrink-0 ${t.type === 'pemasukan' ? 'text-primary' : 'text-danger'}`}>
                  {t.type === 'pemasukan' ? '+' : '-'}{formatIDR(t.nominal)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
