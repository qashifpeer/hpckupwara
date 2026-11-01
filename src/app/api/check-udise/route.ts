// src/app/api/check-udise/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const udise = searchParams.get('udise');

    if (!udise || !/^0\d{10}$/.test(udise)) {
      return NextResponse.json({ exists: false, error: 'Invalid UDISE format' }, { status: 400 });
    }

    // Query Sanity for existing document with this UDISE code
    const query = `*[_type == "schoolRegistration" && udiseCode == $udise][0]{
      _id,
      schoolName
    }`;

    const existingSchool = await sanityClient.fetch(query, { udise });

    if (existingSchool) {
      return NextResponse.json({
        exists: true,
        schoolId: existingSchool._id,
        schoolName: existingSchool.schoolName,
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error('Check UDISE error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}