// pages/patient/UserHome.jsx
import React, { useEffect } from "react";
import { useStore }      from "../../store";
import { useSearchStore } from "../../store/searchStore";
import HomeHeader from "../../components/layout/HomeHeader";
import QuickStats from "../../components/common/Homepage/QuickStats";
import UpcomingBanner from "../../components/common/Homepage/UpcomingBanner";
import FilterChips from "../../components/common/Homepage/FilterChips";
import ClinicList from "../../components/common/Homepage/ClinicList";
import ClinicSearchCard from "../../components/common/Homepage/ClinicSearchCard";

export default function UserHome() {

  const clinics          = useStore(s => s.clinics);
  const loadClinics      = useStore(s => s.loadClinics);
  const loadAppointments = useStore(s => s.loadAppointments);
  const initSearch       = useSearchStore(s => s.initSearch);

  useEffect(() => {
    loadClinics();
    loadAppointments();
  }, []);

  // One-way bridge: main store clinics → searchStore (only connection between them)
  useEffect(() => {
    if (clinics.length > 0) initSearch(clinics);
  }, [clinics]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Existing header — untouched */}
      <HomeHeader />

      <div className="px-4 pt-4 space-y-5">
        {/* ── Agoda-style search card — the hero ── */}
        <ClinicSearchCard />

        {/* ── Everything below is unchanged ─────── */}
        <div className="px-1">
          <QuickStats />
        </div>

        <div className="px-1">
          <UpcomingBanner />
        </div>

        {/* Clinics */}
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
  );
}