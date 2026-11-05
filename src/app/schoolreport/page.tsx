// src/app/schoolreport/page.tsx
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import SchoolReportTable, { SchoolReportItem } from '@/components/reports/SchoolReportTable';
import Footer from '@/components/Footer';

export const revalidate = 60; // Auto-refresh data every 60 seconds

async function getSchoolReports(): Promise<SchoolReportItem[]> {
  try {
    const query = `*[_type == "schoolRegistration" && defined(udiseCode)] | order(submittedAt desc) {
      _id,
      zone,
      udiseCode,
      schoolName,
      registeredOnHpc,
      totalStaff,
      staffRegisteredOnHpc,
      studentEnrollmentKto8,
      registeredStudentEnrollment,
      adminPhone,
      submittedAt
    }`;

    const data = await sanityClient.fetch<SchoolReportItem[]>(query);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch school registration reports:', error);
    return [];
  }
}

export default async function SchoolReportPage() {
  const reports = await getSchoolReports();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10 w-full flex-grow">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mb-3 transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Monitoring Dashboard
            </Link>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-100 flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-cyan-400" />
              Reported Schools Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Field submissions captured through the HPC School Registration Form across District Kupwara.
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-[#070b14] bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition active:scale-95"
            >
              Submit New / Update
            </Link>
          </div>
        </div>

        {/* Interactive Report Table with Zone Filtering */}
        <SchoolReportTable initialData={reports} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}