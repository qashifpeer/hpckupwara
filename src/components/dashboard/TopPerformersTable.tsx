// src/components/dashboard/TopPerformersTable.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Trophy,
  Search,
  School,
  Hash,
  MapPin,
  Building2,
  Download,
} from 'lucide-react';
import { sanityClient } from '@/lib/sanity';

interface ZoneDoc {
  zone: string;
  code: string;
}

interface DailyReportDoc {
  udiseCode?: string;
  schoolName?: string;
  totalStudents?: number | string | null;
  completed?: number | string | null;
  inProgress?: number | string | null;
  pending?: number | string | null;
}

export interface TopPerformerRow {
  udiseCode: string;
  zone: string;
  schoolName: string;
  totalStudents: number;
  completed: number;
  inProgress: number;
  completionPercentage: number;
}

export default function TopPerformersTable() {
  const [rows, setRows] = useState<TopPerformerRow[]>([]);
  const [zonesList, setZonesList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchAndMatchData() {
      try {
        const query = `{
          "zones": *[_type == "zones"][0...100]{
            zone,
            code
          },
          "reports": *[_type == "dailyReport"][0...5000]{
            udiseCode,
            schoolName,
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

        const rawZones = res?.zones || [];
        const rawReports = res?.reports || [];

        // Sort longest zone code first for accurate prefix matching
        const normalizedZones = rawZones
          .filter((z) => z.zone && z.code)
          .map((z) => ({
            zone: z.zone.trim(),
            code: String(z.code).trim().replace(/\.0$/, ''),
          }))
          .sort((a, b) => b.code.length - a.code.length);

        const uniqueZoneNames = Array.from(
          new Set(normalizedZones.map((z) => z.zone))
        ).sort((a, b) => a.localeCompare(b));

        setZonesList(uniqueZoneNames);

        const mappedRows: TopPerformerRow[] = rawReports
          .filter((rep) => rep.udiseCode)
          .map((rep) => {
            const udise = String(rep.udiseCode || '').trim();
            const matchedZone = normalizedZones.find((z) =>
              udise.startsWith(z.code)
            );

            const total = Number(rep.totalStudents) || 0;
            const comp = Number(rep.completed) || 0;
            const prog = Number(rep.inProgress) || 0;
            const pct = total > 0 ? Number(((comp / total) * 100).toFixed(1)) : 0;

            return {
              udiseCode: udise,
              zone: matchedZone ? matchedZone.zone : 'Unassigned',
              schoolName: String(rep.schoolName || 'Unnamed School').trim(),
              totalStudents: total,
              completed: comp,
              inProgress: prog,
              completionPercentage: pct,
            };
          });

        setRows(mappedRows);
      } catch (error) {
        console.error('Failed to fetch top performers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAndMatchData();
  }, []);

  // Filter by Zone & Search, rank by completion % (and completed count as tie-breaker), then slice Top 200
  const topPerformers = useMemo(() => {
    return rows
      .filter((school) => {
        const matchesZone =
          selectedZone === 'ALL' ||
          school.zone.toLowerCase() === selectedZone.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === '' ||
          school.udiseCode.toLowerCase().includes(query) ||
          school.schoolName.toLowerCase().includes(query);

        return matchesZone && matchesSearch && school.totalStudents > 0;
      })
      .sort((a, b) => {
        if (b.completionPercentage !== a.completionPercentage) {
          return b.completionPercentage - a.completionPercentage;
        }
        return b.completed - a.completed;
      })
      .slice(0, 200);
  }, [rows, selectedZone, searchQuery]);

  // Export filtered Top 200 Performers to Excel
  const handleDownloadExcel = () => {
    if (topPerformers.length === 0) return;

    const exportData = topPerformers.map((item, index) => ({
      Rank: index + 1,
      'UDISE Code': item.udiseCode, // Kept as string to preserve leading '0'
      Zone: item.zone,
      'School Name': item.schoolName,
      'Total Students Registered': item.totalStudents,
      Completed: item.completed,
      'In Progress': item.inProgress,
      '% of Completion': `${item.completionPercentage.toFixed(1)}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set readable column widths
    worksheet['!cols'] = [
      { wch: 8 },  // Rank
      { wch: 16 }, // UDISE Code
      { wch: 18 }, // Zone
      { wch: 40 }, // School Name
      { wch: 24 }, // Total Students Registered
      { wch: 14 }, // Completed
      { wch: 14 }, // In Progress
      { wch: 16 }, // % of Completion
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Top 200 Performers');

    const dateStamp = new Date().toISOString().split('T')[0];
    const zoneLabel =
      selectedZone === 'ALL'
        ? 'District_Kupwara'
        : `Zone_${selectedZone.replace(/\s+/g, '_')}`;

    XLSX.writeFile(workbook, `Top_200_Performers_${zoneLabel}_${dateStamp}.xlsx`);
  };

  return (
    <div
      id="top-performers-section"
      className="bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_35px_rgba(16,185,129,0.12)] relative overflow-hidden space-y-6 scroll-mt-10"
    >
      {/* Background Emerald Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard • Highest Completion Rate
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            Top 200 Performers
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={loading || topPerformers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-emerald-200 bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/70 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.18)] active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Excel
          </button>

          {/* Count Badge */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-300 font-mono block leading-none">
                {loading ? '...' : `Top ${topPerformers.length}`}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {selectedZone === 'ALL'
                  ? 'Across District Kupwara'
                  : `In Zone ${selectedZone}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Dropdown & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Zone Dropdown */}
        <div className="relative">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Filter by Zone
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 transition cursor-pointer appearance-none"
            >
              <option value="ALL">All Zones ({zonesList.length})</option>
              {zonesList.map((zone) => (
                <option key={zone} value={zone}>
                  Zone {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Search UDISE Code / School Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type 11-digit UDISE code or school name..."
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Responsive Scrollable Table with Sticky Header */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#070b14]/70">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto divide-y divide-slate-800/60">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0f1d] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4 whitespace-nowrap">UDISE Code</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Zone</th>
                <th className="py-3.5 px-4 min-w-[220px]">School Name</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">
                  Total Students Registered
                </th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">
                  Completed
                </th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">
                  In Progress
                </th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">
                  % of Completion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse"
                  >
                    Ranking top performing institutions...
                  </td>
                </tr>
              ) : topPerformers.length > 0 ? (
                topPerformers.map((item, idx) => {
                  const rankBadge =
                    idx === 0
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                      : idx === 1
                      ? 'bg-slate-300/20 text-slate-200 border-slate-300/50'
                      : idx === 2
                      ? 'bg-orange-400/20 text-orange-300 border-orange-400/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800';

                  return (
                    <tr
                      key={`${item.udiseCode}-${idx}`}
                      className="hover:bg-emerald-500/5 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 rounded-full text-xs font-mono font-bold border ${rankBadge}`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-cyan-500/70" />
                          {item.udiseCode}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.zone}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200 group-hover:text-emerald-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{item.schoolName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                        {item.totalStudents.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-300">
                        {item.completed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sky-300">
                        {item.inProgress.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center justify-end px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          {item.completionPercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-slate-500 text-sm"
                  >
                    No institutions found matching your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
        <span>
          Showing Top {topPerformers.length} performers{' '}
          {selectedZone === 'ALL'
            ? 'across District Kupwara'
            : `in Zone ${selectedZone}`}
        </span>
        <span className="font-mono text-slate-500">
          Ranked by % Completion &amp; Student Volume
        </span>
      </div>
    </div>
  );
}