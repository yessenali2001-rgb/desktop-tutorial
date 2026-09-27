const STORAGE_KEY = 'family-budget-v1';
const CURRENCY = '₸'; // поменяйте на '₽', '$', '€' и т.д.

const DEFAULT_STATE = {
  members: ['Общее'],
  expenseCategories: ['Продукты', 'Жильё и ЖКХ', 'Транспорт', 'Дети', 'Здоровье', 'Одежда', 'Развлечения', 'Прочее'],
  incomeCategories: ['Зарплата', 'Подработка', 'Подарки', 'Прочее'],
  limits: {},
  sheet: 'all', // 'all' — вся семья, иначе имя члена семьи
  transactions: [],
};

let state = load();
let currentMonth = monthKey(new Date());

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const fmt = (n) => money.format(n) + ' ' + CURRENCY;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Не удалось прочитать данные', e);
  }
  return structuredClone(DEFAULT_STATE);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    alert('Не удалось сохранить данные в браузере.');
  }
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

  if (state.sheet !== 'all' && !state.members.includes(state.sheet)) state.sheet = 'all';
  const onMemberSheet = state.sheet !== 'all';
  const monthTx = state.transactions.filter(
    (t) => t.date.startsWith(currentMonth) && (!onMemberSheet || t.member === state.sheet)
  );
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  $('totalIncome').textContent = fmt(income);
  $('totalExpense').textContent = fmt(expense);
  $('balance').textContent = fmt(balance);
  $('balance').className = 'card-value ' + (balance >= 0 ? 'income' : 'expense');

  $('memberPanel').hidden = onMemberSheet;
  $('filterMember').hidden = onMemberSheet;
  $('member').hidden = onMemberSheet;

  renderTabs();
  renderFormSelects();
  renderCategoryChart(monthTx);
  renderMemberChart(monthTx);
  renderTxList(monthTx);
  if (settings) renderSettings();
}

function renderTabs() {
  const sheets = [['all', '👨‍👩‍👧 Вся семья'], ...state.members.map((m) => [m, m])];
  $('tabs').replaceChildren(...sheets.map(([value, label]) => {
    const tab = el('button', { className: 'tab' + (state.sheet === value ? ' active' : ''), textContent: label });
    tab.addEventListener('click', () => {
      state.sheet = value;
      save();
      render();
    });
    return tab;
  }));
}

function renderFormSelects() {
  const type = document.querySelector('input[name="type"]:checked').value;
  const cats = type === 'income' ? state.incomeCategories : state.expenseCategories;
  fillSelect($('category'), cats.map((c) => [c, c]), $('category').value);
  fillSelect($('member'), state.members.map((m) => [m, m]), state.sheet !== 'all' ? state.sheet : $('member').value);
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
  const limits = state.sheet === 'all' ? state.limits : {};
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
    del.addEventListener('click', () => {
      if (!confirm('Удалить эту операцию?')) return;
      state.transactions = state.transactions.filter((x) => x.id !== t.id);
      save();
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
    btn.addEventListener('click', () => {
      if (state.members.length <= 1) return alert('Должен остаться хотя бы один член семьи.');
      if (!confirm(`Удалить «${m}»? Операции останутся.`)) return;
      state.members = state.members.filter((x) => x !== m);
      save();
      render();
    });
    return el('li', {}, el('span', { textContent: m }), btn);
  }));

  $('limitList').replaceChildren(...state.expenseCategories.map((c) => {
    const input = el('input', { type: 'number', min: '0', step: '100', placeholder: 'Без лимита', value: state.limits[c] || '' });
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      if (v > 0) state.limits[c] = v;
      else delete state.limits[c];
      save();
      // не перерисовываем настройки, иначе поле ввода удаляется, пока в фокусе
      render({ settings: false });
    });
    const del = el('button', { textContent: '✕', title: 'Удалить категорию' });
    del.addEventListener('click', () => {
      if (state.expenseCategories.length <= 1) return;
      if (!confirm(`Удалить категорию «${c}»? Операции останутся.`)) return;
      state.expenseCategories = state.expenseCategories.filter((x) => x !== c);
      delete state.limits[c];
      save();
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
  state.transactions.push(tx);
  save();
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
    state.members.push(name);
    save();
    render();
  }
  $('memberName').value = '';
});

$('categoryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('categoryName').value.trim();
  if (name && !state.expenseCategories.includes(name)) {
    state.expenseCategories.push(name);
    save();
    render();
  }
  $('categoryName').value = '';
});

$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: `budget-${todayISO()}.json` });
  a.click();
  URL.revokeObjectURL(a.href);
});

$('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.transactions)) throw new Error('bad format');
    if (!confirm('Заменить текущие данные данными из файла?')) return;
    state = { ...structuredClone(DEFAULT_STATE), ...data };
    save();
    render();
  } catch {
    alert('Не удалось прочитать файл. Нужен JSON, сохранённый через «Экспорт».');
  } finally {
    e.target.value = '';
  }
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Удалить все операции и настройки? Это нельзя отменить.')) return;
  state = structuredClone(DEFAULT_STATE);
  save();
  render();
});

$('date').value = todayISO();
render();
