const express = require('express');
const path = require('path');
const { parseWorkbook } = require('./parse');

const app = express();
const PORT = process.env.PORT || 3000;
const XLSX_PATH = path.join(__dirname, '..', 'Bytes Daily Log (4).xlsx');

let orders = [];

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

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/summary', (_, res) => res.json(buildSummary()));
app.get('/api/debt', (_, res) => res.json(buildDebt()));
app.get('/api/customers', (_, res) => res.json(buildCustomers()));

app.listen(PORT, () => {
  try {
    orders = parseWorkbook(XLSX_PATH);
    console.log(`Parsed ${orders.length} orders from workbook`);
  } catch (e) {
    console.error('Failed to parse workbook:', e.message);
  }
  console.log(`Bytes OS running at http://localhost:${PORT}`);
});
