import { useStore } from "../../../store";
import { useSearchStore } from "../../../store/searchStore";
import ClinicCard from "./ClinicCard";
import DoctorCard from "./DoctorCard";
import { Hospital, Stethoscope, ChevronRight } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-36 bg-slate-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="flex gap-2 mt-3">
          <div className="h-3 bg-slate-100 rounded-full w-16" />
          <div className="h-3 bg-slate-100 rounded-full w-16" />
          <div className="h-3 bg-slate-100 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export default function ClinicList() {
  const clinics       = useSearchStore(s => s.results);
  const loading       = useStore(s => s.clinicsLoading);
  const searchQuery   = useSearchStore(s => s.query);
  const activeTab     = useSearchStore(s => s.activeTab);
  const specialty     = useSearchStore(s => s.specialty);
  const setSpecialty  = useSearchStore(s => s.setSpecialty);
  const setActiveTab  = useSearchStore(s => s.setActiveTab);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  // ── View: Doctors ────────────────────────────────────────────────────────
  if (activeTab === "doctor") {
    const allDoctors = clinics.flatMap(c => 
      (c.doctors || []).map(d => ({ ...d, clinic: c }))
    ).filter(d => {
      // 1. Search query filter
      const q = searchQuery?.toLowerCase().trim();
      const matchesQuery = !q || (
        d.name?.toLowerCase().includes(q) || 
        d.specialty?.toLowerCase().includes(q) ||
        d.clinic?.name?.toLowerCase().includes(q)
      );

      // 2. Specialty dropdown filter
      const s = specialty?.toLowerCase();
      const matchesSpecialty = !s || s === "all" || d.specialty?.toLowerCase().includes(s);

      return matchesQuery && matchesSpecialty;
    });

    if (allDoctors.length === 0) {
      return <EmptyState icon={Stethoscope} title="No doctors found" query={searchQuery} />;
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {allDoctors.map((d, i) => (
          <DoctorCard key={d.id || i} doctor={d} clinic={d.clinic} />
        ))}
      </div>
    );
  }

  // ── View: Specialties ──────────────────────────────────────────────────
  if (activeTab === "specialty") {
    // Group clinics by individual specialties (parsed from comma-separated strings)
    const specsMap = {};
    clinics.forEach(c => {
      const rawSpecs = c.specialty ? c.specialty.split(',').map(s => s.trim()) : ["General"];
      const doctorSpecs = (c.doctors || []).map(d => d.specialty).filter(Boolean);
      
      // Combine and unique-ify
      const allSpecs = [...new Set([...rawSpecs, ...doctorSpecs])];
      
      allSpecs.forEach(s => {
        if (!s) return;
        if (!specsMap[s]) specsMap[s] = [];
        if (!specsMap[s].find(existing => (existing.id || existing.clinicId) === (c.id || c.clinicId))) {
          specsMap[s].push(c);
        }
      });
    });

    const specs = Object.entries(specsMap)
      .filter(([name]) => {
        const q = searchQuery?.toLowerCase().trim();
        return !q || name.toLowerCase().includes(q);
      })
      .sort((a, b) => b[1].length - a[1].length);

    if (specs.length === 0) {
      return <EmptyState icon={Hospital} title="No matching specialties found" query={searchQuery} />;
    }

    return (
      <div className="space-y-10">
        {specs.map(([name, items]) => (
          <div key={name} className="relative">
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <h3 className="text-slate-900 font-black text-lg tracking-tight flex items-center gap-2">
                  {name}
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {items.length} {items.length === 1 ? 'Clinic' : 'Clinics'}
                  </span>
                </h3>
                {/* Green was bg-emerald-500 */}
                <div className="h-1 w-8 bg-sky-500 rounded-full mt-1" />
              </div>
              <button 
                onClick={() => { setSpecialty(name.toLowerCase()); setActiveTab("clinic"); }}
                /* Green was bg-emerald-50 text-emerald-600 hover:bg-emerald-100 */
                className="bg-sky-50 text-sky-600 text-[11px] font-bold px-3 py-1 rounded-full hover:bg-sky-100 transition-colors flex items-center gap-0.5"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {items.slice(0, 3).map(c => (
                <ClinicCard key={c.id || c.clinicId} clinic={c} searchQuery={searchQuery} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── View: Clinics (Default) ─────────────────────────────────────────────
  if (clinics.length === 0) {
    return <EmptyState icon={Hospital} title="No clinics found" query={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {clinics.map(c => <ClinicCard key={c.id} clinic={c} searchQuery={searchQuery} />)}
    </div>
  );
}

function EmptyState({ icon: Icon, title, query }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="text-slate-300 mb-3" />
      <p className="text-slate-600 font-semibold">{title}</p>
      <p className="text-slate-400 text-sm mt-1">
        {query ? `No results for "${query}"` : "Try changing filters"}
      </p>
    </div>
  );
}