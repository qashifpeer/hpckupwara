// src/scripts/importDataCompleted.js
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

let excelPath = path.join(__dirname, 'school_profiles.xlsx');
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(process.cwd(), 'src', 'scripts', 'school_profiles.xlsx');
}

async function importProfiles() {
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ File not found at: ${excelPath}`);
    process.exit(1);
  }

  // 1. Purge older mismatched documents to resolve the immutable _type conflict
  console.log('🧹 Clearing legacy records with mismatched _type...');
  try {
    await client.delete({
      query: `*[_type in ["dadaCompleted", "masterSchoolProfile"]]`,
    });
    // Also delete any existing profile-* IDs to avoid any leftover conflicts
    await client.delete({
      query: `*[_id match "profile-*"]`,
    });
    console.log('✅ Legacy records cleared successfully.');
  } catch (deleteErr) {
    console.warn('⚠️ Note during cleanup:', deleteErr.message);
  }

  // 2. Read and parse Excel file
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet);

  console.log(`📊 Processing ${rawRows.length} rows...`);

  const documents = rawRows.map((row) => {
    const norm = {};
    for (const [k, v] of Object.entries(row)) {
      norm[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = v;
    }

    let udise = String(norm['udisecode'] || norm['udise'] || '').trim();
    if (udise.length === 10) udise = '0' + udise;

    return {
      _id: `profile-${udise}`,
      _type: 'dataCompleted', // Correct type name
      udiseCode: udise,
      schoolName: String(norm['schoolname'] || '').trim(),
      managementType: String(norm['managementtype'] || '').trim(),
      subManagementType: String(norm['submanagementtype'] || '').trim(),
      mediumOfInstruction: String(norm['mediumofinstruction'] || '').trim(),
      academicYear: String(norm['currentacademicyear'] || norm['academicyear'] || '').trim(),
      academicCycle: {
        startMonth: String(norm['startmonth'] || '').trim(),
        endMonth: String(norm['endmonth'] || '').trim(),
      },
      addressLine1: String(norm['addressofschoolline1'] || norm['addressline1'] || '').trim(),
      addressLine2: String(norm['addressofschoolline2'] || norm['addressline2'] || '').trim(),
      villageCity: String(norm['villagecity'] || norm['village'] || norm['city'] || '').trim(),
      brc: String(norm['brc'] || '').trim(),
      crc: String(norm['crc'] || '').trim(),
      locationType: String(norm['locationruralurban'] || norm['location'] || '').trim(),
      pinCode: String(norm['pincode'] || norm['pin'] || '').trim(),
      adminStatus: String(norm['admin'] || norm['adminstatus'] || '').trim(),
    };
  });

  const validDocs = documents.filter((d) => /^0\d{10}$/.test(d.udiseCode) && d.schoolName);
  console.log(`✅ Valid rows ready: ${validDocs.length} / ${rawRows.length}`);

  // 3. Batch write using transaction
  const BATCH_SIZE = 100;
  for (let i = 0; i < validDocs.length; i += BATCH_SIZE) {
    const chunk = validDocs.slice(i, i + BATCH_SIZE);
    const tx = client.transaction();
    chunk.forEach((doc) => tx.createOrReplace(doc));
    await tx.commit();
    console.log(`🚀 Committed rows ${i + 1} to ${Math.min(i + BATCH_SIZE, validDocs.length)}`);
  }

  console.log('🎉 School profiles successfully imported into Sanity as "dataCompleted"!');
}

importProfiles();