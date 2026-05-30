import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.discordId) redirect("/");
  if (session.persona === "applicant") redirect("/apply");

  return (
    <div className="app-shell">
      <Sidebar
        persona={session.persona}
        displayName={session.displayName ?? session.discordId}
        avatarUrl={session.avatarUrl}
        rank={session.rank}
      />
      <main className="main">{children}</main>
    </div>
  );
}
