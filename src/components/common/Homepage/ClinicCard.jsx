// components/home/ClinicCard.jsx
import { Star, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { useStore } from "../../../store";
import { useNavigate } from "react-router-dom";

export default function ClinicCard({ clinic }) {
  const navigate = useNavigate();
  const loadClinicById = useStore(s => s.loadClinicById);
  const setActivePage  = useStore(s => s.setActivePage);
 
  const handleClick = () => {
    navigate(`/clinic/${clinic.id || clinic.clinicId}`);
    setActivePage("clinic-detail");
  };
 
  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.99] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={clinic.coverImage}
          alt={clinic.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
 
        {/* Status pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg backdrop-blur-md ${
            clinic.isOpen ? "bg-white/90 text-emerald-700" : "bg-black/50 text-white/80"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${clinic.isOpen ? "bg-emerald-500" : "bg-slate-400"}`} />
            {clinic.isOpen ? `Open till ${clinic.openUntil}` : "Closed"}
          </span>
        </div>
 
        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-1 rounded-lg">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          {clinic.rating}
          <span className="text-slate-400 font-normal">({clinic.reviewCount})</span>
        </div>
 
        {/* Specialty bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-white/90 text-[11px] font-medium bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {clinic.specialty}
          </span>
        </div>
      </div>
 
      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-slate-900 font-bold text-[15px] leading-tight">{clinic.name}</h3>
          <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-slate-400 text-xs mb-3 leading-relaxed">{clinic.tagline}</p>
 
        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={10} strokeWidth={2.5} className="text-slate-400" />
            {clinic.distance}
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="flex items-center gap-1">
            <Clock size={10} strokeWidth={2.5} className="text-slate-400" />
            {clinic.waitTime} wait
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span>{clinic.doctors.length} doctors</span>
        </div>
 
        {/* Tags */}
        <div className="flex gap-1.5">
          {clinic?.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
