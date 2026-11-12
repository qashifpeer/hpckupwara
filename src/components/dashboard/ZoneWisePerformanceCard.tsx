// src/components/dashboard/ZoneWisePerformanceCard.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  MapPin,
  BarChart3,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  School,
} from 'lucide-react';
import { sanityClient } from '@/lib/sanity';

interface ZoneDoc {
  zone: string;
  code: string;
}

interface DailyReportDoc {
  udiseCode?: string;
  totalStudents?: number | string | null;
  completed?: number | string | null;
  inProgress?: number | string | null;
  pending?: number | string | null;
}

interface ZoneMetric {
  zone: string;
  code: string;
  schools: number;
  totalStudents: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentage: number;
}

type SortMode = 'percentage' | 'completed' | 'alphabetical';

export default function ZoneWisePerformanceCard() {
  const [zoneMetrics, setZoneMetrics] = useState<ZoneMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortMode>('percentage');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchZonePerformance() {
      try {
        // Fetch both zones and dailyreport records in parallel (bypassing 100-doc default limit)
        const query = `{
          "zones": *[_type == "zones"][0...100]{
            zone,
            code
          },
          "reports": *[_type == "dailyreport"][0...5000]{
            udiseCode,
            totalStudents,
            completed,
            inProgress,
            pending
          }
        }`;

        const res = await sanityClient.fetch<{
          zones: ZoneDoc[];
          reports: DailyReportDoc[];
        }>(query, {}, { cache: 'no-store' });

        const zonesList = res?.zones || [];
        const reportsList = res?.reports || [];

        // Normalize zone codes and sort longest code first for exact prefix matching
        const normalizedZones = zonesList
          .filter((z) => z.zone && z.code)
          .map((z) => ({
            zone: z.zone.trim(),
            code: String(z.code).trim().replace(/\.0$/, ''),
          }))
          .sort((a, b) => b.code.length - a.code.length);

        // Initialize accumulator map for each zone
        const metricsMap = new Map<string, ZoneMetric>();
        normalizedZones.forEach((z) => {
          metricsMap.set(z.zone, {
            zone: z.zone,
            code: z.code,
            schools: 0,
            totalStudents: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            percentage: 0,
          });
        });

        // Match each dailyreport entry to its zone via UDISE code prefix
        reportsList.forEach((rep) => {
          const udise = String(rep.udiseCode || '').trim();
          if (!udise) return;

          const matchedZone = normalizedZones.find((z) =>
            udise.startsWith(z.code)
          );

          if (matchedZone) {
            const entry = metricsMap.get(matchedZone.zone)!;
            const total = Number(rep.totalStudents) || 0;
            const comp = Number(rep.completed) || 0;
            const prog = Number(rep.inProgress) || 0;
            const pend =
              rep.pending !== undefined &&
              rep.pending !== null &&
              rep.pending !== ''
                ? Number(rep.pending) || 0
                : Math.max(0, total - comp - prog);

            entry.schools += 1;
            entry.totalStudents += total;
            entry.completed += comp;
            entry.inProgress += prog;
            entry.pending += pend;
          }
        });

        // Calculate completion percentages
        const computed: ZoneMetric[] = Array.from(metricsMap.values()).map(
          (item) => ({
            ...item,
            percentage:
              item.totalStudents > 0
                ? Number(((item.completed / item.totalStudents) * 100).toFixed(1))
                : 0,
          })
        );

        setZoneMetrics(computed);
      } catch (error) {
        console.error('Failed to compute zone-wise performance:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchZonePerformance();
  }, []);

  // Sort zones based on selected toggle
  const sortedZones = useMemo(() => {
    const copy = [...zoneMetrics];
    if (sortBy === 'percentage') {
      return copy.sort((a, b) => b.percentage - a.percentage);
    }
    if (sortBy === 'completed') {
      return copy.sort((a, b) => b.completed - a.completed);
    }
    return copy.sort((a, b) => a.zone.localeCompare(b.zone));
  }, [zoneMetrics, sortBy]);

  // Top performing zone callout
  const topZone = useMemo(() => {
    if (zoneMetrics.length === 0) return null;
    return [...zoneMetrics].sort((a, b) => b.percentage - a.percentage)[0];
  }, [zoneMetrics]);

  return (
    <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-fuchsia-500/30 p-6 shadow-[0_0_25px_rgba(217,70,239,0.12)] relative overflow-hidden space-y-6">
      {/* Ambient Background Glow */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">
            Zonal Analytics • UDISE Code Prefix Mapping
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-fuchsia-400" />
            Zone-Wise HPC Performance
          </h2>
        </div>

        {/* Sort Toggle Pills */}
        <div className="flex items-center gap-1.5 bg-[#070b14] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSortBy('percentage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              sortBy === 'percentage'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            By % Rate
          </button>
          <button
            onClick={() => setSortBy('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              sortBy === 'completed'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            By Volume
          </button>
          <button
            onClick={() => setSortBy('alphabetical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              sortBy === 'alphabetical'
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            A–Z
          </button>
        </div>
      </div>

      {/* Leading Zone Banner */}
      {!loading && topZone && topZone.totalStudents > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-950/60 via-[#0a0f1d] to-fuchsia-950/60 border border-cyan-500/25 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              Top Zone
            </span>
            <span className="text-sm font-bold text-slate-100">
              {topZone.zone}
            </span>
            <span className="text-xs font-mono text-slate-400">
              (Code: {topZone.code})
            </span>
          </div>
          <div className="text-xs font-mono text-cyan-300">
            <strong>{topZone.percentage}%</strong> Completion (
            {topZone.completed.toLocaleString()} /{' '}
            {topZone.totalStudents.toLocaleString()} Students)
          </div>
        </div>
      )}

      {/* Horizontal Performance Graph */}
      <div className="space-y-3.5 relative z-10">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
            Matching UDISE prefixes across Kupwara zones...
          </div>
        ) : sortedZones.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No zones or daily reports found to compare.
          </div>
        ) : (
          sortedZones.map((item) => {
            const isHovered = hoveredZone === item.zone;
            // Color tiering based on completion percentage
            const barGradient =
              item.percentage >= 75
                ? 'from-emerald-400 to-cyan-400'
                : item.percentage >= 40
                ? 'from-cyan-400 to-fuchsia-400'
                : 'from-amber-400 to-rose-500';

            return (
              <div
                key={item.zone}
                onMouseEnter={() => setHoveredZone(item.zone)}
                onMouseLeave={() => setHoveredZone(null)}
                className="p-3 rounded-xl bg-[#070b14]/80 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                {/* Top Row: Zone Name, Code, Schools, and Stats */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-100">
                      {item.zone}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {item.code}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <School className="w-3 h-3" />
                      {item.schools} schools
                    </span>
                  </div>

                  {/* Numeric Readout */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">
                      <span className="text-cyan-300 font-bold">
                        {item.completed.toLocaleString()}
                      </span>{' '}
                      / {item.totalStudents.toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-slate-100 w-14 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/90 p-0.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                {/* Expandable Sub-metrics on Hover */}
                {isHovered && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed: <strong>{item.completed.toLocaleString()}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sky-300">
                      In Progress: <strong>{item.inProgress.toLocaleString()}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      Pending: <strong>{item.pending.toLocaleString()}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Legend */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 relative z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            ≥ 75% High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            40–74% Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            &lt; 40% Needs Focus
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Matched via UDISE prefix • {zoneMetrics.length} Zones
        </span>
      </div>
    </div>
  );
}