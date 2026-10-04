-- MójSenior - schemat demo. Uruchom w Supabase: SQL Editor -> wklej -> Run.
-- UWAGA: polityki RLS są celowo otwarte dla roli anon. W bazie wyłącznie FIKCYJNE dane demo.

create table seniors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date not null,
  sex text check (sex in ('F', 'M')),
  caregiver_name text,
  caregiver_phone text
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  name text not null,
  specialty text,
  clinic text,
  phone text not null
);

create table medications (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  name text not null,
  active_substance text,
  dose_label text not null,
  units_per_dose numeric not null default 1,
  times text[] not null,
  package_size int not null,
  packages_bought int not null default 1,
  purchase_date date not null,
  pharmacy text,
  prescribing_doctor_id uuid references doctors(id) on delete set null,
  free_65 boolean default false,
  color text,
  image_url text,
  buy_online_url text,
  source text default 'ikp'
);

create table dose_events (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  scheduled_at timestamptz not null,
  taken_at timestamptz,
  unique (medication_id, scheduled_at)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  doctor_id uuid references doctors(id) on delete set null,
  starts_at timestamptz not null,
  place text,
  note text
);

create table help_requests (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table demo_state (
  id int primary key default 1,
  time_offset_minutes int not null default 0
);

-- Otwarte RLS na hackathon
do $$
declare t text;
begin
  foreach t in array array['seniors','doctors','medications','dose_events','appointments','help_requests','demo_state'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "demo_all" on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

-- Realtime
alter publication supabase_realtime add table
  seniors, doctors, medications, dose_events, appointments, help_requests, demo_state;
