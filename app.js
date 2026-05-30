const stateKey = "wng-dashboard-state-v2";
const roleButtons = document.querySelectorAll("[data-login-role]");
const currentUser = document.querySelector("[data-current-user]");
const currentRole = document.querySelector("[data-current-role]");
const roleNote = document.querySelector("[data-role-note]");
const accessList = document.querySelector("[data-access-list]");
const rankingSearch = document.querySelector("[data-ranking-search]");
const podium = document.querySelector("[data-podium]");
const rankingBody = document.querySelector("[data-ranking-body]");
const memberBody = document.querySelector("[data-member-body]");
const memberSearch = document.querySelector(".search");
const memberForm = document.querySelector("[data-member-form]");
const registerForm = document.querySelector("[data-register-form]");
const applicationList = document.querySelector("[data-application-list]");
const leaveForm = document.querySelector("[data-leave-form]");
const absenceList = document.querySelector("[data-absence-list]");
const logBody = document.querySelector("[data-log-body]");

let activeFilter = "all";
let activeRole = localStorage.getItem("wng-role") || "boss";

const roleLevels = {
  register: 0,
  testmember: 1,
  member: 2,
  secretary: 3,
  boss: 4,
};

const roleLabels = {
  boss: "Boss",
  secretary: "เลขา",
  member: "Member",
  testmember: "Test Member",
  register: "Register",
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

const defaultState = {
  members: [
    {
      id: "just",
      name: "Just",
      discord: "@just",
      role: "boss",
      status: "Online",
      points: 9420,
      activity: "ประชุมแก๊ง",
      image: "assets/members/just.png",
      leave: 0,
      absent: 0,
    },
    {
      id: "sixseven",
      name: "Sixseven",
      discord: "@sixseven",
      role: "secretary",
      status: "Online",
      points: 5900,
      activity: "Review Register",
      image: "assets/members/sixseven.png",
      leave: 0,
      absent: 0,
    },
    {
      id: "melfury",
      name: "Melfury",
      discord: "@melfury",
      role: "member",
      status: "Online",
      points: 4100,
      activity: "Convoy",
      image: "assets/members/melfury.png",
      leave: 0,
      absent: 0,
    },
    {
      id: "aheye",
      name: "Aheye",
      discord: "@aheye",
      role: "member",
      status: "LOA",
      points: 3780,
      activity: "War Review",
      image: "assets/members/aheye.png",
      leave: 2,
      absent: 0,
    },
    {
      id: "namo",
      name: "Namo",
      discord: "@namo",
      role: "member",
      status: "Offline",
      points: 1250,
      activity: "Test Member Trial",
      image: "",
      leave: 1,
      absent: 1,
    },
    {
      id: "shion",
      name: "Shion",
      discord: "@shion",
      role: "testmember",
      status: "ทดลองงาน",
      points: 680,
      activity: "Interview",
      image: "",
      leave: 0,
      absent: 2,
    },
  ],
  applications: [
    {
      id: "app-shion",
      name: "Shion",
      discord: "@shion",
      time: "20:00 - 01:00",
      experience: "เคยเล่นสายแก๊งและช่วยกิจกรรมทีมได้",
      reason: "ชอบบรรยากาศแก๊งผู้หญิงล้วนและอยากเล่นกับทีมจริงจัง",
      status: "Pending",
    },
    {
      id: "app-bunny",
      name: "Bunny",
      discord: "@bunny",
      time: "21:00 - 02:00",
      experience: "เคยเล่นสายซัพพอร์ต",
      reason: "อยากเข้าทีมที่มีระบบจริงจัง",
      status: "Interview",
    },
  ],
  leaveRequests: [
    { id: "loa-aheye", name: "Aheye", date: "30 May - 1 Jun", reason: "ติดธุระส่วนตัว ขอพัก 2 วัน", status: "Approved" },
  ],
  logs: [
    { at: "Today 20:30", user: "Just", action: "Create mission", detail: "ประชุมแก๊งประจำสัปดาห์" },
    { at: "Today 20:10", user: "Sixseven", action: "Review register", detail: "รับ Shion เข้ารอบ Interview" },
  ],
};

let appState = loadState();

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(stateKey));
    if (parsed?.members && parsed?.applications && parsed?.leaveRequests) {
      return { ...cloneDefaultState(), ...parsed };
    }
  } catch (error) {
    console.warn("Cannot load dashboard state", error);
  }

  return cloneDefaultState();
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(appState));
}

function createId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-")}-${Date.now().toString(36)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusClass(status) {
  if (status === "Online") return "open";
  if (status === "LOA" || status === "ทดลองงาน" || status === "Pending" || status === "Interview") return "warn";
  return "done";
}

function formatPoints(points) {
  return Number(points || 0).toLocaleString("en-US");
}

function avatarMarkup(member) {
  if (member.image) {
    return `<span class="member-name"><img src="${member.image}" alt="" /> ${escapeHtml(member.name)}</span>`;
  }

  return `<span class="avatar">${escapeHtml(member.name.charAt(0).toUpperCase())}</span> ${escapeHtml(member.name)}`;
}

function rankBadge(rank) {
  if (rank <= 3) {
    return `<span class="rank-medal rank-${rank}">${rank}</span>`;
  }

  return `<span class="rank-plain">${rank}</span>`;
}

function absenceScore(member) {
  return Math.max(0, 100 - Number(member.leave || 0) * 2 - Number(member.absent || 0) * 12);
}

function addLog(user, action, detail) {
  appState.logs.unshift({
    at: new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }),
    user,
    action,
    detail,
  });
  appState.logs = appState.logs.slice(0, 30);
}

function renderMembers() {
  if (!memberBody) return;

  const query = (memberSearch?.value || "").trim().toLowerCase();
  const filtered = appState.members.filter((member) => {
    const rankMatch = activeFilter === "all" || member.role === activeFilter;
    const text = `${member.name} ${member.discord} ${member.status} ${member.activity}`.toLowerCase();
    return rankMatch && (!query || text.includes(query));
  });

  memberBody.innerHTML = filtered
    .map(
      (member) => `
        <tr data-member-id="${member.id}">
          <td>${avatarMarkup(member)}</td>
          <td>${roleLabels[member.role] || member.role}</td>
          <td><span class="status ${statusClass(member.status)}">${escapeHtml(member.status)}</span></td>
          <td>${formatPoints(member.points)}</td>
          <td>${escapeHtml(member.activity)}</td>
          <td data-min-role="secretary">
            <button class="row-action" type="button" data-member-action="promote">เลื่อนยศ</button>
            <button class="row-action danger-action" type="button" data-member-action="remove">ลบ</button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderRanking() {
  if (!podium || !rankingBody) return;

  const query = (rankingSearch?.value || "").trim().toLowerCase();
  const sortedMembers = [...appState.members].sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
  const topThree = [sortedMembers[1], sortedMembers[0], sortedMembers[2]].filter(Boolean);

  podium.innerHTML = topThree
    .map((member) => {
      const actualRank = sortedMembers.findIndex((item) => item.id === member.id) + 1;
      const className = actualRank === 1 ? "first" : actualRank === 2 ? "second" : "third";

      return `
        <article class="podium-card ${className}">
          <img src="${member.image || "assets/gang-emblem.png"}" alt="${escapeHtml(member.name)}" />
          <span class="trophy-badge">${actualRank}</span>
          <h3>${escapeHtml(member.name)}</h3>
          <p>${formatPoints(member.points)} pts</p>
        </article>
      `;
    })
    .join("");

  rankingBody.innerHTML = sortedMembers
    .filter((member) => {
      const searchable = `${member.name} ${member.discord} ${member.role} ${member.status} ${member.activity}`.toLowerCase();
      return !query || searchable.includes(query);
    })
    .map((member) => {
      const rank = sortedMembers.findIndex((item) => item.id === member.id) + 1;
      return `
        <tr>
          <td>${avatarMarkup(member)}</td>
          <td>${rankBadge(rank)}</td>
          <td><span class="status ${statusClass(member.status)}">${escapeHtml(member.status)}</span></td>
          <td>${formatPoints(member.points)}</td>
          <td>${escapeHtml(member.activity)}</td>
          <td data-min-role="secretary"><button class="row-action" type="button" data-edit-ranking="${member.id}">แก้ไข</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderApplications() {
  if (!applicationList) return;

  if (!appState.applications.length) {
    applicationList.innerHTML = `<article class="application-card empty-state"><span class="avatar">✓</span><div><h3>ไม่มีใบสมัครค้างอยู่</h3><p>เมื่อ Register ส่งโปรไฟล์ ระบบจะแสดงตรงนี้ให้ Boss/เลขารีวิว</p></div></article>`;
    return;
  }

  applicationList.innerHTML = appState.applications
    .map(
      (app) => `
        <article class="application-card" data-application-id="${app.id}">
          <span class="avatar">${escapeHtml(app.name.charAt(0).toUpperCase())}</span>
          <div>
            <h3>${escapeHtml(app.name)}</h3>
            <p>${escapeHtml(app.discord)} · เล่นได้ ${escapeHtml(app.time)} · สถานะ ${escapeHtml(app.status)}</p>
            <p>${escapeHtml(app.reason)}</p>
          </div>
          <button class="row-action" type="button" data-application-action="approve">รับเป็น Test Member</button>
        </article>
      `,
    )
    .join("");
}

function renderAbsence() {
  if (!absenceList) return;

  const memberRows = appState.members
    .map(
      (member) => `
        <span>
          <b>${escapeHtml(member.name)}</b>
          <em>ลา ${member.leave || 0} · ขาด ${member.absent || 0} · Score ${absenceScore(member)}</em>
        </span>
      `,
    )
    .join("");

  const requestRows = appState.leaveRequests
    .map(
      (request) => `
        <span class="request-row">
          <b>${escapeHtml(request.name)} · ${escapeHtml(request.date)}</b>
          <em>${escapeHtml(request.status)} · ${escapeHtml(request.reason)}</em>
        </span>
      `,
    )
    .join("");

  absenceList.innerHTML = memberRows + requestRows;
}

function renderLogs() {
  if (!logBody) return;

  logBody.innerHTML = appState.logs
    .map(
      (log) => `
        <tr>
          <td>${escapeHtml(log.at)}</td>
          <td>${escapeHtml(log.user)}</td>
          <td>${escapeHtml(log.action)}</td>
          <td>${escapeHtml(log.detail)}</td>
        </tr>
      `,
    )
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

function applyVisibility() {
  document.querySelectorAll("[data-min-role], [data-max-role], [data-only-role]").forEach((element) => {
    element.hidden = !isVisibleForRole(element, activeRole);
  });
}

function renderAll() {
  renderMembers();
  renderRanking();
  renderApplications();
  renderAbsence();
  renderLogs();
  applyVisibility();
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

  accessList.innerHTML = profile.access
    .map((item, index) => `<span><b>${escapeHtml(item)}</b><em>${index + 1}</em></span>`)
    .join("");

  renderAll();
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderMembers();
    applyVisibility();
  });
});

memberSearch?.addEventListener("input", () => {
  renderMembers();
  applyVisibility();
});

rankingSearch?.addEventListener("input", () => {
  renderRanking();
  applyVisibility();
});

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyRole(button.dataset.loginRole);
  });
});

memberForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = memberForm.querySelector("[data-member-name]").value.trim();
  const discord = memberForm.querySelector("[data-member-discord]").value.trim();
  const role = memberForm.querySelector("[data-member-role]").value;
  const status = memberForm.querySelector("[data-member-status]").value;

  if (!name) return;

  const existing = appState.members.find((member) => member.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.discord = discord || existing.discord;
    existing.role = role;
    existing.status = status;
    existing.activity = "แก้ไขข้อมูลล่าสุด";
    addLog(roleProfiles[activeRole].name, "Update member", name);
  } else {
    appState.members.push({
      id: createId(name),
      name,
      discord,
      role,
      status,
      points: role === "testmember" ? 100 : 500,
      activity: "เพิ่มเข้าระบบ",
      image: "",
      leave: 0,
      absent: 0,
    });
    addLog(roleProfiles[activeRole].name, "Add member", name);
  }

  saveState();
  renderAll();
});

memberBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-member-action]");
  if (!button) return;

  const row = button.closest("[data-member-id]");
  const member = appState.members.find((item) => item.id === row.dataset.memberId);
  if (!member) return;

  if (button.dataset.memberAction === "remove") {
    appState.members = appState.members.filter((item) => item.id !== member.id);
    addLog(roleProfiles[activeRole].name, "Remove member", member.name);
  }

  if (button.dataset.memberAction === "promote") {
    const chain = ["testmember", "member", "secretary", "boss"];
    const nextRole = chain[Math.min(chain.indexOf(member.role) + 1, chain.length - 1)] || "member";
    member.role = nextRole;
    member.activity = `เลื่อนยศเป็น ${roleLabels[nextRole]}`;
    addLog(roleProfiles[activeRole].name, "Change role", `${member.name} -> ${roleLabels[nextRole]}`);
  }

  saveState();
  renderAll();
});

registerForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = registerForm.querySelector("[data-register-name]").value.trim();
  if (!name) return;

  appState.applications.unshift({
    id: createId(`app-${name}`),
    name,
    discord: registerForm.querySelector("[data-register-discord]").value.trim(),
    time: registerForm.querySelector("[data-register-time]").value.trim(),
    experience: registerForm.querySelector("[data-register-exp]").value.trim(),
    reason: registerForm.querySelector("[data-register-reason]").value.trim(),
    status: "Pending",
  });

  addLog(name, "Submit register", "ส่งโปรไฟล์สมัครเข้าแก๊ง");
  saveState();
  renderAll();
});

applicationList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-application-action='approve']");
  if (!button) return;

  const card = button.closest("[data-application-id]");
  const app = appState.applications.find((item) => item.id === card.dataset.applicationId);
  if (!app) return;

  if (!appState.members.some((member) => member.name.toLowerCase() === app.name.toLowerCase())) {
    appState.members.push({
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
    });
  }

  appState.applications = appState.applications.filter((item) => item.id !== app.id);
  addLog(roleProfiles[activeRole].name, "Approve register", `${app.name} -> Test Member`);
  saveState();
  renderAll();
});

leaveForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = leaveForm.querySelector("[data-leave-name]").value.trim();
  const reason = leaveForm.querySelector("[data-leave-reason]").value.trim();
  const date = leaveForm.querySelector("[data-leave-date]").value.trim();
  if (!name) return;

  appState.leaveRequests.unshift({ id: createId(`loa-${name}`), name, reason, date, status: "Pending" });

  const member = appState.members.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (member) {
    member.leave = Number(member.leave || 0) + 1;
    member.status = "LOA";
    member.activity = "ส่งคำขอ LOA";
  }

  addLog(name, "Submit LOA", `${date} · ${reason}`);
  saveState();
  renderAll();
});

applyRole(activeRole);
