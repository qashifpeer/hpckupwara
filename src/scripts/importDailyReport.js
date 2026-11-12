// src/scripts/importDailyReport.js
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

// Path to your Excel file (pass via CLI argument or place in src/scripts/daily_report.xlsx)
const FILE_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(process.cwd(), 'src', 'scripts', 'daily_report.xlsx');

// Helper: Normalize column headers to match flexibly
function getVal(row, possibleKeys, fallback = '') {
  const rowKeys = Object.keys(row);
  for (const target of possibleKeys) {
    const foundKey = rowKeys.find(
      (k) => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === target.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
      return row[foundKey];
    }
  }
  return fallback;
}

// Helper: Format UDISE to 11 digits starting with 0
function normalizeUdise(raw) {
  let clean = String(raw || '').trim().replace(/\.0$/, '');
  if (!clean) return '';
  if (clean.length === 10 && !clean.startsWith('0')) {
    clean = '0' + clean;
  }
  return clean;
}

// Helper: Parse clean integer within 0 - 1000 bounds
function parseBoundedInt(raw, maxCap = 1000) {
  const num = parseInt(String(raw ?? '0').trim(), 10);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, maxCap);
}

async function importDailyReport() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Missing SANITY_API_WRITE_TOKEN in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Excel file not found at: ${FILE_PATH}`);
    console.log('Usage: node src/scripts/importDailyReport.js path/to/your_file.xlsx');
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
    const rowNumber = idx + 2; // Excel 1-indexed + header row

    const rawUdise = getVal(row, ['udisecode', 'udise', 'schoolcode']);
    const udiseCode = normalizeUdise(rawUdise);
    const schoolName = String(getVal(row, ['schoolname', 'nameofschool', 'school'])).trim();

    if (!/^0\d{10}$/.test(udiseCode) || !schoolName) {
      skippedRows.push({ row: rowNumber, udise: rawUdise, schoolName, reason: 'Invalid UDISE or missing School Name' });
      return;
    }

    const state = String(getVal(row, ['state', 'stateut'], 'Jammu & Kashmir')).trim();
    const district = String(getVal(row, ['district'], 'Kupwara')).trim();
    const managementType = String(
      getVal(row, ['managementtype', 'management', 'schoolmanagement'], 'Department of Education')
    ).trim();

    const totalStudents = parseBoundedInt(getVal(row, ['totalstudents', 'totalroll', 'enrollment'], 0));
    const pending = parseBoundedInt(getVal(row, ['pending', 'pendingstudents'], 0), totalStudents);
    const inProgress = parseBoundedInt(getVal(row, ['inprogress', 'progress'], 0), totalStudents);
    const completed = parseBoundedInt(getVal(row, ['completed', 'completedstudents'], 0), totalStudents);

    validDocs.push({
      _id: `dailyReport-${udiseCode}`,
      _type: 'dailyReport',
      state,
      district,
      udiseCode,
      schoolName,
      managementType,
      totalStudents,
      pending,
      inProgress,
      completed,
      reportedAt: new Date().toISOString(),
    });
  });

  console.log(`✅ Validated ${validDocs.length} documents. Skipped ${skippedRows.length} rows.`);

  if (skippedRows.length > 0) {
    console.warn('⚠️ Skipped rows summary (first 10):');
    console.table(skippedRows.slice(0, 10));
  }

  if (validDocs.length === 0) {
    console.log('⚠️ No valid rows found. Aborting without deleting existing records.');
    return;
  }

  // 1. Delete all existing dailyReport documents (including drafts, if any)
  console.log('🧹 Clearing all previous dailyReport records from Sanity...');
  await client.delete({
    query: '*[_type == "dailyReport"]',
  });
  console.log('🗑️ Previous records cleared.');

  // 2. Batch upload fresh records in chunks of 100
  const CHUNK_SIZE = 100;
  let uploadedCount = 0;

  for (let i = 0; i < validDocs.length; i += CHUNK_SIZE) {
    const chunk = validDocs.slice(i, i + CHUNK_SIZE);
    const transaction = client.transaction();

    chunk.forEach((doc) => {
      transaction.create(doc);
    });

    await transaction.commit();
    uploadedCount += chunk.length;
    console.log(`🚀 Imported ${uploadedCount} / ${validDocs.length} fresh records...`);
  }

  console.log(`🎉 Successfully replaced old data with ${uploadedCount} fresh daily report records!`);
}

importDailyReport().catch((err) => {
  console.error('❌ Import failed:', err.message);
  process.exit(1);
});