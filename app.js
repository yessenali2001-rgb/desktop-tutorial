// Логика сайта. Данные приходят из Google Apps Script (CONFIG.API_URL),
// а если адрес не задан, берутся демо-данные из data.js.

const app = document.getElementById("app");
const DEMO = !CONFIG.API_URL;
let DATA = null; // данные текущего пользователя (ученик получает только свои)
let creds = null; // { login, pin } для запросов к API
const STATUS_LABEL = {
  present: "Был",
  absent: "Пропуск",
  late: "Опоздал",
  excused: "Уваж. причина",
};
const STATUS_MARK = { present: "✓", absent: "Н", late: "О", excused: "У" };
const DAY_INDEX = { "Понедельник": 1, "Вторник": 2, "Среда": 3, "Четверг": 4, "Пятница": 5, "Суббота": 6, "Воскресенье": 0 };

let state = { user: null, tab: null, viewStudent: null, subjectFilter: "" };

// ---------- helpers ----------
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function fmtShort(iso) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
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
  if (!steps.length) return goal.progress ?? 0;
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
    body: JSON.stringify({ action, login: creds.login, pin: creds.pin, ...payload }),
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
  const login = creds.login.toLowerCase();
  const isTeacher = login === D.teacher.login.toLowerCase() && creds.pin === D.teacher.pin;
  const s = D.students.find((x) => x.id.toLowerCase() === login && x.pin === creds.pin);
  if (!isTeacher && !s) throw new Error("Неверный логин или PIN-код");
  if (action === "login") {
    const strip = ({ pin, ...rest }) => rest;
    if (isTeacher) return { ok: true, role: "teacher", data: { ...D, students: D.students.map(strip) } };
    const only = (list) => (list.includes(s.id) ? [s.id] : []);
    return {
      ok: true,
      role: "student",
      id: s.id,
      data: {
        className: D.className,
        schedule: D.schedule,
        students: [strip(s)],
        attendance: D.attendance.map((l) => ({ date: l.date, subject: l.subject, absent: only(l.absent), late: only(l.late), excused: only(l.excused) })),
      },
    };
  }
  if (action === "saveLesson" && isTeacher) return { ok: true, lesson: payload.lesson };
  throw new Error("Недоступно");
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

async function login(loginValue, pin) {
  creds = { login: loginValue, pin };
  const res = await api("login");
  DATA = res.data;
  state.user = res.role === "teacher" ? { role: "teacher" } : { role: "student", id: res.id };
  saveSession();
}

function logout() {
  state = { user: null, tab: null, viewStudent: null, subjectFilter: "" };
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
    document.getElementById("user-name").textContent = "Учитель";
    if (state.viewStudent) renderStudent(findStudent(state.viewStudent), true);
    else renderTeacher();
  } else {
    const s = findStudent(state.user.id);
    document.getElementById("user-name").textContent = s.name;
    renderStudent(s, false);
  }
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-wrap card">
      <h2>Вход</h2>
      <p class="muted small">Введите свой логин (например, S01) и PIN-код, который дал учитель.</p>
      ${DEMO ? '<p class="small notice">Демо-режим: тестовые данные. Подключите Google Таблицу в config.js.</p>' : ""}
      <form id="login-form">
        <div class="field">
          <label for="login">Логин</label>
          <input id="login" autocomplete="username" required>
        </div>
        <div class="field">
          <label for="pin">PIN-код</label>
          <input id="pin" type="password" inputmode="numeric" autocomplete="current-password" required>
        </div>
        <div class="error" id="login-error"></div>
        <button class="btn btn-block" type="submit" id="login-btn">Войти</button>
      </form>
    </div>`;
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("login-btn");
    const err = document.getElementById("login-error");
    btn.disabled = true;
    btn.textContent = "Загрузка…";
    err.textContent = "";
    try {
      await login(document.getElementById("login").value.trim(), document.getElementById("pin").value.trim());
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
  const tabs = [["schedule", "📅 Расписание"], ["idp", "🎯 IDP план"], ["attendance", "✅ Посещаемость"]];
  if (!tabs.some(([k]) => k === state.tab)) state.tab = "schedule";
  const st = attendanceStats(s.id);

  let body = "";
  if (state.tab === "schedule") body = scheduleHtml(s.schedule || DATA.schedule);
  if (state.tab === "idp") body = idpHtml(s);
  if (state.tab === "attendance") body = studentAttendanceHtml(s);

  app.innerHTML = `
    ${byTeacher ? `<button class="btn btn-ghost" id="back-btn" style="margin-bottom:14px">← Ко всем ученикам</button>` : ""}
    <div class="card">
      <h2>${esc(s.name)}</h2>
      <div class="muted small">Логин: ${esc(s.id)} · Наставник: ${esc(s.idp?.mentor || "—")}</div>
    </div>
    <div class="stats">
      <div class="stat blue"><div class="stat-value">${st.rate}%</div><div class="stat-label">Посещаемость</div></div>
      <div class="stat red"><div class="stat-value">${st.absent}</div><div class="stat-label">Пропусков без причины</div></div>
      <div class="stat orange"><div class="stat-value">${st.late}</div><div class="stat-label">Опозданий</div></div>
      <div class="stat green"><div class="stat-value">${idpProgress(s)}%</div><div class="stat-label">Выполнение IDP</div></div>
    </div>
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

function scheduleHtml(schedule) {
  const today = new Date().getDay();
  return `<div class="card"><h2>Расписание на неделю</h2><div class="week">${schedule
    .map((d) => {
      const isToday = DAY_INDEX[d.day] === today;
      return `<div class="day ${isToday ? "today" : ""}">
        <div class="day-name">${esc(d.day)} ${isToday ? '<span class="badge">Сегодня</span>' : ""}</div>
        ${d.lessons
          .map(
            (l, i) => `<div class="lesson">
              <div class="lesson-time">${i + 1} урок · ${esc(l.time)}</div>
              <div class="lesson-subj">${esc(l.subject)}</div>
              ${l.room ? `<div class="muted small">Кабинет ${esc(l.room)}</div>` : ""}
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
      <h2>Индивидуальный план развития (IDP)</h2>
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
            <div class="progress ${p === 100 ? "done" : ""}"><span style="width:${p}%"></span></div>
            <div class="small muted">Выполнено: ${p}%</div>
            <ul class="steps">${(g.steps || [])
              .map((st) => `<li class="${st.done ? "done" : ""}">${st.done ? "☑" : "☐"} ${esc(st.text)}</li>`)
              .join("")}</ul>
          </div>`;
        })
        .join("")}
      ${idp.comment ? `<div class="card" style="background:var(--accent-soft);border:none;margin:0"><b>Комментарий учителя:</b> ${esc(idp.comment)}</div>` : ""}
    </div>`;
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
  const tabs = [["summary", "👥 Сводка"], ["mark", "✏️ Отметить урок"], ["journal", "📋 Журнал"], ["idp-all", "🎯 IDP всех"], ["schedule", "📅 Расписание"]];
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
  if (state.tab === "schedule") body = scheduleHtml(DATA.schedule);

  app.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat-value">${DATA.students.length}</div><div class="stat-label">Учеников</div></div>
      <div class="stat"><div class="stat-value">${totalLessons}</div><div class="stat-label">Проведено уроков</div></div>
      <div class="stat blue"><div class="stat-value">${avgRate}%</div><div class="stat-label">Средняя посещаемость</div></div>
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

function summaryHtml(all) {
  const sort = state.sort || "name";
  const rows = [...all].sort((a, b) => {
    if (sort === "absent") return b.st.absent - a.st.absent;
    if (sort === "rate") return a.st.rate - b.st.rate;
    return a.s.name.localeCompare(b.s.name, "ru");
  });
  return `
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
      await login(saved.login, saved.pin);
    } catch (e) {
      logout();
      return;
    }
  }
  render();
})();
