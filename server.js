// Мектептен шығуға рұқсат беру жүйесі — сервер.
// Тәуелділіксіз: тек Node.js (18+) керек. Іске қосу: `node server.js`

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const TZ = process.env.TZ_SCHOOL || 'Asia/Almaty';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SESSION_DAYS = 30;

const ROLES = ['teacher', 'zavuch', 'guard'];

// ---------- Деректер қоры (JSON файл) ----------

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

function loadDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
  const password = process.env.ZAVUCH_PASSWORD || 'zavuch123';
  const db = {
    users: [
      {
        id: crypto.randomUUID(),
        login: 'zavuch',
        name: 'Оқу ісінің меңгерушісі',
        role: 'zavuch',
        className: '',
        password: hashPassword(password),
      },
    ],
    sessions: {},
    requests: [],
  };
  console.log(`Жаңа база құрылды. Кіру: zavuch / ${password} — құпия сөзді міндетті түрде ауыстырыңыз!`);
  return db;
}

const db = loadDb();
let saveTimer = null;

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
    fs.renameSync(tmp, DB_FILE);
  }, 50);
}

// ---------- Көмекші функциялар ----------

function localDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date);
}

function publicUser(u) {
  return { id: u.id, login: u.login, name: u.name, role: u.role, className: u.className };
}

function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function currentUser(req) {
  const sid = parseCookies(req).sid;
  const session = sid && db.sessions[sid];
  if (!session || session.expires < Date.now()) return null;
  return db.users.find((u) => u.id === session.userId) || null;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 100_000) {
        reject(new Error('too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('bad json'));
      }
    });
  });
}

// Кіруді тым жиі қайталауды шектеу
const loginAttempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const list = (loginAttempts.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  loginAttempts.set(ip, list);
  return list.length >= 10;
}

// ---------- API ----------

async function api(req, res, url) {
  const route = `${req.method} ${url.pathname}`;
  const user = currentUser(req);

  if (route === 'POST /api/login') {
    const ip = req.socket.remoteAddress;
    if (tooManyAttempts(ip)) return send(res, 429, { error: 'Тым көп әрекет. 10 минуттан кейін қайталаңыз.' });
    const body = await readBody(req);
    const u = db.users.find((x) => x.login === str(body.login).toLowerCase());
    if (!u || !checkPassword(str(body.password), u.password)) {
      loginAttempts.get(ip).push(Date.now());
      return send(res, 401, { error: 'Логин немесе құпия сөз қате.' });
    }
    const sid = crypto.randomBytes(24).toString('hex');
    db.sessions[sid] = { userId: u.id, expires: Date.now() + SESSION_DAYS * 864e5 };
    save();
    return send(res, 200, { user: publicUser(u) }, {
      'Set-Cookie': `sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DAYS * 86400}`,
    });
  }

  if (!user) return send(res, 401, { error: 'Жүйеге кіріңіз.' });

  if (route === 'POST /api/logout') {
    delete db.sessions[parseCookies(req).sid];
    save();
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; Path=/; Max-Age=0' });
  }

  if (route === 'GET /api/me') return send(res, 200, { user: publicUser(user), today: localDate(), tz: TZ });

  if (route === 'POST /api/password') {
    const body = await readBody(req);
    if (!checkPassword(str(body.oldPassword), user.password)) return send(res, 400, { error: 'Ескі құпия сөз қате.' });
    if (str(body.newPassword).length < 6) return send(res, 400, { error: 'Жаңа құпия сөз кемінде 6 таңба болсын.' });
    user.password = hashPassword(str(body.newPassword));
    save();
    return send(res, 200, { ok: true });
  }

  // Өтінімдер тізімі
  if (route === 'GET /api/requests') {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('date') || '') ? url.searchParams.get('date') : localDate();
    let list = db.requests.filter((r) => r.date === date);
    if (user.role === 'teacher') list = list.filter((r) => r.teacherId === user.id);
    if (user.role === 'guard') list = list.filter((r) => r.status === 'approved' || r.status === 'left');
    return send(res, 200, { date, requests: list.slice().reverse() });
  }

  // Сынып жетекшісі жаңа өтінім жібереді
  if (route === 'POST /api/requests') {
    if (user.role !== 'teacher') return send(res, 403, { error: 'Тек сынып жетекшісі өтінім жібере алады.' });
    const b = await readBody(req);
    const r = {
      id: crypto.randomUUID(),
      date: localDate(),
      createdAt: new Date().toISOString(),
      teacherId: user.id,
      teacherName: user.name,
      student: str(b.student, 100),
      className: str(b.className, 20) || user.className,
      reason: str(b.reason, 60),
      reasonNote: str(b.reasonNote, 300),
      destination: str(b.destination, 60),
      pickup: str(b.pickup, 100),
      pickupPhone: str(b.pickupPhone, 30),
      status: 'pending',
      decidedBy: '',
      decidedAt: '',
      decisionNote: '',
      leftAt: '',
      guardName: '',
    };
    if (!r.student || !r.className || !r.reason || !r.destination) {
      return send(res, 400, { error: 'Оқушының аты, сыныбы, себебі және қайда баратыны міндетті.' });
    }
    db.requests.push(r);
    save();
    return send(res, 201, { request: r });
  }

  const action = url.pathname.match(/^\/api\/requests\/([\w-]+)\/(approve|reject|leave|cancel)$/);
  if (req.method === 'POST' && action) {
    const r = db.requests.find((x) => x.id === action[1]);
    if (!r) return send(res, 404, { error: 'Өтінім табылмады.' });
    const b = await readBody(req);
    const now = new Date().toISOString();
    const verb = action[2];

    if (verb === 'approve' || verb === 'reject') {
      if (user.role !== 'zavuch') return send(res, 403, { error: 'Тек завуч шешім қабылдайды.' });
      if (r.status !== 'pending') return send(res, 409, { error: 'Бұл өтінім бойынша шешім қабылданған.' });
      r.status = verb === 'approve' ? 'approved' : 'rejected';
      r.decidedBy = user.name;
      r.decidedAt = now;
      r.decisionNote = str(b.note, 300);
    } else if (verb === 'leave') {
      if (user.role !== 'guard') return send(res, 403, { error: 'Тек күзетші белгілейді.' });
      if (r.status !== 'approved') return send(res, 409, { error: 'Оқушыға шығуға рұқсат берілмеген.' });
      r.status = 'left';
      r.leftAt = now;
      r.guardName = user.name;
    } else if (verb === 'cancel') {
      if (r.teacherId !== user.id) return send(res, 403, { error: 'Тек өз өтініміңізді қайтара аласыз.' });
      if (r.status !== 'pending') return send(res, 409, { error: 'Шешім қабылданған өтінімді қайтаруға болмайды.' });
      r.status = 'cancelled';
    }
    save();
    return send(res, 200, { request: r });
  }

  // Қолданушыларды басқару (тек завуч)
  if (url.pathname.startsWith('/api/users')) {
    if (user.role !== 'zavuch') return send(res, 403, { error: 'Рұқсат жоқ.' });

    if (route === 'GET /api/users') return send(res, 200, { users: db.users.map(publicUser) });

    if (route === 'POST /api/users') {
      const b = await readBody(req);
      const login = str(b.login, 40).toLowerCase();
      const role = ROLES.includes(b.role) ? b.role : '';
      if (!/^[a-z0-9._-]{2,40}$/.test(login)) return send(res, 400, { error: 'Логин тек латын әріптері мен сандардан тұрсын.' });
      if (!role || !str(b.name)) return send(res, 400, { error: 'Аты-жөні мен рөлін толтырыңыз.' });
      if (str(b.password).length < 6) return send(res, 400, { error: 'Құпия сөз кемінде 6 таңба болсын.' });
      if (db.users.some((u) => u.login === login)) return send(res, 409, { error: 'Мұндай логин бар.' });
      const u = {
        id: crypto.randomUUID(),
        login,
        name: str(b.name, 100),
        role,
        className: role === 'teacher' ? str(b.className, 20) : '',
        password: hashPassword(str(b.password)),
      };
      db.users.push(u);
      save();
      return send(res, 201, { user: publicUser(u) });
    }

    const m = url.pathname.match(/^\/api\/users\/([\w-]+)(\/password)?$/);
    const target = m && db.users.find((u) => u.id === m[1]);
    if (!target) return send(res, 404, { error: 'Қолданушы табылмады.' });

    if (req.method === 'POST' && m[2]) {
      const b = await readBody(req);
      if (str(b.password).length < 6) return send(res, 400, { error: 'Құпия сөз кемінде 6 таңба болсын.' });
      target.password = hashPassword(str(b.password));
      for (const [sid, s] of Object.entries(db.sessions)) if (s.userId === target.id) delete db.sessions[sid];
      save();
      return send(res, 200, { ok: true });
    }

    if (req.method === 'DELETE' && !m[2]) {
      if (target.id === user.id) return send(res, 400, { error: 'Өзіңізді өшіре алмайсыз.' });
      db.users = db.users.filter((u) => u.id !== target.id);
      for (const [sid, s] of Object.entries(db.sessions)) if (s.userId === target.id) delete db.sessions[sid];
      save();
      return send(res, 200, { ok: true });
    }
  }

  return send(res, 404, { error: 'Табылмады.' });
}

// ---------- Статикалық файлдар ----------

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(res, pathname) {
  const file = path.normalize(path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'forbidden' });
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Табылмады');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------- Сервер ----------

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    try {
      if (url.pathname.startsWith('/api/')) return await api(req, res, url);
      return serveStatic(res, url.pathname);
    } catch (e) {
      console.error(e);
      return send(res, 400, { error: 'Сұрау қате.' });
    }
  })
  .listen(PORT, () => console.log(`Сайт іске қосылды: http://localhost:${PORT}`));
