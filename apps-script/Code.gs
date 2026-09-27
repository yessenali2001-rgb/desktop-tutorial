// Мектептен шығуға рұқсат беру жүйесі — Google Apps Script сервері.
// Деректер осы скрипт байланған Google Sheets кестесінде сақталады.

var SHEET_USERS = 'Қолданушылар';
var SHEET_REQUESTS = 'Өтінімдер';
var SHEET_SESSIONS = 'Сессиялар';
var SESSION_DAYS = 30;
var DEFAULT_ZAVUCH_PASSWORD = 'zavuch123';

var USER_COLS = ['id', 'login', 'name', 'role', 'className', 'password'];
var USER_HEADERS = ['ID', 'Логин', 'Аты-жөні', 'Рөлі', 'Сыныбы', 'Құпия сөз (хэш)'];

var REQ_COLS = ['id', 'date', 'createdAt', 'teacherId', 'teacherName', 'student', 'className', 'reason', 'reasonNote',
  'destination', 'pickup', 'pickupPhone', 'status', 'decidedBy', 'decidedAt', 'decisionNote', 'leftAt', 'guardName'];
var REQ_HEADERS = ['ID', 'Күні', 'Жіберілді', 'Жетекші ID', 'Сынып жетекшісі', 'Оқушы', 'Сыныбы', 'Себебі', 'Қосымша',
  'Қайда', 'Кім алып кетеді', 'Телефон', 'Күйі', 'Шешім қабылдаған', 'Шешім уақыты', 'Завуч ескертпесі', 'Шыққан уақыты', 'Күзетші'];

var SESSION_COLS = ['token', 'userId', 'expires'];

var ROLES = ['teacher', 'zavuch', 'guard'];
var ROLE_LABELS = { teacher: 'Сынып жетекшісі', zavuch: 'Завуч', guard: 'Күзетші' };
var STATUS_LABELS = {
  pending: 'Күтуде',
  approved: 'Рұқсат берілді',
  rejected: 'Бас тартылды',
  left: 'Мектептен шықты',
  cancelled: 'Қайтарылды',
};

// ---------- Веб-бет ----------

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Мектептен шығу рұқсаты')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

// ---------- Кесте мәзірі және бастапқы баптау ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Шығу рұқсаты')
    .addItem('Бастапқы баптау', 'setup')
    .addToUi();
}

// Бір рет іске қосу керек: парақтарды құрады және завуч логинін жасайды.
function setup() {
  var ss = SpreadsheetApp.getActive();
  prepareSheet_(ss, SHEET_USERS, USER_HEADERS);
  prepareSheet_(ss, SHEET_REQUESTS, REQ_HEADERS);
  prepareSheet_(ss, SHEET_SESSIONS, ['Токен', 'Қолданушы ID', 'Мерзімі']);
  ss.getSheetByName(SHEET_SESSIONS).hideSheet();

  var message;
  if (readRows_(SHEET_USERS, USER_COLS).length === 0) {
    appendRow_(SHEET_USERS, USER_COLS, {
      id: Utilities.getUuid(),
      login: 'zavuch',
      name: 'Оқу ісінің меңгерушісі',
      role: 'zavuch',
      className: '',
      password: hashPassword_(DEFAULT_ZAVUCH_PASSWORD),
    });
    message = 'Дайын! Кіру: zavuch / ' + DEFAULT_ZAVUCH_PASSWORD + '. Кіргеннен кейін құпия сөзді бірден ауыстырыңыз.';
  } else {
    message = 'Парақтар тексерілді. Қолданушылар бұрыннан бар.';
  }
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log(message);
  }
}

function prepareSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  // Барлық ұяшық мәтін форматында: телефон (+7…) мен күндерді Sheets өзгертпесін,
  // ал "=" деп басталатын мәтін формула болып кетпесін.
  sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).setNumberFormat('@');
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

// ---------- Кестемен жұмыс ----------

function sheet_(name) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw new Error('Кесте бапталмаған. Кестеде «Шығу рұқсаты → Бастапқы баптау» басыңыз.');
  return sheet;
}

function readRows_(name, cols) {
  var sheet = sheet_(name);
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var values = sheet.getRange(2, 1, last - 1, cols.length).getDisplayValues();
  return values.map(function (row, i) {
    var obj = { _row: i + 2 };
    cols.forEach(function (c, j) { obj[c] = row[j]; });
    return obj;
  });
}

function appendRow_(name, cols, obj) {
  var sheet = sheet_(name);
  var row = sheet.getLastRow() + 1;
  var range = sheet.getRange(row, 1, 1, cols.length);
  range.setNumberFormat('@');
  range.setValues([cols.map(function (c) { return obj[c] == null ? '' : String(obj[c]); })]);
}

function writeRow_(name, cols, obj) {
  sheet_(name).getRange(obj._row, 1, 1, cols.length)
    .setValues([cols.map(function (c) { return obj[c] == null ? '' : String(obj[c]); })]);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// ---------- Көмекшілер ----------

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function today_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function str_(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max || 200) : '';
}

function hashPassword_(password, salt) {
  salt = salt || Utilities.getUuid().replace(/-/g, '');
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + password, Utilities.Charset.UTF_8);
  for (var i = 0; i < 199; i++) bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes);
  return salt + ':' + Utilities.base64Encode(bytes);
}

function checkPassword_(password, stored) {
  var salt = String(stored).split(':')[0];
  return hashPassword_(password, salt) === stored;
}

function publicUser_(u) {
  return { id: u.id, login: u.login, name: u.name, role: u.role, className: u.className };
}

function publicRequest_(r) {
  var out = {};
  REQ_COLS.forEach(function (c) { out[c] = r[c]; });
  out.status = statusCode_(r.status);
  return out;
}

function statusCode_(label) {
  for (var code in STATUS_LABELS) if (STATUS_LABELS[code] === label) return code;
  return label;
}

// Кіру тексерісі. "AUTH:" деп басталатын қате клиентті кіру бетіне қайтарады.
function auth_(token, roles) {
  if (!token) throw new Error('AUTH:Жүйеге кіріңіз.');
  var cache = CacheService.getScriptCache();
  var userId = cache.get('s:' + token);
  if (!userId) {
    var session = readRows_(SHEET_SESSIONS, SESSION_COLS).filter(function (s) { return s.token === token; })[0];
    if (!session || Number(session.expires) < Date.now()) throw new Error('AUTH:Жүйеге қайта кіріңіз.');
    userId = session.userId;
    cache.put('s:' + token, userId, 21600);
  }
  var user = readRows_(SHEET_USERS, USER_COLS).filter(function (u) { return u.id === userId; })[0];
  if (!user) throw new Error('AUTH:Жүйеге қайта кіріңіз.');
  if (roles && roles.indexOf(user.role) === -1) throw new Error('Бұл әрекетке рұқсатыңыз жоқ.');
  return user;
}

function dropSessions_(userId, exceptToken) {
  var sheet = sheet_(SHEET_SESSIONS);
  var cache = CacheService.getScriptCache();
  var rows = readRows_(SHEET_SESSIONS, SESSION_COLS);
  for (var i = rows.length - 1; i >= 0; i--) {
    var s = rows[i];
    var expired = Number(s.expires) < Date.now();
    if (expired || (s.userId === userId && s.token !== exceptToken)) {
      cache.remove('s:' + s.token);
      sheet.deleteRow(s._row);
    }
  }
}

// ---------- API (бет google.script.run арқылы шақырады) ----------

function apiLogin(login, password) {
  login = str_(login, 40).toLowerCase();
  var cache = CacheService.getScriptCache();
  var attemptsKey = 'fail:' + login;
  var attempts = Number(cache.get(attemptsKey) || 0);
  if (attempts >= 10) throw new Error('Тым көп әрекет. 10 минуттан кейін қайталаңыз.');

  var user = readRows_(SHEET_USERS, USER_COLS).filter(function (u) { return u.login === login; })[0];
  if (!user || !checkPassword_(str_(password), user.password)) {
    cache.put(attemptsKey, String(attempts + 1), 600);
    throw new Error('Логин немесе құпия сөз қате.');
  }
  var token = Utilities.getUuid() + Utilities.getUuid();
  withLock_(function () {
    appendRow_(SHEET_SESSIONS, SESSION_COLS, { token: token, userId: user.id, expires: Date.now() + SESSION_DAYS * 864e5 });
  });
  cache.put('s:' + token, user.id, 21600);
  return { token: token, user: publicUser_(user), today: today_() };
}

function apiMe(token) {
  return { user: publicUser_(auth_(token)), today: today_() };
}

function apiLogout(token) {
  withLock_(function () {
    var s = readRows_(SHEET_SESSIONS, SESSION_COLS).filter(function (x) { return x.token === token; })[0];
    if (s) sheet_(SHEET_SESSIONS).deleteRow(s._row);
    CacheService.getScriptCache().remove('s:' + token);
  });
  return true;
}

function apiChangePassword(token, oldPassword, newPassword) {
  var user = auth_(token);
  if (!checkPassword_(str_(oldPassword), user.password)) throw new Error('Ескі құпия сөз қате.');
  if (str_(newPassword).length < 6) throw new Error('Жаңа құпия сөз кемінде 6 таңба болсын.');
  withLock_(function () {
    user.password = hashPassword_(str_(newPassword));
    writeRow_(SHEET_USERS, USER_COLS, user);
    dropSessions_(user.id, token);
  });
  return true;
}

function apiListRequests(token, date) {
  var user = auth_(token);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) date = today_();
  var list = readRows_(SHEET_REQUESTS, REQ_COLS)
    .filter(function (r) { return r.date === date; })
    .map(publicRequest_);
  if (user.role === 'teacher') list = list.filter(function (r) { return r.teacherId === user.id; });
  if (user.role === 'guard') list = list.filter(function (r) { return r.status === 'approved' || r.status === 'left'; });
  return { date: date, today: today_(), requests: list.reverse() };
}

function apiCreateRequest(token, b) {
  var user = auth_(token, ['teacher']);
  b = b || {};
  var r = {
    id: Utilities.getUuid(),
    date: today_(),
    createdAt: now_(),
    teacherId: user.id,
    teacherName: user.name,
    student: str_(b.student, 100),
    className: str_(b.className, 20) || user.className,
    reason: str_(b.reason, 60),
    reasonNote: str_(b.reasonNote, 300),
    destination: str_(b.destination, 60),
    pickup: str_(b.pickup, 100),
    pickupPhone: str_(b.pickupPhone, 30),
    status: STATUS_LABELS.pending,
  };
  if (!r.student || !r.className || !r.reason || !r.destination) {
    throw new Error('Оқушының аты, сыныбы, себебі және қайда баратыны міндетті.');
  }
  withLock_(function () { appendRow_(SHEET_REQUESTS, REQ_COLS, r); });
  return publicRequest_(r);
}

function apiRequestAction(token, id, verb, note) {
  var user = auth_(token);
  return withLock_(function () {
    var r = readRows_(SHEET_REQUESTS, REQ_COLS).filter(function (x) { return x.id === id; })[0];
    if (!r) throw new Error('Өтінім табылмады.');
    var status = statusCode_(r.status);

    if (verb === 'approve' || verb === 'reject') {
      if (user.role !== 'zavuch') throw new Error('Тек завуч шешім қабылдайды.');
      if (status !== 'pending') throw new Error('Бұл өтінім бойынша шешім қабылданған.');
      r.status = STATUS_LABELS[verb === 'approve' ? 'approved' : 'rejected'];
      r.decidedBy = user.name;
      r.decidedAt = now_();
      r.decisionNote = str_(note, 300);
    } else if (verb === 'leave') {
      if (user.role !== 'guard') throw new Error('Тек күзетші белгілейді.');
      if (status !== 'approved') throw new Error('Оқушыға шығуға рұқсат берілмеген.');
      r.status = STATUS_LABELS.left;
      r.leftAt = now_();
      r.guardName = user.name;
    } else if (verb === 'cancel') {
      if (r.teacherId !== user.id) throw new Error('Тек өз өтініміңізді қайтара аласыз.');
      if (status !== 'pending') throw new Error('Шешім қабылданған өтінімді қайтаруға болмайды.');
      r.status = STATUS_LABELS.cancelled;
    } else {
      throw new Error('Белгісіз әрекет.');
    }
    writeRow_(SHEET_REQUESTS, REQ_COLS, r);
    return publicRequest_(r);
  });
}

// ---------- Қолданушыларды басқару (тек завуч) ----------

function apiListUsers(token) {
  auth_(token, ['zavuch']);
  return readRows_(SHEET_USERS, USER_COLS).map(publicUser_);
}

function apiAddUser(token, b) {
  auth_(token, ['zavuch']);
  b = b || {};
  var login = str_(b.login, 40).toLowerCase();
  var role = ROLES.indexOf(b.role) >= 0 ? b.role : '';
  if (!/^[a-z0-9._-]{2,40}$/.test(login)) throw new Error('Логин тек латын әріптері мен сандардан тұрсын.');
  if (!role || !str_(b.name)) throw new Error('Аты-жөні мен рөлін толтырыңыз.');
  if (str_(b.password).length < 6) throw new Error('Құпия сөз кемінде 6 таңба болсын.');
  return withLock_(function () {
    if (readRows_(SHEET_USERS, USER_COLS).some(function (u) { return u.login === login; })) {
      throw new Error('Мұндай логин бар.');
    }
    var u = {
      id: Utilities.getUuid(),
      login: login,
      name: str_(b.name, 100),
      role: role,
      className: role === 'teacher' ? str_(b.className, 20) : '',
      password: hashPassword_(str_(b.password)),
    };
    appendRow_(SHEET_USERS, USER_COLS, u);
    return publicUser_(u);
  });
}

function apiResetPassword(token, userId, password) {
  auth_(token, ['zavuch']);
  if (str_(password).length < 6) throw new Error('Құпия сөз кемінде 6 таңба болсын.');
  withLock_(function () {
    var u = readRows_(SHEET_USERS, USER_COLS).filter(function (x) { return x.id === userId; })[0];
    if (!u) throw new Error('Қолданушы табылмады.');
    u.password = hashPassword_(str_(password));
    writeRow_(SHEET_USERS, USER_COLS, u);
    dropSessions_(u.id);
  });
  return true;
}

function apiDeleteUser(token, userId) {
  var me = auth_(token, ['zavuch']);
  if (me.id === userId) throw new Error('Өзіңізді өшіре алмайсыз.');
  withLock_(function () {
    var u = readRows_(SHEET_USERS, USER_COLS).filter(function (x) { return x.id === userId; })[0];
    if (!u) throw new Error('Қолданушы табылмады.');
    dropSessions_(u.id);
    sheet_(SHEET_USERS).deleteRow(u._row);
  });
  return true;
}
