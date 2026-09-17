import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Cloud } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-7">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><Cloud size={20} color="#fff" /></div>
          <span className="text-xl font-extrabold">CloudTrack</span>
        </div>
        <form onSubmit={submit} className="card p-6">
          <h1 className="text-base font-bold mb-1">Masuk ke akun kamu</h1>
          <p className="text-xs text-gray-500 mb-5">Gunakan email &amp; password yang sudah kamu daftarkan.</p>
          <label className="label-field">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="input-field mb-3" />
          <label className="label-field">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="input-field mb-4" />
          {err && <p className="text-danger text-xs mb-3">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Memuat...' : 'Masuk'}</button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Belum punya akun? <Link href="/register" className="text-primary font-bold">Daftar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
