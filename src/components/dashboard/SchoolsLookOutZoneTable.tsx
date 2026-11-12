// src/components/dashboard/SchoolsLookOutZoneTable.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  Search,
  School,
  Hash,
  MapPin,
  Building2,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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

export interface ZeroPerformanceRow {
  udiseCode: string;
  zone: string;
  schoolName: string;
  totalStudents: number;
  completed: number;
  inProgress: number;
  completionPercentage: number;
}

export default function SchoolsLookOutZoneTable() {
  const [rows, setRows] = useState<ZeroPerformanceRow[]>([]);
  const [zonesList, setZonesList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchZeroPerformanceSchools() {
      try {
        const query = `{
          "zones": *[_type == "zones"][0...100]{
            zone,
            code
          },
          "reports": *[_type == "dailyreport"][0...5000]{
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

        const mappedRows: ZeroPerformanceRow[] = rawReports
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
          })
          .filter((school) => school.completed === 0);

        setRows(mappedRows);
      } catch (error) {
        console.error('Failed to fetch zero performance schools:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchZeroPerformanceSchools();
  }, []);

  const filteredSchools = useMemo(() => {
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

        return matchesZone && matchesSearch;
      })
      .sort((a, b) => b.totalStudents - a.totalStudents);
  }, [rows, selectedZone, searchQuery]);

  // Download filtered records as an Excel (.xlsx) file
  const handleDownloadExcel = () => {
    if (filteredSchools.length === 0) return;

    const exportData = filteredSchools.map((item, idx) => ({
      'S.No': idx + 1,
      'UDISE Code': String(item.udiseCode),
      Zone: item.zone,
      'School Name': item.schoolName,
      'Total Students Registered': item.totalStudents,
      Completed: item.completed,
      'In Progress': item.inProgress,
      '% of Completion': `${item.completionPercentage.toFixed(1)}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns cleanly
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 14 },
      { wch: 40 },
      { wch: 24 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LookOutSchools');

    const dateStamp = new Date().toISOString().split('T')[0];
    const zoneTag = selectedZone === 'ALL' ? 'All_Zones' : `Zone_${selectedZone}`;
    XLSX.writeFile(workbook, `HPC_LookOut_Schools_${zoneTag}_${dateStamp}.xlsx`);
  };

  return (
    <div
      id="schools-lookout-section"
      className="bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-rose-500/30 p-6 sm:p-8 shadow-[0_0_35px_rgba(244,63,94,0.12)] relative overflow-hidden space-y-6 scroll-mt-10"
    >
      {/* Background Rose Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            Critical Follow-Up • 0% Completion
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            Schools Look Out Zone
          </h2>
        </div>

        <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-2xl font-black text-rose-300 font-mono block leading-none">
              {loading ? '...' : filteredSchools.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {selectedZone === 'ALL'
                ? 'Zero-Progress Schools'
                : `Zero-Progress in ${selectedZone}`}
            </span>
          </div>
        </div>
      </div>

      {/* Controls: Zone Dropdown + Search Bar + Download Button */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {/* Zone Dropdown */}
        <div className="relative">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Filter by Zone
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-400 transition cursor-pointer appearance-none"
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

        {/* Live Search Input + Download Icon Button */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Search UDISE Code / School Name
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type 11-digit UDISE code or school name..."
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={loading || filteredSchools.length === 0}
              title="Download filtered list as Excel (.xlsx)"
              aria-label="Download Excel"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                Excel
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#070b14]/70">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto divide-y divide-slate-800/60 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0f1d] sticky top-0 z-10 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
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
                    Scanning for 0% completion institutions...
                  </td>
                </tr>
              ) : filteredSchools.length > 0 ? (
                filteredSchools.map((item, idx) => (
                  <tr
                    key={`${item.udiseCode}-${idx}`}
                    className="hover:bg-rose-500/5 transition-colors group"
                  >
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center">
                      {idx + 1}
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
                    <td className="py-3 px-4 font-medium text-slate-200 group-hover:text-rose-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{item.schoolName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {item.totalStudents.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {item.completed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sky-300">
                      {item.inProgress.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center justify-end px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                        0.0%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-slate-500 text-sm"
                  >
                    No zero-performance schools found matching your current filter.
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
          Showing {filteredSchools.length} of {rows.length} zero-completion
          institutions across District Kupwara
        </span>
        <span className="font-mono text-slate-500">
          Sorted by Highest Student Roll • 0% Completed
        </span>
      </div>
    </div>
  );
}