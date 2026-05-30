export type Persona = "guest" | "applicant" | "member" | "admin" | "boss";
export type Rank = "boss" | "admin" | "member";

export const rankLabels: Record<Rank, string> = {
  boss: "Boss",
  admin: "Admin",
  member: "Member",
};

export const rankLevel: Record<Rank, number> = { member: 1, admin: 2, boss: 3 };

export interface Profile {
  id: string;
  discord_user_id: string;
  discord_username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Member {
  id: string;
  profile_id: string;
  name: string;
  rank: Rank;
  status: "active" | "loa" | "kicked";
  joined_at: string;
}

export interface Application {
  id: string;
  profile_id: string;
  display_name: string;
  reason: string;
  available_time: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export type EventType = "airdrop" | "story" | "war" | "meeting" | "training";

export const eventLabels: Record<EventType, string> = {
  airdrop: "Airdrop",
  story: "Story",
  war: "War",
  meeting: "Meeting",
  training: "Training",
};

export interface GangEvent {
  id: string;
  type: EventType;
  title: string;
  when: string;          // ISO datetime
  location: string | null;
  enemy_gang: string | null;
  notes: string | null;
  status: "open" | "done" | "canceled";
  points_reward: number;
  created_by: string;
  created_at: string;
}

export interface EventRSVP {
  event_id: string;
  member_id: string;
  response: "yes" | "no" | "pending";
  responded_at: string | null;
}

export interface EventResult {
  event_id: string;
  outcome: "win" | "loss" | "draw" | null;
  our_score: number | null;
  their_score: number | null;
  mvp_member_id: string | null;
  notes: string | null;
}

export type LeaveType = "loa" | "absent";

export interface LeaveRequest {
  id: string;
  member_id: string;
  type: LeaveType;
  reason: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  created_at: string;
}

export interface ScoreLog {
  id: string;
  member_id: string;
  event_id: string | null;
  delta: number;
  reason: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  title: string;
  time_of_day: string;     // "20:30" — local Bangkok
  days_of_week: number[];  // 0..6 (0=Sun)
  channel_id: string;
  message: string;
  active: boolean;
}

// Default scoring rules — admin can override later via settings
export const SCORE_RULES = {
  airdrop_join: 10,
  story_join: 20,
  story_win_bonus: 15,
  meeting_join: 5,
  training_join: 5,
  mvp_bonus: 30,
  absent_no_notice: -15,
  absent_over_loa: -10,
  loa_taken: -2,
} as const;
