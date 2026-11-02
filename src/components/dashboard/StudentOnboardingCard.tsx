// src/components/dashboard/StudentOnboardingCard.tsx
'use client';

import React from 'react';
import { GraduationCap, Users2, CheckCircle, AlertCircle } from 'lucide-react';

export interface StudentOnboardingCardProps {
  totalTargetEnrollment: number;
  verifiedEnrolled: number;
}

export default function StudentOnboardingCard({
  totalTargetEnrollment,
  verifiedEnrolled,
}: StudentOnboardingCardProps) {
  // Cap percentage calculation to avoid unrealistic runaway metrics
  const syncPercentage =
    totalTargetEnrollment > 0
      ? Math.min(100, (verifiedEnrolled / totalTargetEnrollment) * 100).toFixed(1)
      : '0.0';

  const pendingStudents = Math.max(0, totalTargetEnrollment - verifiedEnrolled);

  return (
    <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-fuchsia-500/30 p-6 shadow-[0_0_25px_rgba(217,70,239,0.15)] relative overflow-hidden flex flex-col justify-between">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">
            Card 02 • Pupil Coverage
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Student HPC Onboarding
          </h2>
        </div>
        <div className="p-2.5 rounded-xl bg-fuchsia-950/70 border border-fuchsia-400/40 text-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.3)] shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      {/* Main Metric Showcase */}
      <div className="py-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
              {verifiedEnrolled.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Verified Onboarded Pupils (KG–8)</p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-fuchsia-400 font-mono">
              {syncPercentage}%
            </span>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Sync Ratio</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 via-pink-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Number(syncPercentage))}%` }}
          />
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Users2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Master Target</span>
          </div>
          <span className="text-base font-bold text-slate-100 font-mono mt-1">
            {totalTargetEnrollment.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/20 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-fuchsia-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Pending Sync</span>
          </div>
          <span className="text-base font-bold text-fuchsia-300 font-mono mt-1">
            {pendingStudents.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          PARAKH Base Validation
        </span>
        <span className="text-fuchsia-300 font-mono">
          {verifiedEnrolled.toLocaleString()} / {totalTargetEnrollment.toLocaleString()}
        </span>
      </div>
    </div>
  );
}