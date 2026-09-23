// Логика сайта. Данные приходят из Google Apps Script (CONFIG.API_URL),
// а если адрес не задан, берутся демо-данные из data.js.

const app = document.getElementById("app");
const DEMO = !CONFIG.API_URL;
let DATA = null; // данные текущего пользователя (ученик получает только свои)
let creds = null; // { login, pin, as } для запросов к API; as = "parent" для входа родителя
const STATUS_LABEL = {
  present: "Был",
  absent: "Пропуск",
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
  // Посещаемость: был на уроке (включая опоздания)
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
  const r = await fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...(creds || {}), ...payload }),
  });
  if (!r.ok) throw new Error("Сервер недоступен (" + r.status + ")");
  const res = await r.json();
  if (!res.ok) throw new Error(res.error || "Ошибка сервера");
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
  if (action === "names") return { ok: true, className: D.className, students: publicNames(D.students) };
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
        calendar: D.calendar,
        resources: D.resources,
        students: [strip(s)],
        attendance: D.attendance.map((l) => ({ date: l.date, subject: l.subject, absent: only(l.absent), late: only(l.late), excused: only(l.excused) })),
      },
    };
  }
  if (action === "saveLesson" && isTeacher) return { ok: true, lesson: payload.lesson };
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
    codeInput: 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 700 123 45 67"',
  },
  teacher: {
    label: "Учитель",
    hint: "Для учителя и воспитателя: введите свой логин и PIN-код.",
    login: "Логин",
    code: "PIN-код",
    codeInput: 'type="password" autocomplete="current-password"',
  },
};

function renderLogin() {
  const role = LOGIN_ROLES[state.loginAs] ? state.loginAs : "student";
  const R = LOGIN_ROLES[role];
  const picker = role !== "teacher";
  if (picker && !classList) {
    loadClassList()
      .then(() => state.user || renderLogin())
      .catch((ex) => {
        const err = document.getElementById("login-error");
        if (err) err.textContent = "Не удалось загрузить список класса: " + ex.message;
      });
  }
  if (classList) document.getElementById("class-name").textContent = classList.className || "";
  const loginField = picker
    ? `<select id="login" required ${classList ? "" : "disabled"}>
        <option value="">${classList ? R.pick : "Загрузка списка…"}</option>
        ${(classList?.students || []).map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}
      </select>`
    : `<input id="login" autocomplete="username" required>`;
  app.innerHTML = `
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
    ["portfolio", "📁 Портфолио"],
    ["olympiads", "🏅 Олимпиады"],
    ["exams", "📝 Экзамены"],
    ["tests", "🧠 Тесты"],
  ];
  if (isParent || byTeacher) tabs.push(["events", "👪 Мероприятия родителей"]);
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
  if (state.tab === "tests") body = testsHtml(s);
  if (state.tab === "events") body = parentEventsHtml(s);
  if (state.tab === "resources") body = resourcesHtml();

  const phones = [["Мама", s.momPhone], ["Папа", s.dadPhone]].filter(([, p]) => p);
  app.innerHTML = `
    ${byTeacher ? `<button class="btn btn-ghost" id="back-btn" style="margin-bottom:14px">← Ко всем ученикам</button>` : ""}
    <div class="card">
      ${isParent ? '<div class="muted small">Страница родителя · ваш ребёнок</div>' : ""}
      <h2>${esc(s.name)}</h2>
      <div class="muted small">Логин: ${esc(s.id)} · Наставник: ${esc(s.idp?.mentor || "—")}</div>
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
      <div class="stat red"><div class="stat-value">${st.absent}</div><div class="stat-label">Пропусков без причины</div></div>
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
}

// Для родителя: последние пропуски и опоздания
function recentMissesHtml(s) {
  const misses = lessonsSorted()
    .reverse()
    .map((l) => ({ l, st: statusFor(l, s.id) }))
    .filter((x) => x.st !== "present")
    .slice(0, 5);
  return `<div class="card">
    <h3>Последние пропуски и опоздания</h3>
    ${
      misses.length
        ? `<div class="table-wrap"><table>${misses
            .map(({ l, st }) => `<tr><td>${fmtDate(l.date)}</td><td>${esc(l.subject)}</td><td><span class="pill ${st}">${STATUS_LABEL[st]}</span></td></tr>`)
            .join("")}</table></div>`
        : '<p class="muted" style="margin:0">Пропусков нет 👍</p>'
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
  return `<div class="card"><h2>📆 ${all ? "Календарь событий" : "Ближайшие события"}</h2><div class="events">${list
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
  return `
    <div class="card">
      <h2>Цели и план развития (IDP)</h2>
      <div class="info-grid" style="margin-bottom:16px">
        <div><div class="muted small">Наставник</div><div>${esc(idp.mentor || "—")}</div></div>
        <div><div class="muted small">Сильные стороны</div><div>${esc(idp.strengths || "—")}</div></div>
        <div><div class="muted small">Общий прогресс</div><div><b>${idpProgress(s)}%</b></div></div>
      </div>
      ${goals.length ? "" : '<p class="muted">Цели пока не добавлены.</p>'}
      ${goals
        .map((g) => {
          const p = goalProgress(g);
          return `<div class="goal">
            <div class="goal-head">
              <div>
                <div class="goal-title">${esc(g.title)}</div>
                <div class="muted small">${esc(g.area || "")}</div>
              </div>
              <div class="small">${g.deadline ? `Срок: <b>${fmtDate(g.deadline)}</b>` : ""}</div>
            </div>
            ${
              (g.steps || []).length
                ? `<div class="progress ${p === 100 ? "done" : ""}"><span style="width:${p}%"></span></div><div class="small muted">Выполнено: ${p}%</div>`
                : ""
            }
            ${
              (g.steps || []).length
                ? `<ul class="steps">${g.steps.map((st) => `<li class="${st.done ? "done" : ""}">${st.done ? "☑" : "☐"} ${esc(st.text)}</li>`).join("")}</ul>`
                : `<div class="small" style="margin-top:6px">${g.done ? '<span class="pill present">☑ Выполнено</span>' : '<span class="pill neutral">☐ В процессе</span>'}</div>`
            }
          </div>`;
        })
        .join("")}
      ${idp.comment ? `<div class="card" style="background:var(--accent-soft);border:none;margin:0"><b>Комментарий учителя:</b> ${esc(idp.comment)}</div>` : ""}
    </div>`;
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

function portfolioHtml(s) {
  const items = s.portfolio || [];
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

function parentEventsHtml(s) {
  const list = s.parentEvents || [];
  const done = list.filter((x) => x.value).length;
  return `<div class="card"><h2>Мероприятия для родителей</h2>${
    list.length
      ? `<p class="small muted">Посещено: <b>${done} из ${list.length}</b></p>
         <div class="table-wrap"><table class="kv">${list
           .map((x) => `<tr><th>${esc(x.name)}</th><td>${x.value ? '<span class="pill present">✓ Был</span>' : '<span class="pill absent">✗ Не был</span>'}</td></tr>`)
           .join("")}</table></div>`
      : '<p class="muted">Данных пока нет.</p>'
  }</div>`;
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
  return `<select id="subject-filter">
    <option value="">Все предметы</option>
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
  return `
    <div class="card">
      <h2>Посещаемость по предметам</h2>
      <div class="table-wrap"><table>
        <tr><th>Предмет</th><th class="num">Уроков</th><th class="num">Был</th><th class="num">Опоздал</th><th class="num">Пропуск</th><th class="num">Уваж.</th><th class="num">%</th></tr>
        ${bySubject
          .map(
            ([subj, x]) => `<tr><td>${esc(subj)}</td><td class="num">${x.total}</td><td class="num">${x.present}</td>
            <td class="num">${x.late}</td><td class="num">${x.absent}</td><td class="num">${x.excused}</td><td class="num"><b>${x.rate}%</b></td></tr>`
          )
          .join("")}
      </table></div>
    </div>
    <div class="card">
      <h2>История уроков</h2>
      <div class="filters">${subjectSelectHtml()}
        <span class="muted small" style="align-self:center">Уроков: ${st.total} · пропусков: ${st.absent} · опозданий: ${st.late}</span>
      </div>
      <div class="table-wrap"><table>
        <tr><th>Дата</th><th>Предмет</th><th>Статус</th></tr>
        ${lessons
          .map((l) => {
            const status = statusFor(l, s.id);
            return `<tr><td>${fmtDate(l.date)}</td><td>${esc(l.subject)}</td><td><span class="pill ${status}">${STATUS_LABEL[status]}</span></td></tr>`;
          })
          .join("")}
      </table></div>
    </div>`;
}

// ---------- teacher view ----------
function renderTeacher() {
  const tabs = [
    ["summary", "👥 Сводка"],
    ["mark", "✏️ Отметить урок"],
    ["journal", "📋 Журнал"],
    ["idp-all", "🎯 Цели всех"],
    ["olympiads-all", "🏅 Олимпиады"],
    ["exams-all", "📝 Экзамены"],
    ["events-all", "👪 Родители"],
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
  if (state.tab === "events-all") body = eventsTableHtml();
  if (state.tab === "tests-all") body = wideTableHtml("Результаты тестов", "tests");
  if (state.tab === "resources") body = resourcesHtml();

  app.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat-value">${DATA.students.length}</div><div class="stat-label">Учеников</div></div>
      <div class="stat"><div class="stat-value">${totalLessons}</div><div class="stat-label">Проведено уроков</div></div>
      <div class="stat blue"><div class="stat-value">${totalLessons ? avgRate + "%" : "—"}</div><div class="stat-label">Средняя посещаемость</div></div>
      <div class="stat red"><div class="stat-value">${totalAbs}</div><div class="stat-label">Всего пропусков</div></div>
    </div>
    ${tabsHtml(tabs)}
    ${body}`;
  bindTabs();
  bindSubjectFilter();
  if (state.tab === "mark") bindMark();
  app.querySelectorAll("[data-student]").forEach((b) =>
    b.addEventListener("click", () => {
      state.viewStudent = b.dataset.student;
      state.tab = "attendance";
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

function eventsTableHtml() {
  const cols = [...new Set(DATA.students.flatMap((s) => (s.parentEvents || []).map((x) => x.name)))];
  if (!cols.length) return '<div class="card"><h2>Мероприятия для родителей</h2><p class="muted">Данных пока нет.</p></div>';
  const rows = DATA.students
    .map((s) => {
      const map = Object.fromEntries((s.parentEvents || []).map((x) => [x.name, x.value]));
      return { s, map, total: cols.filter((c) => map[c]).length };
    })
    .sort((a, b) => b.total - a.total || a.s.name.localeCompare(b.s.name, "ru"));
  const perEvent = cols.map((c) => rows.filter((r) => r.map[c]).length);
  const phones = (s) =>
    [s.momPhone, s.dadPhone]
      .filter(Boolean)
      .map((p) => `<a href="tel:${esc(p.replace(/[^\d+]/g, ""))}">${esc(p)}</a>`)
      .join("<br>") || '<span class="muted">—</span>';
  return `<div class="card"><h2>Участие родителей в мероприятиях</h2>
    <div class="table-wrap"><table class="journal">
      <tr><th class="name">Ученик</th><th>Итого</th>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}<th>Телефоны</th></tr>
      ${rows
        .map(
          ({ s, map, total }) => `<tr><td class="name">${studentLink(s)}</td><td><b>${total}/${cols.length}</b></td>${cols
            .map((c) => `<td>${map[c] ? '<span class="mark present">✓</span>' : '<span class="mark absent">✗</span>'}</td>`)
            .join("")}<td class="small" style="text-align:left">${phones(s)}</td></tr>`
        )
        .join("")}
      <tr><td class="name muted">Пришли</td><td></td>${perEvent.map((n) => `<td class="muted">${n}</td>`).join("")}<td></td></tr>
    </table></div></div>`;
}

// Ближайшие дни рождения (из портфолио: Личное → Дата рождения)
function birthdaysHtml() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const list = DATA.students
    .map((s) => {
      const item = (s.portfolio || []).find((x) => x.section === "Личное" && /дата рождения|туған күн/i.test(x.title));
      const m = item && String(item.details).match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?/);
      if (!m) return null;
      let next = new Date(today.getFullYear(), m[2] - 1, m[1]);
      if (next < today) next = new Date(today.getFullYear() + 1, m[2] - 1, m[1]);
      const days = Math.round((next - today) / 86400000);
      const age = m[3] ? next.getFullYear() - Number(m[3]) : null;
      return { s, next, days, age };
    })
    .filter((x) => x && x.days <= 30)
    .sort((a, b) => a.days - b.days);
  if (!list.length) return "";
  return `<div class="card"><h3>🎂 Дни рождения в ближайшие 30 дней</h3><div class="chips">${list
    .map(
      ({ s, next, days, age }) =>
        `<span class="chip">${studentLink(s)} <b>${String(next.getDate()).padStart(2, "0")}.${String(next.getMonth() + 1).padStart(2, "0")}</b>${
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
      <h2>Посещаемость учеников</h2>
      <div class="filters">
        ${subjectSelectHtml()}
        <select id="sort">
          <option value="name" ${sort === "name" ? "selected" : ""}>По алфавиту</option>
          <option value="absent" ${sort === "absent" ? "selected" : ""}>Больше всего пропусков</option>
          <option value="rate" ${sort === "rate" ? "selected" : ""}>Худшая посещаемость</option>
        </select>
      </div>
      <div class="table-wrap"><table>
        <tr><th>#</th><th>Ученик</th><th class="num">Уроков</th><th class="num">Был</th><th class="num">Опоздал</th>
          <th class="num">Пропуск</th><th class="num">Уваж.</th><th class="num">Посещ.</th><th class="num">IDP</th></tr>
        ${rows
          .map(
            ({ s, st }, i) => `<tr>
              <td class="muted">${i + 1}</td>
              <td>${studentLink(s)}</td>
              <td class="num">${st.total}</td>
              <td class="num">${st.present}</td>
              <td class="num">${st.late ? `<span class="pill late">${st.late}</span>` : 0}</td>
              <td class="num">${st.absent ? `<span class="pill absent">${st.absent}</span>` : 0}</td>
              <td class="num">${st.excused ? `<span class="pill excused">${st.excused}</span>` : 0}</td>
              <td class="num"><b style="color:${st.rate < 85 ? "var(--red)" : "inherit"}">${st.rate}%</b></td>
              <td class="num">${idpProgress(s)}%</td>
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
      <h2>Журнал посещаемости</h2>
      <div class="filters">${subjectSelectHtml()}</div>
      <div class="legend">
        <span><span class="mark present">✓</span> был</span>
        <span><span class="mark absent">Н</span> пропуск</span>
        <span><span class="mark late">О</span> опоздал</span>
        <span><span class="mark excused">У</span> уважительная причина</span>
      </div>
      <div class="table-wrap"><table class="journal">
        <tr><th class="name">Ученик</th>${lessons
          .map((l) => `<th title="${esc(l.subject)}">${fmtShort(l.date)}${f ? "" : `<br><span style="text-transform:none;font-weight:400">${esc(l.subject.slice(0, 4))}.</span>`}</th>`)
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

// ---------- teacher: отметить урок ----------
function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Предметы выбранного дня недели идут первыми, затем все остальные
function subjectsForDate(iso) {
  const dayName = Object.keys(DAY_INDEX).find((k) => DAY_INDEX[k] === new Date(iso + "T12:00:00").getDay());
  const ofDay = (DATA.schedule.find((d) => d.day === dayName)?.lessons || []).map((l) => l.subject);
  const all = new Set(DATA.schedule.flatMap((d) => d.lessons.map((l) => l.subject)).concat(subjects()));
  return { ofDay: [...new Set(ofDay)], other: [...all].filter((x) => !ofDay.includes(x)).sort() };
}

// Загружает отметки урока из журнала (если он уже отмечен) в state.mark
function loadMark(date, subject) {
  const existing = DATA.attendance.find((l) => l.date === date && l.subject === subject);
  const marks = {};
  DATA.students.forEach((s) => (marks[s.id] = existing ? statusFor(existing, s.id) : "present"));
  state.mark = { date, subject, marks, existing: !!existing };
}

function markHtml() {
  if (!state.mark) {
    const date = todayIso();
    const { ofDay, other } = subjectsForDate(date);
    loadMark(date, ofDay[0] || other[0] || "");
  }
  const m = state.mark;
  const { ofDay, other } = subjectsForDate(m.date);
  const opt = (x) => `<option ${x === m.subject ? "selected" : ""}>${esc(x)}</option>`;
  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  Object.values(m.marks).forEach((st) => counts[st]++);
  return `
    <div class="card">
      <h2>Отметить посещаемость</h2>
      <div class="filters">
        <input type="date" id="mark-date" value="${m.date}">
        <select id="mark-subject">
          ${ofDay.length ? `<optgroup label="По расписанию">${ofDay.map(opt).join("")}</optgroup>` : ""}
          ${other.length ? `<optgroup label="Другие предметы">${other.map(opt).join("")}</optgroup>` : ""}
        </select>
        <button class="btn btn-ghost" id="mark-all">Все присутствовали</button>
      </div>
      <p class="small muted">${m.existing ? "Этот урок уже отмечен: загружены сохранённые отметки. При сохранении они обновятся." : "Новый урок. По умолчанию все присутствовали, отметьте отсутствующих."}</p>
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
        <span class="small" id="mark-counts">Был: ${counts.present} · Пропуск: ${counts.absent} · Опоздал: ${counts.late} · Уваж.: ${counts.excused}</span>
        <span class="small" id="save-msg"></span>
      </div>
    </div>`;
}

function bindMark() {
  const m = state.mark;
  const refresh = () => render();
  document.getElementById("mark-date").addEventListener("change", (e) => {
    if (!e.target.value) return;
    const { ofDay, other } = subjectsForDate(e.target.value);
    const subject = ofDay.includes(m.subject) || other.includes(m.subject) ? m.subject : ofDay[0] || other[0];
    loadMark(e.target.value, subject);
    refresh();
  });
  document.getElementById("mark-subject").addEventListener("change", (e) => {
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
      document.getElementById("mark-counts").textContent = `Был: ${c.present} · Пропуск: ${c.absent} · Опоздал: ${c.late} · Уваж.: ${c.excused}`;
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
