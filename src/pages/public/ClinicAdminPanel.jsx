import { useEffect } from "react";
import AdminHeader     from "../../components/admin/AdminHeader";
import OverviewSection from "../../components/admin/OverviewSection";
import DoctorsSection  from "../../components/admin/DoctorsSection";
import SlotsSection    from "../../components/admin/SlotsSection";
import SettingsSection from "../../components/admin/SettingsSection";
import DoctorModal     from "../../components/admin/DoctorModal";
import AdminToast      from "../../components/admin/AdminToast";
import { useAdminStore } from "../../store/adminStore";
// Import your auth hook (adjust path based on where your AuthContext is)
import { useAuth } from "../../context/AuthContext"; 

function SectionRenderer() {
  const activeSection = useAdminStore(s => s.activeSection);
  const clinic = useAdminStore(s => s.clinic);

  // While data is loading, we don't want to render the sections yet
  if (!clinic) return null;

  switch (activeSection) {
    case "overview": return <OverviewSection />;
    case "doctors":  return <DoctorsSection />;
    case "slots":    return <SlotsSection />;
    case "settings": return <SettingsSection />;
    default:         return <OverviewSection />;
  }
}

export default function ClinicAdminPanel() {
  const { user } = useAuth(); // Get the current logged-in user
  const fetchClinicData = useAdminStore(s => s.fetchClinicData);

  // Trigger the fetch once we have a user
  useEffect(() => {
    if (user?.uid) {
      fetchClinicData(user.uid);
    }
  }, [user, fetchClinicData]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 w-full mx-auto relative shadow-xl shadow-slate-200/50">
        {/* Pass clinicId to header so it knows what to load */}
        <AdminHeader clinicId={user?.uid} />

        <div className="px-5 pt-5 pb-28">
          <SectionRenderer />
        </div>

        <DoctorModal />
      </div>

      <AdminToast />

      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translate(-50%,-10px) scale(0.95); }
          to   { opacity:1; transform:translate(-50%,0) scale(1); }
        }
      `}</style>
    </>
  );
}