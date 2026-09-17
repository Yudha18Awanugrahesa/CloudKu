import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatIDR, todayISO, daysBetween } from '../lib/format';

function GoalForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [target, setTarget] = useState(initial?.target ?? '');
  const [collected, setCollected] = useState(initial?.collected ?? 0);
  const [deadline, setDeadline] = useState(initial?.deadline || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [err, setErr] = useState('');
  const submit = () => {
    const t = Number(target), cNum = Number(collected);
    if (!name.trim()) return setErr('Nama target wajib diisi.');
    if (!target || isNaN(t) || t <= 0) return setErr('Target nominal harus lebih dari 0.');
    if (!deadline) return setErr('Deadline wajib diisi.');
    onSave({ id: initial?.id, name: name.trim(), target: t, collected: cNum, deadline, description: description.trim() });
  };
  return (
    <div>
      <label className="label-field">Nama Target</label>
      <input value={name} onChange={e => setName(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Target Nominal (Rp)</label>
      <input type="number" min="0" value={target} onChange={e => setTarget(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Nominal Terkumpul (Rp)</label>
      <input type="number" min="0" value={collected} onChange={e => setCollected(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Deadline</label>
      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input-field mb-3.5" />
      <label className="label-field">Deskripsi</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="input-field mb-3.5" />
      {err && <p className="text-danger text-xs mb-3">{err}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-outline">Batal</button>
        <button onClick={submit} className="btn-primary">Simpan</button>
      </div>
    </div>
  );
}

export default function Target() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [addFundsFor, setAddFundsFor] = useState(null);
  const [fundAmt, setFundAmt] = useState('');

  const load = async () => {
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id);
    setGoals(data || []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const addGoal = async (g) => { await supabase.from('goals').insert({ ...g, user_id: user.id }); load(); };
  const updateGoal = async (id, patch) => { await supabase.from('goals').update(patch).eq('id', id); load(); };
  const deleteGoal = async (id) => { await supabase.from('goals').delete().eq('id', id); load(); };

  const statusOf = (g) => {
    if (g.collected >= g.target) return { text: 'Tercapai', tone: 'good' };
    if (g.collected <= 0) return { text: 'Belum Dimulai', tone: 'neutral' };
    return { text: 'Berjalan', tone: 'warn' };
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold">Target Keuangan</h2>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Buat Target</button>
      </div>
      {goals.length === 0 ? <p className="text-sm text-gray-400 py-10 text-center">Belum ada target keuangan.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.collected / g.target) * 100));
            const st = statusOf(g);
            const daysLeft = daysBetween(todayISO(), g.deadline);
            return (
              <div key={g.id} className="card p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="font-extrabold text-sm">{g.name}</div>
                  <Badge text={st.text} tone={st.tone} />
                </div>
                {g.description && <div className="text-xs text-gray-400 mb-2.5">{g.description}</div>}
                <ProgressBar pct={pct} />
                <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                  <span>{formatIDR(g.collected)} / {formatIDR(g.target)}</span>
                  <b className="text-gray-900">{pct}%</b>
                </div>
                <div className="text-xs text-gray-500 mt-1.5">Sisa: {formatIDR(Math.max(0, g.target - g.collected))}</div>
                <div className={`text-xs mt-0.5 ${daysLeft <= 7 && daysLeft >= 0 && st.text !== 'Tercapai' ? 'text-danger font-bold' : 'text-gray-400'}`}>
                  {daysLeft >= 0 ? `${daysLeft} hari menuju deadline` : 'Deadline sudah lewat'}
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => { setAddFundsFor(g); setFundAmt(''); }} className="btn-primary text-xs px-2.5 py-1.5">+ Dana</button>
                  <button onClick={() => setModal(g)} className="btn-outline text-xs px-2.5 py-1.5 flex items-center gap-1"><Pencil size={12} /> Edit</button>
                  <button onClick={() => setConfirmDel(g)} className="text-danger p-1.5"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Buat Target Baru' : 'Edit Target'} onClose={() => setModal(null)}>
          <GoalForm initial={modal === 'add' ? null : modal} onClose={() => setModal(null)}
            onSave={(g) => { modal === 'add' ? addGoal(g) : updateGoal(g.id, g); setModal(null); }} />
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Hapus Target" onClose={() => setConfirmDel(null)}>
          <p className="text-sm mb-4">Yakin hapus target "{confirmDel.name}"?</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDel(null)} className="btn-outline">Batal</button>
            <button onClick={() => { deleteGoal(confirmDel.id); setConfirmDel(null); }} className="btn-danger">Hapus</button>
          </div>
        </Modal>
      )}
      {addFundsFor && (
        <Modal title={`Tambah Dana — ${addFundsFor.name}`} onClose={() => setAddFundsFor(null)}>
          <label className="label-field">Nominal Tambahan (Rp)</label>
          <input type="number" min="0" value={fundAmt} onChange={e => setFundAmt(e.target.value)} className="input-field mb-4" autoFocus />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAddFundsFor(null)} className="btn-outline">Batal</button>
            <button onClick={() => {
              const n = Number(fundAmt);
              if (!fundAmt || isNaN(n) || n <= 0) return;
              updateGoal(addFundsFor.id, { collected: Number(addFundsFor.collected) + n });
              setAddFundsFor(null);
            }} className="btn-primary">Tambahkan</button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
