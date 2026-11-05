'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { School, Menu, X, Home, UserPlus, FileSpreadsheet } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Registration', href: '/registration', icon: UserPlus },
    { name: 'Reports', href: '/schoolreport', icon: FileSpreadsheet },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#070b14]/85 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-400/50 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-200">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                HPC KUPWARA
              </span>
              <span className="hidden sm:block text-[10px] text-cyan-300/60 uppercase tracking-widest -mt-1 font-mono">
                Monitoring Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    active
                      ? 'bg-cyan-950/60 border border-cyan-400/80 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0e1626] border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0a0f1d]/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-cyan-950/70 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-cyan-400 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}