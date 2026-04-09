import { useEffect } from "react";
import { Power, Save, ChevronDown } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "doctors",  label: "Doctors" },
  { id: "slots",    label: "Time Slots" },
  { id: "settings", label: "Settings" },
];

export default function AdminHeader({ clinicId }) {
    
  const clinic           = useAdminStore(s => s.clinic);
  const loading          = useAdminStore(s => s.loading);
  const saving           = useAdminStore(s => s.saving);
  const activeSection    = useAdminStore(s => s.activeSection);
  const setActiveSection = useAdminStore(s => s.setActiveSection);
  const toggleOpen       = useAdminStore(s => s.toggleOpen);
  const fetchClinicData  = useAdminStore(s => s.fetchClinicData);


  // 1. Fetch data on mount
  useEffect(() => {
    if (clinicId) {
      fetchClinicData(clinicId);
    }
  }, [clinicId, fetchClinicData]);

  // 2. Handle Loading State
  if (loading || !clinic) {
    return (
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 px-5 pt-12 pb-8 animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
        <div className="h-6 w-48 bg-slate-100 rounded" />
      </div>
    );
  }

  // 3. Render once clinic data is available
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div className="min-w-0">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">Admin Panel</p>
          <h1 className="text-slate-900 text-lg font-bold tracking-tight truncate">{clinic.name}</h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {saving && (
            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5 mr-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Saving…
            </span>
          )}

          <button
            onClick={toggleOpen}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              clinic.isOpen
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full transition-colors ${clinic.isOpen ? "bg-emerald-500" : "bg-slate-400"}`} />
            {clinic.isOpen ? "Open" : "Closed"}
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex overflow-x-auto scrollbar-hide px-5 gap-1 pb-0">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-all duration-150 ${
              activeSection === s.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}