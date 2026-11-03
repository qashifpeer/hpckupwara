// src/components/dashboard/PendingSchoolsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, Search, School, Hash, MapPin, Building2 } from 'lucide-react';

export interface PendingSchool {
  udiseCode: string;
  schoolName: string;
  zone: string;
}

export interface PendingSchoolsTableProps {
  pendingSchools: PendingSchool[];
  zones: string[];
}

export default function PendingSchoolsTable({
  pendingSchools,
  zones,
}: PendingSchoolsTableProps) {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter based on Zone & Search query
  const filteredSchools = useMemo(() => {
    return pendingSchools.filter((school) => {
      const matchesZone =
        selectedZone === 'ALL' ||
        school.zone.toLowerCase() === selectedZone.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === '' ||
        school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.udiseCode.includes(searchQuery.trim());

      return matchesZone && matchesSearch;
    });
  }, [pendingSchools, selectedZone, searchQuery]);

  return (
    <div
      id="pending-schools-section"
      className="bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-[0_0_35px_rgba(245,158,11,0.12)] relative overflow-hidden space-y-6 scroll-mt-10"
    >
      {/* Background Amber Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Action Required • Pending HPC Data Sync
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            Pending Institutions Directory
          </h2>
          {/* <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Schools listed below exist in the Master UDISE Directory but have not completed their profile in{' '}
            <code className="text-cyan-400 font-mono text-xs">dataCompleted</code>.
          </p> */}
        </div>

        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-2xl font-black text-amber-300 font-mono block leading-none">
              {filteredSchools.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {selectedZone === 'ALL' ? 'Total Pending' : `Pending in ${selectedZone}`}
            </span>
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
            <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition cursor-pointer appearance-none"
            >
              <option value="ALL">All Zones ({zones.length})</option>
              {zones.map((zone) => (
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
            Search School / UDISE Code
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type school name or 11-digit UDISE..."
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
            />
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
                <th className="py-3.5 px-4">UDISE Code</th>
                <th className="py-3.5 px-4">School Name</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {filteredSchools.length > 0 ? (
                filteredSchools.map((item, idx) => (
                  <tr
                    key={item.udiseCode}
                    className="hover:bg-amber-500/5 transition-colors group"
                  >
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      <div className="inline-flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-cyan-500/70" />
                        {item.udiseCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 group-hover:text-amber-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{item.schoolName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {item.zone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-950/50 text-amber-300 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                    No pending schools found matching your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
        <span>Showing {filteredSchools.length} of {pendingSchools.length} pending institutions across District Kupwara</span>
      </div>
    </div>
  );
}