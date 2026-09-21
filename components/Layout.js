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
  PanelLeftClose,
  PanelLeftOpen,
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

  const [profile, setProfile] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("user_profile_cache");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar_collapsed");
      return savedState !== null ? JSON.parse(savedState) : false;
    }
    return false;
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", JSON.stringify(newState));
  };

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
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          localStorage.setItem("user_profile_cache", JSON.stringify(data));
          if (data.theme) {
            document.documentElement.classList.toggle(
              "dark",
              data.theme === "dark",
            );
          }
        }
      });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm dark:bg-gray-900 transition-colors duration-300">
        Memuat...
      </div>
    );
  }

  const displayName = profile?.username || user.email?.split("@")[0];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar Desktop dengan Transisi Smooth */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-[#064e3b] dark:bg-[#0b1915] text-white shadow-2xl transition-all duration-300 ease-in-out z-[60] border-r border-emerald-900/20 dark:border-white/5 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10 overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 rounded-xl bg-white/15 dark:bg-emerald-500/10 dark:border dark:border-emerald-400/30 flex items-center justify-center flex-shrink-0 shadow-md dark:shadow-[0_0_12px_rgba(52,211,153,0.2)] transition-all duration-300">
            <Cloud
              size={22}
              className="text-white dark:text-emerald-300 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
            />
          </div>
          <span
            className={`font-extrabold text-lg tracking-wide text-white transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 translate-x-[-10px] pointer-events-none hidden"
                : "opacity-100 translate-x-0"
            }`}
          >
            CloudTrack
          </span>
        </div>

        {/* Menu Navigasi dengan Transisi Lembut */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = router.pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                title={isCollapsed ? n.label : ""}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  active
                    ? "bg-white/20 dark:bg-emerald-950/80 text-white dark:text-emerald-400 shadow-lg shadow-emerald-900/20 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-500/30"
                    : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  size={22}
                  className={`flex-shrink-0 transition-transform duration-300 ${active ? "scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : ""}`}
                />
                <span
                  className={`transition-all duration-300 ${
                    isCollapsed
                      ? "opacity-0 translate-x-[-10px] pointer-events-none hidden"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Tombol Toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/15 text-emerald-100/80 hover:text-white transition-all duration-300"
            title={isCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>

        {/* Bagian Bawah: Foto Profil & Logout */}
        <div className="p-2.5 m-2.5 rounded-2xl bg-black/20 dark:bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-3 transition-all duration-300 hover:bg-black/30 overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 rounded-xl bg-white/20 overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-white/20 transition-all duration-300">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {displayName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div
            className={`flex-1 min-w-0 transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 translate-x-[-10px] pointer-events-none hidden"
                : "opacity-100 translate-x-0"
            }`}
          >
            <div className="text-[10px] text-emerald-200/70">Akun</div>
            <div className="text-xs font-bold text-white truncate">
              {displayName}
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("user_profile_cache");
              signOut();
            }}
            title="Keluar"
            className={`text-emerald-200/70 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 flex-shrink-0 ${
              isCollapsed ? "mx-auto" : ""
            }`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area dengan Transisi Halaman Smooth */}
      <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-950 flex flex-col min-h-screen transition-colors duration-300">
        <div className="flex-1 px-4 sm:px-8 pt-6 pb-32 max-w-6xl mx-auto w-full transition-all duration-300 animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex z-40 overflow-x-auto pb-safe pt-2 shadow-lg transition-colors duration-300">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = router.pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 text-[10px] font-semibold transition-all duration-300 ${
                active
                  ? "text-emerald-800 dark:text-emerald-400 font-bold"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-300 ${active ? "scale-110" : ""}`}
              />
              <span className="truncate max-w-[55px]">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
