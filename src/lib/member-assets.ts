const MEMBER_ART: Record<string, string> = {
  aheye: "/assets/members/aheye.png",
  just: "/assets/members/just.png",
  melfury: "/assets/members/melfury.png",
  sixseven: "/assets/members/sixseven.png",
};

export function memberArt(name?: string | null, avatarUrl?: string | null) {
  if (avatarUrl) return avatarUrl;
  const key = (name ?? "").trim().toLowerCase();
  return MEMBER_ART[key] ?? null;
}
