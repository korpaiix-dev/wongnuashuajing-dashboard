# Wongnuashuajing Dashboard — Next.js

ระบบจัดการแก๊ง FiveM ธีมดำ-ทอง สำหรับวง **Wongnuashuajing** (Women Gang OS)
Migration จาก static HTML prototype เดิมไปสู่ Next.js 15 + Supabase + Discord OAuth พร้อมโครงสร้างสำหรับ scale ในอนาคต

## Stack

- **Next.js 15** (App Router, React 19 RC, TypeScript)
- **Zustand** (state, persist ลง localStorage)
- **Supabase** (Postgres + Row Level Security)
- **Auth.js v5** (Discord OAuth)
- **Vercel** deployment

## โครงสร้างไฟล์

```
src/
├── app/
│   ├── layout.tsx          # root + font
│   ├── page.tsx            # main dashboard
│   ├── globals.css         # ธีมดำทอง (จาก styles.css เดิม 100%)
│   └── api/auth/[...nextauth]/route.ts
├── components/
│   ├── Topbar.tsx          # nav + role chip
│   ├── HeroAndLogin.tsx    # hero + role switcher
│   ├── Dashboard.tsx       # metric cards + ops timeline
│   ├── Members.tsx         # CRUD + filter + table
│   ├── Register.tsx        # ฟอร์มสมัคร
│   ├── Applications.tsx    # หน้า approve
│   ├── Leave.tsx           # LOA + absence score
│   ├── Ranking.tsx         # podium + table
│   ├── Events.tsx          # event cards
│   ├── Vault.tsx           # คลังเงิน/ของ
│   ├── Announcements.tsx
│   ├── Logs.tsx            # audit log
│   ├── Settings.tsx
│   ├── ProfilePreview.tsx
│   └── RoleGate.tsx        # ซ่อน/แสดงตาม role
├── lib/
│   ├── types.ts            # Role, Member, defaultState
│   ├── store.ts            # Zustand + persist
│   ├── auth.ts             # NextAuth v5 + Discord
│   └── supabase.ts         # browser/server/admin clients
└── middleware.ts
public/assets/              # รูปทั้งหมดจาก repo เดิม
supabase/
├── migrations/001_initial_schema.sql
└── seed.sql
```

## วิธี run local

1. ติดตั้ง dependencies
   ```bash
   npm install
   ```
2. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจริง (ข้ามได้ในช่วง prototype — app เปิดได้โดยไม่มี Supabase/Discord เพราะ state ยัง persist บน localStorage)
3. รัน dev server
   ```bash
   npm run dev
   ```
4. เปิด http://localhost:3000

## ตั้ง Supabase

1. สร้าง project ที่ https://supabase.com (Free tier ใช้ได้)
2. SQL Editor → New query → วาง `supabase/migrations/001_initial_schema.sql` → Run
3. (เลือก) วาง `supabase/seed.sql` เพื่อใส่ข้อมูลเริ่มต้น
4. Settings → API → คัดลอก `URL` และ `anon` key, `service_role` key ลง `.env.local`

## ตั้ง Discord OAuth

1. ไปที่ https://discord.com/developers/applications → New Application
2. OAuth2 → ใส่ Redirect URL:
   - `http://localhost:3000/api/auth/callback/discord`
   - `https://<your-vercel-domain>/api/auth/callback/discord`
3. Copy Client ID + Client Secret ลง `.env.local`
4. Generate `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

## Deploy บน Vercel

1. Push เข้า GitHub
2. Import repo บน Vercel
3. ใส่ env vars ทั้งหมดจาก `.env.example` ใน Vercel project settings
4. Deploy

## เทียบกับเวอร์ชันเดิม

| เรื่อง | เดิม (static) | ใหม่ (Next.js) |
|---|---|---|
| State | localStorage (vanilla JS) | Zustand + persist (localStorage) |
| Role visibility | `data-min-role` HTML attr | `<RoleGate>` component |
| UI / Styling | styles.css | **คงไว้ 100%** ที่ `app/globals.css` |
| Assets | `assets/` | `public/assets/` (path เปลี่ยน prefix `/`) |
| Auth | จำลอง role-switch | จำลอง role-switch + พร้อมเชื่อม Discord OAuth จริง |
| Database | ไม่มี | Supabase schema + RLS พร้อมรัน |
| Routing | hash anchor | hash anchor (เหมือนเดิม) — ต่อยอดเป็น multi-page ภายหลังได้ |

## Roadmap ต่อจากนี้

- **Phase A (ตอนนี้)**: UI port ครบ + Zustand state + persist (app ใช้งานได้แบบ local-only) ✅
- **Phase B**: เปิด Discord OAuth จริง + ต่อ Supabase queries แทน Zustand
- **Phase C**: เพิ่ม API routes สำหรับ events, vault, announcements, real-time activity log
- **Phase D**: Discord webhook + bot integration + mobile polish

## วิธี push ขึ้น repo เดิม

โปรเจ็กต์เดิม `https://github.com/korpaiix-dev/wongnuashuajing-dashboard` สามารถ
1. สร้าง branch ใหม่ `next-migration`
2. คัดลอกไฟล์ทั้งหมดจากโปรเจ็กต์นี้ทับ (เก็บ `assets/` ของเดิมไว้ใน `public/assets/`)
3. ลบไฟล์ static เก่า: `index.html`, `app.js`, `styles.css` (เพราะถูก port ไป Next.js แล้ว)
4. Commit + push + เปิด PR หรือ merge เข้า `main`

หรือถ้าอยาก clean start: สร้าง repo ใหม่ทับก็ได้
