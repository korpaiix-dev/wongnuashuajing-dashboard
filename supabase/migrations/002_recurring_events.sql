-- Recurring events with Supabase pg_cron + pg_net
-- Runs entirely inside Supabase — no external service needed.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- TEMPLATE table — admin defines recurring events here
create table if not exists event_templates (
  id              uuid primary key default gen_random_uuid(),
  type            event_type_t not null default 'airdrop',
  title           text not null,
  location        text,
  enemy_gang      text,
  notes           text,
  points_reward   integer not null default 10,
  times_of_day    text[] not null,             -- ['14:00','18:00','22:00'] in Asia/Bangkok
  days_of_week    int[]  not null default '{0,1,2,3,4,5,6}'::int[], -- 0=Sun .. 6=Sat
  active          boolean not null default true,
  created_by      uuid references members(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists event_templates_active_idx on event_templates(active);

-- TRACKING column: last spawn per template (idempotency)
alter table event_templates add column if not exists last_spawned_at timestamptz;

alter table event_templates enable row level security;
create policy "tpl read"  on event_templates for select using (current_rank() in ('boss','admin'));
create policy "tpl write" on event_templates for all
  using (current_rank() in ('boss','admin'))
  with check (current_rank() in ('boss','admin'));

-- Settings table for the cron secret (one row)
create table if not exists app_settings (
  key text primary key,
  value text
);
alter table app_settings enable row level security;
create policy "settings boss read" on app_settings for select using (current_rank() = 'boss');

-- Default app_url placeholder
insert into app_settings(key, value) values
  ('app_url', 'https://files-mentioned-by-the-user-dd339a8.vercel.app'),
  ('cron_secret', encode(gen_random_bytes(24), 'hex'))
on conflict (key) do nothing;

-- Function: ping the Vercel cron endpoint every minute via pg_net
create or replace function trigger_event_spawn()
returns void
language plpgsql
as $$
declare
  app_url text;
  secret  text;
begin
  select value into app_url from app_settings where key = 'app_url';
  select value into secret  from app_settings where key = 'cron_secret';
  if app_url is null or secret is null then return; end if;

  perform net.http_post(
    url     := app_url || '/api/cron/spawn',
    headers := jsonb_build_object(
                  'Content-Type','application/json',
                  'Authorization','Bearer ' || secret
               ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 8000
  );
end;
$$;

-- Schedule (every minute)
do $$
begin
  -- Unschedule if already exists
  perform cron.unschedule(jobname) from cron.job where jobname = 'wns-event-spawner';
exception when others then null;
end$$;

select cron.schedule(
  'wns-event-spawner',
  '* * * * *',
  $$ select public.trigger_event_spawn(); $$
);
