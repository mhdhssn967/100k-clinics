import React, { useEffect } from "react";
import { useStore } from "../../store";
import { useSearchStore } from "../../store/searchStore";
import HomeHeader from "../../components/layout/HomeHeader";
import FilterChips from "../../components/common/Homepage/FilterChips";
import ClinicList from "../../components/common/Homepage/ClinicList";
import ClinicSearchCard from "../../components/common/Homepage/ClinicSearchCard";
import ClinicEnrollBanner from "../../components/common/Homepage/ClinicEnrollBanner";

export default function Home() {
  const clinics     = useStore(s => s.clinics);
  const loadClinics = useStore(s => s.loadClinics);
  const initSearch  = useSearchStore(s => s.initSearch);

  useEffect(() => {
    loadClinics();
  }, []); // Intentionally leaving out dependencies per project pattern

  useEffect(() => {
    if (clinics.length > 0) initSearch(clinics);
  }, [clinics]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <HomeHeader />

      <div className="max-w-3xl mx-auto w-full">
        <div className="px-4 pt-4 space-y-5">
          <ClinicEnrollBanner />
          <ClinicSearchCard />
          
          <div className="px-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-900 font-bold text-[15px]">Clinics Near You</p>
            </div>
            <div className="mb-4">
              <FilterChips />
            </div>
            <ClinicList />
          </div>
        </div>
      </div>
    </div>
  );
}