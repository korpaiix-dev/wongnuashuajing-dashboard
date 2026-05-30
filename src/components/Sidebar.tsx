"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Persona, Rank } from "@/lib/types";
import { rankLabels } from "@/lib/types";
import { signOutAction } from "@/server-actions/auth";

interface Props {
  persona: Persona;
  displayName: string;
  avatarUrl?: string | null;
  rank?: Rank;
}

const MEMBER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "◆" },
  { href: "/roster", label: "สมาชิกแก๊ง", icon: "◯" },
  { href: "/ranking", label: "Ranking", icon: "♛" },
  { href: "/events", label: "กิจกรรม / Story", icon: "▶" },
  { href: "/leave", label: "แจ้งขาด / ลา", icon: "✎" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Admin Overview", icon: "▣" },
  { href: "/admin/applicants", label: "ผู้สมัครรอรับ", icon: "✚" },
  { href: "/admin/members", label: "จัดการสมาชิก", icon: "⚒" },
  { href: "/admin/events/new", label: "สร้างกิจกรรม", icon: "✦" },
  { href: "/admin/schedule", label: "ตั้งแจ้งเตือนรายวัน", icon: "◷" },
];

export default function Sidebar({ persona, displayName, avatarUrl, rank }: Props) {
  const path = usePathname();
  const showAdmin = persona === "admin" || persona === "boss";
  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
      <div className="brand">
        <div className="brand-mark brand-image"><img src="/assets/gang-emblem.png" alt="" /></div>
        <div className="brand-name">
          <strong>WONGNUA</strong>
          <small>Gang OS</small>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-section">Member</div>
        {MEMBER_NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`nav-link ${path === n.href ? "active" : ""}`}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </Link>
        ))}
        {showAdmin && (
          <>
            <div className="nav-section">Admin</div>
            {ADMIN_NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`nav-link ${path.startsWith(n.href) ? "active" : ""}`}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </>
        )}
      </nav>
      <div className="session-tag">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" />
        ) : (
          <div className="avatar avatar-sm">{(displayName || "?").charAt(0).toUpperCase()}</div>
        )}
        <div className="meta">
          <strong>{displayName}</strong>
          <small>{rank ? rankLabels[rank] : persona}</small>
        </div>
        <form action={signOutAction} style={{ display: "inline-flex" }}>
          <button type="submit" title="ออกจากระบบ" aria-label="ออกจากระบบ" style={{ background: "transparent", border: 0, color: "var(--muted)", padding: 6, cursor: "pointer", fontSize: 16 }}>↩</button>
        </form>
      </div>
    </aside>
  );
}
