require('dotenv').config();
const express = require('express');
const path = require('path');
const { fetchAllOrders } = require('./sheets');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const REFRESH_MS = 5 * 60 * 1000;

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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Pakistan Standard Time = UTC+5, no DST
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Returns the current business date in PKT
// Business day boundary is 4:00 AM PKT, so 12:00 AM to 3:59 AM shifts to the previous day.
function getBusinessDate(now = new Date()) {
  // Shift UTC → PKT by adding 5 h
  // Shift business day back by 4 h
  // Effective shift: +1 hour
  const pktBusiness = new Date(now.getTime() + PKT_OFFSET_MS - 4 * 60 * 60 * 1000);
  const result = pktBusiness.toISOString().slice(0, 10); // YYYY-MM-DD
  console.log(`[getBusinessDate] UTC=${now.toISOString()} → Business date=${result}`);
  return result;
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
  const today = getBusinessDate(); // always the current PKT business day

  // Historical dates with orders, capped at today (exclude any future sheets)
  const pastDates = [...new Set(orders.map(o => o.date))].sort().filter(d => d <= today);

  const todayOrders = orders.filter(o => o.date === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.amount, 0);
  const todayCount = todayOrders.length;
  const avgOrder = todayCount > 0 ? Math.round(todayRevenue / todayCount) : 0;
  const todayProfit = Math.round(todayRevenue * 0.52);
  const todayPerPerson = Math.round(todayProfit / 4);

  // Chart uses all known past dates (today included if it has data)
  const chartDates = pastDates.slice(-30);
  const revData = chartDates.map(d => orders.filter(o => o.date === d).reduce((s, o) => s + o.amount, 0));
  const revLabels = chartDates.map(d => {
    const dt = new Date(d + 'T00:00:00Z');
    return `${MONTH_SHORT[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
  });

  const last7 = pastDates.slice(-7);
  const prev7 = pastDates.slice(-14, -7);
  const weekRevenue = orders.filter(o => last7.includes(o.date)).reduce((s, o) => s + o.amount, 0);
  const weekPrev = orders.filter(o => prev7.includes(o.date)).reduce((s, o) => s + o.amount, 0);
  const weekProfit = Math.round(weekRevenue * 0.52);

  const unpaidOrders = orders.filter(o => !o.paid);
  const outstanding = unpaidOrders.reduce((s, o) => s + o.amount, 0);
  const outstandingByCustomer = {};
  for (const o of unpaidOrders) {
    if (!outstandingByCustomer[o.normalizedName]) outstandingByCustomer[o.normalizedName] = true;
  }
  const outstandingCount = Object.keys(outstandingByCustomer).length;

  // Yesterday = most recent past date that is before today
  const yesterday = pastDates.filter(d => d < today).slice(-1)[0] || '';
  const yesterdayRevenue = yesterday
    ? orders.filter(o => o.date === yesterday).reduce((s, o) => s + o.amount, 0)
    : 0;
  const todayTarget = yesterdayRevenue > 0 ? Math.round(yesterdayRevenue * 1.1) : Math.round(todayRevenue * 1.15) || 1;

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
    slot: o.slot || 'Lunch',
  }));

  const todayDate = today ? new Date(today + 'T00:00:00Z') : new Date();
  const todayLabel = `${DAY_NAMES[todayDate.getUTCDay()]}, ${MONTH_NAMES[todayDate.getUTCMonth()]} ${todayDate.getUTCDate()}`;

  // Daily breakdown — all dates descending (newest first)
  const maxRev = Math.max(...pastDates.map(d => orders.filter(o => o.date === d).reduce((s, o) => s + o.amount, 0)), 0);
  const dailyBreakdown = [...pastDates].reverse().map(date => {
    const dayOrds = orders.filter(o => o.date === date);
    const revenue = dayOrds.reduce((s, o) => s + o.amount, 0);
    const profit = Math.round(revenue * 0.52);
    const perPerson = Math.round(profit / 4);
    const count = dayOrds.length;
    const unpaidCount = dayOrds.filter(o => !o.paid).length;
    const dt = new Date(date + 'T00:00:00Z');
    const label = `${DAY_SHORT[dt.getUTCDay()]} ${MONTH_SHORT[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
    const isBest = revenue === maxRev && maxRev > 0;
    return { date, label, revenue, profit, perPerson, count, unpaidCount, isBest };
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
      weekProfit,
      outstanding,
      outstandingCount,
      avgOrder,
      todayProfit,
      todayPerPerson,
    },
    revData,
    revLabels,
    activity: activity.slice(0, 10),
    openOrders,
    dailyBreakdown,
  };
}

function buildFinances() {
  const lifetimeRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const lifetimeProfit = Math.round(lifetimeRevenue * 0.52);
  const lifetimePerPerson = Math.round(lifetimeProfit / 4);

  const realizedRevenue = orders.filter(o => o.paid).reduce((s, o) => s + o.amount, 0);
  const realizedProfit = Math.round(realizedRevenue * 0.52);
  const realizedPerPerson = Math.round(realizedProfit / 4);

  const outstanding = lifetimeRevenue - realizedRevenue;

  const weekly = {};
  for (const o of orders) {
    const d = new Date(o.date + 'T00:00:00Z');
    // Align to Monday
    const day = d.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diffToMonday);
    
    const weekLabel = `Week of ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
    const sortKey = d.toISOString().slice(0, 10);
    
    if (!weekly[sortKey]) {
      weekly[sortKey] = { sortKey, label: weekLabel, revenue: 0, profit: 0, perPerson: 0, count: 0, unpaidAmount: 0 };
    }
    weekly[sortKey].revenue += o.amount;
    weekly[sortKey].count++;
    if (!o.paid) weekly[sortKey].unpaidAmount += o.amount;
  }
  
  const weeklyBreakdown = Object.values(weekly)
    .sort((a,b) => b.sortKey.localeCompare(a.sortKey))
    .map(w => {
      w.profit = Math.round(w.revenue * 0.52);
      w.perPerson = Math.round(w.profit / 4);
      return w;
    });

  return { lifetimeRevenue, lifetimeProfit, lifetimePerPerson, realizedRevenue, realizedProfit, realizedPerPerson, outstanding, weeklyBreakdown };
}

app.get('/api/finances', (_, res) => res.json(buildFinances()));
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
