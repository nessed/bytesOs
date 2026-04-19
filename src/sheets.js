const { google } = require('googleapis');
const { parseSheetRows } = require('./parse');

const SPREADSHEET_ID = '1UECxYHAfoJ840HzU0OksSWJhsDnuwvcmttQz1kVW9yE';
const SKIP_SHEETS = new Set(['Template To Duplicate', 'Finances']);

function getAuth() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyFile) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env var not set — point it to your service account JSON file');
  return new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function fetchAllOrders() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Get sheet names
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID, fields: 'sheets.properties.title' });
  const sheetTitles = meta.data.sheets
    .map(s => s.properties.title)
    .filter(t => !SKIP_SHEETS.has(t));

  if (sheetTitles.length === 0) return [];

  // Fetch all sheets in one batch request
  const ranges = sheetTitles.map(t => `'${t}'`);
  const batch = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  const allOrders = [];
  for (const vr of batch.data.valueRanges || []) {
    // Range looks like "'17  04'" — extract sheet title
    const sheetName = vr.range.split('!')[0].replace(/^'|'$/g, '');
    const rows = vr.values || [];
    const orders = parseSheetRows(rows, sheetName);
    if (orders) allOrders.push(...orders);
  }

  allOrders.sort((a, b) => a.date.localeCompare(b.date));
  return allOrders;
}

module.exports = { fetchAllOrders };
