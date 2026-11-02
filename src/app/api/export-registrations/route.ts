// src/app/api/export-registrations/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    const records = await sanityClient.fetch(query);

    if (!records || records.length === 0) {
      return NextResponse.json({ message: 'No registration records found' }, { status: 404 });
    }

    // Transform raw fields into human-readable columns
    const sheetData = records.map((item: any, index: number) => ({
      'S.No': index + 1,
      'UDISE Code': item.udiseCode || '',
      'School Name': item.schoolName || '',
      'Zone': item.zone || '',
      'HPC Registered': item.registeredOnHpc || 'No',
      'Reason If Not Registered': item.reasonIfNotRegistered || 'N/A',
      'Total Staff': item.totalStaff ?? '',
      'Staff Registered on HPC': item.staffRegisteredOnHpc ?? '',
      'Total Students (KG-8)': item.studentEnrollmentKto8 ?? '',
      'Students Registered on HPC': item.registeredStudentEnrollment ?? '',
      'Admin Phone Number': item.adminPhone || '',
      'Submitted At': item.submittedAt
        ? new Date(item.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : '',
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    // Auto-fit column widths
    const columnWidths = Object.keys(sheetData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 14),
    }));
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'School Registrations');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `HPC_Kupwara_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel export', details: error.message },
      { status: 500 }
    );
  }
}