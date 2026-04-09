// pages/patient/ClinicDetail.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added for routing
import { ArrowLeft, Star, MapPin, Phone, Clock, Users, CheckCircle, Calendar, ChevronRight } from "lucide-react";
import { useStore } from "../../../store";

function DoctorCard({ doctor }) {
  const openBookingModal = useStore(s => s.openBookingModal);
  const selectedClinic   = useStore(s => s.selectedClinic);

  return (
    <div className="flex items-center gap-3.5 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="relative flex-shrink-0">
        <img 
          src={doctor.avatar || "https://ui-avatars.com/api/?name=" + doctor.name} 
          alt={doctor.name} 
          className="w-14 h-14 rounded-xl object-cover bg-slate-100" 
        />
        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          doctor.available ? "bg-emerald-500" : "bg-slate-300"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 font-bold text-sm leading-tight">{doctor.name}</p>
        <p className="text-emerald-600 text-xs font-medium mt-0.5">{doctor.specialty}</p>
        <p className="text-slate-400 text-xs mt-0.5">{doctor.experience || "New"} exp.</p>
      </div>
      {doctor.available ? (
        <button
          onClick={() => openBookingModal(selectedClinic, doctor)}
          className="flex-shrink-0 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Book
        </button>
      ) : (
        <span className="flex-shrink-0 text-slate-400 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200">
          Busy
        </span>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-3">{children}</p>
  );
}

export default function ClinicDetail() {
  const { id } = useParams(); // Get ID from URL /clinic/:id
  const navigate = useNavigate();
  
  const clinic           = useStore(s => s.selectedClinic);
  const loadClinicById   = useStore(s => s.loadClinicById);
  const openBookingModal = useStore(s => s.openBookingModal);
  const loading          = useStore(s => s.clinicsLoading);

  // Fetch data on mount or when ID changes
  useEffect(() => {
    if (id) loadClinicById(id);
  }, [id, loadClinicById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white animate-pulse">
        <div className="h-64 bg-slate-100" />
        <div className="p-5 space-y-4">
          <div className="h-6 bg-slate-100 rounded-xl w-2/3" />
          <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!clinic) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <p className="text-slate-400 mb-4">Clinic details not found.</p>
      <button onClick={() => navigate("/home")} className="text-slate-900 font-bold text-sm">Go Back Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={clinic.coverImage || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"} 
          alt={clinic.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Back */}
        <button
          onClick={() => navigate(-1)} // Use browser history to go back
          className="absolute top-12 left-4 w-9 h-9 bg-black/30 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20"
        >
          <ArrowLeft size={17} />
        </button>

        {/* Status */}
        <span className={`absolute top-12 right-4 text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
          clinic.isOpen ? "bg-white/90 text-emerald-700" : "bg-white/20 backdrop-blur-md text-white/80"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${clinic.isOpen ? "bg-emerald-500" : "bg-slate-400"}`} />
          {clinic.isOpen ? `Open till ${clinic.openUntil || 'Closing'}` : "Closed"}
        </span>

        {/* Name block */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{clinic.specialty}</p>
          <h1 className="text-white text-2xl font-bold tracking-tight leading-tight">{clinic.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-white font-bold text-sm">{clinic.rating || "5.0"}</span>
              <span className="text-white/60 text-xs">({clinic.reviewCount || 0})</span>
            </div>
            <span className="w-px h-3.5 bg-white/30" />
            <span className="text-white/70 text-xs flex items-center gap-1">
              <MapPin size={11} /> {clinic.distance || "Location shared"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick info bar */}
      <div className="grid grid-cols-3 border-b border-slate-100">
        {[
          { label: "Wait Time", value: clinic.waitTime || "N/A", Icon: Clock },
          { label: "Doctors",   value: `${clinic.doctors?.length || 0} avail.`, Icon: Users },
          { label: "Phone",     value: "Call",          Icon: Phone },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1 py-4 px-2 border-r border-slate-100 last:border-r-0">
            <Icon size={14} className="text-slate-400" />
            <span className="text-slate-800 text-xs font-bold">{value}</span>
            <span className="text-slate-400 text-[10px]">{label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pt-6 space-y-8">
        {/* About */}
        {clinic.description && (
          <div>
            <SectionLabel>About</SectionLabel>
            <p className="text-slate-600 text-sm leading-relaxed">{clinic.description}</p>
            <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-xs">
              <MapPin size={11} /> {clinic.address}
            </div>
          </div>
        )}

        {/* Facilities - Only show if there are some */}
        {clinic.facilities?.length > 0 && (
          <div>
            <SectionLabel>Facilities</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {clinic.facilities.map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-xl">
                  <CheckCircle size={11} className="text-emerald-500" /> {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Doctors - Show empty state if none */}
        <div>
          <SectionLabel>Doctors</SectionLabel>
          <div className="space-y-3">
            {clinic.doctors?.length > 0 ? (
               clinic.doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-slate-400 text-xs">No doctors added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Time Slots */}
        {clinic.timeSlots?.length > 0 && (
          <div>
            <SectionLabel>Available Times</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {clinic.timeSlots.map(slot => (
                <span key={slot} className="bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-5 pb-6 pt-3 bg-white/90 backdrop-blur-xl border-t border-slate-100">
        <button
          onClick={() => openBookingModal(clinic)}
          disabled={!clinic.isOpen || !clinic.doctors?.length}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all ${
            (clinic.isOpen && clinic.doctors?.length > 0)
              ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {clinic.isOpen 
            ? (clinic.doctors?.length > 0 ? "Book an Appointment" : "No Doctors Available") 
            : "Clinic is Closed"}
        </button>
      </div>
    </div>
  );
}