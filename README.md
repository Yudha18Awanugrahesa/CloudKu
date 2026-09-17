# CloudTrack — Full-Stack (Next.js + Supabase)

Versi ini adalah aplikasi web sungguhan dengan:
- Login & register asli (email + password, dikelola oleh Supabase Auth — password di-hash, aman).
- Database online (Postgres via Supabase) — data tiap user otomatis terpisah lewat Row Level Security (RLS), jadi user A tidak bisa melihat/mengubah data user B.
- Bisa dibuka dari PC maupun HP lewat browser (responsive), dan bisa "Add to Home Screen" di HP agar terasa seperti aplikasi native.

## 1. Buat project Supabase (gratis)
1. Buka https://supabase.com → Sign up / Login → "New project".
2. Catat **Database Password** yang kamu buat (simpan baik-baik).
3. Tunggu project selesai dibuat (±2 menit).

## 2. Buat tabel & aturan keamanan
1. Di dashboard Supabase, buka menu **SQL Editor** → **New query**.
2. Copy-paste seluruh isi file `supabase/schema.sql` (ada di folder ini) → klik **Run**.
   Ini akan membuat tabel `profiles`, `transactions`, `goals`, `budgets`, mengaktifkan Row Level Security, dan membuat trigger agar profil otomatis dibuat saat user mendaftar.

## 3. (Opsional, untuk testing cepat) Matikan konfirmasi email
Supabase secara default mewajibkan verifikasi email sebelum user bisa login.
Untuk testing lebih cepat: Authentication → Providers → Email → matikan **"Confirm email"**.
(Untuk aplikasi produksi sungguhan, sebaiknya biarkan aktif demi keamanan.)

## 4. Buat storage bucket untuk foto profil
1. Buka menu **Storage** → **New bucket**.
2. Nama bucket: `avatars` → centang **Public bucket** → Create.

## 5. Ambil API key
1. Buka **Project Settings** → **API**.
2. Salin **Project URL** dan **anon public key**.

## 6. Setup project di komputer kamu
1. Install [Node.js](https://nodejs.org) versi 18 ke atas jika belum ada.
2. Buka folder project ini di terminal.
3. Copy file `.env.local.example` menjadi `.env.local`, lalu isi dengan URL & anon key dari langkah 5:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=isi-anon-key-kamu
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Jalankan aplikasi:
   ```
   npm run dev
   ```
6. Buka http://localhost:3000 di browser → daftar akun baru → mulai pakai CloudTrack.

## 7. Deploy supaya bisa diakses online (PC & HP)
1. Push folder project ini ke repository GitHub (buat repo baru, `git init`, `git add .`, `git commit`, `git push`).
2. Buka https://vercel.com → Login pakai GitHub → **Add New Project** → pilih repo CloudTrack kamu.
3. Di bagian **Environment Variables**, tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang sama seperti di `.env.local`.
4. Klik **Deploy**. Setelah selesai, kamu akan dapat URL publik (mis. `cloudtrack.vercel.app`) yang bisa dibuka dari PC maupun HP mana pun.
5. Di HP, buka URL tersebut di browser → menu browser → **"Add to Home Screen"** — ikon CloudTrack akan muncul di layar HP seperti aplikasi biasa.

## Struktur folder
```
pages/            → tiap file = 1 halaman (login, dashboard, transaksi, dst.)
components/        → komponen UI yang dipakai berulang (Modal, SummaryCard, Layout, dll.)
context/           → AuthContext, menyimpan status login di seluruh aplikasi
lib/               → koneksi Supabase, daftar kategori, fungsi format angka/tanggal
supabase/schema.sql→ struktur database + aturan keamanan (RLS)
```

## Catatan keamanan
- Password tidak pernah disimpan sebagai teks biasa — semua ditangani Supabase Auth (hash + salt standar industri).
- `anon public key` aman dipakai di sisi browser karena akses ke data tetap dibatasi oleh RLS per user — bukan kunci rahasia penuh.
- Jangan commit file `.env.local` ke GitHub (sudah otomatis diabaikan lewat `.gitignore`).

## Pengembangan lanjutan (opsional)
- Untuk versi aplikasi native yang benar-benar terpasang lewat Play Store/App Store, folder ini bisa dibungkus dengan **Capacitor** tanpa menulis ulang kode React-nya.
- Untuk push notification, bisa ditambahkan Supabase Edge Functions + web push.
