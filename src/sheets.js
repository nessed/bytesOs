const { google } = require('googleapis');
const { parseSheetRows } = require('./parse');

const SPREADSHEET_ID = '1UECxYHAfoJ840HzU0OksSWJhsDnuwvcmttQz1kVW9yE';
const SKIP_SHEETS = new Set(['Finances']);

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
  const allTitles = meta.data.sheets.map(s => s.properties.title);
  console.log(`[sheets] All tabs: ${allTitles.join(', ')}`);

  // Skip position 0 (template) and any explicitly excluded tabs.
  // Remaining sheets are already in ascending date order per spreadsheet convention.
  const sheetTitles = allTitles
    .slice(1)
    .filter(t => !SKIP_SHEETS.has(t));

  console.log(`[sheets] Processing (${sheetTitles.length} sheets): ${sheetTitles.join(', ')}`);
  console.log(`[sheets] Last sheet in list: "${sheetTitles[sheetTitles.length - 1]}"`);
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
    const sheetName = vr.range.split('!')[0].replace(/^'|'$/g, '');
    const rows = vr.values || [];
    const orders = parseSheetRows(rows, sheetName);
    if (orders) {
      console.log(`  [sheet] "${sheetName}" → ${orders.length} orders`);
      allOrders.push(...orders);
    } else {
      console.log(`  [sheet] "${sheetName}" → skipped (name didn't match DDMM pattern)`);
    }
  }

  allOrders.sort((a, b) => a.businessDate.localeCompare(b.businessDate));
  return allOrders;
}

module.exports = { fetchAllOrders };
