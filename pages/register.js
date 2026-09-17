import { useState } from 'react';
import Link from 'next/link';
import { Cloud } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username } },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card p-6 max-w-sm w-full text-center">
          <h1 className="font-bold text-base mb-2">Cek email kamu</h1>
          <p className="text-sm text-gray-500">Kami mengirim link verifikasi ke {email}. Klik link tersebut lalu masuk ke CloudTrack.</p>
          <Link href="/login" className="btn-primary inline-block mt-5">Ke Halaman Masuk</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-7">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><Cloud size={20} color="#fff" /></div>
          <span className="text-xl font-extrabold">CloudTrack</span>
        </div>
        <form onSubmit={submit} className="card p-6">
          <h1 className="text-base font-bold mb-1">Buat akun baru</h1>
          <p className="text-xs text-gray-500 mb-5">Data kamu tersimpan aman &amp; terpisah dari pengguna lain.</p>
          <label className="label-field">Nama Pengguna</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required className="input-field mb-3" />
          <label className="label-field">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="input-field mb-3" />
          <label className="label-field">Password (min. 6 karakter)</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={6} required className="input-field mb-4" />
          {err && <p className="text-danger text-xs mb-3">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Memuat...' : 'Daftar'}</button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Sudah punya akun? <Link href="/login" className="text-primary font-bold">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
