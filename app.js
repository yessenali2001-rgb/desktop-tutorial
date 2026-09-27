const STORAGE_KEY = 'family-budget-v1';
const SHEET_KEY = 'family-budget-sheet';
const CURRENCY = '₸'; // поменяйте на '₽', '$', '€' и т.д.

const DEFAULT_STATE = {
  members: ['Общее'],
  expenseCategories: ['Продукты', 'Жильё и ЖКХ', 'Транспорт', 'Дети', 'Здоровье', 'Одежда', 'Развлечения', 'Прочее'],
  incomeCategories: ['Зарплата', 'Подработка', 'Подарки', 'Прочее'],
  limits: {},
  monthlyBudget: 0,
  transactions: [],
};

const SETTINGS_KEYS = ['members', 'expenseCategories', 'incomeCategories', 'limits', 'monthlyBudget'];

let state = load();
let sheet = loadSheet(); // 'all' — вся семья, иначе имя члена семьи; у каждого своя вкладка
let currentMonth = monthKey(new Date());

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const fmt = (n) => money.format(n) + ' ' + CURRENCY;

function normalize(data) {
  const out = structuredClone(DEFAULT_STATE);
  for (const key of ['members', 'expenseCategories', 'incomeCategories']) {
    if (Array.isArray(data?.[key]) && data[key].length) out[key] = data[key].filter((x) => typeof x === 'string');
  }
  if (data?.limits && typeof data.limits === 'object') {
    for (const [c, v] of Object.entries(data.limits)) if (v > 0) out.limits[c] = Number(v);
  }
  if (data?.monthlyBudget > 0) out.monthlyBudget = Number(data.monthlyBudget);
  if (Array.isArray(data?.transactions)) out.transactions = data.transactions.filter(isValidTx);
  return out;
}

function isValidTx(t) {
  return t && typeof t.id === 'string' && (t.type === 'income' || t.type === 'expense')
    && typeof t.amount === 'number' && t.amount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
    && typeof t.category === 'string' && typeof t.member === 'string';
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) {
    console.warn('Не удалось прочитать данные', e);
  }
  return structuredClone(DEFAULT_STATE);
}

function loadSheet() {
  try {
    return localStorage.getItem(SHEET_KEY) || JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').sheet || 'all';
  } catch {
    return 'all';
  }
}

function saveSheet() {
  try { localStorage.setItem(SHEET_KEY, sheet); } catch { /* вкладка просто не запомнится */ }
}

function saveLocal() {
  if (db) return; // в общем режиме данные живут в общей базе
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    notify('Не удалось сохранить данные в этом браузере.');
  }
}

// ---------- Общая база ----------
// На claude.ai страница подключается к общей базе: все, кому открыт доступ, видят одни и те же записи.
// Операции хранятся по месяцам (months/2026-09 → items{id: операция}), настройки — в budget/settings.
// Вне claude.ai (файл на компьютере, GitHub Pages) всё хранится в localStorage этого браузера.

let db = null;
let canWrite = true;
let settingsExist = false;
let knownMonths = new Set();
let settingsLoaded = false;
let monthsLoaded = false;
let localCopy = null; // данные этого браузера — можно перенести в общий бюджет
let pendingSettings = null;
let settingsTimer;
const writeQueues = {};

function settingsOf(s) {
  return Object.fromEntries(SETTINGS_KEYS.map((k) => [k, s[k]]));
}

function setStatus(text, kind = '') {
  $('syncStatus').textContent = text;
  $('syncStatus').className = 'sync ' + kind;
  $('syncStatus').hidden = !text;
}

function onWriteError(e) {
  const messages = {
    invalid_argument: 'Не удалось сохранить. Похоже, у вас доступ только на просмотр: попросите владельца дать права «Contributor».',
    quota_exceeded: 'Общая база заполнена. Удалите старые операции, чтобы добавлять новые.',
    resource_exhausted: 'Слишком много изменений подряд. Подождите немного и повторите.',
  };
  notify(messages[e?.code] || 'Не удалось сохранить изменения. Проверьте интернет и повторите.');
}

// Записи в один документ идут строго по очереди.
function enqueue(path, write) {
  const run = () => write(db.doc(path)).catch(onWriteError);
  writeQueues[path] = (writeQueues[path] || Promise.resolve()).then(run);
  return writeQueues[path];
}

function applySettings(patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (k !== 'limits') { state[k] = v; continue; }
    for (const [c, x] of Object.entries(v)) {
      if (x > 0) state.limits[c] = x;
      else delete state.limits[c];
    }
  }
}

// Меняем только переданные поля, чтобы не затереть одновременные правки других.
// delay склеивает быстрый ввод (бюджет, лимиты) в одну запись.
function setSettings(patch, delay = 0) {
  applySettings(patch);
  if (!db) return saveLocal();
  const merged = { ...pendingSettings, ...patch };
  if (pendingSettings?.limits && patch.limits) merged.limits = { ...pendingSettings.limits, ...patch.limits };
  pendingSettings = merged;
  clearTimeout(settingsTimer);
  settingsTimer = setTimeout(flushSettings, delay);
}

function flushSettings() {
  const patch = pendingSettings;
  pendingSettings = null;
  if (!patch) return;
  enqueue('budget/settings', (ref) => (settingsExist ? ref.update(patch) : ref.set(settingsOf(state))));
}

function addTx(tx) {
  state.transactions.push(tx);
  if (!db) return saveLocal();
  const month = tx.date.slice(0, 7);
  enqueue('months/' + month, async (ref) => {
    try {
      await ref.update({ items: { [tx.id]: tx } });
    } catch (e) {
      // update требует существующий документ: первая операция месяца создаёт его
      if (e?.code !== 'invalid_argument' || knownMonths.has(month)) throw e;
      await ref.set({ items: { [tx.id]: tx } });
    }
  });
}

function deleteTx(tx) {
  state.transactions = state.transactions.filter((x) => x.id !== tx.id);
  if (!db) return saveLocal();
  enqueue('months/' + tx.date.slice(0, 7), (ref) => ref.update({ items: { [tx.id]: null } }));
}

async function replaceAll(data) {
  state = normalize(data);
  render();
  if (!db) return saveLocal();
  const byMonth = {};
  for (const t of state.transactions) (byMonth[t.date.slice(0, 7)] ??= {})[t.id] = t;
  const months = new Set([...knownMonths, ...Object.keys(byMonth)]);
  await Promise.all([
    enqueue('budget/settings', (ref) => ref.set(settingsOf(state))),
    ...[...months].map((m) => enqueue('months/' + m, (ref) => (byMonth[m] ? ref.set({ items: byMonth[m] }) : ref.delete()))),
  ]);
}

function hasLocalData(s) {
  return s && (s.transactions.length > 0 || s.members.length > 1 || s.monthlyBudget > 0);
}

function renderMigration() {
  const show = Boolean(db && canWrite && settingsLoaded && monthsLoaded && !settingsExist
    && knownMonths.size === 0 && hasLocalData(localCopy));
  $('migrateBanner').hidden = !show;
  if (show) {
    $('migrateText').textContent = `В этом браузере сохранены ваши прежние записи (операций: ${localCopy.transactions.length}). `
      + 'Перенести их в общий бюджет, чтобы их увидела вся семья?';
  }
}

function onSubscribeError() {
  setStatus('Нет связи с общим бюджетом', 'bad');
}

async function connectShared() {
  if (!window.claude?.use) return;
  const shared = await window.claude.use('db');
  if (!shared) return;

  db = shared;
  localCopy = state;
  state = structuredClone(DEFAULT_STATE);
  setStatus('Подключаемся…');
  render();

  const user = await window.claude.use('user');
  if (user && (await user.can('data.write')) === false) {
    canWrite = false;
    document.body.classList.add('read-only');
  }

  db.doc('budget/settings').onSnapshot((snap) => {
    settingsExist = snap.exists;
    Object.assign(state, settingsOf(normalize(snap.exists ? structuredClone(snap.data()) : {})));
    if (pendingSettings) applySettings(pendingSettings); // ещё не отправленный ввод
    if (!snap.metadata.fromCache) settingsLoaded = true;
    render();
  }, onSubscribeError);

  db.collection('months').onSnapshot((snap) => {
    knownMonths = new Set(snap.docs.map((d) => d.id));
    state.transactions = snap.docs
      .flatMap((d) => Object.values(d.data()?.items || {}))
      .filter(isValidTx)
      .map((t) => ({ ...t }));
    if (!snap.metadata.fromCache) monthsLoaded = true;
    setStatus(canWrite ? 'Общий бюджет семьи' : 'Только просмотр', canWrite ? 'ok' : '');
    render();
  }, onSubscribeError);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

function todayISO() {
  const d = new Date();
  return `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`;
}

// Окно подтверждения внутри страницы: встроенные confirm()/alert() работают не везде.
// Возвращает 'ok', 'extra' или 'cancel'.
function openModal({ text, okLabel = 'OK', cancelLabel = 'Отмена', extraLabel = '', data = null, readonly = true }) {
  $('modalText').textContent = text;
  $('modalOk').textContent = okLabel;
  $('modalCancel').textContent = cancelLabel;
  $('modalExtra').textContent = extraLabel;
  $('modalExtra').hidden = !extraLabel;
  $('modalData').hidden = data === null;
  $('modalData').value = data ?? '';
  $('modalData').readOnly = readonly;
  $('modal').hidden = false;
  (data !== null && !readonly ? $('modalData') : $('modalOk')).focus();

  return new Promise((resolve) => {
    const close = (result) => {
      $('modal').hidden = true;
      $('modalOk').onclick = $('modalCancel').onclick = $('modalExtra').onclick = $('modal').onclick = null;
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onKey = (e) => { if (e.key === 'Escape') close('cancel'); };
    $('modalOk').onclick = () => close('ok');
    $('modalCancel').onclick = () => close('cancel');
    $('modalExtra').onclick = () => close('extra');
    $('modal').onclick = (e) => { if (e.target === $('modal')) close('cancel'); };
    document.addEventListener('keydown', onKey);
  });
}

async function ask(text, okLabel = 'Удалить') {
  return (await openModal({ text, okLabel })) === 'ok';
}

let toastTimer;
function notify(text) {
  $('toast').textContent = text;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
}

function fillSelect(select, options, value) {
  select.replaceChildren(...options.map(([v, label]) => el('option', { value: v, textContent: label })));
  if (value !== undefined && options.some(([v]) => v === value)) select.value = value;
}

// ---------- Rendering ----------

function render({ settings = true } = {}) {
  const [y, m] = currentMonth.split('-').map(Number);
  $('monthLabel').textContent = new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  // пока общая база не загрузилась, список членов семьи ещё неполный
  if (sheet !== 'all' && !state.members.includes(sheet) && (!db || settingsLoaded)) sheet = 'all';
  const onMemberSheet = sheet !== 'all';
  const monthTx = state.transactions.filter(
    (t) => t.date.startsWith(currentMonth) && (!onMemberSheet || t.member === sheet)
  );
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  $('totalIncome').textContent = fmt(income);
  $('totalExpense').textContent = fmt(expense);
  $('balance').textContent = fmt(balance);
  $('balance').className = 'card-value ' + (balance >= 0 ? 'income' : 'expense');

  $('memberPanel').hidden = onMemberSheet;
  $('budgetPanel').hidden = onMemberSheet;
  if (!onMemberSheet) renderBudget(expense);
  $('filterMember').hidden = onMemberSheet;
  $('member').hidden = onMemberSheet;

  renderTabs();
  renderFormSelects();
  renderCategoryChart(monthTx);
  renderMemberChart(monthTx);
  renderTxList(monthTx);
  // снимок из общей базы не должен пересоздавать поле, в котором сейчас печатают
  if (settings && !$('limitList').contains(document.activeElement)) renderSettings();
  renderMigration();
}

function renderBudget(spent) {
  const budget = state.monthlyBudget;
  const input = $('budgetInput');
  if (document.activeElement !== input) input.value = budget || '';

  if (!(budget > 0)) {
    $('budgetBody').replaceChildren(el('p', {
      className: 'muted',
      textContent: 'Укажите, сколько семья планирует потратить за месяц, — здесь появится остаток.',
    }));
    return;
  }

  const left = budget - spent;
  const ratio = spent / budget;
  const cls = ratio > 1 ? 'over' : ratio >= 0.8 ? 'near' : '';
  const stats = [
    ['Потрачено', `${fmt(spent)} (${Math.round(ratio * 100)}%)`, ''],
    [left >= 0 ? 'Осталось' : 'Перерасход', fmt(Math.abs(left)), left >= 0 ? 'income' : 'expense'],
  ];

  // «в день» имеет смысл только для текущего месяца
  const now = new Date();
  if (currentMonth === monthKey(now) && left > 0) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - now.getDate() + 1;
    stats.push([`В день (ещё ${daysLeft} дн.)`, fmt(Math.floor(left / daysLeft)), '']);
  }

  $('budgetBody').replaceChildren(
    el('div', { className: 'bar-track budget-track' },
      el('div', { className: 'bar-fill ' + cls, style: `width:${Math.min(100, ratio * 100)}%` })),
    el('div', { className: 'budget-stats' },
      ...stats.map(([label, value, c]) => el('div', {},
        el('span', { textContent: label }), el('b', { className: c, textContent: value }))))
  );
}

function renderTabs() {
  const sheets = [['all', '👨‍👩‍👧 Вся семья'], ...state.members.map((m) => [m, m])];
  $('tabs').replaceChildren(...sheets.map(([value, label]) => {
    const tab = el('button', { className: 'tab' + (sheet === value ? ' active' : ''), textContent: label });
    tab.addEventListener('click', () => {
      sheet = value;
      saveSheet();
      render();
    });
    return tab;
  }));
}

function renderFormSelects() {
  const type = document.querySelector('input[name="type"]:checked').value;
  const cats = type === 'income' ? state.incomeCategories : state.expenseCategories;
  fillSelect($('category'), cats.map((c) => [c, c]), $('category').value);
  fillSelect($('member'), state.members.map((m) => [m, m]), sheet !== 'all' ? sheet : $('member').value);
  fillSelect(
    $('filterMember'),
    [['all', 'Все члены семьи'], ...state.members.map((m) => [m, m])],
    $('filterMember').value
  );
}

function barRow(label, valueText, ratio, cls = '') {
  return el('div', { className: 'bar-row' },
    el('div', { className: 'bar-top' }, el('span', { textContent: label }), el('span', { textContent: valueText })),
    el('div', { className: 'bar-track' },
      el('div', { className: 'bar-fill ' + cls, style: `width:${Math.min(100, ratio * 100)}%` }))
  );
}

function sumBy(txs, key) {
  const map = {};
  for (const t of txs) map[t[key]] = (map[t[key]] || 0) + t.amount;
  return map;
}

function renderCategoryChart(monthTx) {
  const byCat = sumBy(monthTx.filter((t) => t.type === 'expense'), 'category');
  // лимиты общие на семью, поэтому показываем их только на листе «Вся семья»
  const limits = sheet === 'all' ? state.limits : {};
  const cats = [...new Set([...Object.keys(byCat), ...Object.keys(limits).filter((c) => limits[c] > 0)])];
  const max = Math.max(1, ...cats.map((c) => Math.max(byCat[c] || 0, limits[c] || 0)));

  const rows = cats
    .sort((a, b) => (byCat[b] || 0) - (byCat[a] || 0))
    .map((c) => {
      const spent = byCat[c] || 0;
      const limit = limits[c];
      if (limit > 0) {
        const r = spent / limit;
        const cls = r > 1 ? 'over' : r >= 0.8 ? 'near' : '';
        return barRow(c, `${fmt(spent)} / ${fmt(limit)}`, r, cls);
      }
      return barRow(c, fmt(spent), spent / max);
    });

  $('categoryChart').replaceChildren(...(rows.length ? rows : [el('p', { className: 'muted', textContent: 'Нет расходов.' })]));
}

function renderMemberChart(monthTx) {
  const byMember = sumBy(monthTx.filter((t) => t.type === 'expense'), 'member');
  const entries = Object.entries(byMember).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const rows = entries.map(([m, v]) => barRow(m, `${fmt(v)} (${Math.round((v / total) * 100)}%)`, v / total));
  $('memberChart').replaceChildren(...(rows.length ? rows : [el('p', { className: 'muted', textContent: 'Нет расходов.' })]));
}

function renderTxList(monthTx) {
  const type = $('filterType').value;
  const member = $('filterMember').value;
  const list = monthTx
    .filter((t) => (type === 'all' || t.type === type) && (member === 'all' || t.member === member))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  $('txList').replaceChildren(...list.map((t) => {
    const date = new Date(t.date + 'T00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const meta = [date, t.member, t.note].filter(Boolean).join(' · ');
    const del = el('button', { className: 'del-btn', textContent: '✕', title: 'Удалить' });
    del.addEventListener('click', async () => {
      if (!(await ask('Удалить эту операцию?'))) return;
      deleteTx(t);
      render();
    });
    return el('li', {},
      el('div', { className: 'tx-main' },
        el('div', { className: 'tx-title', textContent: t.category }),
        el('div', { className: 'tx-meta', textContent: meta })),
      el('span', {
        className: 'tx-amount ' + t.type,
        textContent: (t.type === 'income' ? '+' : '−') + fmt(t.amount),
      }),
      del
    );
  }));
  $('emptyMsg').hidden = list.length > 0;
}

function renderSettings() {
  $('memberList').replaceChildren(...state.members.map((m) => {
    const btn = el('button', { textContent: '✕', title: 'Удалить' });
    btn.addEventListener('click', async () => {
      if (state.members.length <= 1) return notify('Должен остаться хотя бы один член семьи.');
      if (!(await ask(`Удалить «${m}» и его лист? Операции останутся на листе «Вся семья».`))) return;
      setSettings({ members: state.members.filter((x) => x !== m) });
      render();
    });
    return el('li', {}, el('span', { textContent: m }), btn);
  }));

  $('limitList').replaceChildren(...state.expenseCategories.map((c) => {
    const input = el('input', { type: 'number', min: '0', step: '100', placeholder: 'Без лимита', value: state.limits[c] || '' });
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      setSettings({ limits: { [c]: v > 0 ? v : 0 } }, 800);
      // не перерисовываем настройки, иначе поле ввода удаляется, пока в фокусе
      render({ settings: false });
    });
    const del = el('button', { textContent: '✕', title: 'Удалить категорию' });
    del.addEventListener('click', async () => {
      if (state.expenseCategories.length <= 1) return notify('Должна остаться хотя бы одна категория.');
      if (!(await ask(`Удалить категорию «${c}»? Операции останутся.`))) return;
      setSettings({ expenseCategories: state.expenseCategories.filter((x) => x !== c), limits: { [c]: 0 } });
      render();
    });
    return el('div', { className: 'limit-row' }, el('span', { textContent: c }), input, del);
  }));
}

// ---------- Events ----------

$('prevMonth').addEventListener('click', () => { currentMonth = shiftMonth(currentMonth, -1); render(); });
$('nextMonth').addEventListener('click', () => { currentMonth = shiftMonth(currentMonth, 1); render(); });

document.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener('change', renderFormSelects));
$('filterType').addEventListener('change', render);

$('budgetInput').addEventListener('input', () => {
  const v = parseFloat($('budgetInput').value);
  setSettings({ monthlyBudget: v > 0 ? v : 0 }, 800);
  render({ settings: false });
});
$('filterMember').addEventListener('change', render);

$('txForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat($('amount').value);
  if (!(amount > 0)) return;
  const tx = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type: document.querySelector('input[name="type"]:checked').value,
    amount: Math.round(amount * 100) / 100,
    category: $('category').value,
    member: $('member').value,
    date: $('date').value,
    note: $('note').value.trim(),
  };
  addTx(tx);
  currentMonth = tx.date.slice(0, 7);
  $('amount').value = '';
  $('note').value = '';
  render();
  $('amount').focus();
});

$('memberForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('memberName').value.trim();
  if (name && !state.members.includes(name)) {
    setSettings({ members: [...state.members, name] });
    render();
  }
  $('memberName').value = '';
});

$('categoryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('categoryName').value.trim();
  if (name && !state.expenseCategories.includes(name)) {
    setSettings({ expenseCategories: [...state.expenseCategories, name] });
    render();
  }
  $('categoryName').value = '';
});

function downloadJSON(json) {
  const a = el('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: `budget-${todayISO()}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function importData(json) {
  const data = JSON.parse(json);
  if (!data || !Array.isArray(data.transactions)) throw new Error('bad format');
  replaceAll(data);
  notify(`Загружено операций: ${state.transactions.length}.`);
}

const BAD_IMPORT = 'Не получилось прочитать данные. Нужен текст или файл, сохранённый через «Экспорт».';

// Экспорт показывает данные текстом: скачивание файлов разрешено не на каждом хостинге.
$('exportBtn').addEventListener('click', async () => {
  const json = JSON.stringify(state, null, 2);
  const result = await openModal({
    text: 'Скопируйте эти данные и сохраните их, например, в заметках. Потом их можно загрузить через «Импорт».',
    okLabel: 'Копировать', cancelLabel: 'Закрыть', extraLabel: 'Скачать файл', data: json,
  });
  if (result === 'extra') downloadJSON(json);
  if (result === 'ok') {
    if (await copyText(json)) notify('Данные скопированы.');
    else notify('Скопировать не вышло. Выделите текст в окне экспорта и скопируйте вручную.');
  }
});

$('importBtn').addEventListener('click', async () => {
  const result = await openModal({
    text: 'Вставьте данные, скопированные через «Экспорт», или выберите файл. Текущие данные будут заменены.',
    okLabel: 'Загрузить', extraLabel: 'Выбрать файл', data: '', readonly: false,
  });
  if (result === 'extra') return $('importInput').click();
  if (result !== 'ok') return;
  try {
    importData($('modalData').value);
  } catch {
    notify(BAD_IMPORT);
  }
});

$('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    importData(await file.text());
  } catch {
    notify(BAD_IMPORT);
  } finally {
    e.target.value = '';
  }
});

$('resetBtn').addEventListener('click', async () => {
  if (!(await ask('Удалить все операции и настройки? Это нельзя отменить.', 'Удалить всё'))) return;
  replaceAll(DEFAULT_STATE);
});

$('migrateBtn').addEventListener('click', async () => {
  const data = localCopy;
  localCopy = null;
  await replaceAll(data);
  notify('Записи перенесены в общий бюджет.');
});

$('date').value = todayISO();
render();
connectShared();
