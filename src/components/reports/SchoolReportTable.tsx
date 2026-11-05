// src/components/reports/SchoolReportTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Users, 
  GraduationCap, 
  Download,
  AlertCircle,
  CalendarClock
} from 'lucide-react';

export interface SchoolReportItem {
  _id: string;
  zone: string;
  udiseCode: string;
  schoolName: string;
  registeredOnHpc: string;
  totalStaff: number | null;
  staffRegisteredOnHpc: number | null;
  studentEnrollmentKto8: number | null;
  registeredStudentEnrollment: number | null;
  adminPhone?: string;
  submittedAt?: string;
}

interface SchoolReportTableProps {
  initialData: SchoolReportItem[];
}

export default function SchoolReportTable({ initialData }: SchoolReportTableProps) {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique zones dynamically from reported records
  const zones = useMemo(() => {
    const set = new Set<string>();
    initialData.forEach((item) => {
      if (item.zone) {
        const clean = item.zone.trim();
        set.add(clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase());
      }
    });
    return Array.from(set).sort();
  }, [initialData]);

  // Filter list by Zone and Search query, sorted by reported latest
  const filteredData = useMemo(() => {
    return initialData
      .filter((item) => {
        const itemZone = (item.zone || '').trim().toLowerCase();
        const matchesZone =
          selectedZone === 'ALL' || itemZone === selectedZone.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === '' ||
          (item.schoolName || '').toLowerCase().includes(query) ||
          (item.udiseCode || '').includes(query);

        return matchesZone && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeB - timeA; // Latest date and time first
      });
  }, [initialData, selectedZone, searchQuery]);

  // Summary statistics for current filtered view
  const stats = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        acc.totalStaff += curr.totalStaff || 0;
        acc.registeredStaff += curr.staffRegisteredOnHpc || 0;
        acc.totalStudents += curr.studentEnrollmentKto8 || 0;
        acc.registeredStudents += curr.registeredStudentEnrollment || 0;
        return acc;
      },
      { totalStaff: 0, registeredStaff: 0, totalStudents: 0, registeredStudents: 0 }
    );
  }, [filteredData]);

  // Helper function to format timestamp
  const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return { date: 'N/A', time: '' };
    try {
      const dateObj = new Date(timestamp);
      const date = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
      const time = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
      return { date, time };
    } catch {
      return { date: 'Invalid Date', time: '' };
    }
  };

  // Export filtered table directly to CSV
  const handleExportCSV = () => {
    const headers = [
      'Date & Time of Reporting',
      'S.No',
      'Zone',
      'UDISE',
      'Name of School',
      'Total Staff',
      'Staff Registered',
      'Total Roll (KG-8th)',
      'Students Registered',
    ];

    const rows = filteredData.map((s, index) => {
      const dt = s.submittedAt
        ? new Date(s.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : 'N/A';

      return [
        `"${dt}"`,
        index + 1,
        `"${s.zone || ''}"`,
        `"${s.udiseCode || ''}"`,
        `"${(s.schoolName || '').replace(/"/g, '""')}"`,
        s.totalStaff ?? (s.registeredOnHpc === 'No' ? 'Not Registered' : 0),
        s.staffRegisteredOnHpc ?? (s.registeredOnHpc === 'No' ? 'Not Registered' : 0),
        s.studentEnrollmentKto8 ?? (s.registeredOnHpc === 'No' ? 'Not Registered' : 0),
        s.registeredStudentEnrollment ?? (s.registeredOnHpc === 'No' ? 'Not Registered' : 0),
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `School_Report_${selectedZone}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Schools Reported</span>
          <span className="text-2xl font-black text-slate-100 font-mono mt-1 block">
            {filteredData.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-cyan-500/20">
          <span className="text-xs text-cyan-300 block">Total Staff Reported</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
            {stats.totalStaff.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Registered: <strong className="text-cyan-300">{stats.registeredStaff.toLocaleString()}</strong>
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-fuchsia-500/20">
          <span className="text-xs text-fuchsia-300 block">Total Roll (KG–8th)</span>
          <span className="text-2xl font-black text-fuchsia-400 font-mono mt-1 block">
            {stats.totalStudents.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Registered: <strong className="text-fuchsia-300">{stats.registeredStudents.toLocaleString()}</strong>
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-xs text-emerald-300">Pupil Sync Ratio</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {stats.totalStudents > 0
              ? `${((stats.registeredStudents / stats.totalStudents) * 100).toFixed(1)}%`
              : '0.0%'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">District Alignment</span>
        </div>
      </div>

      {/* Control Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#0e1626]/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3 flex-grow max-w-2xl">
          {/* Zone Dropdown */}
          <div className="relative min-w-[200px]">
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition cursor-pointer appearance-none"
            >
              <option value="ALL">All Zones ({zones.length})</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by school name or UDISE..."
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/50 transition active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Main Report Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#070b14]/80 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0e1626] border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {/* First Column: Date and Time of Reporting */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reported At</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-14">S.No</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">UDISE</th>
                <th className="py-3.5 px-4 min-w-[220px]">Name of School</th>
                <th className="py-3.5 px-4 text-center bg-cyan-950/20 border-l border-slate-800/80">
                  Total Staff
                </th>
                <th className="py-3.5 px-4 text-center bg-cyan-950/20">
                  Registered
                </th>
                <th className="py-3.5 px-4 text-center bg-fuchsia-950/20 border-l border-slate-800/80">
                  Total Roll
                </th>
                <th className="py-3.5 px-4 text-center bg-fuchsia-950/20">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const isHpcNo = item.registeredOnHpc === 'No';
                  const { date, time } = formatDateTime(item.submittedAt);

                  return (
                    <tr
                      key={item._id || `${item.udiseCode}-${index}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Date and Time of Reporting */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="text-slate-200 font-medium">{date}</div>
                        {time && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{time}</div>
                        )}
                      </td>

                      {/* 2. S.No */}
                      <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center">
                        {index + 1}
                      </td>

                      {/* 3. Zone */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                          {item.zone}
                        </span>
                      </td>

                      {/* 4. UDISE */}
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                        {item.udiseCode}
                      </td>

                      {/* 5. Name of School */}
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{item.schoolName}</span>
                        </div>
                      </td>

                      {/* 6. Total Staff */}
                      <td className="py-3 px-4 text-center font-mono border-l border-slate-800/80 bg-cyan-950/10 text-slate-200">
                        {isHpcNo ? (
                          <span className="text-xs text-amber-400 italic">Not Reg</span>
                        ) : (
                          item.totalStaff ?? 0
                        )}
                      </td>

                      {/* 7. Staff Registered */}
                      <td className="py-3 px-4 text-center font-mono bg-cyan-950/10 font-bold text-cyan-300">
                        {isHpcNo ? (
                          <span className="text-xs text-amber-400 italic">Not Reg</span>
                        ) : (
                          item.staffRegisteredOnHpc ?? 0
                        )}
                      </td>

                      {/* 8. Total Roll */}
                      <td className="py-3 px-4 text-center font-mono border-l border-slate-800/80 bg-fuchsia-950/10 text-slate-200">
                        {isHpcNo ? (
                          <span className="text-xs text-amber-400 italic">Not Reg</span>
                        ) : (
                          item.studentEnrollmentKto8 ?? 0
                        )}
                      </td>

                      {/* 9. Student Registered */}
                      <td className="py-3 px-4 text-center font-mono bg-fuchsia-950/10 font-bold text-fuchsia-300">
                        {isHpcNo ? (
                          <span className="text-xs text-amber-400 italic">Not Reg</span>
                        ) : (
                          item.registeredStudentEnrollment ?? 0
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-600" />
                      <span>No reported schools match the selected criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 gap-2">
        <span>Showing {filteredData.length} records</span>
        <span className="font-mono text-cyan-400">
          Live sync from schoolRegistration dataset
        </span>
      </div>
    </div>
  );
}