// src/components/dashboard/SchoolCoverageCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { sanityClient } from '@/lib/sanity';

interface DailyReportRow {
  totalStudents?: number | string | null;
  completed?: number | string | null;
  pending?: number | string | null;
}

interface DistrictTotals {
  totalStudents: number;
  completed: number;
  pending: number;
  schoolCount: number;
}

export default function SchoolCoverageCard() {
  const [totals, setTotals] = useState<DistrictTotals>({
    totalStudents: 0,
    completed: 0,
    pending: 0,
    schoolCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAndSumDailyReports() {
      try {
        // Explicit [0...5000] slice bypasses Sanity's default 100-document limit
        const query = `*[_type == "dailyreport"][0...5000]{
          totalStudents,
          completed,
          pending
        }`;

        const rows = await sanityClient.fetch<DailyReportRow[]>(
          query,
          {},
          { cache: 'no-store' }
        );

        let sumTotalStudents = 0;
        let sumCompleted = 0;
        let sumPending = 0;

        (rows || []).forEach((row) => {
          const total = Number(row.totalStudents) || 0;
          const comp = Number(row.completed) || 0;
          const pend =
            row.pending !== undefined && row.pending !== null && row.pending !== ''
              ? Number(row.pending) || 0
              : Math.max(0, total - comp);

          sumTotalStudents += total;
          sumCompleted += comp;
          sumPending += pend;
        });

        setTotals({
          totalStudents: sumTotalStudents,
          completed: sumCompleted,
          pending: sumPending,
          schoolCount: (rows || []).length,
        });
      } catch (error) {
        console.error('Error aggregating dailyreport figures:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAndSumDailyReports();
  }, []);

  const { totalStudents, completed, pending, schoolCount } = totals;

  const percentage =
    totalStudents > 0 ? ((completed / totalStudents) * 100).toFixed(1) : '0.0';

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const completedStroke =
    totalStudents > 0
      ? Math.min(1, completed / totalStudents) * circumference
      : 0;

  return (
    <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            Card 01 • District Student Summary
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Daily Report Overview
          </h2>
        </div>
        <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center py-6">
        {/* Radial Progress Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-800/80"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="url(#neonCyanGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - completedStroke}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="neonCyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-100 tracking-tight font-mono">
              {loading ? '...' : `${percentage}%`}
            </span>
            <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-widest">
              Completed
            </span>
          </div>
        </div>

        {/* Stat Rows */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Students</span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {loading ? '...' : totalStudents.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-200 font-medium">Completed</span>
            </div>
            <span className="text-sm font-bold text-cyan-300 font-mono">
              {loading ? '...' : completed.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-200 font-medium">Pending</span>
            </div>
            <span className="text-sm font-bold text-amber-300 font-mono">
              {loading ? '...' : pending.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Source: Daily Reports ({schoolCount} Schools)</span>
        <span className="text-cyan-400 font-mono font-medium">
          {loading
            ? 'Syncing...'
            : `${completed.toLocaleString()} / ${totalStudents.toLocaleString()}`}
        </span>
      </div>
    </div>
  );
}