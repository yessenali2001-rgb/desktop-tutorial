// Спартакиада: сервер без внешних зависимостей (Node 18+).
// Запуск: node server.js   →  http://localhost:3000
// Родители входят без пароля (только просмотр), организаторы — по паролю (редактирование).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- пароли ----------
function hash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}
function check(password, rec) {
  const a = Buffer.from(hash(password, rec.salt).hash, 'hex');
  const b = Buffer.from(rec.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
// Организатор создаётся при первом запуске. Пароль берётся из ORGANIZER_PASSWORD
// или генерируется случайно и печатается в консоль один раз.
if (!fs.existsSync(USERS_FILE)) {
  const pwd = process.env.ORGANIZER_PASSWORD || crypto.randomBytes(6).toString('base64url');
  fs.writeFileSync(USERS_FILE, JSON.stringify({ organizer: hash(pwd) }, null, 2), { mode: 0o600 });
  console.log(`\nСоздан аккаунт организатора. Логин: organizer  Пароль: ${pwd}\n(запишите; повторно он не показывается)\n`);
}
const users = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

// ---------- контент ----------
const DEFAULT = {
  news: 'Добро пожаловать на спартакиаду! [Объявление организаторов]',
  schedule: [
    { time: '09:00', event: 'Регистрация команд', place: '[место]' },
    { time: '10:00', event: 'Открытие', place: '[место]' },
    { time: '11:00', event: 'Волейбол', place: '[зал]' },
    { time: '13:00', event: 'Теннис', place: '[корты]' },
    { time: '15:00', event: 'Шахматы', place: '[аудитория]' },
    { time: '17:30', event: 'Награждение', place: '[место]' }
  ],
  results: [
    { team: '[Команда 1]', points: 0 },
    { team: '[Команда 2]', points: 0 },
    { team: '[Команда 3]', points: 0 }
  ]
};
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT, null, 2));

function sanitize(d) {
  const s = (v, n) => String(v ?? '').slice(0, n);
  return {
    news: s(d.news, 1000),
    schedule: (Array.isArray(d.schedule) ? d.schedule : []).slice(0, 100)
      .map(r => ({ time: s(r.time, 20), event: s(r.event, 200), place: s(r.place, 200) })),
    results: (Array.isArray(d.results) ? d.results : []).slice(0, 100)
      .map(r => ({ team: s(r.team, 100), points: Number(r.points) || 0 }))
  };
}

// ---------- сессии ----------
const sessions = new Map(); // token -> {role,name,exp}
const TTL = 8 * 3600e3;
const attempts = new Map(); // ip -> {n, until}

function getSession(req) {
  const m = /(?:^|; )sid=([^;]+)/.exec(req.headers.cookie || '');
  const s = m && sessions.get(m[1]);
  if (!s || s.exp < Date.now()) return null;
  return s;
}
function startSession(res, role, name) {
  const t = crypto.randomBytes(24).toString('hex');
  sessions.set(t, { role, name, exp: Date.now() + TTL });
  res.setHeader('Set-Cookie', `sid=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TTL / 1000}`);
}

// ---------- http ----------
const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};
const body = req => new Promise((ok, fail) => {
  let b = '';
  req.on('data', c => { b += c; if (b.length > 1e6) { fail(new Error('big')); req.destroy(); } });
  req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { fail(e); } });
});

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  try {
    if (url === '/api/login' && req.method === 'POST') {
      const d = await body(req);
      if (d.role === 'parent') {
        const name = String(d.name || 'Родитель').trim().slice(0, 50) || 'Родитель';
        startSession(res, 'parent', name);
        return json(res, 200, { role: 'parent', name });
      }
      const ip = req.socket.remoteAddress;
      const a = attempts.get(ip) || { n: 0, until: 0 };
      if (a.until > Date.now()) return json(res, 429, { error: 'Слишком много попыток. Подождите минуту.' });
      const rec = d.username === 'organizer' && users().organizer;
      if (rec && check(String(d.password || ''), rec)) {
        attempts.delete(ip);
        startSession(res, 'organizer', 'Организатор');
        return json(res, 200, { role: 'organizer', name: 'Организатор' });
      }
      a.n++; if (a.n >= 5) { a.until = Date.now() + 60e3; a.n = 0; }
      attempts.set(ip, a);
      return json(res, 401, { error: 'Неверный логин или пароль' });
    }
    if (url === '/api/logout' && req.method === 'POST') {
      const m = /(?:^|; )sid=([^;]+)/.exec(req.headers.cookie || '');
      if (m) sessions.delete(m[1]);
      res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/');
      return json(res, 200, {});
    }
    if (url === '/api/me') {
      const s = getSession(req);
      return s ? json(res, 200, { role: s.role, name: s.name }) : json(res, 401, {});
    }
    if (url === '/api/data') {
      const s = getSession(req);
      if (!s) return json(res, 401, { error: 'Нужен вход' });
      if (req.method === 'GET') return json(res, 200, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
      if (req.method === 'PUT') {
        if (s.role !== 'organizer') return json(res, 403, { error: 'Только для организаторов' });
        const d = sanitize(await body(req));
        fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
        return json(res, 200, d);
      }
    }
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    }
    res.writeHead(404); res.end('Not found');
  } catch (e) {
    json(res, 400, { error: 'Некорректный запрос' });
  }
}).listen(PORT, () => console.log(`Сайт: http://localhost:${PORT}`));
