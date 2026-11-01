// src/app/page.tsx
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import { DISTRICT_ZONE_TARGETS, TOTAL_DISTRICT_BENCHMARK } from '@/lib/constants';
import {
  Users,
  GraduationCap,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Target,
  UserCheck,
  Code2,
  ShieldAlert,
} from 'lucide-react';

export const revalidate = 60; // Refresh live aggregates every 60 seconds

interface SchoolRecord {
  _id: string;
  udiseCode: string;
  schoolName: string;
  zone: string;
  registeredOnHpc: 'Yes' | 'No';
  totalStaff?: number;
  staffRegisteredOnHpc?: number;
  studentEnrollmentKto8?: number;
  registeredStudentEnrollment?: number;
}

async function getDashboardData(): Promise<SchoolRecord[]> {
  try {
    const query = `*[_type == "schoolRegistration"]{
      _id,
      udiseCode,
      schoolName,
      zone,
      registeredOnHpc,
      totalStaff,
      staffRegisteredOnHpc,
      studentEnrollmentKto8,
      registeredStudentEnrollment
    }`;
    return await sanityClient.fetch(query);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const recordedSchools = await getDashboardData();

  // District-level metric calculations
  const totalReportedInDb = recordedSchools.length;
  const hpcOnboardedCount = recordedSchools.filter((s) => s.registeredOnHpc === 'Yes').length;

  // Real district performance against official baseline of 1,699
  const overallDistrictPercentage = (
    (hpcOnboardedCount / TOTAL_DISTRICT_BENCHMARK) *
    100
  ).toFixed(1);
  const remainingSchoolsToOnboard = TOTAL_DISTRICT_BENCHMARK - hpcOnboardedCount;

  // Staff & Student totals
  const totalStaff = recordedSchools.reduce((acc, s) => acc + (s.totalStaff || 0), 0);
  const registeredStaff = recordedSchools.reduce(
    (acc, s) => acc + (s.staffRegisteredOnHpc || 0),
    0
  );
  const staffRate = totalStaff > 0 ? Math.round((registeredStaff / totalStaff) * 100) : 0;

  const totalStudents = recordedSchools.reduce(
    (acc, s) => acc + (s.studentEnrollmentKto8 || 0),
    0
  );
  const registeredStudents = recordedSchools.reduce(
    (acc, s) => acc + (s.registeredStudentEnrollment || 0),
    0
  );
  const studentRate =
    totalStudents > 0 ? Math.round((registeredStudents / totalStudents) * 100) : 0;

  // Zone Breakdown against official target quotas
  const zoneStats = Object.entries(DISTRICT_ZONE_TARGETS)
    .map(([zoneName, targetTotal]) => {
      const matchingRecords = recordedSchools.filter(
        (s) => s.zone?.toLowerCase().trim() === zoneName.toLowerCase().trim()
      );
      const onboardedHPC = matchingRecords.filter((s) => s.registeredOnHpc === 'Yes').length;
      const reportedTotal = matchingRecords.length;

      const percentage =
        targetTotal > 0
          ? Math.min(100, Math.round((onboardedHPC / targetTotal) * 100))
          : 0;
      const deficit = Math.max(0, targetTotal - onboardedHPC);

      return {
        name: zoneName,
        targetTotal,
        reportedTotal,
        onboardedHPC,
        percentage,
        deficit,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-hidden">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10 w-full flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.18)] p-6 sm:p-10 relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              District Kupwara Monitoring Portal
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-fuchsia-400 bg-clip-text text-transparent">
              Holistic Progress Card (HPC)
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              District monitoring tracker measuring onboarding compliance against the official baseline of{' '}
              <strong>{TOTAL_DISTRICT_BENCHMARK.toLocaleString()} schools</strong> across all 13 educational zones. Real-time capture of staff activation and pupil assessment readiness under PARAKH guidelines.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/registration"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-[#070b14] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 transition"
              >
                Register / Update School
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Primary Metric Highlights Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Official District Completion */}
          <div className="bg-[#0e1626]/80 backdrop-blur-lg rounded-2xl border border-cyan-500/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                Official Completion
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">
              {hpcOnboardedCount}{' '}
              <span className="text-base font-normal text-slate-400">/ {TOTAL_DISTRICT_BENCHMARK}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">HPC Onboarded vs Total Schools</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">District Coverage</span>
              <span className="font-bold text-cyan-400">{overallDistrictPercentage}%</span>
            </div>
          </div>

          {/* Card 2: Remaining Deficit */}
          <div className="bg-[#0e1626]/80 backdrop-blur-lg rounded-2xl border border-amber-500/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Remaining Deficit
              </span>
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-400/40 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-300">
              {remainingSchoolsToOnboard.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Schools pending portal registration</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Form Submissions</span>
              <span className="font-bold text-slate-300">{totalReportedInDb} in database</span>
            </div>
          </div>

          {/* Card 3: Staff Status */}
          <div className="bg-[#0e1626]/80 backdrop-blur-lg rounded-2xl border border-sky-500/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                Staff Registered
              </span>
              <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-400/40 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">{registeredStaff.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Out of {totalStaff.toLocaleString()} reported staff</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Sync Ratio</span>
              <span className="font-bold text-sky-400">{staffRate}%</span>
            </div>
          </div>

          {/* Card 4: Student Enrollment */}
          <div className="bg-[#0e1626]/80 backdrop-blur-lg rounded-2xl border border-fuchsia-500/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
                Students Onboarded
              </span>
              <div className="p-2.5 rounded-xl bg-fuchsia-950/60 border border-fuchsia-400/40 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100">{registeredStudents.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Out of {totalStudents.toLocaleString()} KG-8 pupils</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Sync Ratio</span>
              <span className="font-bold text-fuchsia-400">{studentRate}%</span>
            </div>
          </div>
        </section>

        {/* Zone Breakdown Table & Performance Rank */}
        <section className="bg-[#0e1626]/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100">Zone-Wise Performance vs Official Target</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Baseline: {TOTAL_DISTRICT_BENCHMARK} Schools Across 13 Zones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {zoneStats.map((zone, idx) => (
              <div key={zone.name} className="space-y-2 p-3.5 rounded-xl bg-[#0a0f1d]/70 border border-slate-800/90">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] flex items-center justify-center font-mono font-bold text-cyan-300">
                      #{idx + 1}
                    </span>
                    <span className="text-slate-100 font-semibold">{zone.name}</span>
                  </div>
                  <div className="text-slate-400 font-mono">
                    <span className="text-cyan-400 font-bold">{zone.onboardedHPC}</span> /{' '}
                    <span className="text-slate-200">{zone.targetTotal}</span> ({zone.percentage}%)
                  </div>
                </div>

                {/* Performance Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      zone.percentage >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : zone.percentage >= 40
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-400'
                        : 'bg-gradient-to-r from-amber-500 to-rose-400'
                    }`}
                    style={{ width: `${zone.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                  <span>
                    Deficit to target: <strong className="text-rose-400">{zone.deficit}</strong>
                  </span>
                  <span>Forms Submitted: {zone.reportedTotal}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="w-full border-t border-slate-800/90 bg-[#060a12]/95 backdrop-blur-xl relative z-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Leadership: CEO */}
            <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 flex flex-col justify-center">
              <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Chief Education Officer
                </span>
              </div>
              <p className="text-base font-bold text-slate-100 tracking-wide">
                Manzoor Ahmad
              </p>
              <p className="text-xs text-slate-400 mt-0.5">District Kupwara</p>
            </div>

            {/* Leadership: DNO */}
            <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 flex flex-col justify-center">
              <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 mb-1">
                <UserCheck className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  DNO HPC PARAKH
                </span>
              </div>
              <p className="text-base font-bold text-slate-100 tracking-wide">
                Javaid Abdullah
              </p>
              <p className="text-xs text-slate-400 mt-0.5">District Kupwara</p>
            </div>

            {/* Technical Development */}
            <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 flex flex-col justify-center">
              <div className="flex items-center justify-center md:justify-start gap-2 text-fuchsia-400 mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Technical Architecture
                </span>
              </div>
              <p className="text-base font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                Qashif Peer
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Developed and Maintained</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <p>© {new Date().getFullYear()} HPC Kupwara Monitoring Portal. All Rights Reserved.</p>
            <p className="font-mono text-[11px] text-cyan-300/80">PARAKH Implementation Framework</p>
          </div>
        </div>
      </footer>
    </div>
  );
}