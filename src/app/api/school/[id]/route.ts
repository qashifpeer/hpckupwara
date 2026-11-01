// src/app/api/school/[id]/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch existing record
export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params; // <-- Await context.params before accessing .id

    if (!id) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }

    const query = `*[_type == "schoolRegistration" && _id == $id][0]`;
    const school = await sanityClient.fetch(query, { id });

    if (!school) {
      return NextResponse.json({ error: 'School record not found' }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PUT: Update the existing record
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params; // <-- Await context.params before accessing .id
    const body = await req.json();

    const {
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

    const patch = sanityClient.patch(id).set({
      schoolName,
      zone,
      registeredOnHpc,
      reasonIfNotRegistered: registeredOnHpc === 'No' ? reasonNotRegistered : null,
      totalStaff: registeredOnHpc === 'Yes' ? Number(totalStaff) : null,
      staffRegisteredOnHpc: registeredOnHpc === 'Yes' ? Number(staffRegisteredHpc) : null,
      studentEnrollmentKto8: registeredOnHpc === 'Yes' ? Number(studentEnrollment) : null,
      registeredStudentEnrollment: registeredOnHpc === 'Yes' ? Number(registeredStudentHpc) : null,
      adminPhone,
      updatedAt: new Date().toISOString(),
    });

    const updated = await patch.commit();

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}