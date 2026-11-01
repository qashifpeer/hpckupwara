// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      udiseCode,
      schoolName,
      zone,
      registeredOnHpc,
      reasonNotRegistered,
      totalStaff,
      staffRegisteredHpc,
      studentEnrollment,
      registeredStudentHpc,
      adminPhone,
    } = body;

    // Strict UDISE Validation: 11 digits, begins with 0
    if (!udiseCode || !/^0\d{10}$/.test(udiseCode)) {
      return NextResponse.json(
        { error: 'UDISE code must be exactly 11 digits and start with 0.' },
        { status: 400 }
      );
    }

    if (!schoolName || !zone || !registeredOnHpc || !adminPhone) {
      return NextResponse.json(
        { error: 'Please provide all mandatory fields.' },
        { status: 400 }
      );
    }

    const doc = {
      _type: 'schoolRegistration',
      udiseCode,
      schoolName,
      zone,
      registeredOnHpc,
      reasonIfNotRegistered: registeredOnHpc === 'No' ? reasonNotRegistered : null,
      totalStaff: registeredOnHpc === 'Yes' ? Number(totalStaff) : null,
      staffRegisteredOnHpc: registeredOnHpc === 'Yes' ? Number(staffRegisteredHpc) : null,
      studentEnrollmentKto8: registeredOnHpc === 'Yes' ? Number(studentEnrollment) : null,
      registeredStudentEnrollment: registeredOnHpc === 'Yes' ? Number(registeredStudentHpc) : null,
      adminPhone,
      submittedAt: new Date().toISOString(),
    };

    const result = await sanityClient.create(doc);

    return NextResponse.json({ success: true, id: result._id }, { status: 201 });
  } catch (error: any) {
    console.error('Submission Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}