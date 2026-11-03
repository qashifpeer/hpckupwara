'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { School, Building2, MapPin, Phone, CheckCircle2, AlertCircle, Loader2, Sparkles, HelpCircle } from 'lucide-react';

const ZONES = [
  'Chamkote', 'Drugmulla', 'Kupwara', 'Handwara',
  'Khumriyal', 'Kralpora', 'Langate', 'Mawer',
  'Rajwar', 'Sogam', 'Tangdar', 'Trehgam', 'Villgam'
];

export default function RegistrationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    udiseCode: '',
    schoolName: '',
    zone: '',
    registeredOnHpc: '',
    reasonNotRegistered: '',
    totalStaff: '',
    staffRegisteredHpc: '',
    studentEnrollment: '',
    registeredStudentHpc: '',
    adminPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [checkingUdise, setCheckingUdise] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for duplicate prompt
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    isOpen: boolean;
    schoolId: string;
    schoolName: string;
    udise: string;
  } | null>(null);

  // Verify UDISE existence
  const checkDuplicateUdise = async (code: string) => {
    if (!/^0\d{10}$/.test(code)) return;
    setCheckingUdise(true);
    try {
      const res = await fetch(`/api/check-udise?udise=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.exists) {
        setDuplicatePrompt({
          isOpen: true,
          schoolId: data.schoolId,
          schoolName: data.schoolName,
          udise: code,
        });
      }
    } catch (err) {
      console.error('UDISE verification failed', err);
    } finally {
      setCheckingUdise(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Trigger check automatically once 11 digits are typed
    if (name === 'udiseCode' && value.length === 11 && /^0\d{10}$/.test(value)) {
      checkDuplicateUdise(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!/^0\d{10}$/.test(formData.udiseCode)) {
      setStatusMessage({
        type: 'error',
        text: 'UDISE Code must be exactly 11 digits and start with 0.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit the form.');
      }

      setStatusMessage({
        type: 'success',
        text: 'Record registered successfully in Database!',
      });

      setFormData({
        udiseCode: '',
        schoolName: '',
        zone: '',
        registeredOnHpc: '',
        reasonNotRegistered: '',
        totalStaff: '',
        staffRegisteredHpc: '',
        studentEnrollment: '',
        registeredStudentHpc: '',
        adminPhone: '',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Duplicate Alert Modal */}
      {duplicatePrompt?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0e1626] border border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.3)] rounded-2xl max-w-md w-full p-6 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <HelpCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-100">School Data exists</h2>
              <p className="text-sm text-slate-300">
                A record for <span className="text-cyan-400 font-semibold">{duplicatePrompt.schoolName}</span> (UDISE: {duplicatePrompt.udise}) already exists.
              </p>
              <p className="text-xs text-cyan-200/70 pt-1">Do you want to update it?</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDuplicatePrompt(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push(`/registration/update/${duplicatePrompt.schoolId}`)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:brightness-110 text-[#070b14] text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] transition"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-950/70 border border-cyan-400/50 text-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.35)] shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                  HPC Kupwara
                </h1>
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse hidden sm:inline" />
              </div>
              <p className="text-xs sm:text-sm text-cyan-200/60 mt-0.5">
                School Monitoring & Registration Portal
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 border backdrop-blur-md ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0e1626]/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 sm:p-8 space-y-6"
        >
          {/* UDISE Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                UDISE Code <span className="text-fuchsia-400">*</span>
              </label>
              {checkingUdise && (
                <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </span>
              )}
            </div>
            <input
              type="text"
              name="udiseCode"
              required
              maxLength={11}
              pattern="^0\d{10}$"
              value={formData.udiseCode}
              onChange={handleChange}
              onBlur={() => checkDuplicateUdise(formData.udiseCode)}
              placeholder="01234567890 (11 digits, starts with 0)"
              className="w-full px-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition text-sm font-mono tracking-wider"
            />
            <p className="text-xs text-slate-400 mt-1.5">Must be 11 numeric digits beginning with 0.</p>
          </div>

          {/* School Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
              Name of the School (as per UDISE) <span className="text-fuchsia-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 absolute left-3.5 top-3.5 text-cyan-500/70 pointer-events-none" />
              <input
                type="text"
                name="schoolName"
                required
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g., Govt Boys Middle School..."
                className="w-full pl-11 pr-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition text-sm"
              />
            </div>
          </div>

          {/* Zone Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
              Educational Zone <span className="text-fuchsia-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-cyan-500/70 pointer-events-none" />
              <select
                name="zone"
                required
                value={formData.zone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition text-sm appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0a0f1d] text-slate-400">Select Zone</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone} className="bg-[#0a0f1d] text-slate-100">{zone}</option>
                ))}
              </select>
            </div>
          </div>

          {/* HPC Registration Option */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3">
              Registered on HPC Portal? <span className="text-fuchsia-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['Yes', 'No'].map((opt) => {
                const isSelected = formData.registeredOnHpc === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center justify-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-sm font-semibold tracking-wide ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                        : 'bg-[#0a0f1d] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="registeredOnHpc"
                      value={opt}
                      checked={isSelected}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>

          {/* If No: Reason */}
          {formData.registeredOnHpc === 'No' && (
            <div className="p-5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300">
                Reason for not registering <span className="text-fuchsia-400">*</span>
              </label>
              <textarea
                name="reasonNotRegistered"
                required
                rows={3}
                value={formData.reasonNotRegistered}
                onChange={handleChange}
                placeholder="Specify reasons..."
                className="w-full p-3 bg-[#0a0f1d] border border-amber-500/40 text-slate-100 placeholder-slate-600 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
              />
            </div>
          )}

          {/* If Yes: Statistics */}
          {formData.registeredOnHpc === 'Yes' && (
            <div className="p-5 bg-cyan-950/20 border border-cyan-500/40 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-cyan-900/60 pb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  HPC Portal Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    1. Total Staff (Teaching only) <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalStaff"
                    min="0"
                    required
                    value={formData.totalStaff}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#0a0f1d] border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    2. Staff Registered on HPC <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="staffRegisteredHpc"
                    min="0"
                    required
                    value={formData.staffRegisteredHpc}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#0a0f1d] border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Enrollment (KG to 8th) <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="studentEnrollment"
                    min="0"
                    required
                    value={formData.studentEnrollment}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#0a0f1d] border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registered Students on HPC <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="registeredStudentHpc"
                    min="0"
                    required
                    value={formData.registeredStudentHpc}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#0a0f1d] border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
              Phone Number of School Admin <span className="text-fuchsia-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-3.5 text-cyan-500/70 pointer-events-none" />
              <input
                type="tel"
                name="adminPhone"
                required
                maxLength={10}
                pattern="^[6-9]\d{9}$"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full pl-11 pr-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-mono tracking-wider"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-sm text-[#070b14] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:brightness-110 active:scale-[0.99] transition shadow-[0_0_25px_rgba(34,211,238,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#070b14]" />
                Saving...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}