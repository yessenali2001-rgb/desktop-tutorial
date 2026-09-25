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
        universities: D.universities,
        duties: (D.duties || [])
          .filter((d) => d.students.includes(s.id) || d.date >= todayIso())
          .map((d) => ({ date: d.date, duty: d.duty, students: d.students, names: d.students.map((id) => D.students.find((x) => x.id === id)?.name || id) })),
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
  if (["addActivity", "deleteActivity", "addEnglish", "deleteEnglish"].includes(action)) {
    if (parent) throw new Error("Добавляет сам ученик или учитель");
    const target = D.students.find((x) => x.id === (isTeacher ? payload.id : s.id));
    if (!target) throw new Error("Ученик не найден");
    const key = action.endsWith("Activity") ? "activities" : "english";
    const list = (target[key] = target[key] || []);
    const item = payload.activity || payload.result || {};
    if (action.startsWith("add")) {
      if (key === "activities" && !item.title) throw new Error("Введите название активности");
      if (key === "english" && (!item.date || !item.score)) throw new Error("Укажите дату и балл");
      list.push({ ...item, hours: Number(item.hours) || 0, weeks: Number(item.weeks) || 0, added: todayIso() });
    } else {
      const i = list.findIndex((x) => (key === "activities" ? x.type === item.type && x.title === item.title && (x.period || "") === (item.period || "") : x.date === item.date && x.exam === item.exam && x.score === item.score));
      if (i < 0) throw new Error("Запись не найдена. Обновите страницу.");
      list.splice(i, 1);
    }
    return { ok: true, id: target.id, [key]: JSON.parse(JSON.stringify(list)) };
  }
  if (action === "savePlan") {
    if (parent) throw new Error("Анкету заполняет сам ученик или учитель");
    const target = D.students.find((x) => x.id === (isTeacher ? payload.id : s.id));
    if (!target) throw new Error("Ученик не найден");
    const plan = { ...(payload.plan || {}), updated: todayIso() };
    if (plan.target && !(/^\d{1,3}$/.test(plan.target) && Number(plan.target) <= 140)) throw new Error("Цель ЕНТ — число от 0 до 140");
    target.plan = plan;
    return { ok: true, id: target.id, plan };
  }
  if (action === "saveDuty") {
    if (!isTeacher) throw new Error("Доступно только учителю и воспитателю");
    const d = payload.duty || {};
    if (!d.date) throw new Error("Укажите дату дежурства");
    if (!String(d.duty || "").trim()) throw new Error("Укажите дежурство");
    D.duties = D.duties || [];
    const i = D.duties.findIndex((x) => x.date === d.date && x.duty === d.duty);
    if (!(d.students || []).length) {
      if (i < 0) throw new Error("Выберите дежурных");
      D.duties.splice(i, 1);
    } else if (i >= 0) D.duties[i] = { date: d.date, duty: d.duty, students: d.students, by: isTutor ? "Воспитатель" : "Учитель" };
    else D.duties.push({ date: d.date, duty: d.duty, students: d.students, by: isTutor ? "Воспитатель" : "Учитель" });
    return { ok: true, duties: JSON.parse(JSON.stringify(D.duties)) };
  }
  if (action === "addMeeting" || action === "deleteMeeting") {
    if (!isTeacher) throw new Error("Доступно только учителю и воспитателю");
    const who = isTutor ? "Воспитатель" : "Учитель";
    const m = payload.meeting || {};
    D.meetings = D.meetings || [];
    if (action === "addMeeting") {
      if (!m.date) throw new Error("Укажите дату встречи");
      if (!(m.students || []).length) throw new Error("Выберите учеников");
      if (!String(m.topic || "").trim()) throw new Error("Введите тему встречи");
      D.meetings.push({ date: m.date, who, students: m.students, topic: m.topic, notes: m.notes || "" });
    } else {
      if (m.who !== who) throw new Error("Удалить встречу может только тот, кто её провёл");
      const i = D.meetings.findIndex((x) => x.date === m.date && x.who === who && x.students.join(",") === m.students.join(",") && x.topic === m.topic);
      if (i < 0) throw new Error("Встреча не найдена. Обновите страницу.");
      D.meetings.splice(i, 1);
    }
    return { ok: true, meetings: JSON.parse(JSON.stringify(D.meetings)) };
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
    ["admission", "🎓 Поступление"],
    ["activities", "⭐ Активности"],
    ["english", "🇬🇧 Английский"],
    ["attendance", "✅ Посещаемость"],
    ["grades", "📊 Оценки"],
    ["portfolio", "📁 Портфолио"],
    ["olympiads", "🏅 Олимпиады"],
    ["exams", "📝 Экзамены"],
    ["books", "📖 Книги"],
    ["duty", "🧹 Кезекшілік"],
    ["tests", "🧠 Тесты"],
  ];
  if (byTeacher) tabs.push(["meetings", "🤝 Встречи"]); // встречи видят только учитель и воспитатель
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
  if (state.tab === "meetings" && byTeacher) body = meetingsHtml(s);
  if (state.tab === "duty") body = studentDutyHtml(s);
  if (state.tab === "admission") body = admissionHtml(s);
  if (state.tab === "activities") body = activitiesHtml(s);
  if (state.tab === "english") body = englishHtml(s);

  const phones = [["Мама", s.momPhone], ["Папа", s.dadPhone]].filter(([, p]) => p);
  app.innerHTML = `
    ${byTeacher ? `<button class="btn btn-ghost" id="back-btn" style="margin-bottom:14px">← Ко всем ученикам</button>` : ""}
    <div class="card">
      <div class="profile">
        ${avatarHtml(s, "avatar-lg")}
        <div class="profile-info">
          ${isParent ? '<div class="muted small">Страница родителя · ваш ребёнок</div>' : ""}
          <h2>${esc(s.name)}</h2>
          <button class="btn btn-ghost resume-btn" id="resume-btn" type="button">📄 Резюме (PDF)</button>
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
  if (state.tab === "meetings" && byTeacher) bindMeetings(s);
  if (state.tab === "admission") bindAdmission(s);
  if (state.tab === "schedule") bindSchedule();
  if (state.tab === "activities") bindActivities(s);
  if (state.tab === "english") bindEnglish(s);
  document.getElementById("resume-btn").addEventListener("click", () => openResume(s));
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

// Значок предмета по названию (казахский, русский, английский)
const SUBJECT_ICONS = [
  [/алгебр|математ|mathem/i, "➗"],
  [/геометр/i, "📐"],
  [/физик|physic/i, "⚛️"],
  [/хими|chem/i, "🧪"],
  [/биолог|biolog/i, "🧬"],
  [/географ/i, "🌍"],
  [/тарих|истор|history/i, "📜"],
  [/информат|computer|prog|IT\b/i, "💻"],
  [/ағылшын|англ|english|(^|\s)ағ\.\s*тіл/i, "🇬🇧"],
  [/түрік|турец|turk|(^|\s)т\.\s*тіл/i, "🇹🇷"],
  [/орыс|русск|о\. тілі/i, "📘"],
  [/қазақ|казах|әдебиет|литерат|қ\. тілі/i, "📗"],
  [/дене|физкульт|спорт|sport|^дш(\s|$)/i, "⚽"],
  [/сынып сағаты|классный|\(cc\)/i, "🏫"],
  [/құқық|право|law/i, "⚖️"],
  [/робот/i, "🤖"],
  [/музык|өнер|искусств|сурет|art/i, "🎨"],
  [/технолог|еңбек/i, "🛠"],
];
function subjectIcon(subject) {
  return (SUBJECT_ICONS.find(([re]) => re.test(subject)) || [0, "📚"])[1];
}
const DAY_SHORT = { "Понедельник": "Пн", "Вторник": "Вт", "Среда": "Ср", "Четверг": "Чт", "Пятница": "Пт", "Суббота": "Сб", "Воскресенье": "Вс" };

// "08:30–09:15" → [510, 555] (минуты от полуночи)
function lessonMinutes(time) {
  const m = String(time || "").match(/(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/);
  return m ? [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])] : null;
}
// «гр.1: … · гр.2: …» → по строке на группу
function groupLines(text) {
  const t = String(text || "");
  return /гр\.\s*\d/i.test(t) ? t.split(/\s*·\s*/).map((x) => esc(x)).join("<br>") : esc(t);
}

function scheduleHtml(schedule) {
  if (!schedule || !schedule.length) return '<div class="card"><h2>Расписание на неделю</h2><p class="muted">Расписание пока не добавлено.</p></div>';
  const todayIdx = new Date().getDay();
  const todayDay = schedule.find((d) => DAY_INDEX[d.day] === todayIdx);
  // Открыт сегодняшний день; в выходные — понедельник
  if (!state.schedDay || !schedule.some((d) => d.day === state.schedDay)) state.schedDay = (todayDay || schedule[0]).day;
  const view = state.schedView || "day";
  const switcher = `<div class="sched-head">
      <h2>📅 Расписание</h2>
      <div class="seg sched-view">
        <button class="seg-btn ${view === "day" ? "active" : ""}" data-sched-view="day">По дням</button>
        <button class="seg-btn ${view === "week" ? "active" : ""}" data-sched-view="week">Вся неделя</button>
      </div>
    </div>`;
  if (view === "week") return `<div class="card">${switcher}${weekTableHtml(schedule, todayIdx)}</div>`;

  const day = schedule.find((d) => d.day === state.schedDay);
  const isToday = DAY_INDEX[day.day] === todayIdx;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const lessons = day.lessons.map((l, i) => ({ ...l, num: l.num || i + 1, mins: lessonMinutes(l.time) }));
  const current = isToday ? lessons.findIndex((l) => l.mins && nowMin >= l.mins[0] && nowMin < l.mins[1]) : -1;
  const next = isToday ? lessons.findIndex((l) => l.mins && nowMin < l.mins[0]) : -1;
  const first = lessons.find((l) => l.mins), last = [...lessons].reverse().find((l) => l.mins);
  const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

  const items = [];
  lessons.forEach((l, i) => {
    const prev = lessons[i - 1];
    if (prev && prev.mins && l.mins) {
      const gap = l.mins[0] - prev.mins[1];
      if (gap >= 15) items.push(`<div class="tl-break">${gap >= 40 ? "🍽 Обед" : "☕ Перемена"} · ${gap} мин</div>`);
    }
    const state_ = i === current ? "now" : i === next && current < 0 ? "next" : isToday && l.mins && nowMin >= l.mins[1] ? "done" : "";
    const progress = i === current ? Math.round(((nowMin - l.mins[0]) / (l.mins[1] - l.mins[0])) * 100) : 0;
    items.push(`<div class="tl-item ${state_}">
      <div class="tl-num">${esc(l.num)}</div>
      <div class="tl-card">
        <div class="tl-top"><span class="tl-time">${esc(l.time)}</span>${state_ === "now" ? '<span class="tl-tag now">Сейчас</span>' : state_ === "next" ? '<span class="tl-tag">Далее</span>' : ""}</div>
        <div class="tl-subj"><span class="tl-icon">${subjectIcon(l.subject)}</span>${esc(l.subject)}</div>
        ${l.room || l.teacher ? `<div class="tl-meta">${l.room ? `<span>🚪 ${groupLines(l.room)}</span>` : ""}${l.teacher ? `<span>👤 ${groupLines(l.teacher)}</span>` : ""}</div>` : ""}
        ${state_ === "now" ? `<div class="tl-progress"><span style="width:${progress}%"></span></div>` : ""}
      </div>
    </div>`);
  });

  return `<div class="card">${switcher}
    <div class="day-chips">${schedule
      .map((d) => {
        const t = DAY_INDEX[d.day] === todayIdx;
        return `<button class="day-chip ${d.day === day.day ? "active" : ""} ${t ? "is-today" : ""}" data-sched-day="${esc(d.day)}"><b>${esc(DAY_SHORT[d.day] || d.day.slice(0, 2))}</b><span>${d.lessons.length} ур.</span></button>`;
      })
      .join("")}</div>
    <div class="day-summary"><b>${esc(day.day)}</b>${isToday ? ' <span class="badge">Сегодня</span>' : ""} · ${lessons.length} ${plural(lessons.length, "урок", "урока", "уроков")}${
      first && last ? ` · ${fmt(first.mins[0])}–${fmt(last.mins[1])}` : ""
    }</div>
    <div class="timeline">${items.join("")}</div>
  </div>`;
}

// Вся неделя: строки — номер урока, колонки — дни
function weekTableHtml(schedule, todayIdx) {
  const maxN = Math.max(...schedule.map((d) => d.lessons.length));
  const rows = [];
  for (let i = 0; i < maxN; i++) {
    const time = schedule.map((d) => d.lessons[i]?.time).find(Boolean) || "";
    rows.push(`<tr><td class="wk-num"><b>${i + 1}</b><div class="small muted">${esc(time)}</div></td>${schedule
      .map((d) => {
        const l = d.lessons[i];
        const t = DAY_INDEX[d.day] === todayIdx ? "wk-today" : "";
        return l
          ? `<td class="${t}"><div class="wk-subj">${subjectIcon(l.subject)} ${esc(l.subject)}</div>${l.room ? `<div class="small muted">${groupLines(l.room)}</div>` : ""}</td>`
          : `<td class="${t}"></td>`;
      })
      .join("")}</tr>`);
  }
  return `<div class="table-wrap"><table class="week-table">
    <tr><th></th>${schedule.map((d) => `<th class="${DAY_INDEX[d.day] === todayIdx ? "wk-today" : ""}">${esc(d.day)}${DAY_INDEX[d.day] === todayIdx ? " ·&nbsp;сегодня" : ""}</th>`).join("")}</tr>
    ${rows.join("")}
  </table></div>`;
}

function bindSchedule() {
  app.querySelectorAll("[data-sched-day]").forEach((b) =>
    b.addEventListener("click", () => {
      state.schedDay = b.dataset.schedDay;
      render();
    })
  );
  app.querySelectorAll("[data-sched-view]").forEach((b) =>
    b.addEventListener("click", () => {
      state.schedView = b.dataset.schedView;
      render();
    })
  );
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
    ["meetings", "🤝 Встречи"],
    ["duty", "🧹 Кезекшілік"],
    ["admission-all", "🎓 Поступление"],
    ["activities-all", "⭐ Активности"],
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
  if (state.tab === "meetings") body = meetingsHtml();
  if (state.tab === "duty") body = dutyHtml();
  if (state.tab === "admission-all") body = admissionAllHtml();
  if (state.tab === "activities-all") body = activitiesAllHtml();
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
  if (state.tab === "meetings") bindMeetings();
  if (state.tab === "duty") bindDuty();
  if (state.tab === "schedule") bindSchedule();
  app.querySelectorAll("[data-student]").forEach((b) =>
    b.addEventListener("click", () => {
      state.viewStudent = b.dataset.student;
      state.tab = { "books-all": "books", "grades-all": "grades", meetings: "meetings", duty: "duty", "admission-all": "admission", "activities-all": "activities" }[state.tab] || "attendance";
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

// ---------- встречи учителя и воспитателя с учениками (ученики и родители их не видят) ----------
const MEET_WHO = ["Учитель", "Воспитатель"];

function meetingsOf(id) {
  return (DATA.meetings || []).filter((m) => m.students.includes(id));
}

function meetingStudentsText(m) {
  if (m.students.length === DATA.students.length) return "Весь класс";
  return m.students.map((id) => findStudent(id)?.name || id).join(", ");
}

// Без student — вкладка учителя со всем классом; со student — встречи одного ученика на его странице
function meetingsHtml(student) {
  const me = state.user.staff || "Учитель";
  if (!state.meet) state.meet = { date: todayIso(), pick: [], who: "" };
  const f = state.meet;
  const list = (student ? meetingsOf(student.id) : DATA.meetings || [])
    .filter((m) => !f.who || m.who === f.who)
    .map((m) => ({ m, i: (DATA.meetings || []).indexOf(m) })) // i — номер в общем списке, по нему удаляем
    .sort((a, b) => (a.m.date < b.m.date ? 1 : a.m.date > b.m.date ? -1 : b.i - a.i));

  const form = `<div class="card">
    <h2>➕ Новая встреча${student ? " с " + esc(student.name) : ""}</h2>
    <p class="small muted">Проводит: <b>${esc(me)}</b>. Встречи видят только учитель и воспитатель.</p>
    <form id="meet-form" class="meet-form">
      <div class="book-fields">
        <input type="date" id="meet-date" value="${esc(f.date)}" required>
        <input id="meet-topic" maxlength="200" placeholder="Тема встречи" required>
      </div>
      <textarea id="meet-notes" maxlength="1000" rows="3" placeholder="Итог, о чём договорились (необязательно)"></textarea>
      ${
        student
          ? ""
          : `<div class="meet-pick-head"><b>Ученики</b> <span class="small muted" id="meet-picked">выбрано: ${f.pick.length}</span>
              <button type="button" class="btn btn-ghost" id="meet-all">Весь класс</button>
              <button type="button" class="btn btn-ghost" id="meet-none">Снять выбор</button></div>
            <div class="meet-pick">${[...DATA.students]
              .sort((a, b) => a.name.localeCompare(b.name, "ru"))
              .map((s) => `<label class="meet-chip"><input type="checkbox" value="${esc(s.id)}" ${f.pick.includes(s.id) ? "checked" : ""}> ${esc(s.name)}</label>`)
              .join("")}</div>`
      }
      <div class="save-bar" style="position:static;border:none;padding:6px 0 0">
        <button class="btn" type="submit" id="meet-save">Сохранить встречу</button>
        <span class="small" id="meet-msg"></span>
      </div>
    </form>
  </div>`;

  // Сколько встреч у каждого ученика: видно, с кем ещё не встречались
  const counts = student
    ? ""
    : `<div class="card">
        <h2>Встречи по ученикам</h2>
        <div class="table-wrap"><table>
          <tr><th>#</th><th>Ученик</th>${MEET_WHO.map((w) => `<th class="num">С ${w === "Учитель" ? "учителем" : "воспитателем"}</th>`).join("")}<th>Последняя встреча</th></tr>
          ${[...DATA.students]
            .sort((a, b) => a.name.localeCompare(b.name, "ru"))
            .map((s, i) => {
              const ms = meetingsOf(s.id);
              const last = ms.reduce((a, m) => (m.date > a ? m.date : a), "");
              return `<tr><td class="muted">${i + 1}</td><td>${studentLink(s)}</td>${MEET_WHO.map((w) => {
                const n = ms.filter((m) => m.who === w).length;
                return `<td class="num">${n ? n : '<span class="pill absent">0</span>'}</td>`;
              }).join("")}<td>${last ? fmtDate(last) : '<span class="muted">—</span>'}</td></tr>`;
            })
            .join("")}
        </table></div>
        <p class="muted small">Красный 0 — с этим учеником ещё не было встреч.</p>
      </div>`;

  const history = `<div class="card">
    <h2>История встреч</h2>
    <div class="filters">
      <select id="meet-who">
        <option value="">Все встречи</option>
        ${MEET_WHO.map((w) => `<option value="${w}" ${f.who === w ? "selected" : ""}>${w === "Учитель" ? "Учитель с учениками" : "Воспитатель с учениками"}</option>`).join("")}
      </select>
    </div>
    ${
      list.length
        ? `<div class="meet-list">${list
            .map(
              ({ m, i }) => `<div class="meet-item">
                <div class="meet-top"><b>${fmtDate(m.date)}</b> <span class="badge ${m.who === "Учитель" ? "" : "badge-alt"}">${esc(m.who)}</span>
                  ${m.who === me ? `<button class="book-del" data-meet-del="${i}" title="Удалить">✕</button>` : ""}</div>
                <div class="meet-topic">${esc(m.topic)}</div>
                ${student && m.students.length === 1 ? "" : `<div class="small muted">👥 ${esc(meetingStudentsText(m))}</div>`}
                ${m.notes ? `<div class="small">${esc(m.notes)}</div>` : ""}
              </div>`
            )
            .join("")}</div>`
        : `<p class="muted">Встреч пока нет.</p>`
    }
  </div>`;
  return form + history + counts;
}

function bindMeetings(student) {
  const f = state.meet;
  const form = document.getElementById("meet-form");
  if (!form) return;
  const msg = document.getElementById("meet-msg");
  const boxes = [...app.querySelectorAll(".meet-pick input")];
  const syncPick = () => {
    f.pick = boxes.filter((b) => b.checked).map((b) => b.value);
    const el = document.getElementById("meet-picked");
    if (el) el.textContent = "выбрано: " + f.pick.length;
  };
  boxes.forEach((b) => b.addEventListener("change", syncPick));
  document.getElementById("meet-all")?.addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = true));
    syncPick();
  });
  document.getElementById("meet-none")?.addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = false));
    syncPick();
  });
  document.getElementById("meet-date").addEventListener("change", (e) => (f.date = e.target.value));
  document.getElementById("meet-who").addEventListener("change", (e) => {
    f.who = e.target.value;
    render();
  });
  const run = async (action, meeting, okText) => {
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const res = await api(action, { meeting });
      DATA.meetings = res.meetings;
      if (action === "addMeeting") f.pick = [];
      render();
      const m = document.getElementById("meet-msg");
      if (m) {
        m.textContent = okText;
        m.style.color = "var(--green)";
      }
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
      const btn = document.getElementById("meet-save");
      if (btn) btn.disabled = false;
    }
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const meeting = {
      date: document.getElementById("meet-date").value,
      topic: document.getElementById("meet-topic").value.trim(),
      notes: document.getElementById("meet-notes").value.trim(),
      students: student ? [student.id] : f.pick,
    };
    if (!meeting.students.length) {
      msg.textContent = "Выберите учеников";
      msg.style.color = "var(--red)";
      return;
    }
    if (!meeting.date || !meeting.topic) return;
    document.getElementById("meet-save").disabled = true;
    run("addMeeting", meeting, "Встреча сохранена ✓");
  });
  app.querySelectorAll("[data-meet-del]").forEach((b) =>
    b.addEventListener("click", () => {
      const m = (DATA.meetings || [])[Number(b.dataset.meetDel)];
      if (m && confirm(`Удалить встречу «${m.topic}» от ${fmtDate(m.date)}?`)) run("deleteMeeting", m, "Встреча удалена");
    })
  );
}

// ---------- кезекшілік: дежурства ----------
// Учитель и воспитатель назначают дежурных; «Подобрать честно» выбирает тех, кто дежурил меньше всех.
// Ученик и родитель видят свои дежурства и ближайшие дежурства класса.

function dutyNames(d) {
  return d.names || d.students.map((id) => findStudent(id)?.name || id);
}
function dutyTypes() {
  return [...new Set([...(DATA.dutyTypes && DATA.dutyTypes.length ? DATA.dutyTypes : ["Класс"]), ...(DATA.duties || []).map((d) => d.duty)])];
}
function sortedStudents() {
  return [...DATA.students].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}
// Сколько раз ученик дежурил: всего, по видам дежурства и когда в последний раз (до выбранной даты включительно не важно — считаем все)
function dutyStats(id) {
  const mine = (DATA.duties || []).filter((d) => d.students.includes(id));
  const byType = {};
  mine.forEach((d) => (byType[d.duty] = (byType[d.duty] || 0) + 1));
  const last = mine.reduce((a, d) => (d.date > a ? d.date : a), "");
  return { total: mine.length, byType, last };
}
function loadDutyForm(date, duty) {
  const existing = (DATA.duties || []).find((d) => d.date === date && d.duty === duty);
  state.duty = { ...state.duty, date, duty, pick: existing ? [...existing.students] : [], existing: !!existing };
}

function dutyHtml() {
  if (!state.duty) {
    state.duty = { count: 2, sort: "name", filter: "", month: "" };
    loadDutyForm(todayIso(), dutyTypes()[0]);
  }
  const f = state.duty;
  const types = dutyTypes();
  const absentThatDay = new Set(DATA.attendance.filter((l) => l.date === f.date).flatMap((l) => [...l.absent, ...l.excused]));

  const form = `<div class="card">
    <h2>🧹 Назначить дежурных</h2>
    <form id="duty-form" class="meet-form">
      <div class="duty-fields">
        <label>Дата<input type="date" id="duty-date" value="${esc(f.date)}" required></label>
        <label>Дежурство<input id="duty-name" list="duty-types" maxlength="60" value="${esc(f.duty)}" required></label>
        <datalist id="duty-types">${types.map((t) => `<option value="${esc(t)}">`).join("")}</datalist>
        <label>Сколько человек<input type="number" id="duty-count" min="1" max="25" value="${f.count}"></label>
        <button type="button" class="btn btn-ghost" id="duty-fair">⚖️ Подобрать честно</button>
      </div>
      <p class="small muted">${
        f.existing ? "На эту дату дежурные уже назначены: они отмечены ниже. При сохранении список обновится." : "«Подобрать честно» выбирает тех, кто дежурил меньше всех (и давно не дежурил). Отсутствующие в этот день не выбираются."
      } Число в скобках — сколько раз ученик уже был на этом дежурстве.</p>
      <div class="meet-pick-head"><b>Дежурные</b> <span class="small muted" id="duty-picked">выбрано: ${f.pick.length}</span>
        <button type="button" class="btn btn-ghost" id="duty-none">Снять выбор</button></div>
      <div class="meet-pick">${sortedStudents()
        .map((s) => {
          const n = dutyStats(s.id).byType[f.duty] || 0;
          const away = absentThatDay.has(s.id);
          return `<label class="meet-chip ${away ? "chip-away" : ""}" ${away ? 'title="Отсутствует в этот день"' : ""}><input type="checkbox" value="${esc(s.id)}" ${f.pick.includes(s.id) ? "checked" : ""}> ${esc(s.name)} <span class="muted small">(${n})</span></label>`;
        })
        .join("")}</div>
      <div class="save-bar" style="position:static;border:none;padding:6px 0 0">
        <button class="btn" type="submit" id="duty-save">Сохранить</button>
        ${f.existing ? '<button type="button" class="btn btn-ghost" id="duty-delete">Удалить дежурство</button>' : ""}
        <span class="small" id="duty-msg"></span>
      </div>
    </form>
  </div>`;

  // Счёт: кто сколько дежурил
  const rows = sortedStudents().map((s) => ({ s, st: dutyStats(s.id) }));
  if (f.sort === "few") rows.sort((a, b) => a.st.total - b.st.total || (a.st.last < b.st.last ? -1 : 1));
  if (f.sort === "many") rows.sort((a, b) => b.st.total - a.st.total);
  const totals = rows.map((x) => x.st.total);
  const min = Math.min(...totals), max = Math.max(...totals);
  const score = `<div class="card">
    <h2>⚖️ Кто сколько дежурил</h2>
    <div class="filters">
      <select id="duty-sort">
        <option value="name" ${f.sort === "name" ? "selected" : ""}>По алфавиту</option>
        <option value="few" ${f.sort === "few" ? "selected" : ""}>Меньше всего дежурств</option>
        <option value="many" ${f.sort === "many" ? "selected" : ""}>Больше всего дежурств</option>
      </select>
      <span class="small muted">Меньше всех: ${min} · больше всех: ${max}${max - min > 1 ? ' · <b style="color:var(--red)">разница больше 1 — назначайте тех, у кого меньше</b>' : ' · <b style="color:var(--green)">всё честно ✓</b>'}</span>
    </div>
    <div class="table-wrap"><table>
      <tr><th>#</th><th>Ученик</th>${types.map((t) => `<th class="num">${esc(t)}</th>`).join("")}<th class="num">Всего</th><th>Последний раз</th></tr>
      ${rows
        .map(
          ({ s, st }, i) => `<tr><td class="muted">${i + 1}</td><td>${studentLink(s)}</td>${types
            .map((t) => `<td class="num">${st.byType[t] || 0}</td>`)
            .join("")}<td class="num">${st.total === min && max > min ? `<span class="pill late">${st.total}</span>` : `<b>${st.total}</b>`}</td><td>${st.last ? fmtDate(st.last) : '<span class="muted">—</span>'}</td></tr>`
        )
        .join("")}
    </table></div>
    <p class="muted small">Оранжевым отмечены те, кто дежурил меньше всех: их очередь.</p>
  </div>`;

  // Архив
  const months = [...new Set((DATA.duties || []).map((d) => d.date.slice(0, 7)))].sort().reverse();
  const list = (DATA.duties || [])
    .filter((d) => (!f.filter || d.duty === f.filter) && (!f.month || d.date.startsWith(f.month)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.duty.localeCompare(b.duty)));
  const archive = `<div class="card">
    <h2>🗂 Архив дежурств</h2>
    <div class="filters">
      <select id="duty-filter"><option value="">Все дежурства</option>${types.map((t) => `<option ${f.filter === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
      <select id="duty-month"><option value="">Все месяцы</option>${months
        .map((m) => `<option value="${m}" ${f.month === m ? "selected" : ""}>${MONTHS_FULL[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}</option>`)
        .join("")}</select>
    </div>
    ${
      list.length
        ? `<div class="table-wrap"><table>
            <tr><th>Дата</th><th>Дежурство</th><th>Дежурные</th><th>Назначил</th><th></th></tr>
            ${list
              .map(
                (d) => `<tr><td>${fmtDate(d.date)}${d.date === todayIso() ? ' <span class="badge">сегодня</span>' : ""}</td><td>${esc(d.duty)}</td><td class="wrap">${esc(
                  dutyNames(d).join(", ")
                )}</td><td class="muted small">${esc(d.by || "")}</td><td><button class="btn-link" data-duty-edit="${esc(d.date)}|${esc(d.duty)}">Изменить</button></td></tr>`
              )
              .join("")}
          </table></div>`
        : '<p class="muted">Дежурств пока нет.</p>'
    }
  </div>`;
  return form + score + archive;
}

function bindDuty() {
  const f = state.duty;
  const msg = document.getElementById("duty-msg");
  const boxes = [...app.querySelectorAll("#duty-form .meet-pick input")];
  const syncPick = () => {
    f.pick = boxes.filter((b) => b.checked).map((b) => b.value);
    document.getElementById("duty-picked").textContent = "выбрано: " + f.pick.length;
  };
  boxes.forEach((b) => b.addEventListener("change", syncPick));
  document.getElementById("duty-none").addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = false));
    syncPick();
  });
  document.getElementById("duty-date").addEventListener("change", (e) => {
    if (!e.target.value) return;
    loadDutyForm(e.target.value, f.duty);
    render();
  });
  document.getElementById("duty-name").addEventListener("change", (e) => {
    const v = e.target.value.trim();
    if (!v) return;
    loadDutyForm(f.date, v);
    render();
  });
  document.getElementById("duty-count").addEventListener("change", (e) => (f.count = Math.max(1, Math.min(25, Number(e.target.value) || 1))));
  // Честный выбор: меньше всего дежурств этого вида → меньше всего дежурств всего → дольше всех не дежурил
  document.getElementById("duty-fair").addEventListener("click", () => {
    const away = new Set(DATA.attendance.filter((l) => l.date === f.date).flatMap((l) => [...l.absent, ...l.excused]));
    const others = (DATA.duties || []).filter((d) => !(d.date === f.date && d.duty === f.duty)); // текущую запись не считаем
    const stat = (id) => {
      const mine = others.filter((d) => d.students.includes(id));
      return { type: mine.filter((d) => d.duty === f.duty).length, total: mine.length, last: mine.reduce((a, d) => (d.date > a ? d.date : a), "") };
    };
    const busy = new Set(others.filter((d) => d.date === f.date).flatMap((d) => d.students)); // уже дежурят в этот день на другом дежурстве
    const pool = sortedStudents()
      .filter((s) => !away.has(s.id))
      .map((s) => ({ id: s.id, st: stat(s.id), busy: busy.has(s.id) ? 1 : 0 }))
      .sort((a, b) => a.busy - b.busy || a.st.type - b.st.type || a.st.total - b.st.total || (a.st.last < b.st.last ? -1 : a.st.last > b.st.last ? 1 : 0));
    f.pick = pool.slice(0, f.count).map((x) => x.id);
    render();
    const m = document.getElementById("duty-msg");
    m.textContent = "Подобрано: " + f.pick.map((id) => findStudent(id).name).join(", ") + ". Проверьте и нажмите «Сохранить».";
  });
  const run = async (students, okText) => {
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const res = await api("saveDuty", { duty: { date: f.date, duty: f.duty, students } });
      DATA.duties = res.duties;
      loadDutyForm(f.date, f.duty);
      render();
      const m = document.getElementById("duty-msg");
      m.textContent = okText;
      m.style.color = "var(--green)";
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
    }
  };
  document.getElementById("duty-form").addEventListener("submit", (e) => {
    e.preventDefault();
    f.duty = document.getElementById("duty-name").value.trim();
    if (!f.duty) return;
    if (!f.pick.length) {
      msg.textContent = "Выберите дежурных";
      msg.style.color = "var(--red)";
      return;
    }
    run(f.pick, DEMO ? "Сохранено ✓ (демо-режим)" : "Сохранено в Google Таблицу ✓");
  });
  document.getElementById("duty-delete")?.addEventListener("click", () => {
    if (confirm(`Удалить дежурство «${f.duty}» на ${fmtDate(f.date)}?`)) run([], "Дежурство удалено");
  });
  document.getElementById("duty-sort").addEventListener("change", (e) => {
    f.sort = e.target.value;
    render();
  });
  document.getElementById("duty-filter").addEventListener("change", (e) => {
    f.filter = e.target.value;
    render();
  });
  document.getElementById("duty-month").addEventListener("change", (e) => {
    f.month = e.target.value;
    render();
  });
  app.querySelectorAll("[data-duty-edit]").forEach((b) =>
    b.addEventListener("click", () => {
      const [date, duty] = b.dataset.dutyEdit.split("|");
      loadDutyForm(date, duty);
      render();
      document.getElementById("duty-form").scrollIntoView({ behavior: "smooth" });
    })
  );
}

// Страница ученика: свои дежурства и ближайшие дежурства класса
function studentDutyHtml(s) {
  const today = todayIso();
  const all = DATA.duties || [];
  const mine = all.filter((d) => d.students.includes(s.id)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const upcoming = all.filter((d) => d.date >= today).sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.duty.localeCompare(b.duty)));
  const byType = {};
  mine.filter((d) => d.date <= today).forEach((d) => (byType[d.duty] = (byType[d.duty] || 0) + 1));
  const done = mine.filter((d) => d.date <= today).length;
  const next = mine.filter((d) => d.date >= today).sort((a, b) => (a.date > b.date ? 1 : -1))[0];
  return `<div class="card">
    <div class="eyebrow">Кезекшілік</div>
    <h2>Дежурства</h2>
    <div class="highlights" style="margin:0 0 14px">
      <div class="hl"><span class="hl-icon">🧹</span><div><div class="eyebrow">Дежурил</div><div><b>${done}</b> ${plural(done, "раз", "раза", "раз")}${
        Object.keys(byType).length ? ` <span class="muted small">(${Object.entries(byType).map(([t, n]) => `${esc(t)}: ${n}`).join(", ")})</span>` : ""
      }</div></div></div>
      <div class="hl ${next && next.date === today ? "hl-today" : ""}"><span class="hl-icon">📅</span><div><div class="eyebrow">Следующее дежурство</div><div>${
        next ? `${next.date === today ? "<b>сегодня</b>" : fmtDate(next.date)} · ${esc(next.duty)}` : '<span class="muted">не назначено</span>'
      }</div></div></div>
    </div>
    <h3>Ближайшие дежурства класса</h3>
    ${
      upcoming.length
        ? `<div class="table-wrap"><table><tr><th>Дата</th><th>Дежурство</th><th>Дежурные</th></tr>${upcoming
            .map(
              (d) => `<tr ${d.students.includes(s.id) ? 'class="row-me"' : ""}><td>${d.date === today ? "<b>Сегодня</b>" : fmtDate(d.date)}</td><td>${esc(d.duty)}</td><td class="wrap">${esc(
                dutyNames(d).join(", ")
              )}</td></tr>`
            )
            .join("")}</table></div>`
        : '<p class="muted">Пока не назначены.</p>'
    }
    <h3>Мои дежурства</h3>
    ${
      mine.length
        ? `<ul class="duty-mine">${mine.map((d) => `<li>${fmtDate(d.date)} — ${esc(d.duty)}</li>`).join("")}</ul>`
        : '<p class="muted">Дежурств ещё не было.</p>'
    }
  </div>`;
}

// ---------- поступление: анкета ученика и подбор университетов (без ИИ, по листу «Университеты») ----------
// Названия направлений должны совпадать с колонкой «Направления» листа «Университеты»
const DIRECTIONS = [
  { name: "IT и программирование", ent: "Математика + Информатика" },
  { name: "Инженерия и технологии", ent: "Математика + Физика" },
  { name: "Архитектура и дизайн", ent: "творческий экзамен + предмет по специальности (уточните в вузе)" },
  { name: "Экономика, финансы, бизнес", ent: "Математика + География" },
  { name: "Медицина", ent: "Биология + Химия" },
  { name: "Биология, химия, экология", ent: "Биология + Химия (для экологии бывает Биология + География)" },
  { name: "Агро и ветеринария", ent: "Биология + Химия" },
  { name: "Право", ent: "Всемирная история + Основы права" },
  { name: "Международные отношения", ent: "Иностранный язык + Всемирная история" },
  { name: "Филология и языки", ent: "Язык + Литература (казахский или русский) или Иностранный язык + Всемирная история" },
  { name: "Журналистика и медиа", ent: "творческий экзамен + предмет по специальности (уточните в вузе)" },
  { name: "Педагогика", ent: "два предмета по будущей специальности учителя" },
  { name: "Психология", ent: "Биология + География (уточните в вузе)" },
  { name: "Туризм и сервис", ent: "География + Иностранный язык" },
];
const ANY_DIRECTION = "Все направления";

// Тест Гарднера: тип интеллекта → подходящие направления
const GARDNER = [
  { re: /логи|математ/, label: "логико-математический", dirs: ["IT и программирование", "Инженерия и технологии", "Экономика, финансы, бизнес"] },
  { re: /визуал|простран/, label: "визуально-пространственный", dirs: ["Архитектура и дизайн", "Инженерия и технологии"] },
  { re: /лингв/, label: "лингвистический", dirs: ["Филология и языки", "Международные отношения", "Журналистика и медиа", "Право"] },
  { re: /межлич/, label: "межличностный", dirs: ["Педагогика", "Психология", "Международные отношения", "Туризм и сервис"] },
  { re: /вн[а-я]*утри[а-я]*лич/, label: "внутриличностный", dirs: ["Психология", "Право"] },
  { re: /кинест|кинес/, label: "кинестетический", dirs: ["Медицина", "Агро и ветеринария"] },
  { re: /музык/, label: "музыкальный", dirs: [] },
];

// Самые сильные типы интеллекта по тесту Гарднера (текст вида «Математико-логический (4), лингвистический (2)…»)
function gardnerTop(s) {
  const t = (s.tests || []).find((x) => /гарднер/i.test(x.name));
  const text = String(t?.value || "").toLowerCase();
  if (!text) return [];
  const scored = GARDNER.map((g) => {
    const m = text.match(g.re);
    if (!m) return null;
    const n = text.slice(m.index).match(/\(\s*(\d)\s*\)/);
    return n ? { ...g, score: Number(n[1]) } : null;
  }).filter(Boolean);
  const max = Math.max(0, ...scored.map((g) => g.score));
  return max >= 2 ? scored.filter((g) => g.score === max) : [];
}

// Анкета ученика; если он её ещё не заполнял — подсказки из портфолио («Будущая профессия», «Интересы»)
function planOf(s) {
  if (s.plan) return { ...s.plan, saved: true };
  const personal = (key) => (s.portfolio || []).find((p) => p.section === "Личное" && p.title === key)?.details || "";
  return { career: personal("Будущая профессия"), about: personal("Интересы"), where: "За рубежом", grant: "Да", lang: "Английский", saved: false };
}

// Вид финансирования по тексту колонки «Финансирование»
function fundKind(text) {
  const t = String(text || "").toLowerCase();
  if (/полная|госгрант/.test(t)) return "full";
  if (/бесплат|низкая плата|квота/.test(t)) return "free";
  if (/частичн|по доходу/.test(t)) return "partial";
  if (/платно/.test(t)) return "paid";
  return "";
}

function langMatch(uniLang, want) {
  const stem = { Казахский: "казах", Русский: "русск", Английский: "англ" }[want];
  return !stem || uniLang.toLowerCase().includes(stem);
}

// Подбор: у каждого вуза считаем очки и собираем плюсы (✓) и то, чего не хватает (⚠)
function recommendUnis(plan) {
  const dirs = [plan.dir1, plan.dir2].filter(Boolean);
  if (!dirs.length) return [];
  const target = Number(plan.target) || 0;
  // Балл IELTS: «IELTS 6.0» или просто «6.5». «KET B1» баллом IELTS не считается
  const eng = String(plan.english || "").replace(",", ".");
  const m = eng.match(/ielts\s*(\d(?:\.\d)?)/i) || eng.trim().match(/^(\d(?:\.\d)?)$/);
  const ielts = m && Number(m[1]) >= 1 && Number(m[1]) <= 9 ? Number(m[1]) : 0;
  const res = [];
  (DATA.universities || []).forEach((u) => {
    const pros = [], cons = [];
    let score = 0;
    const any = u.dirs.includes(ANY_DIRECTION);
    if (plan.dir1 && u.dirs.includes(plan.dir1)) (score += 50), pros.push(`есть направление «${plan.dir1}»`);
    if (plan.dir2 && u.dirs.includes(plan.dir2)) (score += 30), pros.push(`есть направление «${plan.dir2}»`);
    if (!score && any) (score += 20), pros.push("принимают на разные направления");
    if (!score) return;
    const kz = u.country === "Казахстан";
    if ((plan.where === "Казахстан" && !kz) || (plan.where === "За рубежом" && kz)) (score -= 70), cons.push(kz ? "это вуз в Казахстане" : "это вуз за рубежом");
    else if (plan.where === "Казахстан" || plan.where === "За рубежом") score += 10;
    if (plan.country && plan.country !== "Любая") {
      if (u.country === plan.country) (score += 30), pros.push(`страна: ${u.country}`);
      else score -= 40; // выбранная страна важнее совпадения второго направления
    }
    if (plan.city && u.city.toLowerCase().includes(plan.city.trim().toLowerCase())) (score += 10), pros.push(`в городе ${u.city}`);
    if (plan.lang && plan.lang !== "Не важно") {
      if (langMatch(u.lang, plan.lang)) (score += 5), pros.push(`обучение на языке: ${plan.lang.toLowerCase()}`);
      else cons.push(`обучение: ${u.lang.toLowerCase()}`);
    }
    if (u.grantScore) {
      if (!target) cons.push(`укажите цель ЕНТ, чтобы сравнить с ориентиром гранта (≈${u.grantScore})`);
      else if (target >= u.grantScore) (score += 10), pros.push(`цель ЕНТ ${target} не ниже ориентира гранта (≈${u.grantScore})`);
      else {
        const d = u.grantScore - target;
        score -= Math.min(20, Math.ceil(d / 2));
        cons.push(`до ориентира гранта (≈${u.grantScore}) не хватает ${d} баллов ЕНТ`);
      }
    }
    if (u.ielts) {
      if (ielts >= u.ielts) (score += 5), pros.push(`IELTS ${ielts} ≥ ${u.ielts}`);
      else cons.push(`нужен IELTS ${u.ielts}${ielts ? ` (сейчас ${ielts})` : ""}`);
    }
    // Финансирование: нужна ли семье полная стипендия
    const f = fundKind(u.fund);
    if (plan.grant === "Да") {
      if (f === "full") (score += 10), pros.push("полная стипендия или грант");
      else if (f === "free") (score += 5), pros.push("учёба бесплатная или недорогая (нужны деньги на жизнь)");
      else if (f === "partial") (score -= 10), cons.push("стипендия частичная, часть оплаты на семье");
      else if (f === "paid") (score -= 25), cons.push("в основном платно");
    } else if (plan.grant === "Желательно") {
      if (f === "full" || f === "free") (score += 5), pros.push(f === "full" ? "полная стипендия или грант" : "учёба бесплатная или недорогая");
      else if (f === "paid") (score -= 10), cons.push("в основном платно");
    }
    res.push({ u, score, pros, cons });
  });
  return res.sort((a, b) => b.score - a.score || a.u.name.localeCompare(b.u.name, "ru"));
}

function admissionTips(plan, recs) {
  const tips = [];
  if (plan.where !== "Казахстан") {
    const needIelts = Math.max(0, ...recs.slice(0, 5).map((r) => r.u.ielts || 0));
    const usa = recs.slice(0, 8).some((r) => /США|ОАЭ|Турция/.test(r.u.country));
    tips.push(
      `<b>9 класс (сейчас):</b> английский до уровня B1–B2 (KET → PET), хорошие оценки во всех четвертях (зарубежные вузы смотрят оценки 9–11 классов), олимпиады, 1–2 постоянных занятия: волонтёрство, проект, кружок, спорт.`
    );
    tips.push(
      `<b>10 класс:</b> первая попытка IELTS${needIelts ? ` (цель ${needIelts}+)` : ""}${usa ? ", подготовка к SAT" : ""}, летние школы и конкурсы, начать список вузов и узнать сроки. Записывай все достижения и часы волонтёрства.`
    );
    tips.push(`<b>11 класс:</b> финальный IELTS${usa ? " и SAT" : ""} до осени, эссе и мотивационные письма, рекомендации учителей, подача заявок (многие сроки — с ноября по февраль).`);
  }
  const d1 = DIRECTIONS.find((d) => d.name === plan.dir1);
  if (d1 && plan.where === "Казахстан") tips.push(`Профильные предметы ЕНТ для «${d1.name}»: <b>${esc(d1.ent)}</b>. Уделяй им больше времени уже в 9 классе.`);
  const needIelts = Math.max(0, ...recs.slice(0, 5).map((r) => r.u.ielts || 0));
  if (needIelts && plan.where === "Казахстан") tips.push(`Английский: к 11 классу нужен IELTS <b>${needIelts}</b> или выше. Начни с KET/PET и пробных IELTS.`);
  if (plan.target && plan.where !== "За рубежом") tips.push(`Цель ЕНТ <b>${esc(plan.target)}</b> из 140. Сравнивай с ней результаты пробных тестов BTS.`);
  tips.push("Олимпиады (особенно международные и республиканские) — сильный плюс и для зарубежных стипендий: участвуй каждый год.");
  if (plan.where !== "Казахстан") tips.push("Запасной вариант: подготовься и к ЕНТ или NUET, чтобы при отказе за рубежом поступить в сильный вуз Казахстана.");
  return tips;
}

function admissionHtml(s) {
  const plan = planOf(s);
  const canEdit = state.user.role !== "parent";
  const dis = canEdit ? "" : "disabled";
  const opt = (list, v) => list.map((x) => `<option ${x === v ? "selected" : ""}>${esc(x)}</option>`).join("");
  const dirOpt = (v) => `<option value="">— выберите —</option>` + DIRECTIONS.map((d) => `<option ${d.name === v ? "selected" : ""}>${esc(d.name)}</option>`).join("");
  const ent = DIRECTIONS.find((d) => d.name === plan.dir1)?.ent;
  const countries = [...new Set((DATA.universities || []).map((u) => u.country).filter(Boolean))].sort((a, b) =>
    a === "Казахстан" ? 1 : b === "Казахстан" ? -1 : a.localeCompare(b, "ru")
  );
  const cities = [...new Set((DATA.universities || []).map((u) => u.city).filter((c) => !/разные/i.test(c)))];
  const gard = gardnerTop(s);

  const form = `<div class="card">
    <div class="eyebrow">Түлек · поступление</div>
    <h2>🎓 Моя цель поступления</h2>
    ${plan.saved ? `<p class="small muted">Обновлено: ${fmtDate(plan.updated)}</p>` : `<p class="small muted">${canEdit ? "Заполни анкету: сайт подберёт университеты. Её можно менять в любое время." : "Ученик ещё не заполнил анкету."}</p>`}
    <form id="plan-form" class="plan-form">
      <label class="wide">Кем хочу стать<input id="pl-career" maxlength="100" value="${esc(plan.career || "")}" placeholder="например, программист, врач, дипломат" ${dis}></label>
      <label>Главное направление<select id="pl-dir1" ${dis}>${dirOpt(plan.dir1)}</select></label>
      <label>Запасное направление<select id="pl-dir2" ${dis}>${dirOpt(plan.dir2)}</select></label>
      ${ent && plan.where !== "За рубежом" ? `<div class="wide small plan-ent">📘 Предметы ЕНТ: <b>${esc(ent)}</b></div>` : ""}
      <label>Где хочу учиться<select id="pl-where" ${dis}>${opt(["Не важно", "Казахстан", "За рубежом"], plan.where)}</select></label>
      <label>Страна (если важно)<select id="pl-country" ${dis}>${["Любая", ...countries].map((c) => `<option ${c === (plan.country || "Любая") ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>
      <label>Город (если важно)<input id="pl-city" list="pl-cities" maxlength="60" value="${esc(plan.city || "")}" placeholder="любой" ${dis}></label>
      <datalist id="pl-cities">${cities.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
      <label>Финансирование<select id="pl-grant" ${dis}>${[
        ["Да", "Нужна полная стипендия или грант"],
        ["Желательно", "Подойдёт и частичная стипендия"],
        ["Нет", "Семья может оплатить"],
      ]
        .map(([v, l]) => `<option value="${v}" ${v === plan.grant ? "selected" : ""}>${l}</option>`)
        .join("")}</select></label>
      <label>Язык обучения<select id="pl-lang" ${dis}>${opt(["Не важно", "Казахский", "Русский", "Английский"], plan.lang)}</select></label>
      <label>Английский сейчас<input id="pl-english" maxlength="40" value="${esc(plan.english || "")}" placeholder="например, IELTS 6.0 или KET B1" ${dis}></label>
      <label>Цель ЕНТ (из 140, для вузов Казахстана)<input id="pl-target" type="number" min="0" max="140" value="${esc(plan.target || "")}" placeholder="например, 115" ${dis}></label>
      <label class="wide">О себе: интересы, достижения, чем занимаешься<textarea id="pl-about" maxlength="500" rows="2" ${dis}>${esc(plan.about || "")}</textarea></label>
      ${
        canEdit
          ? `<div class="wide save-bar" style="position:static;border:none;padding:0"><button class="btn" type="submit" id="plan-save">Сохранить и подобрать</button><span class="small" id="plan-msg"></span></div>`
          : ""
      }
    </form>
  </div>`;

  const gardHtml = gard.length
    ? `<div class="card"><h3>🧠 Подсказка по тесту Гарднера</h3><p>Сильнее всего: <b>${gard.map((g) => esc(g.label)).join(", ")}</b>.${
        [...new Set(gard.flatMap((g) => g.dirs))].length ? ` Могут подойти: ${[...new Set(gard.flatMap((g) => g.dirs))].map((d) => `<span class="badge">${esc(d)}</span>`).join(" ")}` : ""
      }</p><p class="small muted">Это только подсказка. Главное — интересы и то, что получается лучше всего.</p></div>`
    : "";

  if (!plan.dir1)
    return form + gardHtml + `<div class="card"><h2>🏛 Подходящие университеты</h2><p class="muted">Выберите главное направление в анкете, и здесь появятся подходящие вузы.</p></div>`;

  const recs = recommendUnis(plan);
  const shown = state.admAll ? recs : recs.slice(0, 8);
  const recHtml = `<div class="card">
    <h2>🏛 Подходящие университеты</h2>
    <p class="small muted">Подбор по анкете и списку университетов. Условия, сроки и баллы — примерный ориентир: проверяйте на сайте вуза или программы каждый год.</p>
    ${
      shown.length
        ? `<div class="uni-list">${shown
            .map(
              (r, i) => `<div class="uni-item">
                <div class="uni-head"><span class="uni-rank">${i + 1}</span><div><div class="uni-name">${esc(r.u.name)}</div><div class="small muted">${esc(r.u.city)} · ${esc(r.u.country)}${
                r.u.site ? ` · <a href="https://${esc(r.u.site.replace(/^https?:\/\//, ""))}" target="_blank" rel="noopener">${esc(r.u.site)}</a>` : ""
              }</div></div></div>
                <div class="uni-tags">${r.pros.map((x) => `<span class="uni-pro">✓ ${esc(x)}</span>`).join("")}${r.cons.map((x) => `<span class="uni-con">⚠ ${esc(x)}</span>`).join("")}</div>
                <div class="small"><b>Как поступать:</b> ${esc(r.u.how)}</div>
                ${r.u.fund || r.u.deadline ? `<div class="small uni-meta">${r.u.fund ? `<span>💰 ${esc(r.u.fund)}</span>` : ""}${r.u.deadline ? `<span>📅 ${esc(r.u.deadline)}</span>` : ""}</div>` : ""}
                ${r.u.note ? `<div class="small muted">${esc(r.u.note)}</div>` : ""}
              </div>`
            )
            .join("")}</div>
          ${recs.length > 8 ? `<button class="btn btn-ghost" id="adm-all" style="margin-top:10px">${state.admAll ? "Показать меньше" : `Показать все (${recs.length})`}</button>` : ""}`
        : '<p class="muted">По этим направлениям в списке пока нет вузов. Учитель может добавить их в лист «Университеты».</p>'
    }
  </div>`;
  const tips = admissionTips(plan, recs);
  const tipsHtml = `<div class="card"><h3>📌 Что делать уже сейчас</h3><ul class="tips">${tips.map((t) => `<li>${t}</li>`).join("")}</ul></div>`;
  return form + recHtml + tipsHtml + gardHtml;
}

function bindAdmission(s) {
  document.getElementById("adm-all")?.addEventListener("click", () => {
    state.admAll = !state.admAll;
    render();
  });
  const form = document.getElementById("plan-form");
  const save = document.getElementById("plan-save");
  if (!form || !save) return;
  const val = (id) => document.getElementById(id).value.trim();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("plan-msg");
    const plan = {
      career: val("pl-career"),
      dir1: val("pl-dir1"),
      dir2: val("pl-dir2"),
      where: val("pl-where"),
      country: val("pl-country") === "Любая" ? "" : val("pl-country"),
      city: val("pl-city"),
      grant: val("pl-grant"),
      lang: val("pl-lang"),
      english: val("pl-english"),
      target: val("pl-target"),
      about: val("pl-about"),
    };
    if (!plan.dir1) {
      msg.textContent = "Выберите главное направление";
      msg.style.color = "var(--red)";
      return;
    }
    save.disabled = true;
    msg.textContent = "Сохранение…";
    msg.style.color = "";
    try {
      const res = await api("savePlan", { id: s.id, plan });
      s.plan = res.plan;
      render();
      const m = document.getElementById("plan-msg");
      m.textContent = "Сохранено ✓ Подбор обновлён";
      m.style.color = "var(--green)";
    } catch (ex) {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
      save.disabled = false;
    }
  });
}

// Учитель: кто куда хочет поступать и список университетов
function admissionAllHtml() {
  const list = sortedStudents();
  const filled = list.filter((s) => s.plan && s.plan.dir1).length;
  const unis = DATA.universities || [];
  return `<div class="card">
    <h2>🎓 Кто куда хочет поступать</h2>
    <p class="small muted">Анкету заполнили: <b>${filled}</b> из ${list.length}. Нажмите на имя, чтобы открыть анкету и подбор ученика.</p>
    <div class="table-wrap"><table>
      <tr><th>#</th><th>Ученик</th><th>Кем хочет стать</th><th>Направление</th><th>Где</th><th class="num">Цель ЕНТ</th><th>Лучший вариант</th><th>Обновлено</th></tr>
      ${list
        .map((s, i) => {
          const p = s.plan;
          if (!p || !p.dir1)
            return `<tr><td class="muted">${i + 1}</td><td>${studentLink(s)}</td><td colspan="6"><span class="pill absent">не заполнил</span>${
              planOf(s).career ? ` <span class="small muted">в портфолио: ${esc(planOf(s).career)}</span>` : ""
            }</td></tr>`;
          const best = recommendUnis(p)[0];
          return `<tr><td class="muted">${i + 1}</td><td>${studentLink(s)}</td><td class="wrap">${esc(p.career || "—")}</td><td class="wrap">${esc(p.dir1)}${
            p.dir2 ? `<div class="small muted">${esc(p.dir2)}</div>` : ""
          }</td><td>${esc(p.where || "")}${p.country || p.city ? `<div class="small muted">${esc([p.country, p.city].filter(Boolean).join(", "))}</div>` : ""}</td><td class="num">${esc(p.target || "—")}</td><td class="wrap">${
            best ? esc(best.u.name) : '<span class="muted">—</span>'
          }</td><td>${p.updated ? fmtDate(p.updated) : ""}</td></tr>`;
        })
        .join("")}
    </table></div>
  </div>
  <div class="card">
    <h2>🏛 Список университетов (${unis.length})</h2>
    <p class="small muted">Список хранится в Google Таблице на листе «Университеты»: сначала зарубежные вузы и стипендии, потом вузы Казахстана как запасной вариант. Там можно добавить вуз, изменить условия, сроки и баллы. Это примерный ориентир: сверяйте с сайтами программ каждый год.</p>
    <div class="table-wrap"><table>
      <tr><th>Университет</th><th>Где</th><th>Направления</th><th>Финансирование</th><th>Сроки подачи</th><th class="num">IELTS</th><th class="num">ЕНТ ≈</th></tr>
      ${unis
        .map(
          (u) => `<tr><td class="wrap"><b>${esc(u.name)}</b>${u.site ? `<div class="small"><a href="https://${esc(u.site.replace(/^https?:\/\//, ""))}" target="_blank" rel="noopener">${esc(u.site)}</a></div>` : ""}</td><td>${esc(u.city)}<div class="small muted">${esc(
            u.country
          )}</div></td><td class="wrap small">${esc(u.dirs.join(", "))}</td><td class="wrap small">${esc(u.fund || "—")}</td><td class="wrap small">${esc(u.deadline || "—")}</td><td class="num">${u.ielts || "—"}</td><td class="num">${u.grantScore || "—"}</td></tr>`
        )
        .join("")}
    </table></div>
  </div>`;
}

// ---------- активности (волонтёрство, кружки, проекты…) для поступления ----------
const ACTIVITY_TYPES = ["Волонтёрство", "Кружок", "Спорт", "Проект", "Конкурс", "Летняя школа / лагерь", "Работа / стажировка", "Другое"];
const ACTIVITY_ICON = { "Волонтёрство": "🤝", "Кружок": "🧩", "Спорт": "⚽", "Проект": "💡", "Конкурс": "🏆", "Летняя школа / лагерь": "🏕", "Работа / стажировка": "💼", "Другое": "⭐" };

// Всего часов: часов в неделю × недель (если недель нет — просто часы)
function activityHours(a) {
  return (Number(a.hours) || 0) * (Number(a.weeks) || 1);
}
function activityTotals(list) {
  const byType = {};
  list.forEach((a) => (byType[a.type] = (byType[a.type] || 0) + activityHours(a)));
  return { total: list.reduce((x, a) => x + activityHours(a), 0), byType };
}

function activitiesHtml(s) {
  const list = s.activities || [];
  const canEdit = state.user.role !== "parent";
  const t = activityTotals(list);
  return `<div class="card">
    <div class="eyebrow">Для заявки в вуз</div>
    <h2>⭐ Активности</h2>
    <p class="small muted">Всё, чем ученик занимается кроме уроков: волонтёрство, кружки, спорт, проекты, конкурсы, летние школы. Зарубежные вузы смотрят на это почти так же внимательно, как на оценки. Записывайте сразу, пока помните часы.</p>
    <div class="highlights" style="margin:0 0 14px">
      <div class="hl"><span class="hl-icon">⭐</span><div><div class="eyebrow">Активностей</div><div><b>${list.length}</b></div></div></div>
      <div class="hl"><span class="hl-icon">⏱</span><div><div class="eyebrow">Всего часов</div><div><b>${t.total}</b></div></div></div>
      ${Object.keys(t.byType).length ? `<div class="hl"><span class="hl-icon">📊</span><div><div class="eyebrow">По видам</div><div class="small">${Object.entries(t.byType).map(([k, v]) => `${esc(k)}: <b>${v} ч</b>`).join(" · ")}</div></div></div>` : ""}
    </div>
    ${
      list.length
        ? `<div class="meet-list">${list
            .map(
              (a, i) => `<div class="meet-item">
                <div class="meet-top"><span>${ACTIVITY_ICON[a.type] || "⭐"}</span><b>${esc(a.title)}</b><span class="badge">${esc(a.type)}</span>${
                canEdit ? `<button class="book-del" data-act-del="${i}" title="Удалить">✕</button>` : ""
              }</div>
                ${a.role ? `<div class="small">${esc(a.role)}</div>` : ""}
                <div class="small muted">${[a.period, a.hours ? `${a.hours} ч в неделю` : "", a.weeks ? `${a.weeks} нед.` : "", activityHours(a) ? `всего ≈ ${activityHours(a)} ч` : ""].filter(Boolean).map(esc).join(" · ")}</div>
              </div>`
            )
            .join("")}</div>`
        : `<p class="muted">${canEdit ? "Пока пусто. Добавьте первую активность." : "Пока пусто."}</p>`
    }
    ${
      canEdit
        ? `<form class="book-form plan-form" id="act-form">
            <h3 class="wide">➕ Добавить активность</h3>
            <label>Вид<select id="act-type">${ACTIVITY_TYPES.map((x) => `<option>${esc(x)}</option>`).join("")}</select></label>
            <label>Название<input id="act-title" maxlength="150" placeholder="например, волонтёр в приюте для животных" required></label>
            <label class="wide">Роль, что делал<input id="act-role" maxlength="300" placeholder="например, капитан команды; организовал сбор книг"></label>
            <label>Часов в неделю<input id="act-hours" type="number" min="0" max="60" step="0.5" placeholder="например, 2"></label>
            <label>Сколько недель<input id="act-weeks" type="number" min="0" max="200" placeholder="1 — если один раз"></label>
            <label class="wide">Период<input id="act-period" maxlength="60" placeholder="например, сентябрь 2025 – май 2026"></label>
            <div class="wide save-bar" style="position:static;border:none;padding:0"><button class="btn" type="submit" id="act-save">Добавить</button><span class="small" id="act-msg"></span></div>
          </form>`
        : ""
    }
  </div>`;
}

// Общий обработчик добавления/удаления записей ученика (активности, английский)
function runStudentEdit(s, action, payload, key, msgId, okText) {
  const msg = document.getElementById(msgId);
  msg.textContent = "Сохранение…";
  msg.style.color = "";
  return api(action, { id: s.id, ...payload })
    .then((res) => {
      s[key] = res[key];
      render();
      const m = document.getElementById(msgId);
      if (m) {
        m.textContent = okText;
        m.style.color = "var(--green)";
      }
    })
    .catch((ex) => {
      msg.textContent = "Ошибка: " + ex.message;
      msg.style.color = "var(--red)";
      app.querySelectorAll("button[type=submit]").forEach((b) => (b.disabled = false));
    });
}

function bindActivities(s) {
  const form = document.getElementById("act-form");
  if (!form) return;
  const val = (id) => document.getElementById(id).value.trim();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const activity = { type: val("act-type"), title: val("act-title"), role: val("act-role"), hours: val("act-hours"), weeks: val("act-weeks"), period: val("act-period") };
    if (!activity.title) return;
    document.getElementById("act-save").disabled = true;
    runStudentEdit(s, "addActivity", { activity }, "activities", "act-msg", "Добавлено ✓");
  });
  app.querySelectorAll("[data-act-del]").forEach((b) =>
    b.addEventListener("click", () => {
      const a = (s.activities || [])[Number(b.dataset.actDel)];
      if (a && confirm(`Удалить «${a.title}»?`)) runStudentEdit(s, "deleteActivity", { activity: { type: a.type, title: a.title, period: a.period } }, "activities", "act-msg", "Удалено");
    })
  );
}

// ---------- английский: результаты экзаменов и прогресс IELTS ----------
const ENGLISH_EXAMS = ["Пробный IELTS", "IELTS", "KET", "PET", "FCE", "TOEFL", "Duolingo", "Другое"];
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

function isIelts(x) {
  return /ielts/i.test(x.exam) && Number(String(x.score).replace(",", ".")) > 0 && Number(String(x.score).replace(",", ".")) <= 9;
}
function ieltsToCefr(b) {
  return b >= 8.5 ? "C2" : b >= 7 ? "C1" : b >= 5.5 ? "B2" : b >= 4 ? "B1" : b >= 3 ? "A2" : "A1";
}
// Лучший уровень CEFR: из IELTS, из записей вида «B1» и из экзаменов KET/PET на вкладке «Экзамены»
function bestCefr(s) {
  const found = [];
  (s.english || []).forEach((x) => {
    if (isIelts(x)) found.push(ieltsToCefr(Number(String(x.score).replace(",", "."))));
    const m = `${x.note} ${x.score}`.match(/\b([ABC][12])\b/);
    if (m) found.push(m[1]);
  });
  (s.exams || []).forEach((x) => {
    const m = String(x.value || "").match(/\b([ABC][12])\b/);
    if (m && /ket|pet|fce|english|ағылшын/i.test(x.name)) found.push(m[1]);
  });
  return found.sort((a, b) => CEFR.indexOf(b) - CEFR.indexOf(a))[0] || "";
}
function ieltsTarget(s) {
  if (!s.plan || !s.plan.dir1) return 0;
  return Math.max(0, ...recommendUnis(s.plan).slice(0, 5).map((r) => r.u.ielts || 0));
}

// Линейный график IELTS по датам (один ряд, пунктир — цель). Наведение на точку — подсказка.
function ieltsChart(points, target) {
  if (points.length < 1) return "";
  const W = 600, H = 220, L = 36, R = 16, T = 14, B = 30;
  const ys = points.map((p) => p.v).concat(target ? [target] : []);
  const yMin = Math.max(0, Math.floor(Math.min(...ys) - 0.5)), yMax = Math.min(9, Math.ceil(Math.max(...ys) + 0.5));
  const t0 = new Date(points[0].date).getTime(), t1 = new Date(points[points.length - 1].date).getTime();
  const x = (d) => (points.length === 1 ? (L + W - R) / 2 : L + ((new Date(d).getTime() - t0) / (t1 - t0 || 1)) * (W - L - R));
  const y = (v) => T + ((yMax - v) / (yMax - yMin || 1)) * (H - T - B);
  const grid = [];
  for (let v = yMin; v <= yMax; v += 1) grid.push(`<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="ch-grid"/><text x="${L - 8}" y="${y(v) + 4}" class="ch-axis" text-anchor="end">${v}</text>`);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return `<div class="chart-wrap" id="ielts-chart">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Прогресс IELTS по датам">
      ${grid.join("")}
      ${target ? `<line x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}" class="ch-target"/><text x="${W - R}" y="${y(target) - 6}" class="ch-axis" text-anchor="end">цель ${target}</text>` : ""}
      <path d="${path}" class="ch-line"/>
      ${points.map((p) => `<circle cx="${x(p.date)}" cy="${y(p.v)}" r="5" class="ch-dot"/>`).join("")}
      <text x="${x(last.date)}" y="${y(last.v) - 12}" class="ch-label" text-anchor="${points.length > 1 ? "end" : "middle"}">${last.v}</text>
      ${points.map((p) => `<text x="${x(p.date)}" y="${H - 8}" class="ch-axis" text-anchor="middle">${fmtShortDate(p.date)}</text>`).join("")}
      ${points.map((p, i) => `<circle cx="${x(p.date)}" cy="${y(p.v)}" r="16" class="ch-hit" data-pt="${i}"/>`).join("")}
    </svg>
    <div class="ch-tip" hidden></div>
  </div>`;
}
function fmtShortDate(iso) {
  const [yy, mm] = iso.split("-");
  return `${mm}.${yy.slice(2)}`;
}
function bindIeltsChart(points) {
  const wrap = document.getElementById("ielts-chart");
  if (!wrap) return;
  const tip = wrap.querySelector(".ch-tip");
  wrap.querySelectorAll(".ch-hit").forEach((c) => {
    const show = () => {
      const p = points[Number(c.dataset.pt)];
      tip.innerHTML = `<b>${esc(String(p.v))}</b> · ${esc(p.exam)}<br><span class="muted">${fmtDate(p.date)}${p.detail ? " · " + esc(p.detail) : ""}</span>`;
      const box = wrap.getBoundingClientRect(), r = c.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = Math.min(box.width - tip.offsetWidth - 4, Math.max(4, r.left - box.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
      tip.style.top = Math.max(0, r.top - box.top - tip.offsetHeight - 6) + "px";
    };
    c.addEventListener("mouseenter", show);
    c.addEventListener("click", show);
    c.addEventListener("mouseleave", () => (tip.hidden = true));
  });
}
function ieltsPoints(s) {
  return (s.english || [])
    .filter(isIelts)
    .map((x) => ({ date: x.date, v: Number(String(x.score).replace(",", ".")), exam: x.exam, detail: [x.l && `L ${x.l}`, x.r && `R ${x.r}`, x.w && `W ${x.w}`, x.s && `S ${x.s}`].filter(Boolean).join(" · ") }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function englishHtml(s) {
  const list = [...(s.english || [])].map((x, i) => ({ x, i })).sort((a, b) => (a.x.date < b.x.date ? 1 : -1));
  const canEdit = state.user.role !== "parent";
  const pts = ieltsPoints(s);
  const best = pts.length ? Math.max(...pts.map((p) => p.v)) : 0;
  const target = ieltsTarget(s);
  const cefr = bestCefr(s);
  const ket = (s.exams || []).filter((x) => /^(KET|PET|FCE)/i.test(x.name) && cellValue(x.value));
  return `<div class="card">
    <div class="eyebrow">Ағылшын тілі</div>
    <h2>🇬🇧 Английский</h2>
    <div class="highlights" style="margin:0 0 14px">
      <div class="hl"><span class="hl-icon">🎯</span><div><div class="eyebrow">Лучший IELTS</div><div><b>${best || "—"}</b>${target ? ` <span class="small muted">цель ${target}</span>` : ""}</div></div></div>
      <div class="hl ${target && best >= target ? "hl-today" : ""}"><span class="hl-icon">📈</span><div><div class="eyebrow">${target ? "До цели" : "Уровень CEFR"}</div><div>${
        target ? (best >= target ? "<b>цель достигнута ✓</b>" : best ? `<b>${(target - best).toFixed(1)}</b> балла` : "сдайте пробный IELTS") : `<b>${cefr || "—"}</b>`
      }</div></div></div>
      <div class="cefr" title="Уровень английского по шкале CEFR">${CEFR.map((c) => `<span class="${c === cefr ? "on" : CEFR.indexOf(c) < CEFR.indexOf(cefr) ? "past" : ""}">${c}</span>`).join("")}</div>
    </div>
    ${target ? "" : `<p class="small muted">Цель IELTS появится, когда ученик заполнит анкету во вкладке «🎓 Поступление»: она берётся из требований подходящих вузов.</p>`}
    ${pts.length ? `<h3>Прогресс IELTS</h3>${ieltsChart(pts, target)}` : `<p class="muted">Добавьте результаты IELTS или пробного IELTS, и здесь появится график прогресса.</p>`}
    <h3>Все результаты</h3>
    ${
      list.length || ket.length
        ? `<div class="table-wrap"><table>
            <tr><th>Дата</th><th>Экзамен</th><th class="num">Балл</th><th class="num">L</th><th class="num">R</th><th class="num">W</th><th class="num">S</th><th>Примечание</th><th></th></tr>
            ${list
              .map(
                ({ x, i }) => `<tr><td>${fmtDate(x.date)}</td><td>${esc(x.exam)}</td><td class="num"><b>${esc(x.score)}</b></td><td class="num">${esc(x.l)}</td><td class="num">${esc(x.r)}</td><td class="num">${esc(x.w)}</td><td class="num">${esc(
                  x.s
                )}</td><td class="small">${esc(x.note)}</td><td>${canEdit ? `<button class="book-del" data-eng-del="${i}" title="Удалить">✕</button>` : ""}</td></tr>`
              )
              .join("")}
            ${ket.map((x) => `<tr><td class="muted">—</td><td>${esc(x.name)}</td><td class="num" colspan="5">${esc(x.value)}</td><td class="small muted">из вкладки «Экзамены»</td><td></td></tr>`).join("")}
          </table></div>`
        : '<p class="muted">Результатов пока нет.</p>'
    }
    ${
      canEdit
        ? `<form class="book-form plan-form" id="eng-form">
            <h3 class="wide">➕ Добавить результат</h3>
            <label>Дата<input type="date" id="eng-date" value="${todayIso()}" required></label>
            <label>Экзамен<select id="eng-exam">${ENGLISH_EXAMS.map((x) => `<option>${esc(x)}</option>`).join("")}</select></label>
            <label>Общий балл<input id="eng-score" maxlength="20" placeholder="например, 5.5 или 146" required></label>
            <label>Уровень / примечание<input id="eng-note" maxlength="100" placeholder="например, B1 Pass with Merit"></label>
            <div class="wide eng-parts">
              <label>Listening<input id="eng-l" maxlength="10"></label><label>Reading<input id="eng-r" maxlength="10"></label>
              <label>Writing<input id="eng-w" maxlength="10"></label><label>Speaking<input id="eng-s" maxlength="10"></label>
            </div>
            <div class="wide save-bar" style="position:static;border:none;padding:0"><button class="btn" type="submit" id="eng-save">Добавить</button><span class="small" id="eng-msg"></span></div>
          </form>`
        : ""
    }
  </div>`;
}

function bindEnglish(s) {
  bindIeltsChart(ieltsPoints(s));
  const form = document.getElementById("eng-form");
  if (!form) return;
  const val = (id) => document.getElementById(id).value.trim();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = { date: val("eng-date"), exam: val("eng-exam"), score: val("eng-score").replace(",", "."), note: val("eng-note"), l: val("eng-l"), r: val("eng-r"), w: val("eng-w"), s: val("eng-s") };
    if (!result.date || !result.score) return;
    document.getElementById("eng-save").disabled = true;
    runStudentEdit(s, "addEnglish", { result }, "english", "eng-msg", "Добавлено ✓");
  });
  app.querySelectorAll("[data-eng-del]").forEach((b) =>
    b.addEventListener("click", () => {
      const x = (s.english || [])[Number(b.dataset.engDel)];
      if (x && confirm(`Удалить ${x.exam} от ${fmtDate(x.date)}?`)) runStudentEdit(s, "deleteEnglish", { result: { date: x.date, exam: x.exam, score: x.score } }, "english", "eng-msg", "Удалено");
    })
  );
}

// Учитель: активности и английский всего класса
function activitiesAllHtml() {
  return `<div class="card"><h2>⭐ Активности и английский</h2>
    <p class="small muted">Нажмите на имя, чтобы открыть страницу ученика.</p>
    <div class="table-wrap"><table>
      <tr><th>#</th><th>Ученик</th><th class="num">Активностей</th><th class="num">Всего часов</th><th class="num">Волонтёрство, ч</th><th class="num">Лучший IELTS</th><th>CEFR</th></tr>
      ${sortedStudents()
        .map((s, i) => {
          const t = activityTotals(s.activities || []);
          const pts = ieltsPoints(s);
          return `<tr><td class="muted">${i + 1}</td><td>${studentLink(s)}</td><td class="num">${(s.activities || []).length || '<span class="pill absent">0</span>'}</td><td class="num">${t.total || "—"}</td><td class="num">${
            t.byType["Волонтёрство"] || "—"
          }</td><td class="num">${pts.length ? Math.max(...pts.map((p) => p.v)) : "—"}</td><td>${bestCefr(s) || "—"}</td></tr>`;
        })
        .join("")}
    </table></div></div>`;
}

// ---------- резюме ученика (открывается в новом окне, сохраняется как PDF через «Печать») ----------
function resumeHtml(s) {
  const personal = (key) => (s.portfolio || []).find((p) => p.section === "Личное" && p.title === key)?.details || "";
  const plan = s.plan || {};
  const periods = gradePeriods(s.grades || []);
  const gradeRows = periods
    .map((p) => ({ p, sum: gradeSummary((s.grades || []).filter((g) => g.period === p)) }))
    .filter((x) => x.sum)
    .map((x) => `<tr><td>${esc(x.p)}</td><td><b>${x.sum.avg.toFixed(2)}</b> из 5</td><td>${esc(x.sum.status)}</td></tr>`)
    .join("");
  const olymp = (s.olympiads || []).filter((x) => cellValue(x.value) && !/^жазбады$/i.test(cellValue(x.value))).map((x) => `<li>${esc(x.name)}: <b>${esc(x.value)}</b></li>`).join("");
  const exams = (s.exams || []).filter((x) => cellValue(x.value) && !/по предметам/i.test(x.name)).map((x) => `<li>${esc(x.name)}: <b>${esc(x.value)}</b></li>`).join("");
  const eng = [...(s.english || [])].sort((a, b) => (a.date < b.date ? 1 : -1)).map((x) => `<li>${esc(x.exam)} — <b>${esc(x.score)}</b>${x.note ? ` (${esc(x.note)})` : ""}, ${fmtDate(x.date)}</li>`).join("");
  const acts = (s.activities || [])
    .map((a) => `<li><b>${esc(a.title)}</b> <span class="m">· ${esc(a.type)}${a.period ? " · " + esc(a.period) : ""}${activityHours(a) ? ` · ≈ ${activityHours(a)} ч` : ""}</span>${a.role ? `<br>${esc(a.role)}` : ""}</li>`)
    .join("");
  const t = activityTotals(s.activities || []);
  const section = (names) =>
    (s.portfolio || []).filter((p) => names.includes(p.section)).map((p) => `<li>${esc(p.title)}${p.details ? ` — ${esc(p.details)}` : ""}${p.date && p.date !== "анкета" ? ` (${esc(p.date)})` : ""}</li>`).join("");
  const achievements = section(["Достижения", "Сертификаты"]);
  const hobbies = section(["Хобби", "Языки"]);
  const books = booksOf(s);
  const best = ieltsPoints(s).reduce((a, p) => Math.max(a, p.v), 0);
  const cefr = bestCefr(s);
  const block = (title, body) => (body ? `<h2>${title}</h2>${body}` : "");
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Резюме — ${esc(s.name)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body { font-family: Inter, Arial, sans-serif; color: #111233; font-size: 12.5px; line-height: 1.45; max-width: 780px; margin: 0 auto; padding: 16px; }
    header { display: flex; gap: 18px; align-items: center; border-bottom: 3px solid #f8df83; padding-bottom: 12px; }
    header img { width: 92px; height: 92px; border-radius: 50%; object-fit: cover; border: 3px solid #f8df83; }
    h1 { margin: 0; font-size: 24px; } h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: #8a6a2c; margin: 18px 0 6px; border-bottom: 1px solid #e6e2d8; padding-bottom: 3px; }
    .sub { color: #6e6a7c; } ul { margin: 0; padding-left: 18px; } li { margin: 2px 0; } .m { color: #6e6a7c; }
    table { border-collapse: collapse; } td { padding: 3px 14px 3px 0; }
    .row { display: flex; gap: 24px; flex-wrap: wrap; } .kv b { font-size: 16px; }
    .bar { position: sticky; top: 0; background: #fff; padding: 8px 0; text-align: right; } .bar button { font: inherit; padding: 8px 16px; border-radius: 8px; border: none; background: #111233; color: #f8df83; font-weight: 700; cursor: pointer; }
    footer { margin-top: 22px; color: #6e6a7c; font-size: 11px; border-top: 1px solid #e6e2d8; padding-top: 6px; }
    @media print { .bar { display: none; } body { padding: 0; } }
  </style></head><body>
  <div class="bar"><button onclick="print()">🖨 Сохранить как PDF</button></div>
  <header>${s.photo ? `<img src="${s.photo}" alt="">` : ""}<div>
    <h1>${esc(s.name)}</h1>
    <div class="sub">${esc(DATA.className || "")}${personal("Дата рождения") ? " · дата рождения " + esc(personal("Дата рождения")) : ""}</div>
    ${plan.career || plan.dir1 ? `<div>Цель: <b>${esc(plan.career || "")}</b>${plan.dir1 ? ` · ${esc(plan.dir1)}` : ""}${plan.where ? ` · ${esc(plan.where.toLowerCase())}` : ""}</div>` : ""}
  </div></header>
  <div class="row" style="margin-top:12px">
    ${gradeRows ? `<div class="kv">Средний балл<br><b>${gradeSummary((s.grades || []).filter((g) => g.period === periods[0]))?.avg.toFixed(2) || "—"}</b></div>` : ""}
    ${best ? `<div class="kv">Лучший IELTS<br><b>${best}</b></div>` : ""}
    ${cefr ? `<div class="kv">Английский (CEFR)<br><b>${cefr}</b></div>` : ""}
    ${t.total ? `<div class="kv">Часы активностей<br><b>${t.total}</b></div>` : ""}
    ${books.length ? `<div class="kv">Прочитано книг<br><b>${books.length}</b></div>` : ""}
  </div>
  ${block("Успеваемость", gradeRows ? `<table>${gradeRows}</table>` : "")}
  ${block("Олимпиады", olymp ? `<ul>${olymp}</ul>` : "")}
  ${block("Английский язык", eng ? `<ul>${eng}</ul>` : "")}
  ${block("Экзамены и тесты", exams ? `<ul>${exams}</ul>` : "")}
  ${block("Активности", acts ? `<ul>${acts}</ul>${Object.keys(t.byType).length ? `<p class="m">Итого: ${Object.entries(t.byType).map(([k, v]) => `${esc(k)} ${v} ч`).join(" · ")}</p>` : ""}` : "")}
  ${block("Достижения и сертификаты", achievements ? `<ul>${achievements}</ul>` : "")}
  ${block("Интересы и языки", hobbies ? `<ul>${hobbies}</ul>` : "")}
  ${block("Прочитанные книги", books.length ? `<p>${books.slice(0, 15).map((b) => esc(b.title)).join(" · ")}${books.length > 15 ? ` и ещё ${books.length - 15}` : ""}</p>` : "")}
  <footer>Сформировано ${fmtDate(todayIso())} на сайте «Кабинет ученика» · ${esc(DATA.className || "")}</footer>
  </body></html>`;
}

function openResume(s) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Браузер заблокировал новое окно. Разрешите всплывающие окна для этого сайта и нажмите ещё раз.");
    return;
  }
  w.document.open();
  w.document.write(resumeHtml(s));
  w.document.close();
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
