import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatIDR, currentMonthKey, monthKeyOf } from '../lib/format';
import { EXPENSE_CATEGORIES } from '../lib/categories';

function BudgetForm({ month, initial, onSave, onClose }) {
  const [category, setCategory] = useState(initial?.category || '');
  const [limit, setLimit] = useState(initial?.budget_limit ?? '');
  const [err, setErr] = useState('');
  const submit = () => {
    const l = Number(limit);
    if (!category) return setErr('Kategori wajib dipilih.');
    if (!limit || isNaN(l) || l <= 0) return setErr('Batas anggaran harus lebih dari 0.');
    onSave({ id: initial?.id, month, category, budget_limit: l });
  };
  return (
    <div>
      <label className="label-field">Kategori Pengeluaran</label>
      <select value={category} onChange={e => setCategory(e.target.value)} className="input-field mb-3.5">
        <option value="">Pilih kategori</option>
        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <label className="label-field">Batas Anggaran (Rp)</label>
      <input type="number" min="0" value={limit} onChange={e => setLimit(e.target.value)} className="input-field mb-3.5" />
      {err && <p className="text-danger text-xs mb-3">{err}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-outline">Batal</button>
        <button onClick={submit} className="btn-primary">Simpan</button>
      </div>
    </div>
  );
}

export default function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(currentMonthKey());
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    const [{ data: b }, { data: t }] = await Promise.all([
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id),
    ]);
    setBudgets(b || []); setTransactions(t || []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const addBudget = async (b) => { await supabase.from('budgets').insert({ ...b, user_id: user.id }); load(); };
  const updateBudget = async (id, patch) => { await supabase.from('budgets').update(patch).eq('id', id); load(); };
  const deleteBudget = async (id) => { await supabase.from('budgets').delete().eq('id', id); load(); };

  const monthBudgets = budgets.filter(b => b.month === month);
  const realisasi = (cat) => transactions.filter(t => t.type === 'pengeluaran' && t.category === cat && monthKeyOf(t.date) === month).reduce((s, t) => s + Number(t.nominal), 0);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-extrabold">Anggaran / Budget</h2>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input-field" />
          <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Tambah</button>
        </div>
      </div>
      {monthBudgets.length === 0 ? <p className="text-sm text-gray-400 py-10 text-center">Belum ada budget bulan ini.</p> : (
        <div className="flex flex-col gap-2.5">
          {monthBudgets.map(b => {
            const used = realisasi(b.category);
            const sisa = b.budget_limit - used;
            const pct = Math.round((used / b.budget_limit) * 100);
            const over = used > b.budget_limit;
            return (
              <div key={b.id} className="card p-4">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <div className="font-extrabold text-sm">{b.category}</div>
                  <div className="flex items-center gap-2">
                    {over && <Badge text="Budget Terlampaui" tone="bad" />}
                    <button onClick={() => setModal(b)} className="text-gray-400"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDel(b)} className="text-danger"><Trash2 size={14} /></button>
                  </div>
                </div>
                <ProgressBar pct={pct} color={over ? '#B8433A' : '#12523F'} />
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  <span>Budget: <b className="text-gray-900">{formatIDR(b.budget_limit)}</b></span>
                  <span>Realisasi: <b className="text-gray-900">{formatIDR(used)}</b></span>
                  <span>Sisa: <b className={sisa < 0 ? 'text-danger' : 'text-gray-900'}>{formatIDR(sisa)}</b></span>
                  <span>Penggunaan: <b className="text-gray-900">{pct}%</b></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modal && (
        <Modal title={modal === 'add' ? 'Tambah Budget' : 'Edit Budget'} onClose={() => setModal(null)}>
          <BudgetForm month={month} initial={modal === 'add' ? null : modal} onClose={() => setModal(null)}
            onSave={(b) => { modal === 'add' ? addBudget(b) : updateBudget(b.id, b); setModal(null); }} />
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Hapus Budget" onClose={() => setConfirmDel(null)}>
          <p className="text-sm mb-4">Yakin hapus budget kategori "{confirmDel.category}"?</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDel(null)} className="btn-outline">Batal</button>
            <button onClick={() => { deleteBudget(confirmDel.id); setConfirmDel(null); }} className="btn-danger">Hapus</button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
