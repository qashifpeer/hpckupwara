// src/components/ui/Loader.tsx
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export default function Loader({
  message = 'Loading District Data...',
  subMessage = 'Synchronizing HPC records across District Kupwara',
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8 relative overflow-hidden select-none">
      {/* Background radial ambient glow */}
      <div className="absolute w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-56 h-56 bg-fuchsia-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Spinning Loader Mechanism */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-6">
        {/* Outer Pulsing Aura Ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-30" />

        {/* Counter-Clockwise Outer Cyan Gradient Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-l-cyan-500/30 animate-spin [animation-duration:2.5s]" />

        {/* Clockwise Middle Fuchsia Gradient Ring */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-fuchsia-400 border-r-fuchsia-500/40 animate-spin [animation-direction:reverse] [animation-duration:1.8s]" />

        {/* Inner Glowing Core */}
        <div className="relative w-16 h-16 rounded-2xl bg-[#0e1626]/90 border border-cyan-400/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          <Sparkles className="w-7 h-7 text-cyan-300 animate-pulse" />
        </div>
      </div>

      {/* Text Indicator */}
      <div className="text-center space-y-2 relative z-10 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase shadow-[0_0_12px_rgba(34,211,238,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          PARAKH HPC Live Sync
        </div>
        
        <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-300 bg-clip-text text-transparent">
          {message}
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          {subMessage}
        </p>
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 mt-6 relative">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 w-1/2 rounded-full animate-[progress_1.6s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}