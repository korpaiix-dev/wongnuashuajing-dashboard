const filterButtons = document.querySelectorAll("[data-filter]");
const rows = document.querySelectorAll("tbody tr[data-rank]");
const searchInput = document.querySelector(".search");
const roleButtons = document.querySelectorAll("[data-login-role]");
const currentUser = document.querySelector("[data-current-user]");
const currentRole = document.querySelector("[data-current-role]");
const roleNote = document.querySelector("[data-role-note]");
const accessList = document.querySelector("[data-access-list]");
const rankingSearch = document.querySelector("[data-ranking-search]");
const podium = document.querySelector("[data-podium]");
const rankingBody = document.querySelector("[data-ranking-body]");

let activeFilter = "all";
let activeRole = localStorage.getItem("wng-role") || "boss";

const members = [
  {
    name: "Just",
    role: "Boss",
    rankRole: "boss",
    status: "Online",
    points: 9420,
    activity: "ประชุมแก๊ง",
    image: "assets/members/just.png",
  },
  {
    name: "Sixseven",
    role: "เลขา",
    rankRole: "secretary",
    status: "Online",
    points: 5900,
    activity: "Review Register",
    image: "assets/members/sixseven.png",
  },
  {
    name: "Melfury",
    role: "Member",
    rankRole: "member",
    status: "Online",
    points: 4100,
    activity: "Convoy",
    image: "assets/members/melfury.png",
  },
  {
    name: "Aheye",
    role: "Member",
    rankRole: "member",
    status: "LOA",
    points: 3780,
    activity: "War Review",
    image: "assets/members/aheye.png",
  },
  {
    name: "Namo",
    role: "Member",
    rankRole: "member",
    status: "Offline",
    points: 1250,
    activity: "Test Member Trial",
    image: "",
  },
  {
    name: "Shion",
    role: "Test Member",
    rankRole: "testmember",
    status: "ทดลองงาน",
    points: 680,
    activity: "Interview",
    image: "",
  },
];

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

function statusClass(status) {
  if (status === "Online") return "open";
  if (status === "LOA" || status === "ทดลองงาน") return "warn";
  return "done";
}

function formatPoints(points) {
  return points.toLocaleString("en-US");
}

function avatarMarkup(member) {
  if (member.image) {
    return `<span class="member-name"><img src="${member.image}" alt="" /> ${member.name}</span>`;
  }

  return `<span class="avatar">${member.name.charAt(0).toUpperCase()}</span> ${member.name}`;
}

function rankBadge(rank) {
  if (rank <= 3) {
    return `<span class="rank-medal rank-${rank}">${rank}</span>`;
  }

  return `<span class="rank-plain">${rank}</span>`;
}

function renderRanking() {
  if (!podium || !rankingBody) return;

  const query = (rankingSearch?.value || "").trim().toLowerCase();
  const sortedMembers = [...members].sort((a, b) => b.points - a.points);
  const topThree = [sortedMembers[1], sortedMembers[0], sortedMembers[2]].filter(Boolean);

  podium.innerHTML = topThree
    .map((member) => {
      const actualRank = sortedMembers.findIndex((item) => item.name === member.name) + 1;
      const className = actualRank === 1 ? "first" : actualRank === 2 ? "second" : "third";

      return `
        <article class="podium-card ${className}">
          <img src="${member.image || "assets/gang-emblem.png"}" alt="${member.name}" />
          <span class="trophy-badge">${actualRank}</span>
          <h3>${member.name}</h3>
          <p>${formatPoints(member.points)} pts</p>
        </article>
      `;
    })
    .join("");

  rankingBody.innerHTML = sortedMembers
    .filter((member) => {
      const searchable = `${member.name} ${member.role} ${member.status} ${member.activity}`.toLowerCase();
      return !query || searchable.includes(query);
    })
    .map((member, index) => {
      const rank = sortedMembers.findIndex((item) => item.name === member.name) + 1;
      return `
        <tr>
          <td>${avatarMarkup(member)}</td>
          <td>${rankBadge(rank)}</td>
          <td><span class="status ${statusClass(member.status)}">${member.status}</span></td>
          <td>${formatPoints(member.points)}</td>
          <td>${member.activity}</td>
          <td data-min-role="secretary"><button class="row-action" type="button">แก้ไข</button></td>
        </tr>
      `;
    })
    .join("");
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
  renderRanking();
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
rankingSearch?.addEventListener("input", renderRanking);

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyRole(button.dataset.loginRole);
  });
});

applyRole(activeRole);
