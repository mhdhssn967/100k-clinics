import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore }      from "../../store";
import { useSearchStore } from "../../store/searchStore";
import HomeHeader from "../../components/layout/HomeHeader";
import QuickStats from "../../components/common/Homepage/QuickStats";
import ClinicList from "../../components/common/Homepage/ClinicList";
import ClinicSearchCard from "../../components/common/Homepage/ClinicSearchCard";
import PublicDoctorModal from "../../components/common/Homepage/PublicDoctorModal";
import NotificationsModal from "../../components/common/Homepage/NotificationsModal";

export default function UserHome() {
  const navigate = useNavigate();
  const user             = useStore(s => s.user);
  const clinics          = useStore(s => s.clinics);
  const loadClinics      = useStore(s => s.loadClinics);
  const loadAppointments = useStore(s => s.loadAppointments);
  const loadNotifications = useStore(s => s.loadNotifications);
  const initSearch       = useSearchStore(s => s.initSearch);
  const activeTab        = useSearchStore(s => s.activeTab);

  const doctorDetailModal      = useStore(s => s.doctorDetailModal);
  const closeDoctorDetailModal = useStore(s => s.closeDoctorDetailModal);
  const openBookingModal       = useStore(s => s.openBookingModal);

  useEffect(() => {
    loadClinics();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadAppointments(user.uid);
      loadNotifications(user.uid);
    }
  }, [user?.uid, loadAppointments, loadNotifications]);

  // One-way bridge: main store clinics → searchStore (only connection between them)
  useEffect(() => {
    if (clinics.length > 0) initSearch(clinics);
  }, [clinics]);

  const handleBookDoctor = (doc) => {
    if (!user) navigate("/login/user");
    else openBookingModal(doctorDetailModal.clinic, doc);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Existing header — untouched */}
      <HomeHeader />

      <div className="max-w-3xl mx-auto w-full -mt-6 relative z-10">
        <div className="px-4 space-y-6">
          {/* ── Agoda-style search card — the hero ── */}
          <ClinicSearchCard />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-slate-900 font-semibold text-base">Discover our story</p>
                <p className="text-slate-500 text-sm leading-6">
                  Read how 100KClinics started with a first-of-its-kind vision for accessible healthcare.
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

          {/* ── Everything below is unchanged ─────── */}
          <div className="px-1">
            <QuickStats />
          </div>

          <div className="px-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-900 font-black text-lg tracking-tight">
                {activeTab === "clinic" ? "Clinics Near You" : 
                 activeTab === "doctor" ? "Doctors Available" : 
                 "Browse by Specialty"}
              </p>
            </div>
            <ClinicList />
          </div>
        </div>
      </div>

      <PublicDoctorModal 
        isOpen={!!doctorDetailModal}
        onClose={closeDoctorDetailModal}
        doctor={doctorDetailModal?.doctor}
        onBook={handleBookDoctor}
      />

      <NotificationsModal />
    </div>
  );
}
