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
};

const HEADERS = {
  settings: ["Параметр", "Значение"],
  students: ["ID", "ФИО", "PIN", "Наставник", "Сильные стороны", "Комментарий учителя", "Телефон мамы", "Телефон папы"],
  schedule: ["День", "№ урока", "Время", "Предмет", "Кабинет"],
  idp: ["ID ученика", "Цель", "Направление", "Срок", "Шаг", "Выполнено"],
  attendance: ["Дата", "Предмет", "Пропуск (ID через запятую)", "Опоздал", "Уважительная причина"],
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
  // Список имён для страницы входа — доступен без пароля (только ID и ФИО)
  if (req.action === "names") {
    return {
      ok: true,
      className: readSettings_().className,
      students: readStudents_()
        .map((s) => ({ id: s.id, name: s.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "ru")),
    };
  }
  const user = auth_(req.login, req.pin, req.as);
  switch (req.action) {
    case "login":
      return { ok: true, role: user.role, id: user.id, data: user.role === "teacher" ? teacherData_() : studentData_(user.id) }; // родитель видит то же, что и ребёнок
    case "saveLesson":
      if (user.role !== "teacher") throw new Error("Доступно только учителю");
      return { ok: true, lesson: saveLesson_(req.lesson) };
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
    if (login.toLowerCase() === settings.teacherLogin.toLowerCase() && pin === settings.teacherPin) {
      return { role: "teacher" };
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

function rows_(key) {
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
  }));
}

function readSchedule_() {
  const byDay = {};
  rows_("schedule").forEach((r) => {
    const day = String(r[0]).trim();
    (byDay[day] = byDay[day] || []).push({ num: Number(r[1]) || 0, time: time_(r[2]), subject: String(r[3]).trim(), room: String(r[4]).trim() });
  });
  const order = DAYS.filter((d) => byDay[d]).concat(Object.keys(byDay).filter((d) => DAYS.indexOf(d) < 0));
  return order.map((day) => ({
    day: day,
    lessons: byDay[day].sort((a, b) => a.num - b.num).map((l) => ({ time: l.time, subject: l.subject, room: l.room })),
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

function publicStudent_(s, idp) {
  return {
    id: s.id,
    name: s.name,
    idp: { mentor: s.mentor, strengths: s.strengths, comment: s.comment, goals: idp[s.id] || [] },
  };
}

function teacherData_() {
  const idp = readIdp_();
  return {
    className: readSettings_().className,
    schedule: readSchedule_(),
    students: readStudents_().map((s) => Object.assign(publicStudent_(s, idp), { momPhone: s.momPhone, dadPhone: s.dadPhone })),
    attendance: readAttendance_(),
  };
}

// Ученик получает только свои данные
function studentData_(id) {
  const idp = readIdp_();
  const s = readStudents_().find((x) => x.id === id);
  const only = (list) => (list.indexOf(id) >= 0 ? [id] : []);
  return {
    className: readSettings_().className,
    schedule: readSchedule_(),
    students: [publicStudent_(s, idp)],
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

function saveLesson_(lesson) {
  if (!lesson || !/^\d{4}-\d{2}-\d{2}$/.test(lesson.date)) throw new Error("Неверная дата");
  const subject = String(lesson.subject || "").trim();
  if (!subject) throw new Error("Не указан предмет");

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

    const headers = HEADERS[key];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#e7ecff");
    sh.setFrozenRows(1);

    const data = seedRows_(key);
    if (key === "students") {
      sh.getRange(2, 3, Math.max(data.length, 100), 1).setNumberFormat("@"); // PIN как текст
      sh.getRange(2, 7, Math.max(data.length, 100), 2).setNumberFormat("@"); // телефоны как текст
    }
    if (data.length) sh.getRange(2, 1, data.length, headers.length).setValues(data);
    if (key === "attendance") sh.getRange(2, 1, Math.max(data.length, 500), 1).setNumberFormat("dd.mm.yyyy");
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

function seedRows_(key) {
  if (typeof SEED === "undefined") return key === "settings" ? [["Название класса", "Мой класс"], ["Логин учителя", "teacher"], ["PIN учителя", "0000"]] : [];
  const tz = tz_();
  const d = (s) => (s ? Utilities.parseDate(s, tz, "yyyy-MM-dd") : "");
  switch (key) {
    case "settings":
      return [["Название класса", SEED.className], ["Логин учителя", SEED.teacher.login], ["PIN учителя", SEED.teacher.pin]];
    case "students":
      return SEED.students.map((s) => [s.id, s.name, s.pin, s.idp.mentor, s.idp.strengths, s.idp.comment, s.momPhone || "", s.dadPhone || ""]);
    case "schedule": {
      const rows = [];
      SEED.schedule.forEach((day) => day.lessons.forEach((l, i) => rows.push([day.day, i + 1, l.time, l.subject, l.room])));
      return rows;
    }
    case "idp": {
      const rows = [];
      SEED.students.forEach((s) =>
        s.idp.goals.forEach((g) => g.steps.forEach((st) => rows.push([s.id, g.title, g.area, d(g.deadline), st.text, st.done])))
      );
      return rows;
    }
    case "attendance":
      return SEED.attendance.map((l) => [d(l.date), l.subject, l.absent.join(", "), l.late.join(", "), l.excused.join(", ")]);
  }
  return [];
}
