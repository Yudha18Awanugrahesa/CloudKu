import { useEffect, useRef, useState } from "react";
import { Camera, Download, Upload, RotateCcw, Sun, Moon } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Pengaturan() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState("light");
  const [confirmReset, setConfirmReset] = useState(false);

  const fileRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setDisplayName(data?.username || "");
        if (data?.theme) {
          setTheme(data.theme);
          document.documentElement.classList.toggle(
            "dark",
            data.theme === "dark",
          );
        }
      });
  }, [user]);

  const saveUsername = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ username: displayName.trim() })
      .eq("id", user.id);
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    if (!user) return;
    await supabase
      .from("profiles")
      .update({ theme: newTheme })
      .eq("id", user.id);
  };

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      alert(
        "Gagal upload foto: " +
          error.message +
          '\n(Pastikan bucket "avatars" sudah dibuat dan bersifat public)',
      );
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);
    setProfile((p) => ({ ...p, avatar_url: data.publicUrl }));
  };

  const doExport = async () => {
    if (!user) return;
    const [{ data: tx }, { data: gl }, { data: bg }] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("budgets").select("*").eq("user_id", user.id),
    ]);
    const payload = {
      profile,
      transactions: tx,
      goals: gl,
      budgets: bg,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cloudtrack_backup_${user?.email || "user"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const obj = JSON.parse(reader.result);
        if (obj.transactions?.length)
          await supabase.from("transactions").insert(
            obj.transactions.map((t) => ({
              ...t,
              id: undefined,
              user_id: user.id,
            })),
          );
        if (obj.goals?.length)
          await supabase
            .from("goals")
            .insert(
              obj.goals.map((g) => ({ ...g, id: undefined, user_id: user.id })),
            );
        if (obj.budgets?.length)
          await supabase.from("budgets").insert(
            obj.budgets.map((b) => ({
              ...b,
              id: undefined,
              user_id: user.id,
            })),
          );
        alert("Data berhasil direstore.");
      } catch {
        alert("File tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  const doReset = async () => {
    if (!user) return;
    await Promise.all([
      supabase.from("transactions").delete().eq("user_id", user.id),
      supabase.from("goals").delete().eq("user_id", user.id),
      supabase.from("budgets").delete().eq("user_id", user.id),
    ]);
    setConfirmReset(false);
    alert("Semua data transaksi, target, dan budget berhasil direset.");
  };

  if (authLoading || !user || !profile) {
    return (
      <Layout>
        <p className="text-sm text-gray-400">Memuat...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="text-lg font-extrabold mb-4 text-gray-900 dark:text-white">
        Pengaturan
      </h2>

      {/* Bagian Profil */}
      <div className="card p-5 mb-4">
        <div className="text-sm font-bold mb-3.5 text-gray-800 dark:text-gray-200">
          Profil
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary-soft overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary font-extrabold text-xl">
                  {(displayName || user?.email || "U")[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -right-0.5 -bottom-0.5 w-6 h-6 rounded-full bg-primary border-2 border-white flex items-center justify-center"
            >
              <Camera size={12} color="#fff" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label-field">Nama Pengguna</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={saveUsername}
              className="input-field"
            />
            <div className="text-xs text-gray-400 mt-1.5">
              Email: {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Preferensi & Tema */}
      <div className="card p-5 mb-4">
        <div className="text-sm font-bold mb-3.5 text-gray-800 dark:text-gray-200">
          Preferensi
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Mata Uang Default</label>
            <input
              value="Rupiah (IDR)"
              disabled
              className="input-field opacity-70"
            />
          </div>
          <div>
            <label className="label-field mb-1.5 block">Mode Tampilan</label>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  theme === "light"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Sun size={14} /> Terang
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  theme === "dark"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Moon size={14} /> Gelap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Data */}
      <div className="card p-5">
        <div className="text-sm font-bold mb-3.5 text-gray-800 dark:text-gray-200">
          Data
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={doExport}
            className="btn-outline flex items-center gap-1.5"
          >
            <Download size={14} /> Backup Data (JSON)
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="btn-outline flex items-center gap-1.5"
          >
            <Upload size={14} /> Restore Data
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            onChange={onImportFile}
            className="hidden"
          />
          <button
            onClick={() => setConfirmReset(true)}
            className="btn-danger flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Reset Data
          </button>
          <button onClick={() => signOut()} className="btn-outline">
            Keluar
          </button>
        </div>
      </div>

      {confirmReset && (
        <Modal title="Reset Data" onClose={() => setConfirmReset(false)}>
          <p className="text-sm mb-4">
            Semua transaksi, target, dan budget akan dihapus permanen.
            Lanjutkan?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmReset(false)}
              className="btn-outline"
            >
              Batal
            </button>
            <button onClick={doReset} className="btn-danger">
              Ya, Reset
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
