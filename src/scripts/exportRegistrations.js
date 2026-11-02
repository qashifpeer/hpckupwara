// src/scripts/exportRegistrations.js
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

async function exportRegistrations() {
  console.log('📡 Fetching school registrations from Sanity...');

  const query = `*[_type == "schoolRegistration"] | order(submittedAt desc) {
    udiseCode,
    schoolName,
    zone,
    registeredOnHpc,
    reasonIfNotRegistered,
    totalStaff,
    staffRegisteredOnHpc,
    studentEnrollmentKto8,
    registeredStudentEnrollment,
    adminPhone,
    submittedAt
  }`;

  const data = await client.fetch(query);
  console.log(`📊 Found ${data.length} records.`);

  if (data.length === 0) {
    console.log('No data to export.');
    return;
  }

  const rows = data.map((item, index) => ({
    'S.No': index + 1,
    'UDISE Code': item.udiseCode || '',
    'School Name': item.schoolName || '',
    'Zone': item.zone || '',
    'HPC Registered': item.registeredOnHpc || 'No',
    'Reason (if not registered)': item.reasonIfNotRegistered || 'N/A',
    'Total Staff': item.totalStaff ?? '',
    'Staff Registered on HPC': item.staffRegisteredOnHpc ?? '',
    'Total Students (KG-8)': item.studentEnrollmentKto8 ?? '',
    'Students Registered on HPC': item.registeredStudentEnrollment ?? '',
    'Admin Phone Number': item.adminPhone || '',
    'Submitted At': item.submittedAt
      ? new Date(item.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : '',
  }));

  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'School Registrations');

  const outputPath = path.join(process.cwd(), 'school_registrations_export.xlsx');
  xlsx.writeFile(workbook, outputPath);

  console.log(`🎉 Excel file saved to: ${outputPath}`);
}

exportRegistrations();