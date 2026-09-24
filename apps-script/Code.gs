/**
 * Сервер сайта «Кабинет ученика» на Google Apps Script.
 * База данных — Google Таблица, к которой привязан этот скрипт.
 *
 * Первый запуск: выберите функцию setup и нажмите «Выполнить».
 * Она создаст листы и заполнит их тестовыми данными.
 */

const SHEETS = {
  settings: "Настройки",
  students: "Ученики",
  schedule: "Расписание",
  idp: "IDP",
  attendance: "Посещаемость",
  portfolio: "Портфолио",
  grades: "Оценки",
  olympiads: "Олимпиады",
  exams: "Экзамены",
  tests: "Тесты",
  parentEvents: "Мероприятия родителей",
  resources: "Ресурсы",
  calendar: "Календарь",
};

// «Широкие» листы: ID | ФИО | колонка на каждый показатель. Колонки можно добавлять.
const WIDE = { olympiads: false, exams: false, tests: false, parentEvents: true }; // true — значения-галочки

const HEADERS = {
  settings: ["Параметр", "Значение"],
  students: ["ID", "ФИО", "PIN", "Наставник", "Сильные стороны", "Комментарий учителя", "Телефон мамы", "Телефон папы", "Фото"],
  schedule: ["День", "№ урока", "Время", "Предмет", "Кабинет", "Учитель"],
  idp: ["ID ученика", "Цель", "Направление", "Срок", "Шаг", "Выполнено"],
  attendance: ["Дата", "Этюд", "Отсутствовали (ID через запятую)", "Опоздали (ID через запятую)", "Уважительная причина (ID через запятую)"],
  portfolio: ["ID ученика", "Раздел", "Название", "Детали", "Дата / год"],
  grades: ["ID ученика", "Класс, учебный год", "Предмет", "1 тоқсан", "2 тоқсан", "3 тоқсан", "4 тоқсан", "Жылдық", "Емтихан", "Қорытынды"],
  resources: ["Раздел", "Ресурс", "Где показывать (Ресурсы / Тесты)"],
  calendar: ["Начало", "Окончание (если несколько дней)", "Событие"],
  olympiads: ["ID", "ФИО", "Областной", "KBO final"],
  exams: ["ID", "ФИО", "KET", "BTS"],
  tests: ["ID", "ФИО", "Темперамент"],
  parentEvents: ["ID", "ФИО", "Родительское собрание"],
};

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MAX_FAILS = 5; // попыток входа до блокировки
const LOCK_SECONDS = 600; // блокировка на 10 минут

// ===================== HTTP =====================

function doGet() {
  return json_({ ok: true, message: "API «Кабинет ученика» работает" });
}

function doPost(e) {
  let res;
  try {
    const req = JSON.parse(e.postData.contents);
    res = handle_(req);
  } catch (err) {
    res = { ok: false, error: String((err && err.message) || err) };
  }
  return json_(res);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(req) {
  // Список для страницы входа — доступен без пароля (только ID и ФИО учеников, роли учителей)
  if (req.action === "names") {
    const settings = readSettings_();
    const staff = [];
    if (settings.teacherPin) staff.push({ login: settings.teacherLogin, label: "Учитель" });
    if (settings.tutorPin) staff.push({ login: settings.tutorLogin, label: "Воспитатель" });
    return {
      ok: true,
      className: settings.className,
      staff: staff,
      students: readStudents_()
        .map((s) => ({ id: s.id, name: s.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "ru")),
    };
  }
  const user = auth_(req.login, req.pin, req.as);
  switch (req.action) {
    case "login":
      return { ok: true, role: user.role, id: user.id, staff: user.staff, data: user.role === "teacher" ? teacherData_() : studentData_(user.id) }; // родитель видит то же, что и ребёнок
    case "saveLesson":
      if (user.role !== "teacher") throw new Error("Доступно только учителю");
      return { ok: true, lesson: saveLesson_(req.lesson) };
    case "setPhoto": {
      // Фото меняют только учитель и воспитатель
      if (user.role !== "teacher") throw new Error("Фото меняет только учитель или воспитатель");
      const id = targetId_(user, req.id, "");
      return { ok: true, id: id, photo: setPhoto_(id, req.photo) };
    }
    case "addBook": {
      const id = targetId_(user, req.id, "Книги добавляет сам ученик или учитель");
      return { ok: true, id: id, books: addBook_(id, req.book) };
    }
    case "addGoal": {
      const id = targetId_(user, req.id, "Цели добавляет сам ученик или учитель");
      return { ok: true, id: id, goals: addGoal_(id, req.goal) };
    }
    case "setGoalDone": {
      const id = targetId_(user, req.id, "Цели отмечает сам ученик или учитель");
      return { ok: true, id: id, goals: setGoalDone_(id, req.title, req.step, req.done) };
    }
    case "deleteGoal": {
      const id = targetId_(user, req.id, "Цели удаляет сам ученик или учитель");
      return { ok: true, id: id, goals: deleteGoal_(id, req.title) };
    }
    case "setIdpInfo": {
      if (user.role !== "teacher") throw new Error("Доступно только учителю и воспитателю");
      const id = targetId_(user, req.id, "");
      return { ok: true, id: id, info: setIdpInfo_(id, req.info) };
    }
    case "deleteBook": {
      const id = targetId_(user, req.id, "Книги удаляет сам ученик или учитель");
      return { ok: true, id: id, books: deleteBook_(id, req.book) };
    }
    default:
      throw new Error("Неизвестное действие: " + req.action);
  }
}

// ===================== Авторизация =====================

// as = "parent": логин — ID ребёнка, код — телефон мамы или папы
function auth_(login, pin, as) {
  login = String(login || "").trim();
  pin = String(pin || "").trim();
  if (!login || !pin) throw new Error("Введите логин и PIN-код");

  const cache = CacheService.getScriptCache();
  const key = "fail:" + login.toLowerCase();
  const fails = Number(cache.get(key) || 0);
  if (fails >= MAX_FAILS) throw new Error("Слишком много неверных попыток. Подождите 10 минут.");

  if (as === "parent") {
    const code = phone_(pin);
    const child =
      code &&
      readStudents_().find((x) => x.id.toLowerCase() === login.toLowerCase() && (phone_(x.momPhone) === code || phone_(x.dadPhone) === code));
    if (child) return { role: "parent", id: child.id };
  } else {
    const settings = readSettings_();
    if (settings.teacherPin && login.toLowerCase() === settings.teacherLogin.toLowerCase() && pin === settings.teacherPin) {
      return { role: "teacher", staff: "Учитель" };
    }
    if (settings.tutorPin && login.toLowerCase() === settings.tutorLogin.toLowerCase() && pin === settings.tutorPin) {
      return { role: "teacher", staff: "Воспитатель" };
    }
    const s = readStudents_().find((x) => x.id.toLowerCase() === login.toLowerCase() && x.pin === pin);
    if (s) return { role: "student", id: s.id };
  }

  cache.put(key, String(fails + 1), LOCK_SECONDS);
  if (as === "parent") throw new Error("Неверный номер телефона. Введите номер мамы или папы, который указан у учителя.");
  const isStudent = readStudents_().some((x) => x.id.toLowerCase() === login.toLowerCase());
  throw new Error(isStudent ? "Неверный PIN-код" : "Неверный логин или PIN-код");
}

// ===================== Чтение данных =====================

function sheet_(key) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEETS[key]);
  if (!sh) throw new Error("Нет листа «" + SHEETS[key] + "». Запустите функцию setup.");
  return sh;
}

function rows_(key, optional) {
  if (optional && !SpreadsheetApp.getActive().getSheetByName(SHEETS[key])) return [];
  return sheet_(key)
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((r) => r.some((v) => String(v).trim() !== ""));
}

function tz_() {
  return SpreadsheetApp.getActive().getSpreadsheetTimeZone();
}

function isDate_(v) {
  return Object.prototype.toString.call(v) === "[object Date]";
}

// Дата из ячейки → "yyyy-MM-dd"
function iso_(v) {
  if (isDate_(v)) return Utilities.formatDate(v, tz_(), "yyyy-MM-dd");
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return m[3] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  return s;
}

// Время из ячейки (Sheets может превратить "08:30" в дату)
function time_(v) {
  if (isDate_(v)) return Utilities.formatDate(v, tz_(), "HH:mm");
  return String(v).trim();
}

// Значение ячейки как текст (даты → дд.мм.гггг)
function cellText_(v) {
  if (isDate_(v)) return Utilities.formatDate(v, tz_(), "dd.MM.yyyy");
  return String(v === null || v === undefined ? "" : v).trim();
}

function ids_(v) {
  return String(v || "")
    .split(/[,;\s]+/)
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);
}

// Телефон → последние 10 цифр, чтобы +7 701…, 8 701… и 701… совпадали
function phone_(v) {
  const digits = String(v || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
}

function isDone_(v) {
  return v === true || /^(да|true|1|x|х|✓|\+)$/i.test(String(v).trim());
}

function readSettings_() {
  const map = {};
  rows_("settings").forEach((r) => (map[String(r[0]).trim()] = String(r[1]).trim()));
  return {
    className: map["Название класса"] || "",
    teacherLogin: map["Логин учителя"] || "teacher",
    teacherPin: map["PIN учителя"] || "",
    tutorLogin: map["Логин воспитателя"] || "vospitatel",
    tutorPin: map["PIN воспитателя"] || "",
    // Этюды, которые отмечаются на сайте. Обычно один — «Этюд»; несколько — через запятую
    etudes: (map["Этюды"] || "Этюд")
      .split(/[,;]/)
      .map((x) => x.trim())
      .filter(Boolean),
  };
}

function readStudents_() {
  return rows_("students").map((r) => ({
    id: String(r[0]).trim().toUpperCase(),
    name: String(r[1]).trim(),
    pin: String(r[2]).trim(),
    mentor: String(r[3]).trim(),
    strengths: String(r[4]).trim(),
    comment: String(r[5]).trim(),
    momPhone: String(r[6] || "").trim(),
    dadPhone: String(r[7] || "").trim(),
    photo: String(r[8] || "").trim(),
  }));
}

function readSchedule_() {
  const byDay = {};
  rows_("schedule").forEach((r) => {
    const day = String(r[0]).trim();
    (byDay[day] = byDay[day] || []).push({
      num: Number(r[1]) || 0,
      time: time_(r[2]),
      subject: String(r[3]).trim(),
      room: String(r[4]).trim(),
      teacher: String(r[5] || "").trim(),
    });
  });
  const order = DAYS.filter((d) => byDay[d]).concat(Object.keys(byDay).filter((d) => DAYS.indexOf(d) < 0));
  return order.map((day) => ({
    day: day,
    lessons: byDay[day].sort((a, b) => a.num - b.num),
  }));
}

// { "S01": [ {title, area, deadline, steps:[{text, done}]} ] }
function readIdp_() {
  const res = {};
  rows_("idp").forEach((r) => {
    const id = String(r[0]).trim().toUpperCase();
    const title = String(r[1]).trim();
    if (!title) return;
    const goals = (res[id] = res[id] || []);
    let g = goals.find((x) => x.title === title);
    if (!g) {
      g = { title: title, area: "", deadline: "", steps: [] };
      goals.push(g);
    }
    if (String(r[2]).trim()) g.area = String(r[2]).trim();
    if (String(r[3]).trim()) g.deadline = iso_(r[3]);
    if (String(r[4]).trim()) g.steps.push({ text: String(r[4]).trim(), done: isDone_(r[5]) });
    else g.done = isDone_(r[5]); // цель без шагов: галочка относится к самой цели
  });
  return res;
}

function readAttendance_() {
  return rows_("attendance").map((r) => ({
    date: iso_(r[0]),
    subject: String(r[1]).trim(),
    absent: ids_(r[2]),
    late: ids_(r[3]),
    excused: ids_(r[4]),
  }));
}

// { "S01": [ {section, title, details, date} ] }
function readPortfolio_() {
  const res = {};
  rows_("portfolio", true).forEach((r) => {
    const id = String(r[0]).trim().toUpperCase();
    const section = String(r[1]).trim();
    if (!id || !section) return;
    (res[id] = res[id] || []).push({ section: section, title: cellText_(r[2]), details: cellText_(r[3]), date: cellText_(r[4]) });
  });
  return res;
}

// Календарь событий: [{start, end, title}] с датами "yyyy-MM-dd"
function readCalendar_() {
  return rows_("calendar", true)
    .filter((r) => String(r[0]).trim() && String(r[2]).trim())
    .map((r) => {
      const start = iso_(r[0]);
      return { start: start, end: String(r[1]).trim() ? iso_(r[1]) : start, title: String(r[2]).trim() };
    })
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
}

// Табель: { "S01": [ {period, subject, q1, q2, q3, q4, year, exam, final} ] }
// Строки «Тәртібі», «Сабақ саны», «Қатыспаған сабақ» — поведение, число уроков и пропущенные уроки
function readGrades_() {
  const res = {};
  const keys = ["q1", "q2", "q3", "q4", "year", "exam", "final"];
  rows_("grades", true).forEach((r) => {
    const id = String(r[0]).trim().toUpperCase();
    const subject = String(r[2]).trim();
    if (!id || !subject) return;
    const row = { period: cellText_(r[1]), subject: subject };
    keys.forEach((k, i) => (row[k] = cellText_(r[3 + i])));
    (res[id] = res[id] || []).push(row);
  });
  return res;
}

function readResources_() {
  return rows_("resources", true)
    .filter((r) => String(r[1]).trim())
    .map((r) => ({ section: String(r[0]).trim(), text: String(r[1]).trim(), where: String(r[2] || "").trim() || "Ресурсы" }));
}

// Широкий лист → { "S01": [ {name: "<заголовок колонки>", value} ] }
function readWide_(key) {
  const res = {};
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEETS[key]);
  if (!sh) return res;
  const values = sh.getDataRange().getValues();
  if (!values.length) return res;
  const head = values[0].map((h) => String(h).trim());
  values.slice(1).forEach((r) => {
    const id = String(r[0]).trim().toUpperCase();
    if (!id) return;
    res[id] = [];
    for (let j = 2; j < head.length; j++) {
      if (head[j]) res[id].push({ name: head[j], value: WIDE[key] ? isDone_(r[j]) : cellText_(r[j]) });
    }
  });
  return res;
}

function context_() {
  return {
    idp: readIdp_(),
    portfolio: readPortfolio_(),
    grades: readGrades_(),
    olympiads: readWide_("olympiads"),
    exams: readWide_("exams"),
    tests: readWide_("tests"),
    parentEvents: readWide_("parentEvents"),
  };
}

function publicStudent_(s, ctx) {
  return {
    id: s.id,
    name: s.name,
    photo: s.photo,
    idp: { mentor: s.mentor, strengths: s.strengths, comment: s.comment, goals: ctx.idp[s.id] || [] },
    portfolio: ctx.portfolio[s.id] || [],
    grades: ctx.grades[s.id] || [],
    olympiads: ctx.olympiads[s.id] || [],
    exams: ctx.exams[s.id] || [],
    tests: ctx.tests[s.id] || [],
    parentEvents: ctx.parentEvents[s.id] || [],
  };
}

function teacherData_() {
  const ctx = context_();
  return {
    className: readSettings_().className,
    etudes: readSettings_().etudes,
    schedule: readSchedule_(),
    calendar: readCalendar_(),
    resources: readResources_(),
    students: readStudents_().map((s) => Object.assign(publicStudent_(s, ctx), { momPhone: s.momPhone, dadPhone: s.dadPhone })),
    attendance: readAttendance_(),
  };
}

// Ученик и его родитель получают только данные этого ученика
function studentData_(id) {
  const ctx = context_();
  const s = readStudents_().find((x) => x.id === id);
  const only = (list) => (list.indexOf(id) >= 0 ? [id] : []);
  return {
    className: readSettings_().className,
    schedule: readSchedule_(),
    calendar: readCalendar_(),
    resources: readResources_(),
    students: [publicStudent_(s, ctx)],
    attendance: readAttendance_().map((l) => ({
      date: l.date,
      subject: l.subject,
      absent: only(l.absent),
      late: only(l.late),
      excused: only(l.excused),
    })),
  };
}

// ===================== Запись посещаемости =====================

// Чьи данные меняем: ученик — только свои, учитель и воспитатель — любого ученика, родитель — ничьи
function targetId_(user, reqId, parentMsg) {
  if (user.role === "parent") throw new Error(parentMsg);
  const id = user.role === "student" ? user.id : String(reqId || "").trim().toUpperCase();
  if (!readStudents_().some((s) => s.id === id)) throw new Error("Ученик не найден");
  return id;
}

// ===================== IDP: цели ученика =====================
// Лист «IDP»: ID | Цель | Направление | Срок | Шаг | Выполнено. Цель из нескольких шагов — строка на каждый шаг.

function goalsOf_(id) {
  return readIdp_()[id] || [];
}

function addGoal_(id, goal) {
  goal = goal || {};
  const title = safeText_(goal.title, 150);
  if (!title) throw new Error("Введите цель");
  const area = safeText_(goal.area, 60);
  const deadline = safeText_(goal.deadline, 40);
  const steps = (Array.isArray(goal.steps) ? goal.steps : [])
    .map((x) => safeText_(x, 150))
    .filter(Boolean)
    .slice(0, 15);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existing = goalsOf_(id);
    if (existing.length >= 30) throw new Error("Слишком много целей");
    if (existing.some((g) => g.title === title.replace(/^'/, ""))) throw new Error("Такая цель уже есть");
    const sh = sheet_("idp");
    if (!steps.length) sh.appendRow([id, title, area, deadline, "", false]);
    else steps.forEach((st) => sh.appendRow([id, title, area, deadline, st, false]));
  } finally {
    lock.releaseLock();
  }
  return goalsOf_(id);
}

// Строки листа «IDP» этого ученика с этой целью (номера строк считаются с 1)
function goalRows_(sh, id, title) {
  const values = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === id && String(values[i][1]).trim() === String(title || "").trim()) {
      rows.push({ row: i + 1, step: String(values[i][4]).trim() });
    }
  }
  return rows;
}

function setGoalDone_(id, title, step, done) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_("idp");
    const target = goalRows_(sh, id, title).find((x) => x.step === String(step || "").trim());
    if (!target) throw new Error("Цель не найдена. Обновите страницу.");
    sh.getRange(target.row, 6, 1, 1).setValues([[!!done]]);
  } finally {
    lock.releaseLock();
  }
  return goalsOf_(id);
}

function deleteGoal_(id, title) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_("idp");
    const rows = goalRows_(sh, id, title);
    if (!rows.length) throw new Error("Цель не найдена. Обновите страницу.");
    rows.reverse().forEach((x) => sh.deleteRow(x.row)); // снизу вверх, чтобы номера строк не съезжали
  } finally {
    lock.releaseLock();
  }
  return goalsOf_(id);
}

// Наставник, сильные стороны и комментарий учителя — колонки D, E, F листа «Ученики»
function setIdpInfo_(id, info) {
  info = info || {};
  const row = [safeText_(info.mentor, 80), safeText_(info.strengths, 300), safeText_(info.comment, 500)];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_("students");
    const values = sh.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === id) {
        sh.getRange(i + 1, 4, 1, 3).setValues([row]);
        return { mentor: row[0].replace(/^'/, ""), strengths: row[1].replace(/^'/, ""), comment: row[2].replace(/^'/, "") };
      }
    }
  } finally {
    lock.releaseLock();
  }
  throw new Error("Ученик не найден");
}

// ===================== Прочитанные книги =====================

const BOOKS_SECTION = "Прочитанные книги";

// Текст от ученика: обрезаем длину и не даём начать с «=», «+», «-», «@», чтобы таблица не приняла его за формулу
function safeText_(v, max) {
  const t = String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function booksOf_(id) {
  return (readPortfolio_()[id] || []).filter((p) => p.section === BOOKS_SECTION);
}

function addBook_(id, book) {
  book = book || {};
  const title = safeText_(book.title, 150);
  if (!title) throw new Error("Введите название книги");
  const row = [id, BOOKS_SECTION, title, safeText_(book.details, 100), safeText_(book.date, 40)];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (booksOf_(id).length >= 300) throw new Error("Слишком много книг в списке");
    sheet_("portfolio").appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return booksOf_(id);
}

// Удаляет одну книгу ученика — ту, у которой совпадают название, автор и дата
function deleteBook_(id, book) {
  book = book || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_("portfolio");
    const values = sh.getDataRange().getValues();
    const same = (a, b) => cellText_(a).replace(/^'/, "") === String(b || "").trim();
    for (let i = values.length - 1; i >= 1; i--) {
      const r = values[i];
      if (
        String(r[0]).trim().toUpperCase() === id &&
        String(r[1]).trim() === BOOKS_SECTION &&
        same(r[2], book.title) &&
        same(r[3], book.details) &&
        same(r[4], book.date)
      ) {
        sh.deleteRow(i + 1);
        return booksOf_(id);
      }
    }
  } finally {
    lock.releaseLock();
  }
  throw new Error("Книга не найдена. Обновите страницу.");
}

// ===================== Фото ученика =====================

// Фото хранится прямо в ячейке (колонка «Фото» на листе «Ученики») как маленький JPEG в base64:
// так его видят только те, кто вошёл на сайт, без публичных ссылок на Google Диск.
const PHOTO_MAX = 45000; // лимит ячейки Google Таблицы — 50 000 символов

function setPhoto_(id, photo) {
  photo = String(photo || "");
  if (photo && (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo) || photo.length > PHOTO_MAX)) {
    throw new Error("Неподходящее фото. Попробуйте другое изображение.");
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_("students");
    const values = sh.getDataRange().getValues();
    const PHOTO_COL = 9;
    if (String(values[0][PHOTO_COL - 1] || "").trim() === "") sh.getRange(1, PHOTO_COL, 1, 1).setValues([["Фото"]]);
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === id) {
        sh.getRange(i + 1, PHOTO_COL, 1, 1).setValues([[photo]]);
        return photo;
      }
    }
  } finally {
    lock.releaseLock();
  }
  throw new Error("Ученик не найден");
}

function saveLesson_(lesson) {
  if (!lesson || !/^\d{4}-\d{2}-\d{2}$/.test(lesson.date)) throw new Error("Неверная дата");
  const subject = String(lesson.subject || "").trim();
  if (!subject) throw new Error("Не указан этюд");

  const known = readStudents_().map((s) => s.id);
  const clean = (list) => (list || []).map((x) => String(x).toUpperCase()).filter((x) => known.indexOf(x) >= 0);
  const row = [
    Utilities.parseDate(lesson.date, tz_(), "yyyy-MM-dd"),
    subject,
    clean(lesson.absent).join(", "),
    clean(lesson.late).join(", "),
    clean(lesson.excused).join(", "),
  ];

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_("attendance");
    const values = sh.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (iso_(values[i][0]) === lesson.date && String(values[i][1]).trim() === subject) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex > 0) sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return { date: lesson.date, subject: subject, absent: ids_(row[2]), late: ids_(row[3]), excused: ids_(row[4]) };
}

// ===================== Первоначальная настройка =====================

/**
 * Создаёт листы с заголовками. Пустые листы заполняются тестовыми данными из Seed.gs.
 * Уже заполненные листы не трогаются, поэтому запускать повторно безопасно.
 */
function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach((key) => {
    let sh = ss.getSheetByName(SHEETS[key]);
    if (!sh) sh = ss.insertSheet(SHEETS[key]);
    if (sh.getLastRow() > 0) return;

    const headers = headersFor_(key);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#e7ecff");
    sh.setFrozenRows(1);

    const data = seedRows_(key);
    if (key === "students") {
      sh.getRange(2, 3, Math.max(data.length, 100), 1).setNumberFormat("@"); // PIN как текст
      sh.getRange(2, 7, Math.max(data.length, 100), 2).setNumberFormat("@"); // телефоны как текст
    }
    if (data.length) sh.getRange(2, 1, data.length, headers.length).setValues(data);
    if (key === "attendance") sh.getRange(2, 1, Math.max(data.length, 500), 1).setNumberFormat("dd.mm.yyyy");
    if (key === "calendar") sh.getRange(2, 1, Math.max(data.length, 100), 2).setNumberFormat("dd.mm.yyyy");
    if (key === "parentEvents" && headers.length > 2) sh.getRange(2, 3, Math.max(data.length, 30), headers.length - 2).insertCheckboxes();
    if (key === "idp") {
      sh.getRange(2, 4, Math.max(data.length, 500), 1).setNumberFormat("dd.mm.yyyy");
      sh.getRange(2, 6, Math.max(data.length, 500), 1).insertCheckboxes();
    }
    sh.autoResizeColumns(1, headers.length);
  });

  // Удалить пустой лист по умолчанию
  ["Лист1", "Sheet1"].forEach((name) => {
    const sh = ss.getSheetByName(name);
    if (sh && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
}

// Заголовки широких листов берутся из тестовых данных (если они есть)
function headersFor_(key) {
  if (key in WIDE && typeof SEED !== "undefined" && SEED.students.length && SEED.students[0][key]) {
    return ["ID", "ФИО"].concat(SEED.students[0][key].map((x) => x.name));
  }
  return HEADERS[key];
}

function seedRows_(key) {
  if (typeof SEED === "undefined") {
    return key === "settings"
      ? [["Название класса", "Мой класс"], ["Логин учителя", "teacher"], ["PIN учителя", "0000"], ["Логин воспитателя", "vospitatel"], ["PIN воспитателя", ""], ["Этюды", "Этюд"]]
      : [];
  }
  const tz = tz_();
  // Дата "yyyy-mm-dd" → ячейка-дата; любой другой текст (например, «до конца 8 класса») остаётся текстом
  const d = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || "") ? Utilities.parseDate(s, tz, "yyyy-MM-dd") : s || "");
  switch (key) {
    case "settings":
      return [
        ["Название класса", SEED.className],
        ["Логин учителя", SEED.teacher.login],
        ["PIN учителя", SEED.teacher.pin],
        ["Логин воспитателя", SEED.tutor.login],
        ["PIN воспитателя", SEED.tutor.pin],
        ["Этюды", (SEED.etudes || ["Этюд"]).join(", ")],
      ];
    case "students":
      return SEED.students.map((s) => [s.id, s.name, s.pin, s.idp.mentor, s.idp.strengths, s.idp.comment, s.momPhone || "", s.dadPhone || "", s.photo || ""]);
    case "schedule": {
      const rows = [];
      SEED.schedule.forEach((day) => day.lessons.forEach((l, i) => rows.push([day.day, l.num || i + 1, l.time, l.subject, l.room, l.teacher || ""])));
      return rows;
    }
    case "idp": {
      const rows = [];
      SEED.students.forEach((s) =>
        s.idp.goals.forEach((g) =>
          g.steps && g.steps.length
            ? g.steps.forEach((st) => rows.push([s.id, g.title, g.area, d(g.deadline), st.text, st.done]))
            : rows.push([s.id, g.title, g.area, d(g.deadline), "", !!g.done])
        )
      );
      return rows;
    }
    case "portfolio": {
      const rows = [];
      SEED.students.forEach((s) => (s.portfolio || []).forEach((p) => rows.push([s.id, p.section, p.title, p.details, p.date])));
      return rows;
    }
    case "calendar":
      return (SEED.calendar || []).map((x) => [d(x.start), x.end && x.end !== x.start ? d(x.end) : "", x.title]);
    case "grades": {
      const rows = [];
      SEED.students.forEach((s) =>
        (s.grades || []).forEach((g) => rows.push([s.id, g.period, g.subject, g.q1, g.q2, g.q3, g.q4, g.year, g.exam, g.final]))
      );
      return rows;
    }
    case "resources":
      return (SEED.resources || []).map((x) => [x.section, x.text, x.where === "Ресурсы" ? "" : x.where]);
    case "olympiads":
    case "exams":
    case "tests":
    case "parentEvents":
      return SEED.students.map((s) => [s.id, s.name].concat((s[key] || []).map((x) => x.value)));
    case "attendance":
      return SEED.attendance.map((l) => [d(l.date), l.subject, l.absent.join(", "), l.late.join(", "), l.excused.join(", ")]);
  }
  return [];
}
