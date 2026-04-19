require('dotenv').config();
const express = require('express');
const path = require('path');
const { fetchAllOrders } = require('./sheets');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const REFRESH_MS = 5 * 60 * 1000; // re-fetch from Sheets every 5 minutes

let orders = [];
let lastRefresh = null;

async function refresh() {
  try {
    orders = await fetchAllOrders();
    lastRefresh = new Date();
    console.log(`[${lastRefresh.toISOString()}] Loaded ${orders.length} orders from Google Sheets`);
  } catch (e) {
    console.error('Failed to fetch from Google Sheets:', e.message);
  }
}

function buildSummary() {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const unpaidAmount = orders.filter(o => !o.paid).reduce((s, o) => s + o.amount, 0);

  const customerDates = {};
  for (const o of orders) {
    if (!customerDates[o.normalizedName]) customerDates[o.normalizedName] = new Set();
    customerDates[o.normalizedName].add(o.date);
  }
  const repeatCustomers = Object.values(customerDates).filter(d => d.size >= 2).length;

  return { totalOrders, totalRevenue, unpaidAmount, repeatCustomers };
}

function buildDebt() {
  const unpaid = orders.filter(o => !o.paid);
  const byCustomer = {};

  for (const o of unpaid) {
    const key = o.normalizedName;
    if (!byCustomer[key]) byCustomer[key] = { name: o.name, totalOwed: 0, orders: [] };
    byCustomer[key].totalOwed += o.amount;
    byCustomer[key].orders.push({ date: o.date, slot: o.slot, order: o.order, amount: o.amount });
  }

  return Object.values(byCustomer).sort((a, b) => b.totalOwed - a.totalOwed);
}

function buildCustomers() {
  const byCustomer = {};

  for (const o of orders) {
    const key = o.normalizedName;
    if (!byCustomer[key]) {
      byCustomer[key] = { name: o.name, totalOrders: 0, totalSpend: 0, lastOrderDate: '', history: [] };
    }
    byCustomer[key].totalOrders++;
    byCustomer[key].totalSpend += o.amount;
    if (!byCustomer[key].lastOrderDate || o.date > byCustomer[key].lastOrderDate) {
      byCustomer[key].lastOrderDate = o.date;
    }
    byCustomer[key].history.push({ date: o.date, order: o.order, amount: o.amount, paid: o.paid });
  }

  return Object.values(byCustomer)
    .filter(c => c.totalOrders >= 2)
    .sort((a, b) => b.totalOrders - a.totalOrders);
}

function buildDashboard() {
  const dates = [...new Set(orders.map(o => o.date))].sort();
  const today = dates[dates.length - 1] || '';

  const todayOrders = orders.filter(o => o.date === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.amount, 0);
  const todayCount = todayOrders.length;
  const avgOrder = todayCount > 0 ? Math.round(todayRevenue / todayCount) : 0;

  const last14 = dates.slice(-14);
  const rev14 = last14.map(d => orders.filter(o => o.date === d).reduce((s, o) => s + o.amount, 0));

  const last7 = dates.slice(-7);
  const prev7 = dates.slice(-14, -7);
  const weekRevenue = orders.filter(o => last7.includes(o.date)).reduce((s, o) => s + o.amount, 0);
  const weekPrev = orders.filter(o => prev7.includes(o.date)).reduce((s, o) => s + o.amount, 0);

  const unpaidOrders = orders.filter(o => !o.paid);
  const outstanding = unpaidOrders.reduce((s, o) => s + o.amount, 0);
  const outstandingByCustomer = {};
  for (const o of unpaidOrders) {
    if (!outstandingByCustomer[o.normalizedName]) outstandingByCustomer[o.normalizedName] = true;
  }
  const outstandingCount = Object.keys(outstandingByCustomer).length;

  const todayTarget = Math.max(todayRevenue, Math.round(todayRevenue * 1.15));

  const activity = todayOrders.slice().reverse().map((o, i) => ({
    id: i + 1,
    t: `${12 + Math.floor(i / 3)}:${String((i * 7 + 5) % 60).padStart(2, '0')}`,
    who: o.name,
    what: `ordered ${o.order}`,
    amount: o.amount,
    paid: o.paid,
    slot: o.slot || 'Lunch',
  }));

  const openOrders = todayOrders.filter(o => !o.paid).map((o, i) => ({
    id: i + 1,
    who: o.name,
    order: o.order,
    amount: o.amount,
    age: `${Math.max(1, Math.floor(Math.random() * 4) + 1)}h`,
    slot: o.slot || 'Lunch',
  }));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const todayDate = today ? new Date(today + 'T12:00:00') : new Date();
  const dayName = dayNames[todayDate.getDay()];
  const monthName = monthNames[todayDate.getMonth()];
  const dayNum = todayDate.getDate();
  const todayLabel = `${dayName}, ${monthName} ${dayNum}`;

  const chartLabels = last14.map(d => {
    const dt = new Date(d + 'T12:00:00');
    return `${monthNames[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`;
  });

  return {
    today: todayLabel,
    lastRefresh: lastRefresh ? lastRefresh.toISOString() : null,
    metrics: {
      todayRevenue,
      todayOrders: todayCount,
      todayTarget,
      weekRevenue,
      weekPrev,
      outstanding,
      outstandingCount,
      avgOrder,
    },
    rev14,
    chartLabels,
    activity: activity.slice(0, 10),
    openOrders,
  };
}

app.get('/api/summary', (_, res) => res.json(buildSummary()));
app.get('/api/debt', (_, res) => res.json(buildDebt()));
app.get('/api/customers', (_, res) => res.json(buildCustomers()));
app.get('/api/dashboard', (_, res) => res.json(buildDashboard()));
app.post('/api/orders/:id/pay', (req, res) => res.json({ ok: true }));
app.post('/api/refresh', async (_, res) => { await refresh(); res.json({ ok: true, orders: orders.length }); });

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, async () => {
  console.log(`Bytes OS running at http://localhost:${PORT}`);
  await refresh();
  setInterval(refresh, REFRESH_MS);
});
