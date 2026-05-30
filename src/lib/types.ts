export type Role = "boss" | "secretary" | "member" | "testmember" | "register";

export interface Member {
  id: string;
  name: string;
  discord: string;
  role: Role;
  status: string;
  points: number;
  activity: string;
  image: string;
  leave: number;
  absent: number;
}

export interface Application {
  id: string;
  name: string;
  discord: string;
  time: string;
  experience: string;
  reason: string;
  status: "Pending" | "Interview" | "Approved" | "Rejected";
}

export interface LeaveRequest {
  id: string;
  name: string;
  date: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface LogEntry {
  at: string;
  user: string;
  action: string;
  detail: string;
}

export interface AppState {
  members: Member[];
  applications: Application[];
  leaveRequests: LeaveRequest[];
  logs: LogEntry[];
}

export const roleLevels: Record<Role, number> = {
  register: 0,
  testmember: 1,
  member: 2,
  secretary: 3,
  boss: 4,
};

export const roleLabels: Record<Role, string> = {
  boss: "Boss",
  secretary: "เลขา",
  member: "Member",
  testmember: "Test Member",
  register: "Register",
};

export interface RoleProfile {
  name: string;
  label: string;
  note: string;
  access: string[];
}

export const roleProfiles: Record<Role, RoleProfile> = {
  boss: {
    name: "Just",
    label: "Boss",
    note: "คุณอยู่ในโหมด Boss: เห็นข้อมูลครบ จัดการสมาชิก กิจกรรม คำขอ และ audit ได้ทั้งหมด",
    access: ["จัดการสมาชิกทั้งหมด", "เปลี่ยนยศและสถานะ", "อนุมัติ LOA / Register", "ดู Audit & Strike"],
  },
  secretary: {
    name: "Sixseven",
    label: "เลขา",
    note: "คุณอยู่ในโหมดเลขา: ดูแลใบสมัคร สมาชิก กิจกรรม และระบบขาด/ลาแทน Boss ได้",
    access: ["Review Register", "จัดการสมาชิก", "อนุมัติ LOA", "เช็กชื่อและให้แต้ม"],
  },
  member: {
    name: "Aheye",
    label: "Member",
    note: "คุณอยู่ในโหมด Member: เห็นข้อมูลทีมแบบจำกัด ลงชื่อกิจกรรม ส่ง LOA และแก้โปรไฟล์ตัวเอง",
    access: ["ดูโปรไฟล์ตัวเอง", "ลงชื่อกิจกรรม", "ส่งคำขอ LOA", "ดูแต้มและประกาศ"],
  },
  testmember: {
    name: "Shion",
    label: "Test Member",
    note: "คุณอยู่ในโหมด Test Member: ใช้งานส่วนสมาชิกพื้นฐานได้ แต่ยังถูกจำกัดบางฟีเจอร์",
    access: ["ลงชื่อกิจกรรม", "ส่ง LOA", "ดูประกาศ", "รอประเมินเลื่อนขั้น"],
  },
  register: {
    name: "Guest Register",
    label: "Register",
    note: "คุณอยู่ในโหมด Register: ส่งโปรไฟล์สมัครเข้าแก๊งและรอเลขา/Boss อนุมัติ",
    access: ["ส่งโปรไฟล์สมัคร", "ดูสถานะใบสมัคร", "อ่านประกาศรับสมัคร", "รออนุมัติเป็น Test Member"],
  },
};

export const defaultState: AppState = {
  members: [
    { id: "just", name: "Just", discord: "@just", role: "boss", status: "Online", points: 9420, activity: "ประชุมแก๊ง", image: "/assets/members/just.png", leave: 0, absent: 0 },
    { id: "sixseven", name: "Sixseven", discord: "@sixseven", role: "secretary", status: "Online", points: 5900, activity: "Review Register", image: "/assets/members/sixseven.png", leave: 0, absent: 0 },
    { id: "melfury", name: "Melfury", discord: "@melfury", role: "member", status: "Online", points: 4100, activity: "Convoy", image: "/assets/members/melfury.png", leave: 0, absent: 0 },
    { id: "aheye", name: "Aheye", discord: "@aheye", role: "member", status: "LOA", points: 3780, activity: "War Review", image: "/assets/members/aheye.png", leave: 2, absent: 0 },
    { id: "namo", name: "Namo", discord: "@namo", role: "member", status: "Offline", points: 1250, activity: "Test Member Trial", image: "", leave: 1, absent: 1 },
    { id: "shion", name: "Shion", discord: "@shion", role: "testmember", status: "ทดลองงาน", points: 680, activity: "Interview", image: "", leave: 0, absent: 2 },
  ],
  applications: [
    { id: "app-shion", name: "Shion", discord: "@shion", time: "20:00 - 01:00", experience: "เคยเล่นสายแก๊งและช่วยกิจกรรมทีมได้", reason: "ชอบบรรยากาศแก๊งผู้หญิงล้วนและอยากเล่นกับทีมจริงจัง", status: "Pending" },
    { id: "app-bunny", name: "Bunny", discord: "@bunny", time: "21:00 - 02:00", experience: "เคยเล่นสายซัพพอร์ต", reason: "อยากเข้าทีมที่มีระบบจริงจัง", status: "Interview" },
  ],
  leaveRequests: [
    { id: "loa-aheye", name: "Aheye", date: "30 May - 1 Jun", reason: "ติดธุระส่วนตัว ขอพัก 2 วัน", status: "Approved" },
  ],
  logs: [
    { at: "Today 20:30", user: "Just", action: "Create mission", detail: "ประชุมแก๊งประจำสัปดาห์" },
    { at: "Today 20:10", user: "Sixseven", action: "Review register", detail: "รับ Shion เข้ารอบ Interview" },
  ],
};
