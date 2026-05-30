-- Seed default members. Run AFTER 001_initial_schema.sql.
-- Profiles created with placeholder discord_user_id — replace with real Discord IDs later.

insert into profiles (id, discord_user_id, discord_username, display_name, avatar_url) values
  (gen_random_uuid(), 'seed-just',     'just',     'Just',     '/assets/members/just.png'),
  (gen_random_uuid(), 'seed-sixseven', 'sixseven', 'Sixseven', '/assets/members/sixseven.png'),
  (gen_random_uuid(), 'seed-melfury',  'melfury',  'Melfury',  '/assets/members/melfury.png'),
  (gen_random_uuid(), 'seed-aheye',    'aheye',    'Aheye',    '/assets/members/aheye.png'),
  (gen_random_uuid(), 'seed-namo',     'namo',     'Namo',     null),
  (gen_random_uuid(), 'seed-shion',    'shion',    'Shion',    null);

insert into members (profile_id, name, discord, role, status, points, leave_count, absent_count, last_activity, image_url) values
  ((select id from profiles where discord_user_id = 'seed-just'),     'Just',     '@just',     'boss',       'online',  9420, 0, 0, 'ประชุมแก๊ง',         '/assets/members/just.png'),
  ((select id from profiles where discord_user_id = 'seed-sixseven'), 'Sixseven', '@sixseven', 'secretary',  'online',  5900, 0, 0, 'Review Register',     '/assets/members/sixseven.png'),
  ((select id from profiles where discord_user_id = 'seed-melfury'),  'Melfury',  '@melfury',  'member',     'online',  4100, 0, 0, 'Convoy',              '/assets/members/melfury.png'),
  ((select id from profiles where discord_user_id = 'seed-aheye'),    'Aheye',    '@aheye',    'member',     'loa',     3780, 2, 0, 'War Review',          '/assets/members/aheye.png'),
  ((select id from profiles where discord_user_id = 'seed-namo'),     'Namo',     '@namo',     'member',     'offline', 1250, 1, 1, 'Test Member Trial',   null),
  ((select id from profiles where discord_user_id = 'seed-shion'),    'Shion',    '@shion',    'testmember', 'trial',    680, 0, 2, 'Interview',           null);

insert into applications (name, discord, available_time, experience, reason, status) values
  ('Shion', '@shion', '20:00 - 01:00', 'เคยเล่นสายแก๊งและช่วยกิจกรรมทีมได้', 'ชอบบรรยากาศแก๊งผู้หญิงล้วนและอยากเล่นกับทีมจริงจัง', 'pending'),
  ('Bunny', '@bunny', '21:00 - 02:00', 'เคยเล่นสายซัพพอร์ต', 'อยากเข้าทีมที่มีระบบจริงจัง', 'interview');

insert into leave_requests (member_id, date_range, reason, status) values
  ((select id from members where name='Aheye' limit 1), '30 May - 1 Jun', 'ติดธุระส่วนตัว ขอพัก 2 วัน', 'approved');
