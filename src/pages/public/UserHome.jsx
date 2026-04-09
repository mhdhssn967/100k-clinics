// pages/patient/UserHome.jsx
import React, { useEffect } from "react";
import HomeHeader from "../../components/layout/HomeHeader";
import QuickStats from "../../components/common/Homepage/QuickStats";
import UpcomingBanner from "../../components/common/Homepage/UpcomingBanner";
import FilterChips from "../../components/common/Homepage/FilterChips";
import ClinicList from "../../components/common/Homepage/ClinicList";
import { useStore } from "../../store";

export default function UserHome() {
  const loadClinics      = useStore(s => s.loadClinics);
  const loadAppointments = useStore(s => s.loadAppointments);

  useEffect(() => {
    loadClinics();
    loadAppointments();
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <HomeHeader />

      <div className="px-5 pt-5 space-y-6">
        <QuickStats />
        <UpcomingBanner />

        {/* Clinics */}
        <div>
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