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
  // Strip all non-digit chars — handles "17  04", "17/04", "17-04", "1704", etc.
  const digits = sheetName.trim().replace(/\D/g, '');
  if (digits.length !== 4) return null;
  const day = parseInt(digits.slice(0, 2));
  const month = parseInt(digits.slice(2, 4));
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Accepts a 2D array of rows (strings/numbers) — works with both XLSX and Sheets API output
function parseSheetRows(rows, sheetName) {
  const date = parseDate(sheetName);
  if (!date) return null;

  const orders = [];
  let currentSlot = null;

  for (const row of rows) {
    const col0 = row[0] !== undefined ? String(row[0]) : '';
    if (/^Slot\s+\d+/i.test(col0.trim())) {
      currentSlot = col0.trim();
    }

    const rawNum = row[1];
    const name = row[2] !== undefined ? String(row[2]) : '';
    const order = row[3] !== undefined ? String(row[3]) : '';
    const rawPaid = row[4];

    const num = typeof rawNum === 'number' ? rawNum : parseFloat(rawNum);
    const nameIsValid = name.trim() !== '' && name.trim().replace(/[^a-zA-Z0-9]/g, '').length >= 2;

    const paid = rawPaid === true || String(rawPaid).toUpperCase() === 'TRUE';

    if (!isNaN(num) && num > 0 && nameIsValid) {
      const amount = parseOrderAmount(order);
      orders.push({
        slot: currentSlot,
        name: name.trim(),
        normalizedName: name.trim().toLowerCase().replace(/\s+/g, ' '),
        order: order || '',
        amount,
        paid,
        date,
        businessDate: date, // Normalized business date derived from sheet boundary
        sheetName,
      });
    }
  }

  return orders;
}

module.exports = { parseSheetRows, parseDate };
