"use client";

import Topbar from "@/components/Topbar";
import HeroAndLogin from "@/components/HeroAndLogin";
import Dashboard from "@/components/Dashboard";
import Members from "@/components/Members";
import Register from "@/components/Register";
import Applications from "@/components/Applications";
import Leave from "@/components/Leave";
import Ranking from "@/components/Ranking";
import Events from "@/components/Events";
import Vault from "@/components/Vault";
import Announcements from "@/components/Announcements";
import Logs from "@/components/Logs";
import Settings from "@/components/Settings";
import ProfilePreview from "@/components/ProfilePreview";

export default function HomePage() {
  return (
    <>
      <Topbar />
      <main>
        <HeroAndLogin />
        <Dashboard />
        <Members />
        <Register />
        <Applications />
        <Leave />
        <Ranking />
        <Events />
        <Vault />
        <Announcements />
        <Logs />
        <Settings />
        <ProfilePreview />
      </main>
    </>
  );
}
