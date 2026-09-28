// Мектептен шығуға рұқсат беру жүйесі — Google Apps Script сервері.
// Деректер осы скрипт байланған Google Sheets кестесінде сақталады.

var SHEET_USERS = 'Қолданушылар';
var SHEET_REQUESTS = 'Өтінімдер';
var SHEET_SESSIONS = 'Сессиялар';
var SHEET_STUDENTS = 'Оқушылар';
var SESSION_DAYS = 30;
var DEFAULT_ZAVUCH_PASSWORD = 'zavuch123';

// Мектептің атауы (кіру бетінде толық, жоғарғы жолақта қысқа түрде көрінеді)
var SCHOOL_FULL_NAME = '«Ақтөбе облысының білім басқармасы» мемлекеттік мекемесінің «Дарынды жасөспірімдерге арналған Ақтөбе облыстық мамандандырылған «Білім-инновация» лицей-интернаты» коммуналдық мемлекеттік мекемесі';
var SCHOOL_SHORT_NAME = '«Білім-инновация» лицей-интернаты';
var SITE_TITLE = 'Шығу рұқсаты · Білім-инновация';

var USER_COLS = ['id', 'login', 'name', 'role', 'className', 'password'];
var USER_HEADERS = ['ID', 'Кілт', 'Аты-жөні', 'Рөлі', 'Сыныбы', 'PIN / құпия сөз (хэш)'];

var REQ_COLS = ['id', 'date', 'createdAt', 'teacherId', 'teacherName', 'student', 'className', 'reason', 'reasonNote',
  'destination', 'pickup', 'pickupPhone', 'status', 'decidedBy', 'decidedAt', 'decisionNote', 'leftAt', 'guardName'];
var REQ_HEADERS = ['ID', 'Күні', 'Жіберілді', 'Жетекші ID', 'Сынып жетекшісі', 'Оқушы', 'Сыныбы', 'Себебі', 'Қосымша',
  'Қайда', 'Кім алып кетеді', 'Телефон', 'Күйі', 'Шешім қабылдаған', 'Шешім уақыты', 'Завуч ескертпесі', 'Шыққан уақыты', 'КПП'];

var SESSION_COLS = ['token', 'userId', 'expires'];
var STUDENT_COLS = ['className', 'name', 'photoId'];
var STUDENT_HEADERS = ['Сынып', 'Оқушының аты-жөні', 'Сурет (Drive ID)'];

var ROLES = ['teacher', 'zavuch', 'guard'];
var ROLE_LABELS = { teacher: 'Сынып жетекшісі', zavuch: 'Завуч', guard: 'КПП' };
var STATUS_LABELS = {
  pending: 'Күтуде',
  approved: 'Рұқсат берілді',
  rejected: 'Бас тартылды',
  left: 'Мектептен шықты',
  cancelled: 'Қайтарылды',
};

// ---------- Веб-бет ----------

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  template.schoolFullName = SCHOOL_FULL_NAME;
  template.schoolShortName = SCHOOL_SHORT_NAME;
  template.siteTitle = SITE_TITLE;
  return template
    .evaluate()
    .setTitle(SITE_TITLE)
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
    .addItem('Суреттерді байланыстыру', 'linkPhotos')
    .addItem('Суреттер бумасын ауыстыру', 'changePhotosFolder')
    .addToUi();
}

// Бір рет іске қосу керек: парақтарды құрады және завуч логинін жасайды.
function setup() {
  var ss = SpreadsheetApp.getActive();
  prepareSheet_(ss, SHEET_USERS, USER_HEADERS);
  prepareSheet_(ss, SHEET_REQUESTS, REQ_HEADERS);
  prepareSheet_(ss, SHEET_STUDENTS, STUDENT_HEADERS);
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
    message = 'Дайын! Сайтқа «Завуч» ретінде кіріңіз, құпия сөз: ' + DEFAULT_ZAVUCH_PASSWORD + '. Кіргеннен кейін оны бірден ауыстырыңыз.';
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

// "10 а" → "10А"
function normClass_(value) {
  return str_(value, 20).replace(/\s+/g, '').toUpperCase();
}

function isPin_(value) {
  return /^\d{4,6}$/.test(value);
}

function checkSecret_(role, secret) {
  if (role === 'teacher') {
    if (!isPin_(secret)) throw new Error('PIN-код 4–6 саннан тұрсын.');
  } else if (secret.length < 6) {
    throw new Error('Құпия сөз кемінде 6 таңба болсын.');
  }
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

// Кіру беті үшін: сыныптардың тізімі (құпия ақпарат жоқ).
function apiLoginOptions() {
  var classes = readRows_(SHEET_USERS, USER_COLS)
    .filter(function (u) { return u.role === 'teacher' && u.className; })
    .map(function (u) { return u.className; });
  classes.sort(function (a, b) {
    return (parseInt(a, 10) - parseInt(b, 10)) || a.localeCompare(b, 'kk');
  });
  return { classes: classes };
}

// Сынып жетекшісі: сынып + PIN. КПП мен завуч: рөлі + өз құпия сөзі.
function apiLogin(role, className, secret) {
  if (ROLES.indexOf(role) === -1) throw new Error('Кім ретінде кіретініңізді таңдаңыз.');
  className = role === 'teacher' ? normClass_(className) : '';
  secret = str_(secret);
  if (role === 'teacher' && !className) throw new Error('Сыныпты таңдаңыз.');

  var cache = CacheService.getScriptCache();
  var attemptsKey = 'fail:' + role + ':' + className;
  var attempts = Number(cache.get(attemptsKey) || 0);
  if (attempts >= 10) throw new Error('Тым көп қате әрекет. 10 минуттан кейін қайталаңыз.');

  var user = readRows_(SHEET_USERS, USER_COLS).filter(function (u) {
    return u.role === role && (role !== 'teacher' || u.className === className) && checkPassword_(secret, u.password);
  })[0];
  if (!user) {
    cache.put(attemptsKey, String(attempts + 1), 600);
    throw new Error(role === 'teacher' ? 'PIN-код қате.' : 'Құпия сөз қате.');
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
  if (!checkPassword_(str_(oldPassword), user.password)) {
    throw new Error(user.role === 'teacher' ? 'Ескі PIN-код қате.' : 'Ескі құпия сөз қате.');
  }
  checkSecret_(user.role, str_(newPassword));
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
    className: user.className || normClass_(b.className),
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
      if (user.role !== 'guard') throw new Error('Тек КПП белгілейді.');
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

// ---------- Айлық есеп (завуч) ----------

// Шықты деп рұқсат берілген өтінімдерді санаймыз: КПП белгілегені де, әлі белгілемегені де.
function isExit_(r) {
  return r.status === 'approved' || r.status === 'left';
}

function monthRows_(month) {
  return readRows_(SHEET_REQUESTS, REQ_COLS)
    .map(publicRequest_)
    .filter(function (r) { return r.date.slice(0, 7) === month; });
}

function classOrder_(a, b) {
  return (parseInt(a, 10) - parseInt(b, 10)) || a.localeCompare(b, 'kk');
}

function apiMonthReport(token, month) {
  auth_(token, ['zavuch']);
  if (!/^\d{4}-\d{2}$/.test(month || '')) month = today_().slice(0, 7);
  var rows = monthRows_(month);
  var totals = { all: rows.length, pending: 0, approved: 0, left: 0, rejected: 0, cancelled: 0 };
  rows.forEach(function (r) { totals[r.status] = (totals[r.status] || 0) + 1; });

  var byReason = {};
  var byClass = {};
  var byDay = {};
  var students = {};
  rows.filter(isExit_).forEach(function (r) {
    byReason[r.reason] = (byReason[r.reason] || 0) + 1;
    byClass[r.className] = (byClass[r.className] || 0) + 1;
    byDay[r.date] = (byDay[r.date] || 0) + 1;
    var key = r.className + '|' + r.student;
    var s = students[key] = students[key] || { student: r.student, className: r.className, count: 0, reasons: {}, last: '' };
    s.count++;
    s.reasons[r.reason] = (s.reasons[r.reason] || 0) + 1;
    if (r.createdAt > s.last) s.last = r.createdAt;
  });

  var pairs = function (obj) { return Object.keys(obj).map(function (k) { return [k, obj[k]]; }); };
  return {
    month: month,
    totals: totals,
    exits: totals.approved + totals.left,
    byReason: pairs(byReason).sort(function (a, b) { return b[1] - a[1]; }),
    byClass: pairs(byClass).sort(function (a, b) { return classOrder_(a[0], b[0]); }),
    byDay: pairs(byDay).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }),
    students: Object.keys(students).map(function (k) { return students[k]; })
      .sort(function (a, b) { return (b.count - a.count) || a.student.localeCompare(b.student, 'kk'); }),
  };
}

// Есепті кестенің жаңа парағына шығару (басып шығаруға, архивке)
function apiExportMonthReport(token, month) {
  var report = apiMonthReport(token, month);
  var ss = SpreadsheetApp.getActive();
  var name = 'Есеп ' + report.month;
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clear();
  var rows = [['Оқушы', 'Сынып', 'Неше рет шықты', 'Себептері', 'Соңғы рет']];
  report.students.forEach(function (s) {
    var reasons = Object.keys(s.reasons).map(function (k) { return k + ' — ' + s.reasons[k]; }).join('; ');
    rows.push([s.student, s.className, s.count, reasons, s.last.slice(0, 16)]);
  });
  rows.push(['', '', '', '', '']);
  rows.push(['Себептер бойынша', '', '', '', '']);
  report.byReason.forEach(function (p) { rows.push([p[0], '', p[1], '', '']); });
  rows.push(['', '', '', '', '']);
  rows.push(['Барлық өтінім', '', report.totals.all, '', '']);
  rows.push(['Шығуға рұқсат берілді', '', report.exits, '', '']);
  rows.push(['Бас тартылды', '', report.totals.rejected, '', '']);
  sheet.getRange(1, 1, rows.length, 5).setNumberFormat('@').setValues(rows.map(function (r) {
    return r.map(function (v) { return String(v); });
  }));
  sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 5);
  return ss.getUrl() + '#gid=' + sheet.getSheetId();
}

function apiListUsers(token) {
  auth_(token, ['zavuch']);
  var counts = {};
  readStudents_().forEach(function (s) { counts[s.className] = (counts[s.className] || 0) + 1; });
  return readRows_(SHEET_USERS, USER_COLS).map(function (u) {
    var out = publicUser_(u);
    if (u.role === 'teacher') out.studentCount = counts[u.className] || 0;
    return out;
  });
}

// ---------- Оқушылар тізімі ----------

// «Оқушылар» парағы: A бағаны — сынып (10А), B бағаны — аты-жөні.
// Парақ жоқ болса, бос тізім қайтарамыз: сайт қолмен жазуға мүмкіндік береді.
function readStudents_() {
  if (!SpreadsheetApp.getActive().getSheetByName(SHEET_STUDENTS)) return [];
  return readRows_(SHEET_STUDENTS, STUDENT_COLS)
    .map(function (s) {
      return {
        className: normClass_(s.className),
        name: String(s.name).replace(/\s+/g, ' ').trim(),
        photoId: String(s.photoId || '').trim(),
      };
    })
    .filter(function (s) { return s.className && s.name; });
}

// ---------- Оқушылардың суреттері ----------

// Суреттер бумасын аралап, әр суретті «Оқушылар» парағындағы оқушыға байланыстырады.
// Кестенің мәзірінен іске қосылады: «Шығу рұқсаты → Суреттерді байланыстыру».
//
// Суреттер бумасының ішінде сынып бумалары (7А, 7Ә …), файл аты — оқушының аты-жөні.
// Бума сілтемесі кодта емес, скрипттің жабық баптауларында (Script properties) сақталады:
// код ашық репозиторийде тұр, ал сілтеме арқылы балалардың суреттерін ашуға болады.
function photosFolderId_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PHOTOS_FOLDER_ID');
  if (id) return id;
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt('Суреттер бумасы',
    'Google Drive-тағы суреттер бумасының сілтемесін қойыңыз (ішінде 7А, 7Ә … бумалары бар):',
    ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return '';
  var text = answer.getResponseText().trim();
  var match = text.match(/folders\/([\w-]+)/) || text.match(/^([\w-]{20,})$/);
  if (!match) {
    ui.alert('Сілтеме танылмады. Drive-та буманы ашып, мекенжай жолындағы сілтемені көшіріңіз.');
    return '';
  }
  props.setProperty('PHOTOS_FOLDER_ID', match[1]);
  return match[1];
}

function changePhotosFolder() {
  PropertiesService.getScriptProperties().deleteProperty('PHOTOS_FOLDER_ID');
  linkPhotos();
}

function linkPhotos() {
  var folderId = photosFolderId_();
  if (!folderId) return;
  var rows = readRows_(SHEET_STUDENTS, STUDENT_COLS);
  var byClass = {};
  rows.forEach(function (s) {
    var cls = normClass_(s.className);
    (byClass[cls] = byClass[cls] || []).push(s);
  });
  var linked = 0;
  var unmatched = [];
  var folders = DriveApp.getFolderById(folderId).getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    var cls = normClass_(folder.getName());
    var list = byClass[cls] || [];
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      if (!/^image\//.test(file.getMimeType())) continue;
      var student = matchStudent_(file.getName(), list);
      if (student) {
        student.photoId = file.getId();
        linked++;
      } else {
        unmatched.push(cls + ': ' + file.getName());
      }
    }
  }
  if (rows.length) {
    sheet_(SHEET_STUDENTS).getRange(2, 3, rows.length, 1)
      .setValues(rows.map(function (s) { return [s.photoId || '']; }));
  }
  CacheService.getScriptCache().removeAll(rows.map(function (s) { return 'ph:' + s.photoId; }));

  // Суреті жоқтар: бумасы мүлдем жоқ сыныптарды санымен, қалғандарын атымен көрсетеміз
  var noFolder = [];
  var missing = [];
  Object.keys(byClass).forEach(function (cls) {
    var without = byClass[cls].filter(function (s) { return !s.photoId; });
    if (!without.length) return;
    if (without.length === byClass[cls].length) {
      noFolder.push(cls + ' (' + without.length + ')');
    } else {
      without.forEach(function (s) { missing.push(cls + ': ' + s.name); });
    }
  });
  var message = 'Байланысты: ' + linked + ' сурет.\n\n' +
    'Тізімнен табылмаған суреттер (' + unmatched.length + '):\n' + (unmatched.join('\n') || '—') + '\n\n' +
    'Суреті жоқ оқушылар (' + missing.length + '):\n' + (missing.join('\n') || '—') + '\n\n' +
    'Суреттері мүлдем жоқ сыныптар:\n' + (noFolder.join(', ') || '—');
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log(message);
  }
}

// Файл атын оқушының аты-жөнімен салыстыру. Жазылуы сәл басқа болса да табады:
// «Расул» / «Расұл», әкесінің аты қосылған не түсіп қалған, аты мен тегі орын ауыстырған,
// бір-екі әріп қателігі.
function looseKey_(s) {
  s = String(s).normalize('NFC').replace(/\.(jpe?g|png|heic|heif|webp|gif)$/i, '').toLowerCase().replace(/ё/g, 'е');
  var map = { 'ә': 'а', 'ғ': 'г', 'қ': 'к', 'ң': 'н', 'ө': 'о', 'ұ': 'у', 'ү': 'у', 'һ': 'х', 'і': 'и', 'ъ': '', 'ь': '' };
  s = s.replace(/[әғқңөұүһіъь]/g, function (c) { return map[c]; });
  return s.replace(/[^a-zа-я0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function exactKey_(s) {
  return String(s).normalize('NFC').replace(/\.(jpe?g|png|heic|heif|webp|gif)$/i, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function distance_(a, b) {
  var prev = [], cur, i, j;
  for (j = 0; j <= b.length; j++) prev[j] = j;
  for (i = 1; i <= a.length; i++) {
    cur = [i];
    for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
function matchStudent_(fileName, list) {
  var ek = exactKey_(fileName), lk = looseKey_(fileName);
  var hit = list.filter(function (s) { return exactKey_(s.name) === ek; });
  if (hit.length === 1) return hit[0];
  hit = list.filter(function (s) { return looseKey_(s.name) === lk; });
  if (hit.length === 1) return hit[0];
  // Әкесінің аты қосылған не түсіп қалған: алғашқы екі сөз бойынша
  var two = lk.split(' ').slice(0, 2).join(' ');
  hit = list.filter(function (s) { return looseKey_(s.name).split(' ').slice(0, 2).join(' ') === two; });
  if (hit.length === 1) return hit[0];
  // Аты мен тегі орын ауыстырып жазылған
  var sorted = lk.split(' ').sort().join(' ');
  hit = list.filter(function (s) { return looseKey_(s.name).split(' ').sort().join(' ') === sorted; });
  if (hit.length === 1) return hit[0];
  // Бір-екі әріп қателігі
  var best = null, bestD = 99, second = 99;
  list.forEach(function (s) {
    var d = distance_(lk, looseKey_(s.name));
    if (d < bestD) { second = bestD; bestD = d; best = s; } else if (d < second) second = d;
  });
  if (best && bestD <= Math.max(2, Math.floor(lk.length * 0.12)) && second > bestD) return best;
  return null;
}

// Оқушының суретін кішірейтілген түрде қайтарады (data: URI). Суреті жоқ болса — бос жол.
function apiPhoto(token, className, name) {
  auth_(token);
  className = normClass_(className);
  name = String(name || '').replace(/\s+/g, ' ').trim();
  var student = readStudents_().filter(function (s) { return s.className === className && s.name === name; })[0];
  if (!student || !student.photoId) return '';
  var cache = CacheService.getScriptCache();
  var cached = cache.get('ph:' + student.photoId);
  if (cached) return cached;
  try {
    var blob = DriveApp.getFileById(student.photoId).getThumbnail();
    if (!blob) return '';
    var uri = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
    if (uri.length < 95000) cache.put('ph:' + student.photoId, uri, 21600);
    return uri;
  } catch (e) {
    return '';
  }
}

// Сынып жетекшісіне өз сыныбының оқушылары
function apiStudents(token) {
  var user = auth_(token, ['teacher']);
  return readStudents_()
    .filter(function (s) { return s.className === user.className; })
    .map(function (s) { return s.name; })
    .sort(function (a, b) { return a.localeCompare(b, 'kk'); });
}

function apiAddUser(token, b) {
  auth_(token, ['zavuch']);
  b = b || {};
  var role = ROLES.indexOf(b.role) >= 0 ? b.role : '';
  var className = role === 'teacher' ? normClass_(b.className) : '';
  if (!role || !str_(b.name)) throw new Error('Аты-жөні мен рөлін толтырыңыз.');
  if (role === 'teacher' && !className) throw new Error('Сыныбын жазыңыз, мысалы 10А.');
  checkSecret_(role, str_(b.password));
  return withLock_(function () {
    var users = readRows_(SHEET_USERS, USER_COLS);
    if (role === 'teacher' && users.some(function (u) { return u.role === 'teacher' && u.className === className; })) {
      throw new Error(className + ' сыныбы бұрыннан бар.');
    }
    var secretTaken = role !== 'teacher' && users.some(function (u) {
      return u.role === role && checkPassword_(str_(b.password), u.password);
    });
    if (secretTaken) throw new Error('Бұл құпия сөз бос емес. Басқасын ойлап табыңыз.');
    var u = {
      id: Utilities.getUuid(),
      login: role === 'teacher' ? 'class:' + className : role + ':' + Utilities.getUuid().slice(0, 8),
      name: str_(b.name, 100),
      role: role,
      className: className,
      password: hashPassword_(str_(b.password)),
    };
    appendRow_(SHEET_USERS, USER_COLS, u);
    return publicUser_(u);
  });
}

function apiResetPassword(token, userId, password) {
  auth_(token, ['zavuch']);
  withLock_(function () {
    var u = readRows_(SHEET_USERS, USER_COLS).filter(function (x) { return x.id === userId; })[0];
    if (!u) throw new Error('Қолданушы табылмады.');
    checkSecret_(u.role, str_(password));
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
