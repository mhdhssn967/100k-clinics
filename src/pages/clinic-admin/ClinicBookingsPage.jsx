import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowLeft, CheckCircle2, ClipboardList, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';


const STATUS_STYLES = {
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-600 border border-rose-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-600',
];

function avatarColor(name = '') {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export default function ClinicBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('active');
  const { appointments, historyAppointments, loadClinicBookings, appointmentsLoading } = useAdminStore();

  useEffect(() => {
    loadClinicBookings(user.uid);
  }, [user.uid]);

  
  const currentData = view === 'active' ? appointments : historyAppointments;
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/clinic/home')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-semibold text-slate-800">Manage Bookings</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage all clinic bookings in one place</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active', value: appointments.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            {
              label: 'Completed',
              value: historyAppointments.filter((a) => a.status === 'completed').length,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
            },
            {
              label: 'Cancelled',
              value: historyAppointments.filter((a) => a.status === 'cancelled').length,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
            },
            {
              label: 'Total History',
              value: historyAppointments.length,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.bg} ${stat.color}`}>
                  bookings
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { key: 'active', label: 'Active', icon: ClipboardList },
            { key: 'history', label: 'History', icon: CheckCircle2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              {label}
              {key === 'active' && appointments.length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {appointments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {appointmentsLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-700" />
            <p className="text-sm text-slate-400">Loading appointments…</p>
          </div>
        ) : view === 'active' ? (
          <ActiveCards appointments={currentData} />
        ) : (
          <HistoryTable appointments={currentData} />
        )}
      </div>
    </div>
  );
}

function ActiveCards({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList size={24} className="text-slate-400" />
        </div>
        <p className="text-slate-700 font-semibold">No active bookings</p>
        <p className="text-slate-400 text-sm mt-1">New appointments will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appt) => (
        <AppointmentCard key={appt.id} appt={appt} />
      ))}
    </div>
  );
}

function AppointmentCard({ appt }) {

  const completeBooking = useAdminStore(s => s.completeBooking);

  const handleCompleteClick = (appt) => {
  Swal.fire({
    title: 'Mark as Completed?',
    text: `Confirm completion for ${appt.patientName}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981', // emerald-500
    cancelButtonColor: '#64748b',  // slate-500
    confirmButtonText: 'Yes, complete it!',
    borderRadius: '1rem',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const success = await completeBooking(appt.id);
      if (success) {
        Swal.fire({
          title: 'Success!',
          text: 'Appointment moved to history.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  });
};
  const initials = getInitials(appt.patientName);
  const colorClass = avatarColor(appt.patientName);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      {/* Card Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden ${colorClass}`}
>
  {appt.patientProfileImage ? (
    <img 
      src={appt.patientProfileImage} 
      alt={appt.patientName}
      className="w-full h-full object-cover" 
    />
  ) : (
    <span className="uppercase tracking-tighter">
      {initials}
    </span>
  )}
</div>
          <div>
            <p className="font-semibold text-slate-900 text-sm leading-tight">{appt.patientName}</p>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <User size={10} />  {appt.doctorName}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-300">#{appt.id.slice(-6)}</span>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-dashed border-slate-100" />

      {/* Date & Time Row */}
      <div className="px-5 py-4 flex gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar size={13} className="text-slate-400 shrink-0" />
          <span>{appt.date}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <Clock size={11} className="text-emerald-500" />
          {appt.time}
        </div>
      </div>

      {/* Notes */}
      {appt.notes && (
        <div className="mx-5 mb-4 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] text-slate-500 italic leading-relaxed">
          "{appt.notes}"
        </div>
      )}

      {/* Action */}
      <div className="px-5 pb-5">
        <button onClick={() => handleCompleteClick(appt)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <CheckCircle2 size={13} />
          Mark as Completed
        </button>
      </div>
    </div>
  );
}

function HistoryTable({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle2 size={24} className="text-slate-300" />
        </div>
        <p className="text-slate-600 font-semibold text-sm">No history yet</p>
      </div>
    );
  }

  // 1. Grouping by date
  const grouped = appointments.reduce((groups, appt) => {
    const date = appt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appt);
    return groups;
  }, {});

  // 2. Sort dates (Recent first)
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="relative">
          {/* Date Header - Sticky for better UX */}
          <div className="sticky top-0 z-10 py-2 bg-slate-50/90 backdrop-blur-sm mb-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="w-8 h-px bg-slate-200" />
              {date}
            </h3>
          </div>

          {/* Group Container */}
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {grouped[date].map((appt) => {
                const initials = getInitials(appt.patientName);
                const colorClass = avatarColor(appt.patientName);
                const statusStyle = STATUS_STYLES[appt.status] || STATUS_STYLES.completed;

                return (
                  <div
                    key={appt.id}
                    className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Patient Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden ${colorClass}`}>
                         {appt.patientProfileImage ? (
                            <img src={appt.patientProfileImage} className="w-full h-full object-cover" alt="" />
                         ) : initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{appt.patientName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{appt.patientPhone || 'No contact'}</p>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="col-span-3">
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Doctor</p>
                      <p className="text-xs font-semibold text-slate-700">Dr. {appt.doctorName}</p>
                    </div>

                    {/* Time Info */}
                    <div className="col-span-2">
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Time</p>
                      <p className="text-xs font-bold text-slate-900">{appt.time}</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}