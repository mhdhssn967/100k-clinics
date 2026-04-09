// components/home/ClinicList.jsx
import { useStore } from "../../../store";
import ClinicCard from "./ClinicCard";
import { Hospital } from "lucide-react";

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
  const clinics       = useStore(s => s.filteredClinics);
  const loading       = useStore(s => s.clinicsLoading);
  const searchQuery   = useStore(s => s.searchQuery);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Hospital size={40} className="text-slate-300 mb-3" />
        <p className="text-slate-600 font-semibold">No clinics found</p>
        <p className="text-slate-400 text-sm mt-1">
          {searchQuery ? `No results for "${searchQuery}"` : "Try changing filters"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4">
      {clinics.map(c => <ClinicCard key={c.id} clinic={c} />)}
    </div>
  );
}