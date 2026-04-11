import { useEffect, useState } from "react";
import { Calendar, Clock, CalendarX } from "lucide-react";
import { useStore } from "../../store";
import AppointmentDetailsModal from "../../components/common/AppointmentDetailsModal";

function StatusPill({ status }) {
  const styles = {
    confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    completed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    cancelled: "bg-rose-50 text-rose-500 ring-1 ring-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status] ?? styles.completed}`}>
      {status}
    </span>
  );
}

function ActiveAppointmentCard({ appt, onCancel }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <img
            src={appt.clinicImage}
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-slate-100"
            alt={appt.clinicName}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-slate-900 font-bold text-sm leading-tight">{appt.clinicName}</h3>
                <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-widest mt-0.5">
                  {appt.doctorSpecialty}
                </p>
              </div>
              <StatusPill status="confirmed" />
            </div>
            <p className="text-slate-500 text-xs mt-1">{appt.doctorName}</p>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
            <Calendar size={13} className="text-emerald-500" />
            <span className="text-slate-700 text-xs font-medium">{appt.date}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
            <Clock size={13} className="text-emerald-500" />
            <span className="text-slate-700 text-xs font-medium">{appt.time}</span>
          </div>
        </div>

        {/* Footer action */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <button onClick={() => onSelect(appt)} className="text-slate-500 text-[11px] font-bold hover:text-emerald-600 transition-colors py-1">Tap to view details</button>
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(appt.id); }}
            className="text-rose-500 text-xs font-bold bg-rose-50 hover:bg-rose-100 transition-colors px-3 py-1.5 rounded-xl"
          >
            Cancel booking
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ appt, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(appt)}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
        {appt.doctorName?.charAt(0) ?? "D"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">{appt.doctorName}</p>
        <p className="text-[10px] text-slate-400 truncate">{appt.clinicName}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusPill status={appt.status} />
        <p className="text-[10px] text-slate-400">{appt.date}</p>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [selectedAppt, setSelectedAppt] = useState(null);
  const user = useStore((s) => s.user);
  const appointments = useStore((s) => s.appointments);
  const oldAppointments = useStore((s) => s.oldAppointments)
  const loading = useStore((s) => s.appointmentsLoading);
  const loadAppointments = useStore((s) => s.loadAppointments);
  const cancelAppointment = useStore((s) => s.cancelAppointment);

  useEffect(() => {
    if (user?.uid && appointments.length === 0) {
      loadAppointments(user.uid);
    }
  }, [user?.uid, loadAppointments, appointments.length]);

  const today = new Date().toISOString().split("T")[0];
  const active = appointments.filter((a) => a.date >= today && a.status !== "cancelled");
  const history = oldAppointments.filter(
    (a) => a.date < today || a.status === "cancelled" || a.status === "completed"
  );
console.log(appointments);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your schedule…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-slate-900 px-6 pt-16 pb-10 rounded-b-[36px]">
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Schedule</p>
        <h1 className="text-white text-2xl font-bold leading-tight">Your Appointments</h1>
        <div className="flex items-center gap-2 mt-3">
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
            {active.length} upcoming
          </span>
          <span className="bg-white/10 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
            {history.length} past
          </span>
        </div>
      </div>

      <div className="px-5 -mt-5 space-y-8">
        {/* Upcoming */}
        <section>
          <h2 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-3 px-1">Upcoming</h2>
          <div className="space-y-3">
            {active.length > 0 ? (
              active.map((a) => (
                <ActiveAppointmentCard key={a.id} appt={a} onCancel={cancelAppointment} onSelect={setSelectedAppt} />
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 px-6 py-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <CalendarX size={22} className="text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="text-slate-700 text-sm font-semibold">No upcoming bookings</p>
                  <p className="text-slate-400 text-xs mt-0.5">Book a session to get started</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Past History */}
        <section>
          <h2 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-3 px-1">Past history</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {history.length > 0 ? (
              history.map((appt) => <HistoryRow key={appt.id} appt={appt} onSelect={setSelectedAppt} />)
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-slate-400 text-xs italic">No previous history available</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <AppointmentDetailsModal 
        isOpen={!!selectedAppt} 
        onClose={() => setSelectedAppt(null)} 
        appt={selectedAppt} 
      />
    </div>
  );
}