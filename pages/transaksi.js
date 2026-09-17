import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatIDR, fmtDateShort, todayISO } from '../lib/format';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, METHODS } from '../lib/categories';

function TransactionForm({ initial, onSave, onClose }) {
  const [type, setType] = useState(initial?.type || '');
  const [date, setDate] = useState(initial?.date || todayISO());
  const [category, setCategory] = useState(initial?.category || '');
  const [nominal, setNominal] = useState(initial?.nominal ?? '0');
  const [description, setDescription] = useState(initial?.description || '');
  const [method, setMethod] = useState(initial?.method || '');
  const [note, setNote] = useState(initial?.note || '');
  const [err, setErr] = useState('');
  const cats = type === 'pemasukan' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const submit = () => {
    const n = Number(nominal);
    if (!date) return setErr('Tanggal wajib diisi.');
    if (!category) return setErr('Kategori wajib dipilih.');
    if (!nominal || isNaN(n) || n <= 0) return setErr('Nominal tidak boleh kosong atau negatif.');
    onSave({ id: initial?.id, type, date, category, nominal: n, description: description.trim(), method, note: note.trim() });
  };

  return (
    <div>
      <div className="flex gap-2 mb-3.5">
        {['pemasukan', 'pengeluaran'].map(v => (
          <button key={v} onClick={() => { setType(v); setCategory(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border ${type === v ? 'border-primary bg-primary-soft text-primary' : 'border-gray-200 text-gray-500'}`}>
            {v === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>
      <label className="label-field">Tanggal</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Kategori</label>
      <select value={category} onChange={e => setCategory(e.target.value)} className="input-field mb-3.5">
        <option value="">Pilih kategori</option>
        {cats.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <label className="label-field">Nominal (Rp)</label>
      <input type="number" min="0" value={nominal} onChange={e => setNominal(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Deskripsi</label>
      <input value={description} onChange={e => setDescription(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Metode Pembayaran</label>
      <select value={method} onChange={e => setMethod(e.target.value)} className="input-field mb-3.5">
        {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <label className="label-field">Catatan Tambahan</label>
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="input-field mb-3.5" />
      {err && <p className="text-danger text-xs mb-3">{err}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-outline">Batal</button>
        <button onClick={submit} className="btn-primary">Simpan</button>
      </div>
    </div>
  );
}

export default function Transaksi() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [q, setQ] = useState('');
  const [fType, setFType] = useState('semua');
  const [fCat, setFCat] = useState('semua');
  const [sortDir, setSortDir] = useState('desc');

  const load = async () => {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id);
    setTransactions(data || []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const addTx = async (tx) => {
    await supabase.from('transactions').insert({ ...tx, user_id: user.id });
    load();
  };
  const updateTx = async (id, patch) => {
    await supabase.from('transactions').update(patch).eq('id', id);
    load();
  };
  const deleteTx = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    load();
  };

  const allCats = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].filter((v, i, a) => a.indexOf(v) === i);
  const filtered = useMemo(() => {
    let r = transactions.filter(t => {
      if (fType !== 'semua' && t.type !== fType) return false;
      if (fCat !== 'semua' && t.category !== fCat) return false;
      if (q && !((t.description || '').toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
    r.sort((a, b) => sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    return r;
  }, [transactions, q, fType, fCat, sortDir]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-extrabold">Transaksi</h2>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Tambah</button>
      </div>

      <div className="card p-3.5 mb-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="relative col-span-2 md:col-span-1">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari..." className="input-field pl-8" />
        </div>
        <select value={fType} onChange={e => setFType(e.target.value)} className="input-field">
          <option value="semua">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
        <select value={fCat} onChange={e => setFCat(e.target.value)} className="input-field">
          <option value="semua">Semua Kategori</option>
          {allCats.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="input-field">
          <option value="desc">Terbaru dulu</option>
          <option value="asc">Terlama dulu</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? <p className="text-sm text-gray-400 py-10 text-center">Tidak ada transaksi.</p> : filtered.map(t => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate">{t.description || t.category}</div>
              <div className="text-xs text-gray-400">{t.category} · {fmtDateShort(t.date)} · {t.method}</div>
            </div>
            <div className={`font-extrabold text-sm flex-shrink-0 ${t.type === 'pemasukan' ? 'text-primary' : 'text-danger'}`}>
              {t.type === 'pemasukan' ? '+' : '-'}{formatIDR(t.nominal)}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => setModal(t)} className="text-gray-400 hover:text-gray-600 p-1.5"><Pencil size={15} /></button>
              <button onClick={() => setConfirmDel(t)} className="text-danger p-1.5"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Tambah Transaksi' : 'Edit Transaksi'} onClose={() => setModal(null)}>
          <TransactionForm initial={modal === 'add' ? null : modal} onClose={() => setModal(null)}
            onSave={(tx) => { modal === 'add' ? addTx(tx) : updateTx(tx.id, tx); setModal(null); }} />
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Hapus Transaksi" onClose={() => setConfirmDel(null)}>
          <p className="text-sm mb-4">Yakin hapus transaksi "{confirmDel.description || confirmDel.category}"?</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDel(null)} className="btn-outline">Batal</button>
            <button onClick={() => { deleteTx(confirmDel.id); setConfirmDel(null); }} className="btn-danger">Hapus</button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
