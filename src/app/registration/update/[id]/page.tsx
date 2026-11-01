// src/app/registration/update/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { School, Building2, MapPin, Phone, CheckCircle2, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

const ZONES = [
  'Chamkote', 'Drugmulla', 'Kupwara', 'Handwara',
  'Khumriyal', 'Kralpora', 'Langate', 'Mawer',
  'Rajwar', 'Sogam', 'Tangdar', 'Trehgam', 'Villgam'
];

export default function UpdateSchoolPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.id as string;

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

  const [initialLoading, setInitialLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch school details on mount
  useEffect(() => {
    async function fetchSchoolDetails() {
      try {
        const res = await fetch(`/api/school/${schoolId}`);
        if (!res.ok) throw new Error('Failed to load existing school details.');

        const data = await res.json();
        setFormData({
          udiseCode: data.udiseCode || '',
          schoolName: data.schoolName || '',
          zone: data.zone || '',
          registeredOnHpc: data.registeredOnHpc || 'No',
          reasonNotRegistered: data.reasonIfNotRegistered || '',
          totalStaff: data.totalStaff?.toString() || '',
          staffRegisteredHpc: data.staffRegisteredOnHpc?.toString() || '',
          studentEnrollment: data.studentEnrollmentKto8?.toString() || '',
          registeredStudentHpc: data.registeredStudentEnrollment?.toString() || '',
          adminPhone: data.adminPhone || '',
        });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message });
      } finally {
        setInitialLoading(false);
      }
    }

    if (schoolId) {
      fetchSchoolDetails();
    }
  }, [schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/school/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update school record.');
      }

      setStatusMessage({
        type: 'success',
        text: 'School record successfully updated in Sanity!',
      });

      // Optional redirect back after 2 seconds
      setTimeout(() => {
        router.push('/registration');
      }, 2000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-cyan-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm tracking-wider uppercase">Loading School Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Navigation & Header */}
        <button
          onClick={() => router.push('/registration')}
          className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registration
        </button>

        <div className="bg-[#0e1626]/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-950/70 border border-cyan-400/50 text-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.35)] shrink-0">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                Update School Record
              </h1>
              <p className="text-xs sm:text-sm text-cyan-200/60 mt-0.5">
                Editing existing data for UDISE: <span className="font-mono text-cyan-300">{formData.udiseCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
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

        {/* Update Form */}
        <form
          onSubmit={handleUpdate}
          className="bg-[#0e1626]/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 sm:p-8 space-y-6"
        >
          {/* UDISE Code (Read-Only) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              UDISE Code (Permanent Key)
            </label>
            <input
              type="text"
              name="udiseCode"
              disabled
              value={formData.udiseCode}
              className="w-full px-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-400 font-mono text-sm tracking-wider cursor-not-allowed"
            />
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
                className="w-full pl-11 pr-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
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
                className="w-full pl-11 pr-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 text-sm"
              >
                <option value="">Select Zone</option>
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

          {/* Reason If Not Registered */}
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
                className="w-full p-3 bg-[#0a0f1d] border border-amber-500/40 text-slate-100 rounded-lg focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>
          )}

          {/* Statistics If Registered */}
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
                    1. Total Staff <span className="text-fuchsia-400">*</span>
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

          {/* Admin Phone */}
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
                className="w-full pl-11 pr-4 py-3 bg-[#0a0f1d] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 text-sm font-mono tracking-wider"
              />
            </div>
          </div>

          {/* Update Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-sm text-[#070b14] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:brightness-110 active:scale-[0.99] transition shadow-[0_0_25px_rgba(34,211,238,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#070b14]" />
                Updating Record...
              </>
            ) : (
              'Update School Record'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}