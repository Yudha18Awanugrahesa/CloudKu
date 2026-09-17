import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Cloud, Eye, EyeOff, Loader2, Wallet } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [errKey, setErrKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      setErrKey((k) => k + 1); // ganti key supaya animasi shake restart tiap kali error baru
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 bg-[linear-gradient(135deg,#0C3B2E_0%,#12523F_55%,#1F7A5C_100%)]">
      {/* Blob dekoratif yang bergerak pelan di background */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent/40 rounded-full blur-3xl animate-blob" />
      <div
        className="absolute top-1/3 -right-24 w-96 h-96 bg-emerald-300/25 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "2.5s" }}
      />
      <div
        className="absolute -bottom-28 left-1/4 w-80 h-80 bg-primary-soft/20 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "5s" }}
      />

      {/* Ikon awan mengambang di background */}
      <Cloud
        className="hidden sm:block absolute text-white/10 top-[12%] left-[10%] animate-floatY"
        size={64}
        style={{ animationDelay: "0s", animationDuration: "5s" }}
      />
      <Cloud
        className="hidden sm:block absolute text-white/10 top-[20%] right-[14%] animate-floatY"
        size={46}
        style={{ animationDelay: "1.2s", animationDuration: "4.5s" }}
      />
      <Cloud
        className="hidden sm:block absolute text-white/10 bottom-[16%] left-[16%] animate-floatY"
        size={38}
        style={{ animationDelay: "0.6s", animationDuration: "6s" }}
      />
      <Wallet
        className="hidden sm:block absolute text-white/10 bottom-[22%] right-[12%] animate-floatY"
        size={40}
        style={{ animationDelay: "1.8s", animationDuration: "5.5s" }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo dengan animasi "pop" saat halaman dimuat */}
        <div className="flex items-center justify-center gap-2.5 mb-7 opacity-0 animate-logoPop">
          <div
            className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25 animate-floatY"
            style={{ animationDuration: "3.5s" }}
          >
            <Cloud size={24} color="#fff" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            CloudTrack
          </span>
        </div>

        {/* Kartu form dengan animasi fade + slide up */}
        <form
          onSubmit={submit}
          className="bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/20 rounded-2xl p-7 opacity-0 animate-fadeInUp"
          style={{ animationDelay: "0.15s" }}
        >
          <h1 className="text-base font-bold mb-1">Masuk ke akun kamu</h1>
          <p className="text-xs text-gray-500 mb-6">
            Gunakan email &amp; password yang sudah kamu daftarkan.
          </p>

          <label className="label-field">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoFocus
            placeholder="kamu@email.com"
            className="input-field mb-4 transition-all duration-200 focus:scale-[1.015]"
          />

          <label className="label-field">Password</label>
          <div className="relative mb-1">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPass ? "text" : "password"}
              required
              placeholder="••••••••"
              className="input-field pr-10 transition-all duration-200 focus:scale-[1.015]"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {err && (
            <p
              key={errKey}
              className="text-danger text-xs mt-2 mb-1 animate-shake"
            >
              {err}
            </p>
          )}

          <button
            disabled={loading}
            className="relative overflow-hidden w-full bg-primary text-white font-bold py-3 rounded-lg mt-5 group disabled:opacity-60 disabled:cursor-not-allowed transition-transform active:scale-[0.98] hover:brightness-110"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-white/20 skew-x-12" />
            <span className="relative flex items-center justify-center gap-2 text-sm">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Memuat..." : "Masuk"}
            </span>
          </button>

          <p className="text-xs text-gray-500 mt-5 text-center">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Daftar
            </Link>
          </p>
        </form>

        <p className="text-center text-white/60 text-[11px] mt-5">
          Data kamu tersimpan aman dan terpisah per akun.
        </p>
      </div>
    </div>
  );
}
