const filterButtons = document.querySelectorAll("[data-filter]");
const rows = document.querySelectorAll("tbody tr[data-rank]");
const searchInput = document.querySelector(".search");
const roleButtons = document.querySelectorAll("[data-login-role]");
const currentUser = document.querySelector("[data-current-user]");
const currentRole = document.querySelector("[data-current-role]");
const roleNote = document.querySelector("[data-role-note]");
const accessList = document.querySelector("[data-access-list]");

let activeFilter = "all";
let activeRole = localStorage.getItem("wng-role") || "boss";

const roleLevels = {
  register: 0,
  testmember: 1,
  member: 2,
  secretary: 3,
  boss: 4,
};

const roleProfiles = {
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

function applyMemberFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();

  rows.forEach((row) => {
    const rankMatch = activeFilter === "all" || row.dataset.rank === activeFilter;
    const textMatch = row.textContent.toLowerCase().includes(query);
    row.hidden = !(rankMatch && textMatch);
  });
}

function isVisibleForRole(element, role) {
  const level = roleLevels[role];
  const minRole = element.dataset.minRole;
  const maxRole = element.dataset.maxRole;
  const onlyRole = element.dataset.onlyRole;

  if (onlyRole && onlyRole !== role) return false;
  if (minRole && level < roleLevels[minRole]) return false;
  if (maxRole && level > roleLevels[maxRole]) return false;

  return true;
}

function applyRole(role) {
  if (!roleProfiles[role]) {
    role = "boss";
  }

  activeRole = role;
  localStorage.setItem("wng-role", role);

  const profile = roleProfiles[role];
  currentUser.textContent = profile.name;
  currentRole.textContent = profile.label;
  roleNote.textContent = profile.note;

  roleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.loginRole === role);
  });

  document.querySelectorAll("[data-min-role], [data-max-role], [data-only-role]").forEach((element) => {
    element.hidden = !isVisibleForRole(element, role);
  });

  accessList.innerHTML = profile.access
    .map((item, index) => `<span><b>${item}</b><em>${index + 1}</em></span>`)
    .join("");

  applyMemberFilters();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    applyMemberFilters();
  });
});

searchInput?.addEventListener("input", applyMemberFilters);

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyRole(button.dataset.loginRole);
  });
});

applyRole(activeRole);
