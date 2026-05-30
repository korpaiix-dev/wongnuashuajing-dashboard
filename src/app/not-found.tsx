import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 36 }}>
      <div className="card" style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 56, color: "var(--gold)", fontFamily: "Playfair Display, serif", fontWeight: 700, marginBottom: 8, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>404</div>
        <h2 style={{ marginBottom: 8 }}>ไม่เจอหน้าที่ค้นหา</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 13 }}>หน้าที่บอสกำลังหาอาจถูกย้าย ลบทิ้ง หรือพิมพ์ URL ผิด</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/dashboard" className="btn btn-primary">กลับ Dashboard</Link>
          <Link href="/" className="btn btn-ghost">หน้าแรก</Link>
        </div>
      </div>
    </div>
  );
}
