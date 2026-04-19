const XLSX = require('xlsx');

const PRICE_STANDARD = 300;
const PRICE_FRIES = 380;

function parseOrderAmount(orderStr) {
  if (!orderStr || typeof orderStr !== 'string') return 0;
  const match = orderStr.trim().match(/^(\d+)\s*x\s*(s|f)/i);
  if (!match) return 0;
  const qty = parseInt(match[1]);
  const type = match[2].toLowerCase();
  return qty * (type === 'f' ? PRICE_FRIES : PRICE_STANDARD);
}

function parseDate(sheetName) {
  // Handles "17  04", "09  03", "28  02 ", "0303", "1604"
  const cleaned = sheetName.trim().replace(/\s+/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})$/);
  if (!match) return null;
  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseSheet(ws, sheetName) {
  const date = parseDate(sheetName);
  if (!date) return null;

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const orders = [];
  let currentSlot = null;

  for (const row of rows) {
    if (typeof row[0] === 'string' && /^Slot\s+\d+/i.test(row[0])) {
      currentSlot = row[0].trim();
    }

    const num = row[1];
    const name = row[2];
    const order = row[3];
    const paid = row[4];

    const nameIsValid = typeof name === 'string' &&
      name.trim() !== '' &&
      name.trim().replace(/[^a-zA-Z0-9]/g, '').length >= 2;

    if (typeof num === 'number' && nameIsValid) {
      const amount = parseOrderAmount(order);
      orders.push({
        slot: currentSlot,
        name: name.trim(),
        normalizedName: name.trim().toLowerCase().replace(/\s+/g, ' '),
        order: order || '',
        amount,
        paid: paid === true,
        date,
        sheetName,
      });
    }
  }

  return orders;
}

function parseWorkbook(filePath) {
  const wb = XLSX.readFile(filePath, { data_only: true });
  const skipSheets = new Set(['Template To Duplicate', 'Finances']);
  const allOrders = [];

  for (const name of wb.SheetNames) {
    if (skipSheets.has(name)) continue;
    const ws = wb.Sheets[name];
    const orders = parseSheet(ws, name);
    if (orders) allOrders.push(...orders);
  }

  allOrders.sort((a, b) => a.date.localeCompare(b.date));
  return allOrders;
}

module.exports = { parseWorkbook };
