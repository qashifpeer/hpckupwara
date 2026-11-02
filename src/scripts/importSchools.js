// src/scripts/importSchools.js
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

// Checks both inside src/scripts and root
let excelPath = path.join(__dirname, 'kupwara_schools.xlsx');
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(process.cwd(), 'src', 'scripts', 'kupwara_schools.xlsx');
}

async function importSchools() {
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at: ${excelPath}`);
    process.exit(1);
  }

  console.log('📖 Reading Excel file...');
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (rawRows.length === 0) {
    console.error('❌ The sheet appears to be empty.');
    process.exit(1);
  }

  console.log(`📊 Found ${rawRows.length} rows. Inspecting column names in row 1:`);
  console.log(Object.keys(rawRows[0]));

  const documents = rawRows.map((row) => {
    // Normalizes row keys (lowercased, all punctuation/spaces stripped)
    const normalizedRow = {};
    for (const [key, value] of Object.entries(row)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      normalizedRow[cleanKey] = value;
    }

    // 1. Resolve UDISE
    let rawUdise = String(
      normalizedRow['udisecode'] ||
      normalizedRow['udise'] ||
      normalizedRow['code'] ||
      ''
    ).trim();

    // Preserve leading zero for 10-digit values
    if (rawUdise.length === 10) {
      rawUdise = '0' + rawUdise;
    }

    // 2. Resolve School Name (matches schoolname, school, nameofschool, institution, etc.)
    const schoolName = String(
      normalizedRow['schoolname'] ||
      normalizedRow['nameofschool'] ||
      normalizedRow['school'] ||
      normalizedRow['institution'] ||
      normalizedRow['institutionname'] ||
      normalizedRow['schoolnamerow'] ||
      normalizedRow['name'] ||
      ''
    ).trim();

    // 3. Resolve Zone
    let zone = String(
      normalizedRow['zone'] ||
      normalizedRow['educationalzone'] ||
      normalizedRow['zonename'] ||
      ''
    ).trim();

    if (zone) {
      zone = zone.charAt(0).toUpperCase() + zone.slice(1).toLowerCase();
      if (zone.toLowerCase() === 'vilgam') zone = 'Villgam';
      if (zone.toLowerCase() === 'khumriyam') zone = 'Khumriyal';
    }

    return {
      _id: `school-${rawUdise}`,
      _type: 'masterSchool',
      udiseCode: rawUdise,
      schoolName,
      zone,
    };
  });

  const validDocs = documents.filter((doc) => {
    const isValid = /^0\d{10}$/.test(doc.udiseCode) && doc.schoolName !== '' && doc.zone !== '';
    if (!isValid) {
      console.warn(`⚠️ Skipping row: UDISE="${doc.udiseCode}", School="${doc.schoolName}", Zone="${doc.zone}"`);
    }
    return isValid;
  });

  console.log(`\n✅ Valid records ready for upload: ${validDocs.length} / ${rawRows.length}`);

  if (validDocs.length === 0) {
    console.error('❌ Still 0 valid records. Look at the column names printed above and adjust the resolver keys.');
    process.exit(1);
  }

  // Upload in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < validDocs.length; i += BATCH_SIZE) {
    const chunk = validDocs.slice(i, i + BATCH_SIZE);
    const transaction = client.transaction();

    chunk.forEach((doc) => {
      transaction.createOrReplace(doc);
    });

    try {
      await transaction.commit();
      console.log(`🚀 Uploaded records ${i + 1} to ${Math.min(i + BATCH_SIZE, validDocs.length)}...`);
    } catch (err) {
      console.error(`❌ Batch error at offset ${i}:`, err.message);
    }
  }

  console.log('\n🎉 Master school directory uploaded successfully to Sanity!');
}

importSchools();