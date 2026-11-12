// src/scripts/importZones.js
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Path to Excel file (pass via CLI argument or place at src/scripts/zones.xlsx)
const FILE_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.cwd(), 'src', 'scripts', 'zones.xlsx');

// Helper: Match column headers flexibly regardless of casing or spaces
function getVal(row, possibleKeys, fallback = '') {
  const rowKeys = Object.keys(row);
  for (const target of possibleKeys) {
    const foundKey = rowKeys.find(
      (k) =>
        k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') ===
        target.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (
      foundKey !== undefined &&
      row[foundKey] !== undefined &&
      row[foundKey] !== null &&
      row[foundKey] !== ''
    ) {
      return row[foundKey];
    }
  }
  return fallback;
}

// Helper: Standardize Zone Name to Title Case (e.g., "mawer" -> "Mawer")
function normalizeZoneName(raw) {
  const clean = String(raw || '').trim();
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

// Helper: Clean Zone Code and preserve leading zeros if Excel stored as number
function normalizeZoneCode(raw) {
  let clean = String(raw || '').trim().replace(/\.0$/, '');
  if (!clean) return '';
  // If numeric 5-digit UDISE block code (e.g. 10108), pad to 6 digits (010108)
  if (/^\d{5}$/.test(clean)) {
    clean = '0' + clean;
  }
  return clean;
}

async function importZones() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Missing SANITY_API_WRITE_TOKEN in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Excel file not found at: ${FILE_PATH}`);
    console.log('Usage: node src/scripts/importZones.js path/to/zones.xlsx');
    process.exit(1);
  }

  console.log(`📂 Reading Excel file: ${FILE_PATH}`);
  const workbook = xlsx.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  console.log(`📊 Found ${rawRows.length} rows in sheet "${sheetName}". Processing...`);

  const validDocs = [];
  const skippedRows = [];

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;

    const rawZone = getVal(row, ['zone', 'zonename', 'educationalzone', 'block']);
    const rawCode = getVal(row, ['code', 'zonecode', 'blockcode', 'udisecode']);

    const zone = normalizeZoneName(rawZone);
    const code = normalizeZoneCode(rawCode);

    if (!zone || !code) {
      skippedRows.push({
        row: rowNumber,
        zone: rawZone,
        code: rawCode,
        reason: 'Missing Zone Name or Zone Code',
      });
      return;
    }

    const docId = `zone-${zone.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    validDocs.push({
      _id: docId,
      _type: 'zones',
      zone,
      code,
    });
  });

  console.log(`✅ Validated ${validDocs.length} zones. Skipped ${skippedRows.length} rows.`);

  if (skippedRows.length > 0) {
    console.warn('⚠️ Skipped rows:');
    console.table(skippedRows);
  }

  if (validDocs.length === 0) {
    console.log('Nothing to import.');
    return;
  }

  const transaction = client.transaction();
  validDocs.forEach((doc) => {
    transaction.createOrReplace(doc);
  });

  await transaction.commit();
  console.log(`🎉 Successfully imported ${validDocs.length} zones into Sanity!`);
}

importZones().catch((err) => {
  console.error('❌ Import failed:', err.message);
  process.exit(1);
});