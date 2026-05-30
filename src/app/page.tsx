import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Landing() {
  const session = await auth();
  if (session?.discordId) {
    if (session.persona === "applicant") redirect("/apply");
    if (session.persona === "member" || session.persona === "admin" || session.persona === "boss") {
      redirect("/dashboard");
    }
  }
  return (
    <div className="landing landing-visual">
      <div className="landing-bg" aria-hidden="true" />
      <div className="landing-content">
        <div className="landing-mark">
          <img src="/assets/gang-emblem.png" alt="" />
        </div>
        <h1>WONGNUASHUAJING</h1>
        <p className="landing-sub">Women Gang Operating System</p>
        <p className="landing-copy">
          ระบบจัดการสมาชิก ยศ ใบสมัคร กิจกรรม ขาด/ลา และอันดับประจำเดือนของแก๊งผู้หญิงล้วนใน FiveM
        </p>
        <div className="landing-stats" aria-label="Dashboard preview stats">
          <span><b>Roster</b><small>Role Based</small></span>
          <span><b>Ranking</b><small>Monthly Board</small></span>
          <span><b>Discord</b><small>OAuth Ready</small></span>
        </div>
      </div>
      <div className="landing-card auth-card">
        <p className="eyebrow">Official Login</p>
        <h2>เข้าสู่ระบบแก๊ง</h2>
        <p style={{ color: "#aaa", marginBottom: 22, fontSize: 13.5, lineHeight: 1.7 }}>
          ใช้ Discord เพื่อตรวจ role และเปิด dashboard ตามสิทธิ์ของสมาชิก
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/" });
          }}
        >
          <button type="submit" className="btn btn-primary btn-block" style={{ height: 48, fontSize: 14, letterSpacing: 1 }}>
            <span style={{ fontWeight: 800 }}>Login with Discord</span>
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 18, letterSpacing: 1 }}>
          OFFICIAL ROSTER — FIVEM SERVER
        </p>
      </div>
    </div>
  );
}
