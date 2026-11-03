// src/components/dashboard/ZoneWiseStatusCard.tsx
'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, Target, ArrowUpDown } from 'lucide-react';

export interface ZoneMetric {
  zoneName: string;
  totalMaster: number;
  completedHpc: number;
  registeredForms?: number;
  hpcPercentage: number;
  deficit: number;
}

export interface ZoneWiseStatusCardProps {
  zoneData: ZoneMetric[];
}

export default function ZoneWiseStatusCard({ zoneData }: ZoneWiseStatusCardProps) {
  const [sortBy, setSortBy] = useState<'hpc' | 'name' | 'deficit'>('hpc');

  const sortedZones = [...zoneData].sort((a, b) => {
    if (sortBy === 'hpc') return b.hpcPercentage - a.hpcPercentage;
    if (sortBy === 'deficit') return b.deficit - a.deficit;
    return a.zoneName.localeCompare(b.zoneName);
  });

  return (
    <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-between">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-10 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            Card 04 • Geospatial Breakdown
          </span>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Zone-Wise Onboarding Status
          </h2>
        </div>

        {/* Dynamic Sort Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <div className="flex bg-[#0a0f1d] p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSortBy('hpc')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                sortBy === 'hpc'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HPC %
            </button>
            <button
              onClick={() => setSortBy('deficit')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                sortBy === 'deficit'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deficit
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                sortBy === 'name'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Name
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Dynamic Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
        {sortedZones.map((zone, idx) => (
          <div
            key={zone.zoneName}
            className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 hover:border-cyan-500/40 transition duration-200 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] flex items-center justify-center font-mono font-bold text-cyan-300">
                  #{idx + 1}
                </span>
                <span className="text-sm font-bold text-slate-100">{zone.zoneName}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-cyan-400 font-mono">
                  {zone.hpcPercentage}%
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Coverage</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  zone.hpcPercentage >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    : zone.hpcPercentage >= 50
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-400'
                    : 'bg-gradient-to-r from-amber-500 to-rose-400'
                }`}
                style={{ width: `${Math.min(100, zone.hpcPercentage)}%` }}
              />
            </div>

            {/* Metrics Breakdown (Total vs Completed) */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Target className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  Total Target: <strong className="text-slate-200">{zone.totalMaster}</strong>
                </span>
              </div>

              <div className="flex items-center justify-end gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  HPC Completed: <strong className="text-cyan-300">{zone.completedHpc}</strong>
                </span>
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-800/40">
              <span>
                Remaining Deficit: <strong className="text-amber-400">{zone.deficit}</strong>
              </span>
              <span className="text-cyan-400 font-mono font-medium">
                {zone.completedHpc} / {zone.totalMaster}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Dynamic Zone Aggregation ({zoneData.length} active educational zones)</span>
       
      </div>
    </div>
  );
}