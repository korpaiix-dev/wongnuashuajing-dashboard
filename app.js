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
  recruit: 0,
  member: 1,
  admin: 2,
  boss: 3,
};

const roleProfiles = {
  boss: {
    name: "Just",
    label: "Boss",
    note: "คุณอยู่ในโหมด Boss: เห็นข้อมูลครบ จัดการสมาชิก กิจกรรม คำขอ และ audit ได้ทั้งหมด",
    access: ["จัดการสมาชิกทั้งหมด", "เปลี่ยนยศและสถานะ", "อนุมัติ LOA / Recruit", "ดู Audit & Strike"],
  },
  admin: {
    name: "Melfury",
    label: "Admin",
    note: "คุณอยู่ในโหมด Admin: ช่วยดูแลกิจกรรม สมาชิก และคำขอ แต่ไม่ควรเปลี่ยนยศสูงสุด",
    access: ["สร้างกิจกรรม", "เช็กชื่อและให้แต้ม", "อนุมัติ LOA", "แก้ข้อมูลสมาชิกทั่วไป"],
  },
  member: {
    name: "Aheye",
    label: "Member",
    note: "คุณอยู่ในโหมด Member: เห็นข้อมูลทีมแบบจำกัด ลงชื่อกิจกรรม ส่ง LOA และแก้โปรไฟล์ตัวเอง",
    access: ["ดูโปรไฟล์ตัวเอง", "ลงชื่อกิจกรรม", "ส่งคำขอ LOA", "ดูแต้มและประกาศ"],
  },
  recruit: {
    name: "Guest Recruit",
    label: "Recruit",
    note: "คุณอยู่ในโหมด Recruit: ยังไม่เป็นสมาชิกเต็มตัว จึงเห็นเฉพาะพื้นที่สมัครและสถานะรออนุมัติ",
    access: ["กรอกใบสมัคร", "ดูสถานะสัมภาษณ์", "อ่านประกาศรับสมัคร", "รอ Admin อนุมัติ"],
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
