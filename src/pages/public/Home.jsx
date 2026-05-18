import React, { useEffect } from "react";
import { Link } from "react-router-dom";
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

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-slate-900 font-semibold text-base">Discover our journey</p>
                <p className="text-slate-500 text-sm leading-6">
                  Learn how 100KClinics began with one young innovator’s vision to make healthcare accessible for everyone.
                </p>
              </div>
              <Link
                to="/story"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Read our story
              </Link>
            </div>
          </div>

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