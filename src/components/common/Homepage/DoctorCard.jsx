// components/home/DoctorCard.jsx
import React from "react";
import { Star, Clock, Users, ChevronRight, Stethoscope, Briefcase, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../store";

export default function DoctorCard({ doctor, clinic }) {
  const navigate = useNavigate();
  const openDoctorDetailModal = useStore(s => s.openDoctorDetailModal);

  const handleClick = () => {
    openDoctorDetailModal(doctor, clinic);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.99] transition-all duration-200 p-4"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f1f5f9&color=64748b`}
            alt={doctor.name}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-100 bg-slate-50"
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
            doctor.available ? "bg-emerald-500" : "bg-slate-300"
          }`}>
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="text-slate-900 font-bold text-[16px] leading-tight truncate">{doctor.name}</h3>
            <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
          </div>
          
          <p className="text-emerald-600 text-[12px] font-bold mb-2 flex items-center gap-1">
            <Stethoscope size={12} strokeWidth={2.5} />
            {doctor.specialty}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Briefcase size={11} className="text-slate-400" />
              {doctor.experience || "N/A"}
            </span>
            <span className="w-px h-2.5 bg-slate-200" />
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <IndianRupee size={11} className="text-slate-400" />
              {doctor.consultFee || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Clinic Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
             <Users size={12} className="text-slate-500" />
          </div>
          <span className="text-slate-600 text-[12px] font-bold truncate max-w-[150px]">
            {clinic.name}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          View Profile
        </span>
      </div>
    </button>
  );
}
