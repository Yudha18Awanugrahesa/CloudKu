-- Jalankan seluruh isi file ini di Supabase Dashboard > SQL Editor > New query > Run

create extension if not exists "uuid-ossp";

-- Profil tambahan untuk tiap user (nama, foto, tema)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  theme text default 'light',
  created_at timestamptz default now()
);

-- Transaksi keuangan
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  type text not null check (type in ('pemasukan','pengeluaran')),
  category text not null,
  nominal numeric not null check (nominal > 0),
  description text default '',
  method text default 'Cash',
  note text default '',
  created_at timestamptz default now()
);

-- Target keuangan
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target numeric not null check (target > 0),
  collected numeric not null default 0,
  deadline date,
  description text default '',
  created_at timestamptz default now()
);

-- Budget / anggaran bulanan per kategori
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  month text not null,           -- format 'YYYY-MM'
  category text not null,
  budget_limit numeric not null check (budget_limit > 0),
  created_at timestamptz default now()
);

-- Aktifkan Row Level Security supaya user hanya bisa akses data miliknya sendiri
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.budgets enable row level security;

create policy "profiles_owner" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "transactions_owner" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_owner" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_owner" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Otomatis buat baris profil saat user baru mendaftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
