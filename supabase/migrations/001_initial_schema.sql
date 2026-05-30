-- Wongnuashuajing Dashboard — initial schema
-- Run on Supabase: SQL Editor → New query → paste → Run

set search_path = public;

-- ENUMS ---------------------------------------------------------------

create type member_role as enum ('boss', 'secretary', 'member', 'testmember', 'register');
create type member_status as enum ('online', 'offline', 'loa', 'inactive', 'trial');
create type app_status as enum ('pending', 'interview', 'approved', 'rejected');
create type loa_status as enum ('pending', 'approved', 'rejected');
create type activity_attendance as enum ('attending', 'absent', 'leave', 'unavailable');
create type vault_kind as enum ('deposit', 'withdraw');

-- PROFILES (1 row per Discord user) -----------------------------------

create table profiles (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text unique not null,
  discord_username text not null,
  display_name text,
  avatar_url text,
  contact_link text,
  bio text,
  created_at timestamptz not null default now()
);

-- MEMBERS (in-gang record) --------------------------------------------

create table members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  discord text,
  role member_role not null default 'register',
  status member_status not null default 'offline',
  points integer not null default 0,
  leave_count integer not null default 0,
  absent_count integer not null default 0,
  last_activity text,
  image_url text,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index members_role_idx on members(role);
create index members_status_idx on members(status);

-- APPLICATIONS --------------------------------------------------------

create table applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  discord text,
  city_name text,
  available_time text,
  experience text,
  reason text,
  status app_status not null default 'pending',
  reviewed_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- LEAVE REQUESTS ------------------------------------------------------

create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  date_range text not null,
  reason text,
  status loa_status not null default 'pending',
  reviewed_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ACTIVITIES + PARTICIPANTS -------------------------------------------

create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  start_at timestamptz,
  owner_member_id uuid references members(id) on delete set null,
  status text,
  points_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create table activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references activities(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  attendance_status activity_attendance not null default 'attending',
  points_delta integer not null default 0,
  unique (activity_id, member_id)
);

-- ANNOUNCEMENTS -------------------------------------------------------

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  pinned boolean not null default false,
  created_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);

-- VAULT ---------------------------------------------------------------

create table vault_transactions (
  id uuid primary key default gen_random_uuid(),
  kind vault_kind not null,
  amount integer,
  item_name text,
  note text,
  created_by uuid references members(id) on delete set null,
  approved_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);

-- AUDIT LOG -----------------------------------------------------------

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_member_id uuid references members(id) on delete set null,
  action text not null,
  detail text,
  ip_address text,
  created_at timestamptz not null default now()
);
create index activity_logs_created_idx on activity_logs(created_at desc);

-- HELPER: lookup my role -----------------------------------------------

create or replace function public.current_member_role()
returns member_role
language sql stable as $$
  select m.role from members m
  join profiles p on p.id = m.profile_id
  where p.discord_user_id = auth.jwt()->>'sub'
  limit 1
$$;

-- RLS -----------------------------------------------------------------

alter table profiles enable row level security;
alter table members enable row level security;
alter table applications enable row level security;
alter table leave_requests enable row level security;
alter table activities enable row level security;
alter table activity_participants enable row level security;
alter table announcements enable row level security;
alter table vault_transactions enable row level security;
alter table activity_logs enable row level security;

-- profiles: a user reads their own profile, boss/secretary reads all
create policy "profiles self read" on profiles for select
  using (discord_user_id = auth.jwt()->>'sub' or current_member_role() in ('boss','secretary'));
create policy "profiles insert self" on profiles for insert
  with check (discord_user_id = auth.jwt()->>'sub');
create policy "profiles update self" on profiles for update
  using (discord_user_id = auth.jwt()->>'sub')
  with check (discord_user_id = auth.jwt()->>'sub');

-- members: anyone authed can read; only boss/secretary write
create policy "members read" on members for select using (auth.role() = 'authenticated');
create policy "members write" on members for all
  using (current_member_role() in ('boss','secretary'))
  with check (current_member_role() in ('boss','secretary'));

-- applications: applicant can insert; only boss/secretary read/update
create policy "applications insert" on applications for insert with check (auth.role() = 'authenticated');
create policy "applications read" on applications for select
  using (current_member_role() in ('boss','secretary') or profile_id in (select id from profiles where discord_user_id = auth.jwt()->>'sub'));
create policy "applications update" on applications for update
  using (current_member_role() in ('boss','secretary'));

-- leave_requests: member sees own; boss/secretary sees all
create policy "leave read" on leave_requests for select
  using (current_member_role() in ('boss','secretary') or member_id in (
    select m.id from members m join profiles p on p.id = m.profile_id where p.discord_user_id = auth.jwt()->>'sub'
  ));
create policy "leave insert" on leave_requests for insert
  with check (member_id in (
    select m.id from members m join profiles p on p.id = m.profile_id where p.discord_user_id = auth.jwt()->>'sub'
  ));
create policy "leave update" on leave_requests for update
  using (current_member_role() in ('boss','secretary'));

-- activities/announcements/vault: members read; secretary+ write
create policy "activities read" on activities for select using (auth.role() = 'authenticated');
create policy "activities write" on activities for all
  using (current_member_role() in ('boss','secretary'))
  with check (current_member_role() in ('boss','secretary'));

create policy "ap read" on activity_participants for select using (auth.role() = 'authenticated');
create policy "ap write" on activity_participants for all
  using (current_member_role() in ('boss','secretary'))
  with check (current_member_role() in ('boss','secretary'));

create policy "ann read" on announcements for select using (auth.role() = 'authenticated');
create policy "ann write" on announcements for all
  using (current_member_role() in ('boss','secretary'))
  with check (current_member_role() in ('boss','secretary'));

create policy "vault read" on vault_transactions for select
  using (current_member_role() in ('boss','secretary','member'));
create policy "vault write" on vault_transactions for all
  using (current_member_role() in ('boss','secretary'))
  with check (current_member_role() in ('boss','secretary'));

create policy "logs read" on activity_logs for select
  using (current_member_role() in ('boss','secretary'));
create policy "logs insert" on activity_logs for insert with check (auth.role() = 'authenticated');
