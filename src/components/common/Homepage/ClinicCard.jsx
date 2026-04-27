// components/home/ClinicCard.jsx
import { Star, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { useStore } from "../../../store";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function ClinicCard({ clinic, searchQuery }) {
  const navigate = useNavigate();
  const loadClinicById = useStore(s => s.loadClinicById);
  const setActivePage  = useStore(s => s.setActivePage);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useEffect(() => {
    // We'll use a ref to sync the auto-scroll with the visual state
  }, []);
  const internalScrollRef = React.useRef(null);
  const gallery = clinic.gallery || [clinic.coverImage];

  useEffect(() => {
    if (gallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const next = (prev + 1) % gallery.length;
        if (internalScrollRef.current) {
          internalScrollRef.current.scrollTo({
            left: next * internalScrollRef.current.offsetWidth,
            behavior: "smooth"
          });
        }
        return next;
      });
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [gallery]);

  const handleScroll = (e) => {
    e.stopPropagation();
    const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
    if (index !== currentImageIndex) setCurrentImageIndex(index);
  };

  const goToImage = (e, index) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
    if (internalScrollRef.current) {
      internalScrollRef.current.scrollTo({
        left: index * internalScrollRef.current.offsetWidth,
        behavior: "smooth"
      });
    }
  };
 
  const handleClick = () => {
    navigate(`/clinic/${clinic.id || clinic.clinicId}`);
    setActivePage("clinic-detail");
  };
 
  return (
    <div
      onClick={handleClick}
      className="w-full text-left bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.99] transition-all duration-200 cursor-pointer"
    >
      {/* Image Slider */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <div 
          ref={internalScrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {gallery.map((img, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 snap-start">
              <img
                src={img}
                alt={`${clinic.name} view ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />

        {/* Slider dots */}
        {gallery.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {gallery.map((_, i) => (
              <button 
                key={i}
                onClick={(e) => goToImage(e, i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentImageIndex ? "bg-white scale-125 shadow-sm" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
 
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
        <p className="text-slate-600 text-[13px] font-medium mb-3 leading-relaxed line-clamp-2 italic opacity-90">
          {clinic.tagline}
        </p>
 
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
          <span>{clinic.doctors?.length || 0} doctors</span>
        </div>

        {/* Matching Doctor Badge (if searching) */}
        {searchQuery && clinic.doctors?.some(d => 
          d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
        ) && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Users size={12} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Matching Specialist</p>
              <p className="text-[11px] text-emerald-600 font-medium truncate">
                {clinic.doctors.find(d => 
                  d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
                )?.name}
              </p>
            </div>
          </div>
        )}
 
        {/* Tags & Action Row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1.5">
            {clinic?.tags?.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              useStore.getState().openBookingModal(clinic);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm shadow-emerald-100 transition-all active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
