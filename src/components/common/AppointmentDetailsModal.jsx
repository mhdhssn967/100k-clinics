import React from 'react';
import { X, Calendar, Clock, User, Phone, Stethoscope, AlertCircle, MapPin } from 'lucide-react';

export default function AppointmentDetailsModal({ isOpen, onClose, appt }) {
  if (!isOpen || !appt) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Booking Details</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
               appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
               appt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
               'bg-sky-100 text-sky-700' // Confirmed/Pending
            }`}>
              {appt.status}
            </span>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-1 text-slate-500"><Calendar size={14}/> {appt.date}</span>
              <span className="flex items-center gap-1 text-slate-500"><Clock size={14}/> {appt.time}</span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Patient Information</p>
             <div>
               <p className="text-sm font-bold text-slate-900">{appt.patientName}</p>
               <p className="text-xs text-slate-500 mt-0.5">
                  {appt.patientAge ? `${appt.patientAge} years old` : 'Age N/A'} • {appt.patientGender || 'Gender N/A'}
               </p>
               {(appt.patientPhone || appt.phone) && (
                 <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Phone size={11} className="text-slate-400"/> {appt.patientPhone || appt.phone}</p>
               )}
             </div>
          </div>

          {/* Reason / Issue */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle size={12}/> Reason for visit</p>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 text-sm text-slate-700 leading-relaxed italic">
               "{appt.notes || "No specific reason provided."}"
            </div>
          </div>

          {/* Clinic & Doctor Details */}
          <div className="pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Stethoscope size={12}/> Doctor</p>
               <p className="text-sm font-bold text-slate-900">{appt.doctorName}</p>
               <p className="text-[11px] text-emerald-600 font-medium">{appt.doctorSpecialty}</p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={12}/> Clinic</p>
               <p className="text-sm font-bold text-slate-900 truncate" title={appt.clinicName}>{appt.clinicName}</p>
               {appt.clinicAddress && <p className="text-[11px] text-slate-500 truncate" title={appt.clinicAddress}>{appt.clinicAddress}</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
