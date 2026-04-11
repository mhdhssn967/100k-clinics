import React from 'react';
import { X, Award, Briefcase, GraduationCap, CheckCircle, Banknote } from 'lucide-react';

export default function PublicDoctorModal({ isOpen, onClose, doctor, onBook }) {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 pt-8 relative overflow-y-auto">
          {/* Avatar overlapped */}
          <div className="flex justify-between items-end mb-4">
            <div className="relative p-1 bg-white rounded-2xl shadow-sm">
               <img 
                 src={doctor.avatar || "https://ui-avatars.com/api/?name=" + doctor.name} 
                 alt={doctor.name} 
                 className="w-24 h-24 rounded-xl object-cover bg-slate-100" 
               />
               <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${doctor.available ? "bg-emerald-500" : "bg-slate-300"}`}>
                 {doctor.available && <CheckCircle size={10} className="text-white" strokeWidth={3}/>}
               </div>
            </div>
            <div className="pb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doctor.available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                {doctor.available ? "Available" : "Currently Busy"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h2>
            <p className="text-emerald-600 font-semibold text-sm mb-4">{doctor.specialty}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                   <Briefcase size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                  <p className="text-xs font-semibold text-slate-800">{doctor.experience || "N/A"}</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                   <Banknote size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</p>
                  <p className="text-xs font-semibold text-slate-800">{doctor.consultFee ? `₹${doctor.consultFee}` : "Contact Clinic"}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <GraduationCap size={14} /> About Doctor
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {doctor.bio?doctor.bio:(doctor.experience ? `With ${doctor.experience} of dedicated practice, ` : "An experienced professional, ")}
                
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => {
              onBook(doctor);
              onClose();
            }}
            disabled={!doctor.available}
            className={`w-full py-3.5 rounded-2xl text-[15px] font-bold transition-colors ${
              doctor.available 
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {doctor.available ? "Book Appointment" : "Unavailable for Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
