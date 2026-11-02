// src/components/dashboard/StaffOnboardingCard.tsx
'use client';

import React from 'react';
import { Users, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';

export interface StaffOnboardingCardProps {
  totalReportedStaff: number;
  registeredStaff: number;
}

export default function StaffOnboardingCard({
  totalReportedStaff,
  registeredStaff,
}: StaffOnboardingCardProps) {
  const syncPercentage =
    totalReportedStaff > 0
      ? Math.min(100, (registeredStaff / totalReportedStaff) * 100).toFixed(1)
      : '0.0';

  const pendingStaff = Math.max(0, totalReportedStaff - registeredStaff);

  return (
    <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-sky-500/30 p-6 shadow-[0_0_25px_rgba(56,189,248,0.15)] relative overflow-hidden flex flex-col justify-between">
      {/* Background Neon Accent */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
            Card 03 • Educator Coverage
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Staff HPC Onboarding
          </h2>
        </div>
        <div className="p-2.5 rounded-xl bg-sky-950/70 border border-sky-400/40 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)] shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Metric Showcase */}
      <div className="py-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
              {registeredStaff.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Active Staff Registered on HPC</p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
              {syncPercentage}%
            </span>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Sync Ratio</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Number(syncPercentage))}%` }}
          />
        </div>
      </div>

      {/* Breakdown Badges */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Total Reported Staff</span>
          </div>
          <span className="text-base font-bold text-slate-100 font-mono mt-1">
            {totalReportedStaff.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/20 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-sky-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Pending Sync</span>
          </div>
          <span className="text-base font-bold text-sky-300 font-mono mt-1">
            {pendingStaff.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          PARAKH Teacher Mapping
        </span>
        <span className="text-sky-300 font-mono">
          {registeredStaff.toLocaleString()} / {totalReportedStaff.toLocaleString()}
        </span>
      </div>
    </div>
  );
}