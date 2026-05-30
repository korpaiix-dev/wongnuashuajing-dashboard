-- Wongnuashuajing Dashboard — Schema v2 (persona-based redesign)
-- Run on Supabase SQL Editor → New query → paste → Run

set search_path = public;

create type rank_t          as enum ('boss','admin','member');
create type member_status_t as enum ('active','loa','kicked');
create type app_status_t    as enum ('pending','approved','rejected');
create type event_type_t    as enum ('airdrop','story','war','meeting','training');
create type event_status_t  as enum ('open','done','canceled');
create type rsvp_t          as enum ('yes','no','pending');
create type outcome_t       as enum ('win','loss','draw');
create type leave_type_t    as enum ('loa','absent');
create type leave_status_t  as enum ('pending','approved','rejected');

-- PROFILES — 1 row per Discord user
create table profiles (
  id                uuid primary key default gen_random_uuid(),
  discord_user_id   text unique not null,
  discord_username  text not null,
  display_name      text,
  avatar_url        text,
  bio               text,
  created_at        timestamptz not null default now()
);

-- APPLICATIONS — กรอกสมัครเข้าแก๊ง
create table applications (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references profiles(id) on delete cascade,
  display_name    text not null,
  reason          text,
  available_time  text,
  status          app_status_t not null default 'pending',
  reviewed_by     uuid references profiles(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- MEMBERS — สมาชิกที่ approve แล้ว
create table members (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null unique references profiles(id) on delete cascade,
  name        text not null,
  rank        rank_t not null default 'member',
  status      member_status_t not null default 'active',
  joined_at   timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index members_rank_idx on members(rank);
create index members_status_idx on members(status);

-- EVENTS — กิจกรรม / story / airdrop / war
create table events (
  id              uuid primary key default gen_random_uuid(),
  type            event_type_t not null,
  title           text not null,
  when_at         timestamptz not null,
  location        text,
  enemy_gang      text,
  notes           text,
  status          event_status_t not null default 'open',
  points_reward   integer not null default 10,
  discord_message_id text,         -- Discord message id ที่ bot โพสต์
  created_by      uuid references members(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index events_when_idx on events(when_at desc);

-- EVENT RSVP — ใครรับ/ไม่รับ
create table event_rsvp (
  event_id     uuid not null references events(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  response     rsvp_t not null default 'pending',
  responded_at timestamptz,
  primary key (event_id, member_id)
);

-- EVENT RESULTS — admin กรอกผลหลังจบ
create table event_results (
  event_id      uuid primary key references events(id) on delete cascade,
  outcome       outcome_t,
  our_score     integer,
  their_score   integer,
  mvp_member_id uuid references members(id) on delete set null,
  notes         text,
  scored_at     timestamptz
);

-- LEAVES — แจ้งขาด / แจ้งลา
create table leaves (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references members(id) on delete cascade,
  type          leave_type_t not null,
  reason        text,
  start_date    date not null,
  end_date      date not null,
  status        leave_status_t not null default 'pending',
  reviewed_by   uuid references members(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index leaves_member_idx on leaves(member_id);

-- SCORE LOGS — แหล่งข้อมูลคะแนน (ranking คำนวณจากตรงนี้)
create table score_logs (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references members(id) on delete cascade,
  event_id    uuid references events(id) on delete set null,
  delta       integer not null,
  reason      text not null,
  created_at  timestamptz not null default now()
);
create index score_logs_member_idx on score_logs(member_id, created_at desc);

-- SCHEDULES — แจ้งเตือนรายวัน (cron-ish)
create table schedules (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  time_of_day    text not null,          -- "20:30"
  days_of_week   int[] not null,         -- [1,2,3,4,5] = จ-ศ
  channel_id     text not null,          -- Discord channel id
  message        text not null,
  active         boolean not null default true,
  created_by     uuid references members(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- AUDIT LOGS
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references members(id) on delete set null,
  action      text not null,
  target      text,
  detail      text,
  created_at  timestamptz not null default now()
);
create index audit_logs_created_idx on audit_logs(created_at desc);

-- VIEW: ranking ประจำเดือนปัจจุบัน
create or replace view v_monthly_ranking as
select
  m.id            as member_id,
  m.name,
  m.rank,
  m.status,
  p.avatar_url,
  coalesce(sum(s.delta) filter (
    where s.created_at >= date_trunc('month', now())
  ), 0) as points_month,
  coalesce(sum(s.delta), 0) as points_total
from members m
join profiles p on p.id = m.profile_id
left join score_logs s on s.member_id = m.id
where m.status != 'kicked'
group by m.id, m.name, m.rank, m.status, p.avatar_url
order by points_month desc;

-- HELPER: lookup current member from Discord JWT
create or replace function current_member_row()
returns members
language sql stable as $$
  select m.* from members m
  join profiles p on p.id = m.profile_id
  where p.discord_user_id = auth.jwt()->>'sub'
  limit 1
$$;

create or replace function current_rank() returns rank_t
language sql stable as $$ select rank from current_member_row() $$;

-- RLS
alter table profiles      enable row level security;
alter table applications  enable row level security;
alter table members       enable row level security;
alter table events        enable row level security;
alter table event_rsvp    enable row level security;
alter table event_results enable row level security;
alter table leaves        enable row level security;
alter table score_logs    enable row level security;
alter table schedules     enable row level security;
alter table audit_logs    enable row level security;

-- profiles
create policy "p self read"   on profiles for select using (discord_user_id = auth.jwt()->>'sub' or current_rank() in ('boss','admin'));
create policy "p self insert" on profiles for insert with check (discord_user_id = auth.jwt()->>'sub');
create policy "p self update" on profiles for update using (discord_user_id = auth.jwt()->>'sub');

-- applications — applicant inserts; admin/boss reads/updates
create policy "app insert"   on applications for insert with check (profile_id in (select id from profiles where discord_user_id = auth.jwt()->>'sub'));
create policy "app self read" on applications for select using (profile_id in (select id from profiles where discord_user_id = auth.jwt()->>'sub') or current_rank() in ('boss','admin'));
create policy "app update"    on applications for update using (current_rank() in ('boss','admin'));

-- members — anyone authed read; admin/boss write
create policy "m read"  on members for select using (auth.role() = 'authenticated');
create policy "m write" on members for all using (current_rank() in ('boss','admin')) with check (current_rank() in ('boss','admin'));

-- events — member read; admin/boss write
create policy "e read"  on events for select using (auth.role() = 'authenticated');
create policy "e write" on events for all using (current_rank() in ('boss','admin')) with check (current_rank() in ('boss','admin'));

-- rsvp — member updates own; admin reads all
create policy "rsvp read" on event_rsvp for select using (auth.role() = 'authenticated');
create policy "rsvp upsert self" on event_rsvp for all
  using (member_id = (select id from current_member_row()) or current_rank() in ('boss','admin'))
  with check (member_id = (select id from current_member_row()) or current_rank() in ('boss','admin'));

-- results — admin write
create policy "res read"  on event_results for select using (auth.role() = 'authenticated');
create policy "res write" on event_results for all using (current_rank() in ('boss','admin')) with check (current_rank() in ('boss','admin'));

-- leaves — member submits own; admin reviews
create policy "leave self read"  on leaves for select using (member_id = (select id from current_member_row()) or current_rank() in ('boss','admin'));
create policy "leave insert self" on leaves for insert with check (member_id = (select id from current_member_row()));
create policy "leave update"     on leaves for update using (current_rank() in ('boss','admin'));

-- score_logs — read all; system writes (via service role)
create policy "s read" on score_logs for select using (auth.role() = 'authenticated');

-- schedules — admin only
create policy "sch read"  on schedules for select using (current_rank() in ('boss','admin'));
create policy "sch write" on schedules for all using (current_rank() in ('boss','admin')) with check (current_rank() in ('boss','admin'));

-- audit — admin read
create policy "audit read" on audit_logs for select using (current_rank() in ('boss','admin'));
