// components/home/UpcomingBanner.jsx
import { Calendar, Clock, ChevronRight, X, ArrowRight } from "lucide-react";
import { useStore } from "../../../store";

function statusBadge(status) {
  return {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    completed: "bg-slate-100 text-slate-500 border-slate-200",
  }[status] || "bg-slate-100 text-slate-500 border-slate-200";
}

function AppointmentCard({ appt }) {
  const cancelAppointment = useStore(s => s.cancelAppointment);

  return (
    <div className="flex-shrink-0 w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Top accent strip with clinic image */}
      <div className="relative h-24 overflow-hidden">
        <img src={appt.clinicImage} alt={appt.clinicName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 p-3 flex flex-col justify-end">
          <p className="text-white font-bold text-sm leading-tight">{appt.clinicName}</p>
          <p className="text-white/70 text-[11px] mt-0.5">{appt.doctorName} · {appt.doctorSpecialty}</p>
        </div>
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(appt.status)}`}>
          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
        </span>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-slate-400" />
            {appt.date}
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-slate-400" />
            {appt.time}
          </span>
        </div>

        {appt.status === "confirmed" && (
          <button
            onClick={() => cancelAppointment(appt.id)}
            className="flex items-center gap-1 text-[11px] text-rose-500 font-medium hover:text-rose-700 transition-colors"
          >
            <X size={11} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function UpcomingBanner() {
  const setActivePage = useStore(s => s.setActivePage);
  const appointments  = useStore(s => s.appointments);
  const today         = new Date().toISOString().split("T")[0];
  const upcoming      = appointments.filter(a => a.date >= today && a.status !== "cancelled");

  if (upcoming.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-900 font-bold text-[15px]">Upcoming Appoinments</p>
        <button
          onClick={() => setActivePage("bookings")}
          className="flex items-center gap-1 text-[12px] text-emerald-600 font-semibold"
        >
          See all <ArrowRight size={13} />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {upcoming.map(a => <AppointmentCard key={a.id} appt={a} />)}
      </div>
    </div>
  );
}