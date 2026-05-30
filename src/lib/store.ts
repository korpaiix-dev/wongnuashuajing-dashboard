"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultState, type AppState, type Member, type Application, type LeaveRequest, type Role, type LogEntry, roleLabels, roleProfiles } from "./types";

const STATE_KEY = "wng-dashboard-state-v2";

function createId(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-")}-${Date.now().toString(36)}`;
}

function nowLabel() {
  return new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
}

interface Store extends AppState {
  activeRole: Role;
  activeFilter: string;
  memberQuery: string;
  rankingQuery: string;
  setActiveRole: (r: Role) => void;
  setActiveFilter: (f: string) => void;
  setMemberQuery: (q: string) => void;
  setRankingQuery: (q: string) => void;
  addLog: (user: string, action: string, detail: string) => void;
  upsertMember: (m: Pick<Member, "name" | "discord" | "role" | "status">) => void;
  removeMember: (id: string) => void;
  promoteMember: (id: string) => void;
  submitApplication: (a: Omit<Application, "id" | "status">) => void;
  approveApplication: (id: string) => void;
  submitLeave: (l: Omit<LeaveRequest, "id" | "status">) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaultState,
      activeRole: "boss",
      activeFilter: "all",
      memberQuery: "",
      rankingQuery: "",
      setActiveRole: (activeRole) => set({ activeRole }),
      setActiveFilter: (activeFilter) => set({ activeFilter }),
      setMemberQuery: (memberQuery) => set({ memberQuery }),
      setRankingQuery: (rankingQuery) => set({ rankingQuery }),
      addLog: (user, action, detail) => {
        const log: LogEntry = { at: nowLabel(), user, action, detail };
        set((s) => ({ logs: [log, ...s.logs].slice(0, 30) }));
      },
      upsertMember: (input) => {
        const state = get();
        const existing = state.members.find((m) => m.name.toLowerCase() === input.name.toLowerCase());
        if (existing) {
          set((s) => ({
            members: s.members.map((m) =>
              m.id === existing.id
                ? { ...m, discord: input.discord || m.discord, role: input.role, status: input.status, activity: "แก้ไขข้อมูลล่าสุด" }
                : m
            ),
          }));
          state.addLog(roleProfiles[state.activeRole].name, "Update member", input.name);
        } else {
          const newMember: Member = {
            id: createId(input.name),
            name: input.name,
            discord: input.discord,
            role: input.role,
            status: input.status,
            points: input.role === "testmember" ? 100 : 500,
            activity: "เพิ่มเข้าระบบ",
            image: "",
            leave: 0,
            absent: 0,
          };
          set((s) => ({ members: [...s.members, newMember] }));
          state.addLog(roleProfiles[state.activeRole].name, "Add member", input.name);
        }
      },
      removeMember: (id) => {
        const state = get();
        const member = state.members.find((m) => m.id === id);
        if (!member) return;
        set((s) => ({ members: s.members.filter((m) => m.id !== id) }));
        state.addLog(roleProfiles[state.activeRole].name, "Remove member", member.name);
      },
      promoteMember: (id) => {
        const state = get();
        const member = state.members.find((m) => m.id === id);
        if (!member) return;
        const chain: Role[] = ["testmember", "member", "secretary", "boss"];
        const idx = chain.indexOf(member.role);
        const nextRole = chain[Math.min(idx + 1, chain.length - 1)] ?? "member";
        set((s) => ({
          members: s.members.map((m) =>
            m.id === id ? { ...m, role: nextRole, activity: `เลื่อนยศเป็น ${roleLabels[nextRole]}` } : m
          ),
        }));
        state.addLog(roleProfiles[state.activeRole].name, "Change role", `${member.name} -> ${roleLabels[nextRole]}`);
      },
      submitApplication: (input) => {
        const state = get();
        const app: Application = { id: createId(`app-${input.name}`), ...input, status: "Pending" };
        set((s) => ({ applications: [app, ...s.applications] }));
        state.addLog(input.name, "Submit register", "ส่งโปรไฟล์สมัครเข้าแก๊ง");
      },
      approveApplication: (id) => {
        const state = get();
        const app = state.applications.find((a) => a.id === id);
        if (!app) return;
        const exists = state.members.some((m) => m.name.toLowerCase() === app.name.toLowerCase());
        if (!exists) {
          const m: Member = {
            id: createId(app.name),
            name: app.name,
            discord: app.discord,
            role: "testmember",
            status: "ทดลองงาน",
            points: 100,
            activity: "Approved Register",
            image: "",
            leave: 0,
            absent: 0,
          };
          set((s) => ({ members: [...s.members, m] }));
        }
        set((s) => ({ applications: s.applications.filter((a) => a.id !== id) }));
        state.addLog(roleProfiles[state.activeRole].name, "Approve register", `${app.name} -> Test Member`);
      },
      submitLeave: (input) => {
        const state = get();
        const req: LeaveRequest = { id: createId(`loa-${input.name}`), ...input, status: "Pending" };
        set((s) => ({ leaveRequests: [req, ...s.leaveRequests] }));
        const member = state.members.find((m) => m.name.toLowerCase() === input.name.toLowerCase());
        if (member) {
          set((s) => ({
            members: s.members.map((m) =>
              m.id === member.id
                ? { ...m, leave: Number(m.leave || 0) + 1, status: "LOA", activity: "ส่งคำขอ LOA" }
                : m
            ),
          }));
        }
        state.addLog(input.name, "Submit LOA", `${input.date} · ${input.reason}`);
      },
    }),
    {
      name: STATE_KEY,
      partialize: (s) => ({
        members: s.members,
        applications: s.applications,
        leaveRequests: s.leaveRequests,
        logs: s.logs,
        activeRole: s.activeRole,
      }),
    }
  )
);

export function statusClass(status: string) {
  if (status === "Online") return "open";
  if (["LOA", "ทดลองงาน", "Pending", "Interview"].includes(status)) return "warn";
  return "done";
}

export function formatPoints(points: number) {
  return Number(points || 0).toLocaleString("en-US");
}

export function absenceScore(member: Member) {
  return Math.max(0, 100 - Number(member.leave || 0) * 2 - Number(member.absent || 0) * 12);
}
