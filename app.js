// Логика сайта. Данные приходят из Google Apps Script (CONFIG.API_URL),
// а если адрес не задан, берутся демо-данные из data.js.

const app = document.getElementById("app");
const DEMO = !CONFIG.API_URL;
let DATA = null; // данные текущего пользователя (ученик получает только свои)
let creds = null; // { login, pin, as } для запросов к API; as = "parent" для входа родителя
const STATUS_LABEL = {
  present: "Был",
  absent: "Отсутствовал",
  late: "Опоздал",
  excused: "Уваж. причина",
};
const STATUS_MARK = { present: "✓", absent: "Н", late: "О", excused: "У" };
const DAY_INDEX = { "Понедельник": 1, "Вторник": 2, "Среда": 3, "Четверг": 4, "Пятница": 5, "Суббота": 6, "Воскресенье": 0 };

let state = { user: null, tab: null, viewStudent: null, subjectFilter: "", loginAs: "student" };

// ---------- helpers ----------
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso; // текстовый срок, например «до конца 8 класса»
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function fmtShort(iso) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}
// Телефон → последние 10 цифр, чтобы +7 701…, 8 701… и 701… совпадали
function phoneKey(v) {
  const d = String(v || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : "";
}
function pct(a, b) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}
function findStudent(id) {
  return DATA.students.find((s) => s.id === id);
}

function statusFor(lesson, id) {
  if ((lesson.absent || []).includes(id)) return "absent";
  if ((lesson.late || []).includes(id)) return "late";
  if ((lesson.excused || []).includes(id)) return "excused";
  return "present";
}

function lessonsSorted() {
  return [...DATA.attendance].sort((a, b) => a.date.localeCompare(b.date));
}

function attendanceStats(id, subject = "") {
  const res = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
  for (const l of DATA.attendance) {
    if (subject && l.subject !== subject) continue;
    res.total++;
    res[statusFor(l, id)]++;
  }
  // Посещаемость: был на этюде (включая опоздания)
  res.rate = pct(res.present + res.late, res.total);
  return res;
}

function goalProgress(goal) {
  const steps = goal.steps || [];
  if (!steps.length) return goal.done ? 100 : goal.progress ?? 0;
  return pct(steps.filter((s) => s.done).length, steps.length);
}
function idpProgress(student) {
  const goals = student.idp?.goals || [];
  if (!goals.length) return 0;
  return Math.round(goals.reduce((sum, g) => sum + goalProgress(g), 0) / goals.length);
}

function subjects() {
  return [...new Set(DATA.attendance.map((l) => l.subject))].sort();
}

// ---------- API ----------
async function api(action, payload = {}) {
  if (DEMO) return demoApi(action, payload);
  // Тело отправляется как text/plain, чтобы Apps Script принимал запрос без CORS-preflight
  const ACCESS_HINT = "Проверьте интернет. Если ошибка повторяется, в развертывании Apps Script должен быть доступ «Все».";
  let r;
  try {
    r = await fetch(CONFIG.API_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...(creds || {}), ...payload }),
    });
  } catch (e) {
    throw new Error("Не удалось связаться с сервером. " + ACCESS_HINT);
  }
  if (!r.ok) throw new Error("Сервер недоступен (" + r.status + "). " + ACCESS_HINT);
  let res;
  try {
    res = await r.json();
  } catch (e) {
    // Google вернул страницу вместо данных — обычно доступ к веб-приложению не «Все»
    throw new Error("Сервер не отвечает данными. В развертывании Apps Script должен быть доступ «Все».");
  }
  if (!res.ok) {
    // Сайт новее, чем код в Apps Script: нужно вставить новый Code.gs и выпустить новую версию
    if (/^Неизвестное действие/.test(res.error || "")) {
      throw new Error("Сервер ещё не обновлён. Учителю: вставьте новый Code.gs в Apps Script и выпустите новую версию развертывания.");
    }
    throw new Error(res.error || "Ошибка сервера");
  }
  return res;
}

// Демо-режим: повторяет ответы сервера на данных из data.js
let demoScriptLoaded = null;
function loadDemoData() {
  demoScriptLoaded =
    demoScriptLoaded ||
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "data.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Не найден data.js"));
      document.head.appendChild(s);
    });
  return demoScriptLoaded;
}
async function demoApi(action, payload) {
  await loadDemoData();
  const D = DEMO_DATA;
  if (action === "names") {
    const staff = [{ login: D.teacher.login, label: "Учитель" }];
    if (D.tutor && D.tutor.pin) staff.push({ login: D.tutor.login, label: "Воспитатель" });
    return { ok: true, className: D.className, students: publicNames(D.students), staff };
  }
  const login = creds.login.toLowerCase();
  const parent = creds.as === "parent";
  const code = phoneKey(creds.pin);
  const isTutor = !parent && D.tutor && login === D.tutor.login.toLowerCase() && creds.pin === D.tutor.pin;
  const isTeacher = isTutor || (!parent && login === D.teacher.login.toLowerCase() && creds.pin === D.teacher.pin);
  const s = D.students.find(
    (x) => x.id.toLowerCase() === login && (parent ? code && (phoneKey(x.momPhone) === code || phoneKey(x.dadPhone) === code) : x.pin === creds.pin)
  );
  if (!isTeacher && !s) {
    if (parent) throw new Error("Неверный номер телефона. Введите номер мамы или папы, который указан у учителя.");
    throw new Error(D.students.some((x) => x.id.toLowerCase() === login) ? "Неверный PIN-код" : "Неверный логин или PIN-код");
  }
  if (action === "login") {
    const strip = ({ pin, momPhone, dadPhone, ...rest }) => rest;
    if (isTeacher)
      return { ok: true, role: "teacher", staff: isTutor ? "Воспитатель" : "Учитель", data: { ...D, students: D.students.map(({ pin, ...rest }) => rest) } };
    const only = (list) => (list.includes(s.id) ? [s.id] : []);
    return {
      ok: true,
      role: parent ? "parent" : "student",
      id: s.id,
      data: {
        className: D.className,
        schedule: D.schedule,
        etudes: D.etudes,
        calendar: D.calendar,
        resources: D.resources,
        students: [strip(s)],
        attendance: D.attendance.map((l) => ({ date: l.date, subject: l.subject, absent: only(l.absent), late: only(l.late), excused: only(l.excused) })),
      },
    };
  }
  if (action === "saveLesson" && isTeacher) return { ok: true, lesson: payload.lesson };
  if (["addGoal", "setGoalDone", "deleteGoal", "setIdpInfo"].includes(action) && !parent) {
    const target = D.students.find((x) => x.id === (isTeacher ? payload.id : s.id));
    if (!target) throw new Error("Ученик не найден");
    const goals = target.idp.goals;
    if (action === "setIdpInfo") {
      if (!isTeacher) throw new Error("Доступно только учителю и воспитателю");
      Object.assign(target.idp, payload.info);
      return { ok: true, id: target.id, info: payload.info };
    }
    if (action === "addGoal") {
      const g = payload.goal;
      if (!g.title) throw new Error("Введите цель");
      if (goals.some((x) => x.title === g.title)) throw new Error("Такая цель уже есть");
      goals.push({ title: g.title, area: g.area || "", deadline: g.deadline || "", done: false, steps: (g.steps || []).map((t) => ({ text: t, done: false })) });
    }
    const gi = goals.findIndex((x) => x.title === payload.title);
    if (action === "setGoalDone") {
      if (gi < 0) throw new Error("Цель не найдена. Обновите страницу.");
      const g = goals[gi];
      if (payload.step) g.steps.find((x) => x.text === payload.step).done = payload.done;
      else g.done = payload.done;
    }
    if (action === "deleteGoal") {
      if (gi < 0) throw new Error("Цель не найдена. Обновите страницу.");
      goals.splice(gi, 1);
    }
    return { ok: true, id: target.id, goals: JSON.parse(JSON.stringify(goals)) };
  }
  if ((action === "addBook" || action === "deleteBook") && !parent) {
    const target = D.students.find((x) => x.id === (isTeacher ? payload.id : s.id));
    if (!target) throw new Error("Ученик не найден");
    const b = payload.book || {};
    if (action === "addBook") {
      if (!String(b.title || "").trim()) throw new Error("Введите название книги");
      target.portfolio.push({ section: BOOKS_SECTION, title: b.title, details: b.details || "", date: b.date || "" });
    } else {
      const i = target.portfolio.findIndex((x) => x.section === BOOKS_SECTION && x.title === b.title && (x.details || "") === (b.details || "") && (x.date || "") === (b.date || ""));
      if (i < 0) throw new Error("Книга не найдена. Обновите страницу.");
      target.portfolio.splice(i, 1);
    }
    return { ok: true, id: target.id, books: target.portfolio.filter((x) => x.section === BOOKS_SECTION) };
  }
  if (action === "setPhoto") {
    if (!isTeacher) throw new Error("Фото меняет только учитель или воспитатель");
    const id = payload.id;
    const target = D.students.find((x) => x.id === id);
    if (target) target.photo = payload.photo;
    return { ok: true, id, photo: payload.photo };
  }
  throw new Error("Недоступно");
}

function publicNames(students) {
  return students.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

// Список класса для выбора на странице входа (только ID и имена)
let classList = null;
async function loadClassList() {
  if (!classList) classList = await api("names");
  return classList;
}

// ---------- session ----------
function saveSession() {
  try {
    sessionStorage.setItem("creds", JSON.stringify(creds));
  } catch (e) {}
}
function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem("creds"));
  } catch (e) {
    return null;
  }
}

async function login(loginValue, pin, as) {
  creds = { login: loginValue, pin, as };
  const res = await api("login");
  DATA = res.data;
  state.user = res.role === "teacher" ? { role: "teacher", staff: res.staff || "Учитель" } : { role: res.role, id: res.id };
  saveSession();
}

function logout() {
  state = { user: null, tab: null, viewStudent: null, subjectFilter: "", loginAs: state.loginAs };
  DATA = null;
  creds = null;
  try {
    sessionStorage.removeItem("creds");
  } catch (e) {}
  render();
}

// ---------- rendering ----------
function render() {
  document.getElementById("class-name").textContent = DATA?.className || "";
  const userBox = document.getElementById("user-box");
  if (!state.user) {
    userBox.hidden = true;
    renderLogin();
    return;
  }
  userBox.hidden = false;
  if (state.user.role === "teacher") {
    document.getElementById("user-name").textContent = state.user.staff || "Учитель";
    if (state.viewStudent) renderStudent(findStudent(state.viewStudent), true);
    else renderTeacher();
  } else {
    const s = findStudent(state.user.id);
    document.getElementById("user-name").textContent = state.user.role === "parent" ? "Родитель · " + s.name : s.name;
    renderStudent(s, false);
  }
}

const LOGIN_ROLES = {
  student: {
    label: "Ученик",
    hint: "Выберите своё имя и введите PIN-код, который дал учитель.",
    login: "Ученик",
    pick: "Выберите своё имя",
    code: "PIN-код",
    codeInput: 'type="password" inputmode="numeric" autocomplete="current-password"',
  },
  parent: {
    label: "Родитель",
    hint: "Выберите своего ребёнка и введите номер телефона мамы или папы, который указан у учителя.",
    login: "Ваш ребёнок",
    pick: "Выберите ребёнка",
    code: "Телефон мамы или папы",
    codeInput: 'type="tel" inputmode="tel" autocomplete="tel" placeholder="8 700 123 45 67"',
  },
  teacher: {
    label: "Учитель",
    hint: "Выберите, кто вы, и введите свой PIN-код.",
    login: "Кто входит",
    pick: "Учитель или воспитатель",
    code: "PIN-код",
    codeInput: 'type="password" autocomplete="current-password"',
  },
};

function renderLogin() {
  const role = LOGIN_ROLES[state.loginAs] ? state.loginAs : "student";
  const R = LOGIN_ROLES[role];
  if (!classList) {
    loadClassList()
      .then(() => state.user || renderLogin())
      .catch((ex) => {
        const err = document.getElementById("login-error");
        if (err) err.textContent = "Не удалось загрузить список класса: " + ex.message;
      });
  }
  if (classList) document.getElementById("class-name").textContent = classList.className || "";
  // Логины никто не вводит: ученик и родитель выбирают имя, учитель — «Учитель» или «Воспитатель»
  const options =
    role === "teacher"
      ? (classList?.staff || []).map((x) => ({ id: x.login, name: x.label }))
      : classList?.students || [];
  const loginField = `<select id="login" required ${classList ? "" : "disabled"}>
        <option value="">${classList ? R.pick : "Загрузка списка…"}</option>
        ${options.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}
      </select>`;
  app.innerHTML = `
    <div class="login-banner">
      <div class="kicker">Білім-инновация лицей-интернаты</div>
      <div class="slogan">Сапалы білім —<br>саналы тәрбие</div>
      <img src="logo.png" alt="" onerror="this.remove()">
    </div>
    <div class="login-wrap card">
      <h2>Вход</h2>
      <div class="seg seg-wide" style="margin-bottom:12px">${Object.keys(LOGIN_ROLES)
        .map((k) => `<button type="button" class="seg-btn ${k === role ? "active role" : ""}" data-login-as="${k}">${LOGIN_ROLES[k].label}</button>`)
        .join("")}</div>
      <p class="muted small">${R.hint}</p>
      ${DEMO ? '<p class="small notice">Демо-режим: тестовые данные. Подключите Google Таблицу в config.js.</p>' : ""}
      <form id="login-form">
        <div class="field">
          <label for="login">${R.login}</label>
          ${loginField}
        </div>
        <div class="field">
          <label for="pin">${R.code}</label>
          <input id="pin" ${R.codeInput} required>
        </div>
        <div class="error" id="login-error"></div>
        <button class="btn btn-block" type="submit" id="login-btn">Войти</button>
      </form>
    </div>`;
  app.querySelectorAll("[data-login-as]").forEach((b) =>
    b.addEventListener("click", () => {
      state.loginAs = b.dataset.loginAs;
      renderLogin();
    })
  );
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("login-btn");
    const err = document.getElementById("login-error");
    btn.disabled = true;
    btn.textContent = "Загрузка…";
    err.textContent = "";
    try {
      await login(document.getElementById("login").value.trim(), document.getElementById("pin").value.trim(), role === "parent" ? "parent" : undefined);
      render();
    } catch (ex) {
      creds = null;
      err.textContent = ex.message;
      btn.disabled = false;
      btn.textContent = "Войти";
    }
  });
}

function tabsHtml(tabs) {
  return `<div class="tabs">${tabs
    .map(([k, label]) => `<button class="tab ${state.tab === k ? "active" : ""}" data-tab="${k}">${label}</button>`)
    .join("")}</div>`;
}
function bindTabs() {
  app.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      state.subjectFilter = "";
      render();
    })
  );
}

// ---------- student view ----------
function renderStudent(s, byTeacher) {
  const isParent = state.user.role === "parent";
  const tabs = [
    ["schedule", "📅 Расписание"],
    ["idp", "🎯 Цели (IDP)"],
    ["attendance", "✅ Посещаемость"],
    ["grades", "📊 Оценки"],
    ["portfolio", "📁 Портфолио"],
    ["olympiads", "🏅 Олимпиады"],
    ["exams", "📝 Экзамены"],
    ["books", "📖 Книги"],
    ["tests", "🧠 Тесты"],
  ];
  tabs.push(["resources", "📚 Ресурсы"]);
  if (!tabs.some(([k]) => k === state.tab)) state.tab = "schedule";
  const st = attendanceStats(s.id);

  let body = "";
  if (state.tab === "schedule") body = calendarHtml() + scheduleHtml(s.schedule || DATA.schedule);
  if (state.tab === "idp") body = idpHtml(s);
  if (state.tab === "attendance") body = studentAttendanceHtml(s);
  if (state.tab === "portfolio") body = portfolioHtml(s);
  if (state.tab === "olympiads") body = kvCardHtml("Олимпиады", s.olympiads);
  if (state.tab === "exams") body = kvCardHtml("Экзамены", s.exams);
  if (state.tab === "books") body = booksHtml(s);
  if (state.tab === "grades") body = gradesHtml(s);
  if (state.tab === "tests") body = testsHtml(s);
  if (state.tab === "resources") body = resourcesHtml();

  const phones = [["Мама", s.momPhone], ["Папа", s.dadPhone]].filter(([, p]) => p);
  app.innerHTML = `
    ${byTeacher ? `<button class="btn btn-ghost" id="back-btn" style="margin-bottom:14px">← Ко всем ученикам</button>` : ""}
    <div class="card">
      <div class="profile">
        ${avatarHtml(s, "avatar-lg")}
        <div class="profile-info">
          ${isParent ? '<div class="muted small">Страница родителя · ваш ребёнок</div>' : ""}
          <h2>${esc(s.name)}</h2>
          ${s.idp?.mentor ? `<div class="muted small">Наставник: ${esc(s.idp.mentor)}</div>` : ""}
          ${
            !byTeacher
              ? "" // фото меняют только учитель и воспитатель
              : `<div class="photo-actions">
                  <label class="btn btn-ghost">📷 ${s.photo ? "Изменить фото" : "Загрузить фото"}
                    <input type="file" id="photo-input" accept="image/*" hidden>
                  </label>
                  ${s.photo ? '<button class="btn btn-ghost" id="photo-delete">Удалить</button>' : ""}
                  <span class="small" id="photo-msg"></span>
                </div>`
          }
        </div>
      </div>
      ${(() => {
        const b = birthdayInfo(s);
        const o = olympiadHtml(s);
        if (!b && !o) return "";
        return `<div class="highlights">
          ${b ? `<div class="hl ${b.days === 0 ? "hl-today" : ""}"><span class="hl-icon">🎂</span><div><div class="eyebrow">День рождения</div><div>${esc(birthdayText(b))}</div></div></div>` : ""}
          ${o ? `<div class="hl"><span class="hl-icon">🏅</span><div><div class="eyebrow">Олимпиада</div><div>${o}</div></div></div>` : ""}
        </div>`;
      })()}
      ${
        byTeacher
          ? `<div class="small" style="margin-top:8px">Родители: ${
              phones.length ? phones.map(([who, p]) => `${who} <a href="tel:${esc(p.replace(/[^\d+]/g, ""))}">${esc(p)}</a>`).join(" · ") : '<span class="muted">телефоны не указаны</span>'
            }</div>`
          : ""
      }
    </div>
    <div class="stats">
      <div class="stat blue"><div class="stat-value">${st.total ? st.rate + "%" : "—"}</div><div class="stat-label">Посещаемость</div></div>
      <div class="stat red"><div class="stat-value">${st.absent}</div><div class="stat-label">Отсутствовал</div></div>
      <div class="stat orange"><div class="stat-value">${st.late}</div><div class="stat-label">Опозданий</div></div>
      <div class="stat green"><div class="stat-value">${idpProgress(s)}%</div><div class="stat-label">Выполнение IDP</div></div>
    </div>
    ${isParent ? recentMissesHtml(s) : ""}
    ${tabsHtml(tabs)}
    ${body}`;
  bindTabs();
  if (byTeacher)
    document.getElementById("back-btn").addEventListener("click", () => {
      state.viewStudent = null;
      state.tab = "summary";
      render();
    });
  bindSubjectFilter();
  bindPeriods();
  if (byTeacher) bindPhoto(s); // фото меняют только учитель и воспитатель
  if (state.tab === "books") bindBooks(s);
  if (state.tab === "idp") bindIdp(s);
}

// ---------- фото ученика ----------
function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
function avatarHtml(s, cls = "") {
  return s.photo
    ? `<img class="avatar ${cls}" src="${esc(s.photo)}" alt="">`
    : `<span class="avatar avatar-empty ${cls}">${esc(initials(s.name))}</span>`;
}

// Обрезает фото до квадрата 256×256 и сжимает в JPEG так, чтобы поместилось в ячейку таблицы
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 256;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      for (const q of [0.85, 0.75, 0.6, 0.45, 0.3]) {
        const data = canvas.toDataURL("image/jpeg", q);
        if (data.length <= 45000) return resolve(data);
      }
      reject(new Error("Фото слишком большое"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось открыть изображение"));
    };
    img.src = url;
  });
}

function bindPhoto(s) {
  const msg = document.getElementById("photo-msg");
  const save = async (photo) => {
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const res = await api("setPhoto", { id: s.id, photo });
      s.photo = res.photo;
      render();
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
    }
  };
  document.getElementById("photo-input")?.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      await save(await resizePhoto(file));
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
    }
  });
  document.getElementById("photo-delete")?.addEventListener("click", () => {
    if (confirm("Удалить фото?")) save("");
  });
}

// Для родителя: последние отсутствия и опоздания
function recentMissesHtml(s) {
  const misses = lessonsSorted()
    .reverse()
    .map((l) => ({ l, st: statusFor(l, s.id) }))
    .filter((x) => x.st !== "present")
    .slice(0, 5);
  return `<div class="card">
    <h3>Последние отсутствия и опоздания на этюде</h3>
    ${
      misses.length
        ? `<div class="table-wrap"><table>${misses
            .map(({ l, st }) => `<tr><td>${fmtDate(l.date)}</td>${subjects().length > 1 ? `<td>${esc(l.subject)}</td>` : ""}<td><span class="pill ${st}">${STATUS_LABEL[st]}</span></td></tr>`)
            .join("")}</table></div>`
        : '<p class="muted" style="margin:0">Отсутствий и опозданий нет 👍</p>'
    }
  </div>`;
}

// «Алдағы күнтізбе» — ближайшие события; all = показать и прошедшие
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
function dayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}
function calendarHtml(all = false) {
  const today = todayIso();
  const events = (DATA.calendar || []).filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.start));
  const list = all ? events : events.filter((e) => (e.end || e.start) >= today);
  if (!list.length) return "";
  const days = (iso) => Math.round((new Date(iso + "T12:00:00") - new Date(today + "T12:00:00")) / 86400000);
  return `<div class="card"><div class="eyebrow">Жоспар</div><h2>${all ? "Күнтізбе" : "Алдағы күнтізбе"}</h2><div class="events">${list
    .map((e) => {
      const end = e.end || e.start;
      const past = end < today;
      const now = e.start <= today && today <= end;
      const when = past ? "прошло" : now ? "идёт сейчас" : days(e.start) === 1 ? "завтра" : `через ${days(e.start)} дн.`;
      return `<div class="event ${past ? "past" : ""}">
        <div class="event-date">${dayLabel(e.start)}${end !== e.start ? " – " + dayLabel(end) : ""}</div>
        <div class="event-title">${esc(e.title)}</div>
        <span class="badge ${now ? "now" : ""}">${when}</span>
      </div>`;
    })
    .join("")}</div></div>`;
}

function scheduleHtml(schedule) {
  if (!schedule || !schedule.length) return '<div class="card"><h2>Расписание на неделю</h2><p class="muted">Расписание пока не добавлено.</p></div>';
  const today = new Date().getDay();
  return `<div class="card"><h2>Расписание на неделю</h2><div class="week">${schedule
    .map((d) => {
      const isToday = DAY_INDEX[d.day] === today;
      return `<div class="day ${isToday ? "today" : ""}">
        <div class="day-name">${esc(d.day)} ${isToday ? '<span class="badge">Сегодня</span>' : ""}</div>
        ${d.lessons
          .map(
            (l, i) => `<div class="lesson">
              <div class="lesson-time">${esc(l.num || i + 1)} урок · ${esc(l.time)}</div>
              <div class="lesson-subj">${esc(l.subject)}</div>
              ${l.room ? `<div class="muted small">Кабинет: ${esc(l.room)}</div>` : ""}
              ${l.teacher ? `<div class="muted small">👤 ${esc(l.teacher)}</div>` : ""}
            </div>`
          )
          .join("")}
      </div>`;
    })
    .join("")}</div></div>`;
}

function idpHtml(s) {
  const idp = s.idp || {};
  const goals = idp.goals || [];
  const canEdit = state.user.role !== "parent"; // ученик — свои цели, учитель — любому ученику
  const isStaff = state.user.role === "teacher";
  const check = (checked, attrs) =>
    canEdit
      ? `<input type="checkbox" class="idp-check" ${checked ? "checked" : ""} ${attrs}>`
      : `<span>${checked ? "☑" : "☐"}</span>`;
  return `
    <div class="card">
      <h2>Цели и план развития (IDP)</h2>
      ${
        isStaff
          ? `<form class="idp-info" id="idp-info-form">
              <label>Наставник<input id="idp-mentor" maxlength="80" value="${esc(idp.mentor || "")}"></label>
              <label>Сильные стороны<input id="idp-strengths" maxlength="300" value="${esc(idp.strengths || "")}"></label>
              <label class="wide">Комментарий учителя<textarea id="idp-comment" maxlength="500" rows="2">${esc(idp.comment || "")}</textarea></label>
              <div class="save-bar" style="position:static;border:none;padding:0"><button class="btn btn-ghost" type="submit">Сохранить</button><span class="small" id="idp-info-msg"></span></div>
            </form>`
          : `<div class="info-grid" style="margin-bottom:16px">
              <div><div class="muted small">Наставник</div><div>${esc(idp.mentor || "—")}</div></div>
              <div><div class="muted small">Сильные стороны</div><div>${esc(idp.strengths || "—")}</div></div>
              <div><div class="muted small">Общий прогресс</div><div><b>${idpProgress(s)}%</b></div></div>
            </div>`
      }
      ${goals.length ? "" : `<p class="muted">${canEdit ? "Целей пока нет. Добавьте первую цель ниже." : "Цели пока не добавлены."}</p>`}
      ${goals
        .map((g, gi) => {
          const p = goalProgress(g);
          const steps = g.steps || [];
          return `<div class="goal">
            <div class="goal-head">
              <div>
                <div class="goal-title">${esc(g.title)}</div>
                <div class="muted small">${esc(g.area || "")}</div>
              </div>
              <div class="small">${g.deadline ? `Срок: <b>${esc(fmtDate(g.deadline))}</b>` : ""}${
                canEdit ? ` <button class="book-del" data-goal-del="${gi}" title="Удалить цель">✕</button>` : ""
              }</div>
            </div>
            ${
              steps.length
                ? `<div class="progress ${p === 100 ? "done" : ""}"><span style="width:${p}%"></span></div><div class="small muted">Выполнено: ${p}%</div>
                   <ul class="steps">${steps
                     .map((st, si) => `<li class="${st.done ? "done" : ""}"><label>${check(st.done, `data-goal="${gi}" data-step="${si}"`)} ${esc(st.text)}</label></li>`)
                     .join("")}</ul>`
                : canEdit
                ? `<label class="small goal-done">${check(g.done, `data-goal="${gi}"`)} ${g.done ? "Выполнено" : "Отметить как выполненную"}</label>`
                : `<div class="small" style="margin-top:6px">${g.done ? '<span class="pill present">☑ Выполнено</span>' : '<span class="pill neutral">☐ В процессе</span>'}</div>`
            }
          </div>`;
        })
        .join("")}
      ${
        canEdit
          ? `<form class="book-form" id="goal-form">
              <h3>➕ Новая цель</h3>
              <div class="book-fields">
                <input id="goal-title" maxlength="150" placeholder="Цель, например: Английский B2" required>
                <input id="goal-area" maxlength="60" placeholder="Направление (предмет, спорт…)">
                <input id="goal-deadline" maxlength="40" placeholder="Срок, например: до конца 9 класса">
              </div>
              <textarea id="goal-steps" rows="3" maxlength="1500" placeholder="Шаги к цели — каждый с новой строки (можно оставить пустым)"></textarea>
              <div class="save-bar" style="position:static;border:none;padding:6px 0 0">
                <button class="btn" type="submit" id="goal-save">Добавить цель</button>
                <span class="small" id="goal-msg"></span>
              </div>
            </form>`
          : ""
      }
      ${!isStaff && idp.comment ? `<div class="card" style="background:var(--accent-soft);border:none;margin:14px 0 0"><b>Комментарий учителя:</b> ${esc(idp.comment)}</div>` : ""}
    </div>`;
}

function bindIdp(s) {
  if (state.user.role === "parent") return;
  const msgEl = () => document.getElementById("goal-msg");
  const show = (text, ok) => {
    const m = msgEl();
    if (m) {
      m.textContent = text;
      m.style.color = ok ? "var(--green)" : "var(--red)";
    }
  };
  const run = async (action, payload, okText) => {
    show("Сохранение…", true);
    try {
      const res = await api(action, { id: s.id, ...payload });
      s.idp = { ...(s.idp || {}), goals: res.goals };
      render();
      if (okText) show(okText, true);
    } catch (ex) {
      render();
      show("Ошибка: " + ex.message, false);
    }
  };
  const goals = (s.idp && s.idp.goals) || [];
  app.querySelectorAll(".idp-check").forEach((c) =>
    c.addEventListener("change", () => {
      const g = goals[Number(c.dataset.goal)];
      const step = c.dataset.step !== undefined ? g.steps[Number(c.dataset.step)].text : "";
      run("setGoalDone", { title: g.title, step, done: c.checked });
    })
  );
  app.querySelectorAll("[data-goal-del]").forEach((b) =>
    b.addEventListener("click", () => {
      const g = goals[Number(b.dataset.goalDel)];
      if (g && confirm(`Удалить цель «${g.title}»?`)) run("deleteGoal", { title: g.title }, "Цель удалена");
    })
  );
  document.getElementById("goal-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const goal = {
      title: document.getElementById("goal-title").value.trim(),
      area: document.getElementById("goal-area").value.trim(),
      deadline: document.getElementById("goal-deadline").value.trim(),
      steps: document.getElementById("goal-steps").value.split("\n").map((x) => x.trim()).filter(Boolean),
    };
    if (!goal.title) return;
    document.getElementById("goal-save").disabled = true;
    run("addGoal", { goal }, "Цель добавлена ✓");
  });
  document.getElementById("idp-info-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("idp-info-msg");
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const info = {
        mentor: document.getElementById("idp-mentor").value.trim(),
        strengths: document.getElementById("idp-strengths").value.trim(),
        comment: document.getElementById("idp-comment").value.trim(),
      };
      const res = await api("setIdpInfo", { id: s.id, info });
      s.idp = { ...(s.idp || {}), ...res.info };
      msg.textContent = "Сохранено ✓";
      msg.style.color = "var(--green)";
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
    }
  });
}

// ---------- портфолио, олимпиады, тесты, мероприятия, ресурсы ----------
const PORTFOLIO_ORDER = ["Личное", "Оценки", "Достижения", "Сертификаты", "Хобби", "Прочитанные книги", "Языки", "Поездки", "Цели на будущее"];
const PORTFOLIO_ICON = {
  "Личное": "👤",
  "Оценки": "📚",
  "Достижения": "🏆",
  "Сертификаты": "📜",
  "Хобби": "⚽",
  "Прочитанные книги": "📖",
  "Языки": "🗣️",
  "Поездки": "✈️",
  "Цели на будущее": "🎓",
};

function groupBy(list, key) {
  const map = new Map();
  list.forEach((x) => {
    if (!map.has(x[key])) map.set(x[key], []);
    map.get(x[key]).push(x);
  });
  return map;
}

// ---------- табель (оценки) ----------
const GRADE_COLS = [["q1", "1 тоқсан"], ["q2", "2 тоқсан"], ["q3", "3 тоқсан"], ["q4", "4 тоқсан"], ["year", "Жылдық"], ["exam", "Емтихан"], ["final", "Қорытынды"]];
const GRADE_INFO_ROWS = ["Тәртібі", "Сабақ саны", "Қатыспаған сабақ"]; // не предметы: поведение и уроки

// Учебные периоды (например «8А · 2025/2026»), новые — первыми
function gradePeriods(list) {
  return [...new Set(list.map((g) => g.period))].sort().reverse();
}
function currentPeriod(periods) {
  return periods.includes(state.gradePeriod) ? state.gradePeriod : periods[0];
}
function periodChips(periods, current) {
  if (periods.length < 2) return "";
  return `<div class="tabs">${periods
    .map((p) => `<button class="tab ${p === current ? "active" : ""}" data-period="${esc(p)}">${esc(p)}</button>`)
    .join("")}</div>`;
}
function bindPeriods() {
  app.querySelectorAll("[data-period]").forEach((b) =>
    b.addEventListener("click", () => {
      state.gradePeriod = b.dataset.period;
      render();
    })
  );
}
function gradeCell(v) {
  const t = cellValue(v);
  if (!t) return '<span class="muted">·</span>';
  return /^[2-5]$/.test(t) ? `<span class="grade g${t}">${t}</span>` : `<span class="small muted">${esc(t)}</span>`;
}
// Итог по периоду: средний итоговый балл и статус (отличник / хорошист / есть тройки)
function gradeSummary(rows) {
  const nums = rows
    .filter((g) => !GRADE_INFO_ROWS.includes(g.subject))
    .map((g) => cellValue(g.final) || cellValue(g.year))
    .filter((v) => /^[2-5]$/.test(v))
    .map(Number);
  if (!nums.length) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const min = Math.min(...nums);
  const status = min === 5 ? "Үздік · отличник" : min === 4 ? "Екпінді · хорошист" : min === 3 ? "Есть тройки" : "Есть двойки";
  const missed = rows.find((g) => g.subject === "Қатыспаған сабақ");
  const missedSum = missed ? ["q1", "q2", "q3", "q4"].reduce((a, k) => a + (Number(cellValue(missed[k])) || 0), 0) : null;
  return { avg, status, min, fours: nums.filter((n) => n === 4).length, threes: nums.filter((n) => n <= 3).length, missedSum };
}

function gradesHtml(s) {
  const all = s.grades || [];
  if (!all.length) return '<div class="card"><h2>Оценки</h2><p class="muted">Табель пока не добавлен.</p></div>';
  const periods = gradePeriods(all);
  const period = currentPeriod(periods);
  const rows = all.filter((g) => g.period === period);
  const subjects = rows.filter((g) => !GRADE_INFO_ROWS.includes(g.subject));
  const info = rows.filter((g) => GRADE_INFO_ROWS.includes(g.subject));
  const sum = gradeSummary(rows);
  const hasExam = rows.some((g) => cellValue(g.exam));
  const cols = GRADE_COLS.filter(([k]) => k !== "exam" || hasExam);
  return `<div class="card">
    <div class="eyebrow">Үлгерім табелі</div>
    <h2>Оценки · ${esc(period)}</h2>
    ${periodChips(periods, period)}
    ${
      sum
        ? `<div class="highlights" style="margin:0 0 14px">
            <div class="hl"><span class="hl-icon">📊</span><div><div class="eyebrow">Средний балл</div><div><b>${sum.avg.toFixed(2)}</b></div></div></div>
            <div class="hl ${sum.min === 5 ? "hl-today" : ""}"><span class="hl-icon">${sum.min === 5 ? "🏆" : "📘"}</span><div><div class="eyebrow">Итог года</div><div><b>${esc(sum.status)}</b></div></div></div>
            ${sum.missedSum !== null ? `<div class="hl"><span class="hl-icon">🕒</span><div><div class="eyebrow">Пропущено уроков за год</div><div><b>${sum.missedSum}</b></div></div></div>` : ""}
          </div>`
        : ""
    }
    <div class="table-wrap"><table class="grades">
      <tr><th>Пән</th>${cols.map(([, l]) => `<th class="num">${l}</th>`).join("")}</tr>
      ${subjects.map((g) => `<tr><td>${esc(g.subject)}</td>${cols.map(([k]) => `<td class="num">${gradeCell(g[k])}</td>`).join("")}</tr>`).join("")}
      ${info
        .map((g) => `<tr class="info-row"><td>${esc(g.subject)}</td>${cols.map(([k]) => `<td class="num small">${esc(cellValue(g[k]) || "")}</td>`).join("")}</tr>`)
        .join("")}
    </table></div>
    <p class="small muted">ЕСП — есептелді (зачтено), Үлг. — үлгілі (примерное поведение).</p>
  </div>`;
}

function gradesTableHtml() {
  const periods = gradePeriods(DATA.students.flatMap((s) => s.grades || []));
  if (!periods.length) return '<div class="card"><h2>Оценки</h2><p class="muted">Табели пока не добавлены.</p></div>';
  const period = currentPeriod(periods);
  const rows = DATA.students
    .map((s) => ({ s, sum: gradeSummary((s.grades || []).filter((g) => g.period === period)) }))
    .sort((a, b) => (b.sum ? b.sum.avg : -1) - (a.sum ? a.sum.avg : -1) || a.s.name.localeCompare(b.s.name, "ru"));
  const count = (st) => rows.filter((r) => r.sum && r.sum.status === st).length;
  return `<div class="card"><div class="eyebrow">Үлгерім</div><h2>Оценки класса · ${esc(period)}</h2>
    ${periodChips(periods, period)}
    <p class="small">🏆 Отличников: <b>${count("Үздік · отличник")}</b> · Хорошистов: <b>${count("Екпінді · хорошист")}</b> · С тройками: <b>${count("Есть тройки") + count("Есть двойки")}</b></p>
    <div class="table-wrap"><table>
      <tr><th>Ученик</th><th class="num">Средний</th><th>Итог</th><th class="num">«4»</th><th class="num">«3» и ниже</th><th class="num">Пропущено уроков</th></tr>
      ${rows
        .map(({ s, sum }) =>
          sum
            ? `<tr><td><span class="name-cell">${avatarHtml(s, "avatar-sm")}${studentLink(s)}</span></td><td class="num"><b>${sum.avg.toFixed(2)}</b></td>
                <td>${sum.min === 5 ? '<span class="pill gold">отличник</span>' : sum.min === 4 ? '<span class="pill excused">хорошист</span>' : '<span class="pill absent">есть «3»</span>'}</td>
                <td class="num">${sum.fours || '<span class="muted">0</span>'}</td><td class="num">${sum.threes ? `<b style="color:var(--red)">${sum.threes}</b>` : '<span class="muted">0</span>'}</td>
                <td class="num">${sum.missedSum ?? "—"}</td></tr>`
            : `<tr><td><span class="name-cell">${avatarHtml(s, "avatar-sm")}${studentLink(s)}</span></td><td class="num muted" colspan="5">нет табеля за этот год</td></tr>`
        )
        .join("")}
    </table></div>
    <p class="muted small">Нажмите на имя, чтобы открыть табель ученика по четвертям.</p></div>`;
}

// Прочитанные книги берутся из портфолио (раздел «Прочитанные книги»): название, автор/детали, дата
const BOOKS_SECTION = "Прочитанные книги";
function booksOf(s) {
  return (s.portfolio || []).filter((x) => x.section === BOOKS_SECTION);
}
const MONTHS_FULL = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
function booksHtml(s) {
  const books = booksOf(s);
  const canEdit = state.user.role !== "parent"; // ученик — свои книги, учитель — любому ученику
  const now = new Date();
  return `<div class="card">
    <div class="eyebrow">Оқылған кітаптар</div>
    <h2>Прочитанные книги</h2>
    <div class="highlights" style="margin:0 0 14px">
      <div class="hl"><span class="hl-icon">📚</span><div><div class="eyebrow">Прочитано</div><div><b>${books.length}</b> ${plural(books.length, "книга", "книги", "книг")}</div></div></div>
    </div>
    ${
      books.length
        ? `<ol class="books">${books
            .map(
              (b, i) => `<li><span class="book-title">${esc(b.title)}</span>${b.details ? ` <span class="muted">— ${esc(b.details)}</span>` : ""}${
                b.date ? ` <span class="badge">${esc(b.date)}</span>` : ""
              }${canEdit ? ` <button class="book-del" data-book-del="${i}" title="Удалить">✕</button>` : ""}</li>`
            )
            .join("")}</ol>`
        : `<p class="muted">${canEdit ? "Список пока пуст. Добавьте первую прочитанную книгу." : "Список пока пуст."}</p>`
    }
    ${
      canEdit
        ? `<form class="book-form" id="book-form">
            <h3>➕ Добавить прочитанную книгу</h3>
            <div class="book-fields">
              <input id="book-title" maxlength="150" placeholder="Название книги" required>
              <input id="book-author" maxlength="100" placeholder="Автор">
              <input id="book-date" maxlength="40" placeholder="Когда прочитал" value="${MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}">
            </div>
            <div class="save-bar" style="position:static;border:none;padding:6px 0 0">
              <button class="btn" type="submit" id="book-save">Добавить</button>
              <span class="small" id="book-msg"></span>
            </div>
          </form>`
        : ""
    }
  </div>`;
}

function bindBooks(s) {
  const form = document.getElementById("book-form");
  if (!form) return;
  const msg = document.getElementById("book-msg");
  const run = async (action, book, okText) => {
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const res = await api(action, { id: s.id, book });
      // обновляем только раздел книг в портфолио ученика
      s.portfolio = (s.portfolio || []).filter((x) => x.section !== BOOKS_SECTION).concat(res.books);
      render();
      const m = document.getElementById("book-msg");
      if (m) {
        m.textContent = okText;
        m.style.color = "var(--green)";
      }
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
    }
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const book = {
      title: document.getElementById("book-title").value.trim(),
      details: document.getElementById("book-author").value.trim(),
      date: document.getElementById("book-date").value.trim(),
    };
    if (!book.title) return;
    document.getElementById("book-save").disabled = true;
    run("addBook", book, "Книга добавлена ✓");
  });
  app.querySelectorAll("[data-book-del]").forEach((b) =>
    b.addEventListener("click", () => {
      const book = booksOf(s)[Number(b.dataset.bookDel)];
      if (book && confirm(`Удалить «${book.title}» из списка?`)) {
        run("deleteBook", { title: book.title, details: book.details, date: book.date }, "Книга удалена");
      }
    })
  );
}
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
function booksTableHtml() {
  const rows = DATA.students
    .map((s) => ({ s, books: booksOf(s) }))
    .sort((a, b) => b.books.length - a.books.length || a.s.name.localeCompare(b.s.name, "ru"));
  return `<div class="card"><h2>Прочитанные книги</h2><div class="table-wrap"><table>
    <tr><th>Ученик</th><th class="num">Книг</th><th>Последние книги</th></tr>
    ${rows
      .map(
        ({ s, books }) => `<tr><td>${studentLink(s)}</td><td class="num"><b>${books.length}</b></td><td class="wrap small">${books.length ? books.slice(-3).map((b) => esc(b.title)).join(" · ") : '<span class="muted">—</span>'}</td></tr>`
      )
      .join("")}
  </table></div><p class="muted small">Книги добавляются в Google Таблице: лист «Портфолио», раздел «Прочитанные книги».</p></div>`;
}

function portfolioHtml(s) {
  const items = (s.portfolio || []).filter((x) => x.section !== BOOKS_SECTION);
  if (!items.length) return '<div class="card"><h2>Портфолио</h2><p class="muted">Портфолио пока не заполнено.</p></div>';
  const groups = groupBy(items, "section");
  const order = [...PORTFOLIO_ORDER.filter((k) => groups.has(k)), ...[...groups.keys()].filter((k) => !PORTFOLIO_ORDER.includes(k))];
  const section = (name) => {
    const list = groups.get(name);
    let inner;
    if (name === "Личное") {
      inner = `<div class="info-grid">${list
        .map((x) => `<div><div class="muted small">${esc(x.title)}</div><div>${esc(x.details || "—")}</div></div>`)
        .join("")}</div>`;
    } else if (name === "Оценки" || name === "Языки") {
      inner = `<div class="chips">${list
        .map((x) => `<span class="chip">${esc(x.title)} <b>${esc(x.details)}</b></span>`)
        .join("")}</div>`;
    } else {
      inner = `<ul class="plist">${list
        .map(
          (x) => `<li><span>${esc(x.title)}</span>${x.details ? ` <span class="muted">— ${esc(x.details)}</span>` : ""}${
            x.date ? ` <span class="badge">${esc(x.date)}</span>` : ""
          }</li>`
        )
        .join("")}</ul>`;
    }
    return `<div class="psection"><h3>${PORTFOLIO_ICON[name] || "•"} ${esc(name)}</h3>${inner}</div>`;
  };
  return `<div class="card"><h2>Портфолио</h2>${order.map(section).join("")}</div>`;
}

// Пустые значения из таблицы («Nope», «None», «-») показываем как прочерк
function cellValue(v) {
  const t = String(v ?? "").trim();
  return !t || /^(nope|none|-|—)$/i.test(t) ? "" : t;
}
function valueHtml(v) {
  const t = cellValue(v);
  if (!t) return '<span class="muted">—</span>';
  const medal = /gold/i.test(t) ? "gold" : /silver/i.test(t) ? "silver" : /bronze/i.test(t) ? "bronze" : "";
  return medal ? `<span class="pill ${medal}">${esc(t)}</span>` : esc(t);
}

function kvCardHtml(title, items, extra = "") {
  const list = items || [];
  return `<div class="card"><h2>${esc(title)}</h2>${
    list.length
      ? `<div class="table-wrap"><table class="kv">${list
          .map((x) => `<tr><th>${esc(x.name)}</th><td class="wrap">${valueHtml(x.value)}</td></tr>`)
          .join("")}</table></div>`
      : '<p class="muted">Данных пока нет.</p>'
  }${extra}</div>`;
}

function testsHtml(s) {
  const notes = (DATA.resources || []).filter((x) => x.where === "Тесты");
  const extra = notes.length
    ? `<h3 style="margin-top:18px">Пояснения</h3>${[...groupBy(notes, "section")]
        .map(([sec, list]) => `<div class="note"><b>${esc(sec)}</b><br>${list.map((x) => esc(x.text)).join("<br>")}</div>`)
        .join("")}`
    : "";
  return kvCardHtml("Результаты тестов", s.tests, extra);
}

function resourcesHtml() {
  const list = (DATA.resources || []).filter((x) => x.where !== "Тесты");
  if (!list.length) return '<div class="card"><h2>Ресурсы</h2><p class="muted">Ресурсы пока не добавлены.</p></div>';
  return `<div class="card"><h2>Полезные ресурсы</h2><div class="table-wrap"><table class="kv">${[...groupBy(list, "section")]
    .map(([sec, items]) => `<tr><th>${esc(sec)}</th><td class="wrap">${items.map((x) => linkify(x.text)).join("<br>")}</td></tr>`)
    .join("")}</table></div></div>`;
}

// Делает кликабельными адреса сайтов вида example.com
function linkify(text) {
  return esc(text).replace(/\b((?:https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|kz|ru|io|uk)(?:\/[^\s;,]*)?)/gi, (m) => {
    const href = /^https?:/i.test(m) ? m : "https://" + m;
    return `<a href="${href}" target="_blank" rel="noopener">${m}</a>`;
  });
}

function subjectSelectHtml() {
  if (subjects().length <= 1) return ""; // этюд один — фильтр не нужен
  return `<select id="subject-filter">
    <option value="">Все этюды</option>
    ${subjects().map((x) => `<option ${x === state.subjectFilter ? "selected" : ""}>${esc(x)}</option>`).join("")}
  </select>`;
}
function bindSubjectFilter() {
  const sel = document.getElementById("subject-filter");
  if (sel)
    sel.addEventListener("change", () => {
      state.subjectFilter = sel.value;
      render();
    });
}

function studentAttendanceHtml(s) {
  const f = state.subjectFilter;
  const lessons = lessonsSorted().filter((l) => !f || l.subject === f).reverse();
  const st = attendanceStats(s.id, f);
  const bySubject = subjects().map((subj) => [subj, attendanceStats(s.id, subj)]);
  const multi = subjects().length > 1; // если этюд один, разбивка по этюдам не нужна
  return `
    ${multi ? `<div class="card">
      <h2>Посещаемость этюдов</h2>
      <div class="table-wrap"><table>
        <tr><th>Этюд</th><th class="num">Всего</th><th class="num">Был</th><th class="num">Отсутствовал</th><th class="num">Опоздал</th><th class="num">Уваж.</th><th class="num">%</th></tr>
        ${bySubject
          .map(
            ([subj, x]) => `<tr><td>${esc(subj)}</td><td class="num">${x.total}</td><td class="num">${x.present}</td>
            <td class="num">${x.absent}</td><td class="num">${x.late}</td><td class="num">${x.excused}</td><td class="num"><b>${x.rate}%</b></td></tr>`
          )
          .join("")}
      </table></div>
    </div>` : ""}
    <div class="card">
      <h2>История этюдов</h2>
      <div class="filters">${subjectSelectHtml()}
        <span class="muted small" style="align-self:center">Этюдов: ${st.total} · отсутствовал: ${st.absent} · опоздал: ${st.late} · уваж. причина: ${st.excused}</span>
      </div>
      <div class="table-wrap"><table>
        <tr><th>Дата</th>${multi ? "<th>Этюд</th>" : ""}<th>Статус</th></tr>
        ${lessons
          .map((l) => {
            const status = statusFor(l, s.id);
            return `<tr><td>${fmtDate(l.date)}</td>${multi ? `<td>${esc(l.subject)}</td>` : ""}<td><span class="pill ${status}">${STATUS_LABEL[status]}</span></td></tr>`;
          })
          .join("")}
      </table></div>
    </div>`;
}

// ---------- teacher view ----------
function renderTeacher() {
  const tabs = [
    ["summary", "👥 Сводка"],
    ["mark", "✏️ Отметить этюд"],
    ["journal", "📋 Журнал"],
    ["grades-all", "📊 Оценки"],
    ["idp-all", "🎯 Цели всех"],
    ["olympiads-all", "🏅 Олимпиады"],
    ["exams-all", "📝 Экзамены"],
    ["books-all", "📖 Книги"],
    ["tests-all", "🧠 Тесты"],
    ["schedule", "📅 Расписание"],
    ["resources", "📚 Ресурсы"],
  ];
  if (!tabs.some(([k]) => k === state.tab)) state.tab = "summary";

  const all = DATA.students.map((s) => ({ s, st: attendanceStats(s.id, state.subjectFilter) }));
  const totalLessons = new Set(DATA.attendance.map((l) => l.date + l.subject)).size;
  const avgRate = Math.round(all.reduce((a, x) => a + attendanceStats(x.s.id).rate, 0) / (all.length || 1));
  const totalAbs = all.reduce((a, x) => a + attendanceStats(x.s.id).absent, 0);

  let body = "";
  if (state.tab === "summary") body = summaryHtml(all);
  if (state.tab === "mark") body = markHtml();
  if (state.tab === "journal") body = journalHtml();
  if (state.tab === "idp-all") body = idpAllHtml();
  if (state.tab === "schedule") body = calendarHtml(true) + scheduleHtml(DATA.schedule);
  if (state.tab === "olympiads-all") body = wideTableHtml("Олимпиады", "olympiads");
  if (state.tab === "exams-all") body = wideTableHtml("Экзамены", "exams");
  if (state.tab === "books-all") body = booksTableHtml();
  if (state.tab === "grades-all") body = gradesTableHtml();
  if (state.tab === "tests-all") body = wideTableHtml("Результаты тестов", "tests");
  if (state.tab === "resources") body = resourcesHtml();

  app.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat-value">${DATA.students.length}</div><div class="stat-label">Учеников</div></div>
      <div class="stat"><div class="stat-value">${totalLessons}</div><div class="stat-label">Проведено этюдов</div></div>
      <div class="stat blue"><div class="stat-value">${totalLessons ? avgRate + "%" : "—"}</div><div class="stat-label">Средняя посещаемость</div></div>
      <div class="stat red"><div class="stat-value">${totalAbs}</div><div class="stat-label">Всего отсутствий</div></div>
    </div>
    ${tabsHtml(tabs)}
    ${body}`;
  bindTabs();
  bindSubjectFilter();
  bindPeriods();
  if (state.tab === "mark") bindMark();
  app.querySelectorAll("[data-student]").forEach((b) =>
    b.addEventListener("click", () => {
      state.viewStudent = b.dataset.student;
      state.tab = { "books-all": "books", "grades-all": "grades" }[state.tab] || "attendance";
      state.subjectFilter = "";
      render();
    })
  );
  const sortSel = document.getElementById("sort");
  if (sortSel)
    sortSel.addEventListener("change", () => {
      state.sort = sortSel.value;
      render();
    });
}

function studentLink(s) {
  return `<button class="btn-link" data-student="${esc(s.id)}">${esc(s.name)}</button>`;
}

// Таблица «ученик × показатель» для широких листов (олимпиады, тесты)
function wideTableHtml(title, key) {
  const cols = [...new Set(DATA.students.flatMap((s) => (s[key] || []).map((x) => x.name)))];
  if (!cols.length) return `<div class="card"><h2>${esc(title)}</h2><p class="muted">Данных пока нет.</p></div>`;
  return `<div class="card"><h2>${esc(title)}</h2><div class="table-wrap"><table>
    <tr><th>Ученик</th>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>
    ${DATA.students
      .map((s) => {
        const map = Object.fromEntries((s[key] || []).map((x) => [x.name, x.value]));
        return `<tr><td>${studentLink(s)}</td>${cols.map((c) => `<td class="wrap">${valueHtml(map[c])}</td>`).join("")}</tr>`;
      })
      .join("")}
  </table></div></div>`;
}

// Ближайшие дни рождения (из портфолио: Личное → Дата рождения)
// День рождения из портфолио (Личное → Дата рождения): дата, сколько исполнится, через сколько дней
function birthdayInfo(s) {
  const item = (s.portfolio || []).find((x) => x.section === "Личное" && /^(дата рождения|туған күн)/i.test(x.title));
  const m = item && String(item.details).match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?/);
  if (!m) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), m[2] - 1, m[1]);
  if (next < today) next = new Date(today.getFullYear() + 1, m[2] - 1, m[1]);
  const days = Math.round((next - today) / 86400000);
  const age = m[3] ? next.getFullYear() - Number(m[3]) : null;
  const date = `${String(m[1]).padStart(2, "0")}.${String(m[2]).padStart(2, "0")}`;
  return { s, next, days, age, date, full: m[3] ? `${date}.${m[3]}` : date };
}
function birthdayText(b) {
  if (!b) return "";
  if (b.days === 0) return `🎉 Сегодня день рождения${b.age ? ` — ${b.age} лет` : ""}!`;
  return `${b.full}${b.age ? ` · исполнится ${b.age} лет через ${b.days} дн.` : ` · через ${b.days} дн.`}`;
}

// Олимпиадный предмет ученика (сначала текущего года); результаты — во вкладке «Олимпиады»
function olympiadSubject(s) {
  const items = (s.olympiads || []).filter((x) => cellValue(x.value));
  const subjectOf = (list) => list.find((x) => /предмет|пән|^olympiad$/i.test(x.name));
  const subject = subjectOf(items.filter((x) => !/^\d+\s*кл/i.test(x.name))) || subjectOf(items);
  return subject ? cellValue(subject.value) : "";
}
function olympiadHtml(s) {
  const subject = olympiadSubject(s);
  return subject ? `<b>${esc(subject)}</b>` : "";
}

function birthdaysHtml() {
  const list = DATA.students
    .map(birthdayInfo)
    .filter((x) => x && x.days <= 30)
    .sort((a, b) => a.days - b.days);
  if (!list.length) return "";
  return `<div class="card"><h3>🎂 Дни рождения в ближайшие 30 дней</h3><div class="chips">${list
    .map(
      ({ s, days, age, date }) =>
        `<span class="chip">${studentLink(s)} <b>${date}</b>${
          age ? ` · ${age} лет` : ""
        } <span class="muted">${days === 0 ? "сегодня!" : "через " + days + " дн."}</span></span>`
    )
    .join("")}</div></div>`;
}

function summaryHtml(all) {
  const sort = state.sort || "name";
  const rows = [...all].sort((a, b) => {
    if (sort === "absent") return b.st.absent - a.st.absent;
    if (sort === "rate") return a.st.rate - b.st.rate;
    return a.s.name.localeCompare(b.s.name, "ru");
  });
  return `
    ${calendarHtml()}
    ${birthdaysHtml()}
    <div class="card">
      <h2>Ученики класса</h2>
      <div class="filters">
        ${subjectSelectHtml()}
        <select id="sort">
          <option value="name" ${sort === "name" ? "selected" : ""}>По алфавиту</option>
          <option value="absent" ${sort === "absent" ? "selected" : ""}>Больше всего отсутствий</option>
          <option value="rate" ${sort === "rate" ? "selected" : ""}>Худшая посещаемость</option>
        </select>
      </div>
      <div class="table-wrap"><table>
        <tr><th>#</th><th>Ученик</th><th class="num">Этюдов</th><th class="num">Был</th><th class="num">Отсутствовал</th>
          <th class="num">Опоздал</th><th class="num">Уваж.</th><th class="num">Посещ.</th><th class="num">IDP</th><th>Олимпиада</th><th>День рождения</th></tr>
        ${rows
          .map(
            ({ s, st }, i) => `<tr>
              <td class="muted">${i + 1}</td>
              <td><span class="name-cell">${avatarHtml(s, "avatar-sm")}${studentLink(s)}</span></td>
              <td class="num">${st.total}</td>
              <td class="num">${st.present}</td>
              <td class="num">${st.absent ? `<span class="pill absent">${st.absent}</span>` : 0}</td>
              <td class="num">${st.late ? `<span class="pill late">${st.late}</span>` : 0}</td>
              <td class="num">${st.excused ? `<span class="pill excused">${st.excused}</span>` : 0}</td>
              <td class="num">${st.total ? `<b style="color:${st.rate < 85 ? "var(--red)" : "inherit"}">${st.rate}%</b>` : '<span class="muted">—</span>'}</td>
              <td class="num">${idpProgress(s)}%</td>
              <td>${olympiadHtml(s) || '<span class="muted">—</span>'}</td>
              <td>${(() => {
                const b = birthdayInfo(s);
                return b ? `${b.full}${b.days === 0 ? " 🎉" : b.days <= 30 ? ` <span class="badge">через ${b.days} дн.</span>` : ""}` : '<span class="muted">—</span>';
              })()}</td>
            </tr>`
          )
          .join("")}
      </table></div>
      <p class="muted small">Нажмите на имя ученика, чтобы открыть его страницу. Красным выделена посещаемость ниже 85%.</p>
    </div>`;
}

function journalHtml() {
  const f = state.subjectFilter;
  const lessons = lessonsSorted().filter((l) => !f || l.subject === f);
  return `
    <div class="card">
      <h2>Журнал этюдов</h2>
      <div class="filters">${subjectSelectHtml()}</div>
      <div class="legend">
        <span><span class="mark present">✓</span> был</span>
        <span><span class="mark absent">Н</span> отсутствовал</span>
        <span><span class="mark late">О</span> опоздал</span>
        <span><span class="mark excused">У</span> уважительная причина</span>
      </div>
      <div class="table-wrap"><table class="journal">
        <tr><th class="name">Ученик</th>${lessons
          .map((l) => `<th title="${esc(l.subject)}">${fmtShort(l.date)}${f || subjects().length <= 1 ? "" : `<br><span style="text-transform:none;font-weight:400">${esc(l.subject.slice(0, 4))}.</span>`}</th>`)
          .join("")}</tr>
        ${DATA.students
          .map(
            (s) => `<tr><td class="name">${studentLink(s)}</td>${lessons
              .map((l) => {
                const st = statusFor(l, s.id);
                return `<td><span class="mark ${st}" title="${STATUS_LABEL[st]}">${STATUS_MARK[st]}</span></td>`;
              })
              .join("")}</tr>`
          )
          .join("")}
      </table></div>
    </div>`;
}

function idpAllHtml() {
  return `
    <div class="card">
      <h2>IDP планы учеников</h2>
      <div class="table-wrap"><table>
        <tr><th>Ученик</th><th>Наставник</th><th>Цели</th><th>Прогресс</th></tr>
        ${DATA.students
          .map((s) => {
            const p = idpProgress(s);
            return `<tr>
              <td>${studentLink(s)}</td>
              <td>${esc(s.idp?.mentor || "—")}</td>
              <td class="small">${(s.idp?.goals || []).map((g) => `${esc(g.title)} — ${goalProgress(g)}%`).join("<br>")}</td>
              <td style="min-width:140px"><div class="progress ${p === 100 ? "done" : ""}"><span style="width:${p}%"></span></div><span class="small">${p}%</span></td>
            </tr>`;
          })
          .join("")}
      </table></div>
    </div>`;
}

// ---------- teacher: отметить этюд ----------
function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Этюды из настроек (лист «Настройки» → «Этюды»), плюс уже отмеченные в журнале
function etudeList() {
  const list = DATA.etudes && DATA.etudes.length ? DATA.etudes : ["Этюд"];
  return [...new Set([...list, ...subjects()])];
}

// Загружает отметки этюда из журнала (если он уже отмечен) в state.mark
function loadMark(date, subject) {
  const existing = DATA.attendance.find((l) => l.date === date && l.subject === subject);
  const marks = {};
  DATA.students.forEach((s) => (marks[s.id] = existing ? statusFor(existing, s.id) : "present"));
  state.mark = { date, subject, marks, existing: !!existing };
}

function markHtml() {
  if (!state.mark) {
    loadMark(todayIso(), etudeList()[0]);
  }
  const m = state.mark;
  const opt = (x) => `<option ${x === m.subject ? "selected" : ""}>${esc(x)}</option>`;
  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  Object.values(m.marks).forEach((st) => counts[st]++);
  return `
    <div class="card">
      <h2>Отметить посещаемость этюда</h2>
      <div class="filters">
        <input type="date" id="mark-date" value="${m.date}">
        ${
          etudeList().length > 1
            ? `<select id="mark-subject">${etudeList().map(opt).join("")}</select>`
            : "" /* этюд один — выбирать нечего */
        }
        <button class="btn btn-ghost" id="mark-all">Все присутствовали</button>
      </div>
      <p class="small muted">${m.existing ? "Этот этюд уже отмечен: загружены сохранённые отметки. При сохранении они обновятся." : "Новый этюд. По умолчанию все присутствовали, отметьте отсутствующих."}</p>
      <div class="table-wrap"><table>
        ${DATA.students
          .map(
            (s, i) => `<tr><td class="muted">${i + 1}</td><td>${esc(s.name)}</td><td><div class="seg">${Object.keys(STATUS_LABEL)
              .map((st) => `<button class="seg-btn ${st} ${m.marks[s.id] === st ? "active" : ""}" data-mark="${esc(s.id)}" data-st="${st}">${STATUS_LABEL[st]}</button>`)
              .join("")}</div></td></tr>`
          )
          .join("")}
      </table></div>
      <div class="save-bar">
        <button class="btn" id="save-lesson">Сохранить</button>
        <span class="small" id="mark-counts">Был: ${counts.present} · Отсутствовал: ${counts.absent} · Опоздал: ${counts.late} · Уваж.: ${counts.excused}</span>
        <span class="small" id="save-msg"></span>
      </div>
    </div>`;
}

function bindMark() {
  const m = state.mark;
  const refresh = () => render();
  document.getElementById("mark-date").addEventListener("change", (e) => {
    if (!e.target.value) return;
    loadMark(e.target.value, m.subject);
    refresh();
  });
  // Выбор этюда есть, только если этюдов несколько
  document.getElementById("mark-subject")?.addEventListener("change", (e) => {
    loadMark(m.date, e.target.value);
    refresh();
  });
  document.getElementById("mark-all").addEventListener("click", () => {
    Object.keys(m.marks).forEach((id) => (m.marks[id] = "present"));
    refresh();
  });
  app.querySelectorAll("[data-mark]").forEach((b) =>
    b.addEventListener("click", () => {
      m.marks[b.dataset.mark] = b.dataset.st;
      b.parentElement.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x === b));
      const c = { present: 0, absent: 0, late: 0, excused: 0 };
      Object.values(m.marks).forEach((st) => c[st]++);
      document.getElementById("mark-counts").textContent = `Был: ${c.present} · Отсутствовал: ${c.absent} · Опоздал: ${c.late} · Уваж.: ${c.excused}`;
      document.getElementById("save-msg").textContent = "";
    })
  );
  document.getElementById("save-lesson").addEventListener("click", async (e) => {
    const btn = e.target;
    const msg = document.getElementById("save-msg");
    const pick = (st) => Object.keys(m.marks).filter((id) => m.marks[id] === st);
    const lesson = { date: m.date, subject: m.subject, absent: pick("absent"), late: pick("late"), excused: pick("excused") };
    btn.disabled = true;
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const res = await api("saveLesson", { lesson });
      const i = DATA.attendance.findIndex((l) => l.date === res.lesson.date && l.subject === res.lesson.subject);
      if (i >= 0) DATA.attendance[i] = res.lesson;
      else DATA.attendance.push(res.lesson);
      m.existing = true;
      msg.textContent = DEMO ? "Сохранено ✓ (демо-режим: только до перезагрузки)" : "Сохранено в Google Таблицу ✓";
      msg.style.color = "var(--green)";
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
    }
    btn.disabled = false;
  });
}

// ---------- тема: белый / чёрный фон ----------
function currentTheme() {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function updateThemeButton() {
  const dark = currentTheme() === "dark";
  const btn = document.getElementById("theme-btn");
  btn.textContent = dark ? "☀️" : "🌙";
  btn.title = dark ? "Белый фон" : "Чёрный фон";
}
document.getElementById("theme-btn").addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
  updateThemeButton();
});
updateThemeButton();

// ---------- start ----------
document.getElementById("logout-btn").addEventListener("click", logout);

(async function start() {
  const saved = loadSession();
  if (saved) {
    app.innerHTML = '<p class="muted" style="text-align:center;margin-top:60px">Загрузка…</p>';
    try {
      await login(saved.login, saved.pin, saved.as);
    } catch (e) {
      logout();
      return;
    }
  }
  render();
})();
