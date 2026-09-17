import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  PiggyBank,
  FileBarChart2,
  Settings as SettingsIcon,
  LogOut,
  Cloud,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/cashflow", label: "Cash Flow", icon: Wallet },
  { href: "/target", label: "Target", icon: Target },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/laporan", label: "Laporan", icon: FileBarChart2 },
  { href: "/pengaturan", label: "Pengaturan", icon: SettingsIcon },
];

export default function Layout({ children }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Memuat...
      </div>
    );
  }

  const displayName = profile?.username || user.email?.split("@")[0];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop (Sticky agar tidak ikut scroll ke bawah) */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-primary-dark flex-col h-screen sticky top-0 shadow-xl">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
            <Cloud size={16} color="#fff" />
          </div>
          <span className="text-white font-extrabold text-lg">CloudTrack</span>
        </div>
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = router.pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-white/25 text-white font-bold shadow-md translate-x-1"
                    : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
                }`}
              >
                <Icon size={17} /> {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Bagian Bawah (Profil & Logout) Dibuat Timbul & Interaktif */}
        <div className="p-3 m-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg flex items-center gap-2.5 transition-all duration-200 hover:bg-white/15 hover:shadow-xl hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-white/20">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xs">
                {displayName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-white text-xs font-bold truncate">
            {displayName}
          </div>
          <button
            onClick={() => signOut()}
            title="Keluar"
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-all duration-150 active:scale-95"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="px-5 pt-5 pb-28 max-w-5xl mx-auto">
          <div className="hidden md:block mb-4">
            <div className="text-xs text-gray-500">Halo,</div>
            <div className="text-xl font-extrabold">{displayName} 👋</div>
          </div>
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile (Dilengkapi pb-safe agar tidak tertutup bar iPhone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40 overflow-x-auto pb-safe pt-2">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = router.pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9.5px] font-bold ${active ? "text-primary" : "text-gray-400"}`}
            >
              <Icon size={18} /> {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
