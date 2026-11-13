/**
 * Достық спартакиадасы: бэкенд сайта на Google Apps Script.
 * Таблица Google — это база данных. Сайт читает и пишет данные только через этот скрипт.
 * Таблица остаётся закрытой: доступ к ней есть только у владельца и у самого скрипта.
 *
 * Установка: см. apps-script/README.md
 */

var SPORTS = {
  volleyball_dads: ['league', 'championship'], // Волейбол әкелер
  volleyball_moms: ['league', 'championship'], // Волейбол аналар
  tennis: ['league', 'group'],                 // Настольный теннис
  chess: ['blitz', 'swiss']                    // Шахматы
};
var DEFAULT_VENUES = {
  volleyball_dads: ['Арена 1 - Жубанов университет', 'Арена 2 - #38 школа'],
  volleyball_moms: ['Арена 3 - БИЛ'],
  tennis: ['Зал настольного тенниса'],
  chess: ['Шахматный зал']
};
// Пароли хранятся в «Свойствах скрипта» (Project Settings → Script properties).
var ACCOUNTS = {
  organizer: { prop: 'ORGANIZER_PASSWORD', sports: 'all' },
  org_volleyball: { prop: 'ORG_VOLLEYBALL_PASSWORD', sports: ['volleyball_dads', 'volleyball_moms'] },
  org_tennis: { prop: 'ORG_TENNIS_PASSWORD', sports: ['tennis'] },
  org_chess: { prop: 'ORG_CHESS_PASSWORD', sports: ['chess'] }
};
var TOKEN_TTL = 6 * 3600; // секунд (максимум для CacheService)
var STATUSES = ['scheduled', 'live', 'finished'];

var H = {
  cfg: ['Ключ', 'Значение'],
  sched: ['Время', 'Событие', 'Место'],
  venues: ['Вид (ключ)', '№', 'Название'],
  people: ['Вид (ключ)', 'ID', 'Имя / команда', 'Класс', 'Родитель', 'Группа'],
  matches: ['Вид (ключ)', 'ID', 'Тур', 'Группа', 'ID А', 'ID Б', 'Счёт А', 'Счёт Б', 'Заметка', 'Арена №', 'Статус', 'А (имя)', 'Б (имя)']
};
var SHEET = { cfg: 'Настройки', sched: 'Расписание', venues: 'Арены', people: 'Участники', matches: 'Матчи' };

// ---------------------------------------------------------------- HTTP
function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.action === 'ping') return out_({ ok: true });
    var sess = session_(p.token);
    // организаторы читают таблицу напрямую (видят контакты родителей), остальные берут кэш
    var data = sess ? withLock_(function () { ensure_(); return readAll_(); }) : publicData_();
    return out_({ ok: true, data: data });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'login') return out_(login_(body));
    if (body.action === 'logout') { if (body.token) cache_().remove('t_' + body.token); return out_({ ok: true }); }
    if (body.action === 'save') return out_(save_(body));
    return out_({ ok: false, error: 'Неизвестное действие' });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------- кэш для родителей
// Страницу открывают сотни людей и обновляют каждые 30 секунд, поэтому публичные данные
// кэшируются на 2 минуты и сбрасываются при каждом сохранении организатором.
var PUB_TTL = 120;
function pubKeys_() { return ['pub_main'].concat(Object.keys(SPORTS).map(function (k) { return 'pub_' + k; })); }

function publicData_() {
  var c = cache_(), keys = pubKeys_(), got = c.getAll(keys);
  if (keys.every(function (k) { return got[k]; })) {
    var m = JSON.parse(got.pub_main), data = { news: m.news, date: m.date, place: m.place, schedule: m.schedule, sports: {} };
    for (var k in SPORTS) data.sports[k] = JSON.parse(got['pub_' + k]);
    return data;
  }
  var fresh = withLock_(function () { ensure_(); return readAll_(); });
  stripParents_(fresh);
  var put = { pub_main: JSON.stringify({ news: fresh.news, date: fresh.date, place: fresh.place, schedule: fresh.schedule }) };
  for (var key in SPORTS) put['pub_' + key] = JSON.stringify(fresh.sports[key]);
  var fits = Object.keys(put).every(function (k) { return put[k].length < 90000; }); // лимит записи кэша ~100 КБ
  if (fits) c.putAll(put, PUB_TTL);
  return fresh;
}

// ---------------------------------------------------------------- вход
function cache_() { return CacheService.getScriptCache(); }

function login_(b) {
  var c = cache_();
  if (Number(c.get('fails') || 0) >= 10) return { ok: false, error: 'Слишком много попыток. Подождите минуту.' };
  var user = String(b.username || '');
  var acc = Object.prototype.hasOwnProperty.call(ACCOUNTS, user) ? ACCOUNTS[user] : null;
  var pass = acc ? PropertiesService.getScriptProperties().getProperty(acc.prop) : null;
  if (acc && pass && String(b.password || '') === pass) {
    var token = Utilities.getUuid() + Utilities.getUuid();
    c.put('t_' + token, JSON.stringify({ u: user, sports: acc.sports }), TOKEN_TTL);
    return { ok: true, token: token, role: 'organizer', name: user, sports: acc.sports };
  }
  c.put('fails', String(Number(c.get('fails') || 0) + 1), 60);
  Utilities.sleep(800);
  return { ok: false, error: 'Неверный логин или пароль' };
}

function session_(token) {
  if (!token) return null;
  var raw = cache_().get('t_' + token);
  return raw ? JSON.parse(raw) : null;
}

function canEdit_(sess, key) {
  return sess.sports === 'all' || sess.sports.indexOf(key) >= 0;
}

// ---------------------------------------------------------------- сохранение
function save_(b) {
  var sess = session_(b.token);
  if (!sess) return { ok: false, error: 'Нужен вход организатора', auth: false };
  var inc = b.data || {};
  cache_().removeAll(pubKeys_());
  withLock_(function () {
    ensure_();
    if (sess.sports === 'all') {
      var cfg = {};
      cfg.news = s_(inc.news, 1000);
      cfg.date = s_(inc.date, 100);
      cfg.place = s_(inc.place, 200);
      writeCfg_(cfg);
      writeSchedule_(sanitizeSchedule_(inc.schedule));
    }
    for (var key in SPORTS) {
      if (canEdit_(sess, key) && inc.sports && inc.sports[key]) writeSport_(key, sanitizeSport_(key, inc.sports[key]));
    }
  });
  cache_().removeAll(pubKeys_());
  return { ok: true };
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// ---------------------------------------------------------------- проверка данных
function s_(v, n) { return String(v == null ? '' : v).slice(0, n); }
function num_(v) { v = Number(v); return isFinite(v) ? Math.max(-1e6, Math.min(1e6, v)) : 0; }

function sanitizeSport_(key, d) {
  d = d || {};
  var participants = (Array.isArray(d.participants) ? d.participants : []).slice(0, 200).map(function (p) {
    return { id: s_(p.id, 20), name: s_(p.name, 100), cls: s_(p.cls, 20), parent: s_(p.parent, 100), group: s_(p.group, 5) };
  });
  var ids = {};
  participants.forEach(function (p) { ids[p.id] = true; });
  var venues = (Array.isArray(d.venues) ? d.venues : DEFAULT_VENUES[key]).slice(0, 6).map(function (v) { return s_(v, 60); });
  var matches = (Array.isArray(d.matches) ? d.matches : []).slice(0, 2000).map(function (m) {
    var v = String(m.venue == null ? '' : m.venue);
    return {
      id: s_(m.id, 20),
      round: Math.max(1, Math.min(99, parseInt(m.round, 10) || 1)),
      group: s_(m.group, 5),
      a: ids[m.a] ? m.a : '',
      b: ids[m.b] ? m.b : '',
      sa: num_(m.sa), sb: num_(m.sb),
      detail: s_(m.detail, 200),
      venue: /^\d$/.test(v) && Number(v) < venues.length ? v : '',
      status: STATUSES.indexOf(m.status) >= 0 ? m.status : 'scheduled'
    };
  });
  return {
    format: SPORTS[key].indexOf(d.format) >= 0 ? d.format : SPORTS[key][0],
    groups: Math.max(1, Math.min(8, parseInt(d.groups, 10) || 2)),
    venues: venues, participants: participants, matches: matches
  };
}

function sanitizeSchedule_(a) {
  return (Array.isArray(a) ? a : []).slice(0, 100).map(function (r) {
    return { time: s_(r.time, 20), event: s_(r.event, 200), place: s_(r.place, 200) };
  });
}

function stripParents_(data) {
  for (var k in data.sports) data.sports[k].participants.forEach(function (p) { delete p.parent; });
}

// ---------------------------------------------------------------- работа с таблицей
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheet_(kind) {
  var name = SHEET[kind], sh = ss_().getSheetByName(name);
  if (!sh) {
    sh = ss_().insertSheet(name);
    sh.getRange(1, 1, 1, H[kind].length).setValues([H[kind]]);
  }
  return sh;
}

function ensure_() {
  var firstRun = !ss_().getSheetByName(SHEET.cfg);
  sheet_('cfg'); sheet_('sched'); sheet_('venues'); sheet_('people'); sheet_('matches');
  if (firstRun) {
    var cfg = [['news', 'Добро пожаловать на спартакиаду!'], ['date', ''], ['place', '']];
    for (var k in SPORTS) { cfg.push(['format_' + k, SPORTS[k][0]]); cfg.push(['groups_' + k, '2']); }
    sheet_('cfg').getRange(2, 1, cfg.length, 2).setValues(cfg);
  }
}

function txt_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, ss_().getSpreadsheetTimeZone(), 'HH:mm');
  return v == null ? '' : String(v);
}

function rows_(kind) {
  var sh = sheet_(kind), n = sh.getLastRow(), w = H[kind].length;
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, w).getValues();
}

function replaceRows_(kind, rows, textCols) {
  var sh = sheet_(kind), w = H[kind].length, n = sh.getLastRow();
  if (n > 1) sh.getRange(2, 1, n - 1, w).clearContent();
  if (!rows.length) return;
  textCols.forEach(function (c) { sh.getRange(2, c, rows.length, 1).setNumberFormat('@'); });
  sh.getRange(2, 1, rows.length, w).setValues(rows);
}

function readAll_() {
  var cfg = {};
  rows_('cfg').forEach(function (r) { cfg[txt_(r[0])] = txt_(r[1]); });
  var data = {
    news: cfg.news || '', date: cfg.date || '', place: cfg.place || '',
    schedule: rows_('sched').filter(function (r) { return txt_(r[0]) || txt_(r[1]) || txt_(r[2]); })
      .map(function (r) { return { time: txt_(r[0]), event: txt_(r[1]), place: txt_(r[2]) }; }),
    sports: {}
  };
  var venues = {}, people = {}, matches = {};
  for (var k in SPORTS) { venues[k] = []; people[k] = []; matches[k] = []; }
  rows_('venues').forEach(function (r) {
    var k = txt_(r[0]), i = Number(r[1]) - 1;
    if (venues[k] && i >= 0 && i < 6) venues[k][i] = txt_(r[2]);
  });
  rows_('people').forEach(function (r) {
    var k = txt_(r[0]);
    if (people[k]) people[k].push({ id: txt_(r[1]), name: txt_(r[2]), cls: txt_(r[3]), parent: txt_(r[4]), group: txt_(r[5]) });
  });
  rows_('matches').forEach(function (r) {
    var k = txt_(r[0]);
    if (!matches[k]) return;
    var v = r[9] === '' ? '' : String(Number(r[9]) - 1);
    matches[k].push({
      id: txt_(r[1]), round: Number(r[2]) || 1, group: txt_(r[3]), a: txt_(r[4]), b: txt_(r[5]),
      sa: Number(r[6]) || 0, sb: Number(r[7]) || 0, detail: txt_(r[8]), venue: v, status: STATUSES.indexOf(txt_(r[10])) >= 0 ? txt_(r[10]) : 'scheduled'
    });
  });
  for (k in SPORTS) {
    var vn = venues[k].length ? venues[k] : DEFAULT_VENUES[k].slice();
    for (var i = 0; i < vn.length; i++) if (vn[i] == null) vn[i] = 'Арена ' + (i + 1);
    data.sports[k] = {
      format: SPORTS[k].indexOf(cfg['format_' + k]) >= 0 ? cfg['format_' + k] : SPORTS[k][0],
      groups: Math.max(1, Math.min(8, parseInt(cfg['groups_' + k], 10) || 2)),
      venues: vn, participants: people[k], matches: matches[k]
    };
  }
  return data;
}

function writeCfg_(obj) {
  var sh = sheet_('cfg'), rows = rows_('cfg'), seen = {};
  rows.forEach(function (r) {
    var key = txt_(r[0]);
    if (Object.prototype.hasOwnProperty.call(obj, key)) { r[1] = obj[key]; seen[key] = true; }
  });
  for (var key in obj) if (!seen[key]) rows.push([key, obj[key]]);
  replaceRows_('cfg', rows.map(function (r) { return [txt_(r[0]), txt_(r[1])]; }), [1, 2]);
}

function writeSchedule_(list) {
  replaceRows_('sched', list.map(function (r) { return [r.time, r.event, r.place]; }), [1, 2, 3]);
}

function writeSport_(key, d) {
  // настройки вида спорта
  var c = {}; c['format_' + key] = d.format; c['groups_' + key] = String(d.groups);
  writeCfg_(c);
  // арены
  var venues = rows_('venues').filter(function (r) { return txt_(r[0]) !== key; });
  d.venues.forEach(function (v, i) { venues.push([key, i + 1, v]); });
  replaceRows_('venues', venues.map(function (r) { return [txt_(r[0]), Number(r[1]), txt_(r[2])]; }), [1, 3]);
  // участники
  var people = rows_('people').filter(function (r) { return txt_(r[0]) !== key; }).map(function (r) {
    return [txt_(r[0]), txt_(r[1]), txt_(r[2]), txt_(r[3]), txt_(r[4]), txt_(r[5])];
  });
  var names = {};
  d.participants.forEach(function (p) {
    names[p.id] = p.name;
    people.push([key, p.id, p.name, p.cls, p.parent, p.group]);
  });
  replaceRows_('people', people, [1, 2, 3, 4, 5, 6]);
  // матчи (имена А и Б пишутся для удобства чтения таблицы)
  var matches = rows_('matches').filter(function (r) { return txt_(r[0]) !== key; }).map(function (r) {
    return [txt_(r[0]), txt_(r[1]), Number(r[2]) || 1, txt_(r[3]), txt_(r[4]), txt_(r[5]), Number(r[6]) || 0, Number(r[7]) || 0, txt_(r[8]), r[9] === '' ? '' : Number(r[9]), txt_(r[10]), txt_(r[11]), txt_(r[12])];
  });
  d.matches.forEach(function (m) {
    matches.push([key, m.id, m.round, m.group, m.a, m.b, m.sa, m.sb, m.detail, m.venue === '' ? '' : Number(m.venue) + 1, m.status, names[m.a] || '', names[m.b] || '']);
  });
  replaceRows_('matches', matches, [1, 2, 4, 5, 6, 9, 11, 12, 13]);
}
