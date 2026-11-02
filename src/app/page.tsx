// src/app/page.tsx
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import { Sparkles, ArrowRight, ListFilter } from 'lucide-react';
import SchoolCoverageCard from '@/components/dashboard/SchoolCoverageCard';
import StudentOnboardingCard from '@/components/dashboard/StudentOnboardingCard';
import StaffOnboardingCard from '@/components/dashboard/StaffOnboardingCard';
import ZoneWiseStatusCard, { ZoneMetric } from '@/components/dashboard/ZoneWiseStatusCard';
import PendingSchoolsTable, { PendingSchool } from '@/components/dashboard/PendingSchoolsTable';
import Footer from '@/components/Footer';

export const revalidate = 60; // Auto-refresh data every 60 seconds

async function getDashboardData() {
  try {
    const [
      totalMaster,
      completed,
      studentAggregates,
      staffAggregates,
      masterSchools,
      completedUdises,
      registrationRecords,
    ] = await Promise.all([
      sanityClient.fetch<number>(`count(*[_type == "masterSchool"])`),
      sanityClient.fetch<number>(`count(*[_type == "dataCompleted"])`),
      sanityClient.fetch<{
        totalTargetEnrollment: number;
        verifiedEnrolled: number;
      }>(`{
        "totalTargetEnrollment": math::sum(*[_type == "schoolRegistration" && defined(studentEnrollmentKto8) && studentEnrollmentKto8 <= 1000].studentEnrollmentKto8),
        "verifiedEnrolled": math::sum(*[_type == "schoolRegistration" && defined(registeredStudentEnrollment) && registeredStudentEnrollment <= 1000].registeredStudentEnrollment)
      }`),
      sanityClient.fetch<{
        totalReportedStaff: number;
        registeredStaff: number;
      }>(`{
        "totalReportedStaff": math::sum(*[_type == "schoolRegistration" && defined(totalStaff) && totalStaff <= 1000].totalStaff),
        "registeredStaff": math::sum(*[_type == "schoolRegistration" && defined(staffRegisteredOnHpc) && staffRegisteredOnHpc <= 1000].staffRegisteredOnHpc)
      }`),
      // Master directory schools
      sanityClient.fetch<{ udiseCode: string; schoolName: string; zone: string }[]>(
        `*[_type == "masterSchool" && defined(udiseCode)]{ udiseCode, schoolName, zone }`
      ),
      // UDISE codes completed in HPC
      sanityClient.fetch<string[]>(
        `*[_type == "dataCompleted" && defined(udiseCode)].udiseCode`
      ),
      // Registration forms
      sanityClient.fetch<{ udiseCode: string }[]>(
        `*[_type == "schoolRegistration" && defined(udiseCode)]{ udiseCode }`
      ),
    ]);

    // Build completed set for O(1) membership check
    const completedSet = new Set((completedUdises || []).map((u) => String(u).trim()));

    // 1. Zone-Wise aggregation
    const zoneMap: Record<
      string,
      { totalMaster: number; completedHpc: number }
    > = {};

    // 2. Identify Pending Schools
    const pendingSchools: PendingSchool[] = [];
    const zonesSet = new Set<string>();

    (masterSchools || []).forEach((school) => {
      let rawZone = String(school.zone || '').trim();
      if (!rawZone) return;

      const zoneName = rawZone.charAt(0).toUpperCase() + rawZone.slice(1).toLowerCase();
      zonesSet.add(zoneName);

      if (!zoneMap[zoneName]) {
        zoneMap[zoneName] = { totalMaster: 0, completedHpc: 0 };
      }
      zoneMap[zoneName].totalMaster += 1;

      const cleanUdise = String(school.udiseCode || '').trim();
      const isCompleted = completedSet.has(cleanUdise);

      if (isCompleted) {
        zoneMap[zoneName].completedHpc += 1;
      } else {
        // Collect missing school
        pendingSchools.push({
          udiseCode: cleanUdise,
          schoolName: school.schoolName || 'Unknown School Name',
          zone: zoneName,
        });
      }
    });

    const zoneData: ZoneMetric[] = Object.entries(zoneMap).map(([zoneName, counts]) => {
      const percentage =
        counts.totalMaster > 0
          ? Math.round((counts.completedHpc / counts.totalMaster) * 100)
          : 0;
      const deficit = Math.max(0, counts.totalMaster - counts.completedHpc);

      return {
        zoneName,
        totalMaster: counts.totalMaster,
        completedHpc: counts.completedHpc,
        hpcPercentage: percentage,
        deficit,
      };
    });

    const sortedZones = Array.from(zonesSet).sort();

    return {
      totalMaster: totalMaster || 0,
      completed: completed || 0,
      totalTargetEnrollment: studentAggregates?.totalTargetEnrollment || 0,
      verifiedEnrolled: studentAggregates?.verifiedEnrolled || 0,
      totalReportedStaff: staffAggregates?.totalReportedStaff || 0,
      registeredStaff: staffAggregates?.registeredStaff || 0,
      zoneData,
      pendingSchools,
      zones: sortedZones,
    };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return {
      totalMaster: 0,
      completed: 0,
      totalTargetEnrollment: 0,
      verifiedEnrolled: 0,
      totalReportedStaff: 0,
      registeredStaff: 0,
      zoneData: [],
      pendingSchools: [],
      zones: [],
    };
  }
}

export default async function DashboardPage() {
  const {
    totalMaster,
    completed,
    totalTargetEnrollment,
    verifiedEnrolled,
    totalReportedStaff,
    registeredStaff,
    zoneData,
    pendingSchools,
    zones,
  } = await getDashboardData();

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
              District monitoring tracker measuring onboarding compliance across all educational zones. Real-time capture of institutional synchronization and pupil assessment readiness under PARAKH guidelines.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/registration"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-[#070b14] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 transition"
              >
                Register / Update School
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Pending Schools Button */}
              <a
                href="#pending-schools-section"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95 transition"
              >
                <ListFilter className="w-4 h-4 text-amber-400" />
                Pending Schools ({pendingSchools.length})
              </a>
            </div>
          </div>
        </section>

        {/* Top Metric Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SchoolCoverageCard totalMaster={totalMaster} completed={completed} />
          <StudentOnboardingCard
            totalTargetEnrollment={totalTargetEnrollment}
            verifiedEnrolled={verifiedEnrolled}
          />
          <StaffOnboardingCard
            totalReportedStaff={totalReportedStaff}
            registeredStaff={registeredStaff}
          />
        </section>

        {/* Zone-Wise Status Breakdown Card */}
        <section className="w-full">
          <ZoneWiseStatusCard zoneData={zoneData} />
        </section>

        {/* Dedicated Pending Schools Table Component */}
        <section className="w-full">
          <PendingSchoolsTable pendingSchools={pendingSchools} zones={zones} />
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}