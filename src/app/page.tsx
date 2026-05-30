import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Landing() {
  const session = await auth();
  if (session) {
    if (session.persona === "applicant") redirect("/apply");
    if (session.persona === "member" || session.persona === "admin" || session.persona === "boss") {
      redirect("/dashboard");
    }
  }
  return (
    <div className="landing">
      <div className="landing-card">
        <div style={{ width: 64, height: 64, borderRadius: 14, background: "var(--gold)", color: "#050505", display: "grid", placeItems: "center", fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 700, margin: "0 auto 18px" }}>
          W
        </div>
        <h1>WONGNUASHUAJING</h1>
        <p className="landing-sub">— Women Gang Operating System —</p>
        <p style={{ color: "#aaa", marginBottom: 28, fontSize: 13.5, lineHeight: 1.7 }}>
          เข้าระบบด้วย Discord เพื่อสมัครเข้าแก๊ง ดูสมาชิก กิจกรรม และอันดับคะแนนประจำเดือน
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
