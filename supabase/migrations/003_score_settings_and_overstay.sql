-- Score rules in DB (admin-editable) + LOA overstay auto-deduct

-- Seed score_* settings (idempotent)
insert into app_settings(key, value) values
  ('score_airdrop_join',    '10'),
  ('score_story_join',      '20'),
  ('score_story_win_bonus', '15'),
  ('score_meeting_join',    '5'),
  ('score_training_join',   '5'),
  ('score_mvp_bonus',       '30'),
  ('score_absent_no_notice','-15'),
  ('score_absent_over_loa', '-10'),
  ('score_loa_taken',       '-2'),
  ('score_overstay_per_day','-10'),
  ('score_overstay_max_days','7')
on conflict (key) do nothing;

-- Allow admin/boss to read score settings via UI (instead of just boss-only)
drop policy if exists "settings boss read" on app_settings;
create policy "settings admin read" on app_settings for select
  using (current_rank() in ('boss','admin'));
create policy "settings boss write" on app_settings for all
  using (current_rank() = 'boss')
  with check (current_rank() = 'boss');

-- Function: daily overstay penalty
-- Runs at 00:30 Bangkok = 17:30 UTC
create or replace function apply_loa_overstay()
returns void
language plpgsql
as $$
declare
  per_day int;
  max_days int;
begin
  select coalesce((select value::int from app_settings where key='score_overstay_per_day'), -10) into per_day;
  select coalesce((select value::int from app_settings where key='score_overstay_max_days'), 7) into max_days;

  insert into score_logs (member_id, delta, reason, event_id)
  select
    l.member_id,
    per_day,
    'ลาเกินวันที่แจ้ง (' || to_char(current_date, 'YYYY-MM-DD') || ')',
    null
  from leaves l
  join members m on m.id = l.member_id
  where l.status = 'approved'
    and l.type = 'loa'
    and l.end_date < current_date
    and l.end_date >= current_date - (max_days || ' days')::interval
    and m.status != 'kicked'
    and not exists (
      select 1 from score_logs s
      where s.member_id = l.member_id
        and s.reason like 'ลาเกินวันที่แจ้ง%'
        and date(s.created_at at time zone 'Asia/Bangkok') = current_date
    );
end;
$$;

-- Schedule
do $$
begin
  perform cron.unschedule(jobname) from cron.job where jobname = 'wns-loa-overstay';
exception when others then null;
end$$;

select cron.schedule(
  'wns-loa-overstay',
  '30 17 * * *',  -- 00:30 Bangkok = 17:30 UTC
  $$ select public.apply_loa_overstay(); $$
);
