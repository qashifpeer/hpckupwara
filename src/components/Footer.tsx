// src/components/Footer.tsx
import React from 'react';
import { ShieldAlert, UserCheck, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/90 bg-[#060a12]/95 backdrop-blur-xl relative z-20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Leadership: CEO */}
          <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 flex flex-col justify-center">
            <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Chief Education Officer
              </span>
            </div>
            <p className="text-base font-bold text-slate-100 tracking-wide">
              Manzoor Ahmad
            </p>
            <p className="text-xs text-slate-400 mt-0.5">District Kupwara</p>
          </div>

          {/* Leadership: DNO */}
          <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 flex flex-col justify-center">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                DNO HPC PARAKH
              </span>
            </div>
            <p className="text-base font-bold text-slate-100 tracking-wide">
              Javaid Abdullah
            </p>
            <p className="text-xs text-slate-400 mt-0.5">District Kupwara</p>
          </div>

          {/* Technical Development */}
          <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-slate-800/90 flex flex-col justify-center">
            <div className="flex items-center justify-center md:justify-start gap-2 text-fuchsia-400 mb-1">
              <Code2 className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Technical Architecture
              </span>
            </div>
            <p className="text-base font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
              Qashif Peer
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Developed and Maintained</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} HPC Kupwara Monitoring Portal. All Rights Reserved.</p>
          <p className="font-mono text-[11px] text-cyan-300/80">PARAKH Implementation Framework</p>
        </div>
      </div>
    </footer>
  );
}