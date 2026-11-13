// Спартакиада: сервер без внешних зависимостей (Node 18+).
// Запуск: node server.js   →  http://localhost:3000
// Родители входят без пароля (только просмотр), организаторы — по паролю.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data'); // на хостинге укажите постоянный диск
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

// Виды спорта и допустимые форматы турнира
const SPORTS = {
  volleyball: ['league', 'championship'], // лига | чемпионат (на вылет)
  tennis: ['league', 'group'],            // лига | групповой
  chess: ['blitz', 'swiss']               // блиц | швейцарская система
};

// ---------- пароли ----------
function hash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}
function check(password, rec) {
  const a = Buffer.from(hash(password, rec.salt).hash, 'hex');
  const b = Buffer.from(rec.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
// Аккаунты организаторов:
//   organizer       — главный (всё: расписание, объявления, все виды спорта)
//   org_volleyball  — только волейбол
//   org_tennis      — только настольный теннис
//   org_chess       — только шахматы
// Пароли задаются переменными окружения (рекомендуется для хостинга):
//   ORGANIZER_PASSWORD, ORG_VOLLEYBALL_PASSWORD, ORG_TENNIS_PASSWORD, ORG_CHESS_PASSWORD
// Если переменная не задана, при первом запуске пароль генерируется и печатается в консоль.
const ACCOUNTS = {
  organizer: { env: 'ORGANIZER_PASSWORD', sports: 'all' },
  org_volleyball: { env: 'ORG_VOLLEYBALL_PASSWORD', sports: ['volleyball'] },
  org_tennis: { env: 'ORG_TENNIS_PASSWORD', sports: ['tennis'] },
  org_chess: { env: 'ORG_CHESS_PASSWORD', sports: ['chess'] }
};
{
  const rnd = () => crypto.randomBytes(6).toString('base64url');
  let file = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) : {};
  let changed = false, printed = false;
  for (const [u, a] of Object.entries(ACCOUNTS)) {
    const envPwd = process.env[a.env];
    if (envPwd && envPwd.length < 8) { console.error(`${a.env}: пароль должен быть не короче 8 символов`); process.exit(1); }
    if (envPwd && !(file[u] && check(envPwd, file[u]))) { file[u] = { ...hash(envPwd), sports: a.sports }; changed = true; }
    else if (!file[u]) {
      const pwd = rnd();
      file[u] = { ...hash(pwd), sports: a.sports }; changed = true;
      if (!printed) { console.log('\nСозданы аккаунты организаторов (запишите пароли, повторно не показываются):'); printed = true; }
      console.log(`  ${u.padEnd(15)} пароль: ${pwd}`);
    }
  }
  if (printed) console.log('');
  if (changed) fs.writeFileSync(USERS_FILE, JSON.stringify(file, null, 2), { mode: 0o600 });
}
const users = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

// ---------- контент ----------
const DEFAULT_VENUES = ['Площадка 1', 'Площадка 2', 'Площадка 3']; // волейбол проходит в трёх местах
const emptySport = key => ({ format: SPORTS[key][0], groups: 2, venues: key === 'volleyball' ? DEFAULT_VENUES : [], participants: [], matches: [] });
const DEFAULT = {
  news: 'Добро пожаловать на спартакиаду! [Объявление организаторов]',
  schedule: [
    { time: '09:00', event: 'Регистрация команд', place: '[место]' },
    { time: '10:00', event: 'Открытие', place: '[место]' },
    { time: '11:00', event: 'Волейбол', place: '[зал]' },
    { time: '13:00', event: 'Настольный теннис', place: '[зал]' },
    { time: '15:00', event: 'Шахматы', place: '[аудитория]' },
    { time: '17:30', event: 'Награждение', place: '[место]' }
  ],
  sports: Object.fromEntries(Object.keys(SPORTS).map(k => [k, emptySport(k)]))
};
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT, null, 2));

const s = (v, n) => String(v ?? '').slice(0, n);
const num = v => { v = Number(v); return Number.isFinite(v) ? Math.max(-1e6, Math.min(1e6, v)) : 0; };

function sanitizeSport(key, d) {
  d = d || {};
  const participants = (Array.isArray(d.participants) ? d.participants : []).slice(0, 200).map(p => ({
    id: s(p.id, 20), name: s(p.name, 100), cls: s(p.cls, 20), parent: s(p.parent, 100), group: s(p.group, 5)
  }));
  const ids = new Set(participants.map(p => p.id));
  const venues = key === 'volleyball'
    ? (Array.isArray(d.venues) ? d.venues : DEFAULT_VENUES).slice(0, 6).map(v => s(v, 60))
    : [];
  const matches = (Array.isArray(d.matches) ? d.matches : []).slice(0, 2000).map(m => ({
    id: s(m.id, 20),
    round: Math.max(1, Math.min(99, parseInt(m.round) || 1)),
    group: s(m.group, 5),
    a: ids.has(m.a) ? m.a : '',
    b: ids.has(m.b) ? m.b : '',
    sa: num(m.sa), sb: num(m.sb),
    detail: s(m.detail, 100),
    venue: /^\d$/.test(String(m.venue)) && Number(m.venue) < venues.length ? String(m.venue) : '',
    status: ['scheduled', 'live', 'finished'].includes(m.status) ? m.status : 'scheduled'
  }));
  return {
    format: SPORTS[key].includes(d.format) ? d.format : SPORTS[key][0],
    groups: Math.max(1, Math.min(8, parseInt(d.groups) || 2)),
    venues, participants, matches
  };
}
function sanitizeSchedule(a) {
  return (Array.isArray(a) ? a : []).slice(0, 100)
    .map(r => ({ time: s(r.time, 20), event: s(r.event, 200), place: s(r.place, 200) }));
}
function readData() {
  const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  d.sports = d.sports || {};
  for (const k of Object.keys(SPORTS)) d.sports[k] = sanitizeSport(k, d.sports[k]);
  return d;
}

// ---------- сессии ----------
const sessions = new Map(); // token -> {role,name,sports,exp}
const TTL = 8 * 3600e3;
const attempts = new Map();
const sidOf = req => (/(?:^|; )sid=([^;]+)/.exec(req.headers.cookie || '') || [])[1];

function getSession(req) {
  const t = sidOf(req);
  const x = t && sessions.get(t);
  if (!x || x.exp < Date.now()) return null;
  return x;
}
function startSession(req, res, info) {
  const t = crypto.randomBytes(24).toString('hex');
  sessions.set(t, { ...info, exp: Date.now() + TTL });
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sid=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TTL / 1000}${secure}`);
}
const canEdit = (ses, sport) => ses.role === 'organizer' && (ses.sports === 'all' || ses.sports.includes(sport));
const publicInfo = ses => ({ role: ses.role, name: ses.name, sports: ses.sports });

// ---------- http ----------
const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};
const body = req => new Promise((ok, fail) => {
  let b = '';
  req.on('data', c => { b += c; if (b.length > 2e6) { fail(new Error('big')); req.destroy(); } });
  req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { fail(e); } });
});

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  try {
    if (url === '/healthz') return json(res, 200, { ok: true });
    if (url === '/api/login' && req.method === 'POST') {
      const d = await body(req);
      if (d.role === 'parent') {
        const name = String(d.name || '').trim().slice(0, 50) || 'Родитель';
        const info = { role: 'parent', name, sports: [] };
        startSession(req, res, info);
        return json(res, 200, publicInfo(info));
      }
      const ip = (process.env.TRUST_PROXY === '1' && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress;
      const a = attempts.get(ip) || { n: 0, until: 0 };
      if (a.until > Date.now()) return json(res, 429, { error: 'Слишком много попыток. Подождите минуту.' });
      const all = users();
      const rec = Object.prototype.hasOwnProperty.call(all, d.username) ? all[d.username] : null;
      if (rec && check(String(d.password || ''), rec)) {
        attempts.delete(ip);
        const info = { role: 'organizer', name: String(d.username), sports: rec.sports };
        startSession(req, res, info);
        return json(res, 200, publicInfo(info));
      }
      a.n++; if (a.n >= 5) { a.until = Date.now() + 60e3; a.n = 0; }
      attempts.set(ip, a);
      return json(res, 401, { error: 'Неверный логин или пароль' });
    }
    if (url === '/api/logout' && req.method === 'POST') {
      const t = sidOf(req); if (t) sessions.delete(t);
      res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/');
      return json(res, 200, {});
    }
    if (url === '/api/me') {
      const ses = getSession(req);
      return ses ? json(res, 200, publicInfo(ses)) : json(res, 401, {});
    }
    if (url === '/api/data') {
      const ses = getSession(req);
      if (!ses) return json(res, 401, { error: 'Нужен вход' });
      if (req.method === 'GET') {
        const d = readData();
        if (ses.role !== 'organizer') // контакты родителей видят только организаторы
          for (const k of Object.keys(d.sports)) d.sports[k].participants.forEach(p => { delete p.parent; });
        return json(res, 200, d);
      }
      if (req.method === 'PUT') {
        if (ses.role !== 'organizer') return json(res, 403, { error: 'Только для организаторов' });
        const inc = await body(req);
        const cur = readData();
        if (ses.sports === 'all') {
          cur.news = s(inc.news, 1000);
          cur.schedule = sanitizeSchedule(inc.schedule);
        }
        for (const k of Object.keys(SPORTS))
          if (canEdit(ses, k) && inc.sports && inc.sports[k]) cur.sports[k] = sanitizeSport(k, inc.sports[k]);
        fs.writeFileSync(DATA_FILE, JSON.stringify(cur, null, 2));
        return json(res, 200, { ok: true });
      }
    }
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    }
    if (url.startsWith('/assets/')) { // логотипы и картинки (публичные)
      const f = path.join(__dirname, 'assets', path.basename(url));
      const types = { '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
      const type = types[path.extname(f).toLowerCase()];
      if (type && fs.existsSync(f)) {
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' });
        return res.end(fs.readFileSync(f));
      }
    }
    res.writeHead(404); res.end('Not found');
  } catch (e) {
    json(res, 400, { error: 'Некорректный запрос' });
  }
}).listen(PORT, () => console.log(`Сайт: http://localhost:${PORT}`));
