# Wongnuashuajing — Gang OS

ระบบจัดการแก๊ง FiveM **Wongnuashuajing** (ผู้หญิงล้วน) — persona-based, dark/gold theme

## Personas & routes

| Persona | เห็นอะไร |
|---|---|
| 🔒 Guest | `/` — Login with Discord |
| 📝 Applicant | `/apply` — กรอกใบสมัคร + สถานะ |
| 👤 Member | `/dashboard /roster /ranking /events /leave` |
| 👑 Admin/Boss | + `/admin/*` (applicants/members/events/schedule) |

## Stack

- **Next.js 15** App Router + React 19 + TypeScript
- **Supabase** Postgres + RLS
- **Auth.js v5** Discord OAuth
- **Discord Bot** (separate folder `discord-bot/`) — discord.js + node-cron

## Setup (ครั้งแรก)

### 1. Supabase project

```bash
# https://supabase.com → New project (ฟรี)
# SQL Editor → paste supabase/migrations/001_initial_schema.sql → Run
```
Settings → API → copy URL + anon + service_role keys

### 2. Discord App

```
https://discord.com/developers/applications → New Application
OAuth2 → Redirect: <AUTH_URL>/api/auth/callback/discord
OAuth2 → Public Key (สำหรับ verify interactions)
Bot → Reset Token → copy
Bot → Privileged Intents: Server Members ON
```

### 3. Vercel env vars

ใส่ทุกตัวจาก `.env.example` (excluding bot-only ตัว) ที่ Vercel project settings

### 4. Discord Bot (เลือก — ถ้าอยากให้กดปุ่ม RSVP ใน Discord ได้)

```bash
cd discord-bot
cp .env.example .env
npm install
npm run register
npm start  # หรือ deploy ที่ Railway / Fly / Render
```

## Scoring system (default — ปรับใน `src/lib/types.ts` SCORE_RULES)

```
Airdrop join     +10
Story/War join   +20  (+15 ถ้าชนะ)
Meeting/Training +5
MVP              +30
ขาดโดยไม่แจ้ง    −15
ขาดเกินเวลา      −10
ลาตามแจ้ง        −2
```

## Flow ตัวอย่าง: รับสมาชิกใหม่

```
1. User เข้าเว็บ → กด Login Discord
2. Redirect /apply → กรอกใบสมัคร
3. Bot โพสต์ใน #admin-channel แจ้ง "ใบสมัครใหม่"
4. Admin/Boss เข้า /admin/applicants → เลือกยศ → กดรับ
5. User refresh → เข้าเว็บได้เป็น Member
```

## Flow ตัวอย่าง: สตอรี่ + คะแนน

```
1. Admin /admin/events/new → กรอก vs แก๊ง A, เวลา → Broadcast
2. Bot โพสต์ใน #announce + ปุ่ม [✅ เข้าร่วม] [❌ ไม่เข้าร่วม]
3. สมาชิกกดใน Discord → DB อัปเดต RSVP
4. หลังจบ → Admin /admin/events/[id] → กรอกผล + tick คนมาจริง + เลือก MVP
5. ระบบเข้าคะแนนใน score_logs → ranking อัปเดตทันที
```

## Folder map

```
src/
├── app/
│   ├── page.tsx              # Landing (public)
│   ├── apply/                # Applicant
│   ├── (member)/             # Member-only routes (sidebar layout)
│   ├── (admin)/admin/        # Admin-only routes
│   └── api/
│       ├── auth/             # Discord OAuth
│       └── discord/interactions/  # Bot webhook fallback
├── components/Sidebar.tsx
├── server-actions/{applications,leaves,events,members}.ts
├── lib/{auth,supabase,types}.ts
└── middleware.ts             # persona-based routing guard

supabase/
└── migrations/001_initial_schema.sql

discord-bot/                   # separate worker for Discord interactions + cron
```
