import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, Clock, Users, CheckCircle, ChevronDown, ChevronUp, Globe, Mail } from "lucide-react";
import { useStore } from "../../../store";
import PublicDoctorModal from "./PublicDoctorModal";

function ExpandedText({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  return (
    <div>
      <p className={`text-slate-600 text-sm leading-relaxed transition-all ${!expanded && 'line-clamp-3'}`}>
        {text}
      </p>
      {text.length > 200 && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-emerald-600 text-xs font-bold mt-1.5 flex items-center gap-1 hover:text-emerald-700 hover:underline"
        >
          {expanded ? "Show less" : "Read more"} {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
        </button>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">{children}</p>
  );
}

export default function ClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clinic = useStore(s => s.selectedClinic);
  const loadClinicById = useStore(s => s.loadClinicById);
  const openBookingModal = useStore(s => s.openBookingModal);
  const loading = useStore(s => s.clinicsLoading);
  const user = useStore(s => s.user);

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    if (id) loadClinicById(id);
  }, [id, loadClinicById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white animate-pulse">
        <div className="h-72 bg-slate-100" />
        <div className="px-5 py-8 space-y-4">
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

  const specialties = ["All", ...new Set((clinic.doctors || []).map(d => d.specialty).filter(Boolean))];

  const filteredDoctors = clinic.doctors?.filter(doc => activeFilter === "All" || doc.specialty === activeFilter) || [];

  // Group doctors by specialty
  const groupedDoctors = filteredDoctors.reduce((acc, doc) => {
    const spec = doc.specialty || "General Practice";
    if (!acc[spec]) acc[spec] = [];
    acc[spec].push(doc);
    return acc;
  }, {});

  const handleBookSelectedDoctor = (doc) => {
    if (!user) navigate("/login/user");
    else openBookingModal(clinic, doc);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Revamp */}
      <div className="relative h-[300px] overflow-hidden bg-slate-900">
        <img 
          src={clinic.coverImage || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"} 
          alt={clinic.name} 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-5 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <span className={`absolute top-12 right-5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm ${
          clinic.isOpen ? "bg-emerald-500 text-white" : "bg-slate-800/80 text-slate-300 backdrop-blur-md"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${clinic.isOpen ? "bg-white" : "bg-slate-400"}`} />
          {clinic.isOpen ? `Open till ${clinic.openUntil || 'Late'}` : "Closed"}
        </span>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">{clinic.specialty}</p>
          <h1 className="text-white text-3xl font-extrabold tracking-tight leading-tight mb-3">{clinic.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-white font-bold text-xs">{clinic.rating || "5.0"}</span>
            </div>
            <span className="text-slate-300 text-xs flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-400" /> {clinic.distance || "Location shared"}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Stats Bar */}
      <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50">
        {[
          { label: "Wait Time", value: clinic.waitTime || "N/A", Icon: Clock },
          { label: "Doctors",   value: `${clinic.doctors?.length || 0} Expert(s)`, Icon: Users },
          { label: "Phone",     value: clinic.phone || "N/A", Icon: Phone },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 border-r border-slate-200 last:border-r-0 text-center">
            <Icon size={16} className="text-emerald-500 shrink-0" />
            <span className="text-slate-800 text-xs font-extrabold">{value}</span>
            <span className="text-slate-400 text-[10px] tracking-wide uppercase font-semibold">{label}</span>
          </div>
        ))}
      </div>

      <div className="px-6 pt-8 space-y-10">
        
        {/* Overview & Quick Links */}
        <div className="space-y-4">
          <SectionLabel>About Clinic</SectionLabel>
          <ExpandedText text={clinic.description || clinic.tagline || "No description provided yet."} />
          
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            {clinic.address && (
               <div className="flex items-start gap-2.5 text-slate-600">
                  <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed font-medium">{clinic.address}</span>
               </div>
            )}
            {clinic.website && (
               <div className="flex items-center gap-2.5 text-emerald-600 font-bold">
                  <Globe size={14} className="text-emerald-500 shrink-0" /> 
                  <a href={`https://${clinic.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{clinic.website}</a>
               </div>
            )}
            {clinic.email && (
               <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                  <Mail size={14} className="text-slate-400 shrink-0" /> 
                  <a href={`mailto:${clinic.email}`} className="hover:text-emerald-600 transition-colors">{clinic.email}</a>
               </div>
            )}
          </div>
        </div>

        {/* Facilities */}
        {clinic.facilities?.length > 0 && (
          <div>
            <SectionLabel>Facilities & Amenities</SectionLabel>
            <div className="flex flex-wrap gap-2.5 text-[11px] font-semibold text-slate-600">
              {clinic.facilities.map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3.5 py-1.5 rounded-full">
                  <CheckCircle size={12} className="text-emerald-600" /> {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Categorized */}
        <div>
          <SectionLabel>Our Specialists</SectionLabel>
          
          {/* Dynamic Filters */}
          {specialties.length > 2 && (
             <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-1">
                {specialties.map(spec => (
                   <button 
                     key={spec}
                     onClick={() => setActiveFilter(spec)}
                     className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                       activeFilter === spec 
                         ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                         : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                     }`}
                   >
                     {spec}
                   </button>
                ))}
             </div>
          )}

          {/* Grouped Doctors */}
          <div className="space-y-6">
            {Object.keys(groupedDoctors).length > 0 ? (
               Object.entries(groupedDoctors).map(([spec, doctors]) => (
                  <div key={spec}>
                     <h3 className="text-[13px] font-extrabold text-slate-800 mb-3 uppercase tracking-wider">{spec}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doctors.map(doc => (
                           <div 
                             key={doc.id}
                             onClick={() => setSelectedDoctor(doc)}
                             className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                           >
                              <div className="flex items-center gap-3.5 min-w-0">
                                 <div className="relative shrink-0">
                                   <img 
                                      src={doc.avatar || "https://ui-avatars.com/api/?name=" + doc.name} 
                                      alt={doc.name} 
                                      className="w-[52px] h-[52px] rounded-xl object-cover bg-slate-100 group-hover:scale-105 transition-transform" 
                                   />
                                   <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                      doc.available ? "bg-emerald-500" : "bg-slate-300"
                                   }`} />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="font-extrabold text-slate-900 text-sm leading-tight truncate">{doc.name}</p>
                                   <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide truncate">{doc.experience || "New"} experience</p>
                                 </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-50 border border-slate-100 group-hover:border-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                                <ChevronDown size={14} className="text-slate-400 group-hover:text-emerald-500 -rotate-90" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ))
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium text-sm">No specialists found for this area.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer for standard booking (no doctor pre-selection) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-6 pb-6 pt-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40">
        <button
          onClick={() => {
            if (!user) navigate("/login/user");
            else openBookingModal(clinic);
          }}
          disabled={!clinic.isOpen || !clinic.doctors?.length}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
            (clinic.isOpen && clinic.doctors?.length > 0)
              ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[0.99]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          {clinic.isOpen 
            ? (clinic.doctors?.length > 0 ? "Book General Appointment" : "No Doctors Available") 
            : "Clinic is Closed"}
        </button>
      </div>

      <PublicDoctorModal 
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        doctor={selectedDoctor}
        onBook={handleBookSelectedDoctor}
      />
    </div>
  );
}