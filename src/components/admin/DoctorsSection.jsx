// src/pages/clinic-admin/components/DoctorsSection.jsx
import { Plus, Edit2, Trash2, Clock, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState } from "react";
import { useAdminStore } from "../../store/adminStore";

function DoctorSlotManager({ doctor }) {
  const updateDoctorSlots = useAdminStore(s => s.updateDoctorSlots);
  const [open, setOpen] = useState(false);
  const [customSlot, setCustomSlot] = useState("");

  const SLOT_PRESETS = [
    "7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM",
    "10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM",
    "1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM",
  ];

  const slots = doctor.timeSlots || [];

  const toggle = (slot) => {
    const next = slots.includes(slot)
      ? slots.filter(s => s !== slot)
      : [...slots, slot].sort();
    updateDoctorSlots(doctor.id, next);
  };

  const addCustom = () => {
    const t = customSlot.trim();
    if (!t || slots.includes(t)) return;
    updateDoctorSlots(doctor.id, [...slots, t].sort());
    setCustomSlot("");
  };

  const removeSlot = (slot) => {
    updateDoctorSlots(doctor.id, slots.filter(s => s !== slot));
  };

  return (
    <div className="mt-3 border-t border-slate-50 pt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-slate-500 text-xs font-semibold w-full"
      >
        <Clock size={12} className="text-slate-400" />
        {slots.length} time slots
        {open ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Current slots */}
          <div className="flex flex-wrap gap-1.5">
            {slots.length === 0 && <span className="text-slate-300 text-xs italic">No slots set</span>}
            {slots.map(s => (
              <span key={s} className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                {s}
                <button onClick={() => removeSlot(s)} className="text-emerald-300 hover:text-rose-500 transition-colors ml-0.5 text-[10px] font-bold">×</button>
              </span>
            ))}
          </div>

          {/* Preset toggle grid */}
          <div className="flex flex-wrap gap-1.5">
            {SLOT_PRESETS.map(s => {
              const active = slots.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Custom slot */}
          <div className="flex gap-2">
            <input
              value={customSlot}
              onChange={e => setCustomSlot(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              placeholder="Custom e.g. 2:30 PM"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              onClick={addCustom}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor }) {
  const openDoctorModal        = useAdminStore(s => s.openDoctorModal);
  const removeDoctor           = useAdminStore(s => s.removeDoctor);
  const toggleDoctorAvailability = useAdminStore(s => s.toggleDoctorAvailability);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      doctor.available ? "border-slate-100" : "border-slate-100 opacity-70"
    }`}>
      {/* Top: avatar + info + controls */}
      <div className="p-4 flex items-start gap-3.5">
        {/* Avatar with availability dot */}
        <div className="relative flex-shrink-0">
          <img
            src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=e2e8f0&color=475569&size=128`}
            alt={doctor.name}
            className="w-14 h-14 rounded-xl object-cover bg-slate-100"
          />
          <button
            onClick={() => toggleDoctorAvailability(doctor.id)}
            title={doctor.available ? "Mark as unavailable" : "Mark as available"}
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center transition-colors ${
              doctor.available ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            {doctor.available && <Check size={9} className="text-white" strokeWidth={3} />}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-slate-900 font-bold text-sm leading-tight truncate">{doctor.name}</p>
              <p className="text-emerald-600 text-xs font-medium mt-0.5">{doctor.specialty}</p>
              {doctor.qualification && (
                <p className="text-slate-400 text-xs mt-0.5">{doctor.qualification}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => openDoctorModal("edit", doctor)}
                className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <Edit2 size={12} className="text-slate-500" />
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Trash2 size={12} className="text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => removeDoctor(doctor.id)}
                  className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {doctor.experience && (
              <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-md">{doctor.experience}</span>
            )}
            {doctor.consultFee && (
              <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-md">{doctor.consultFee}</span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              doctor.available
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}>
              {doctor.available ? "Available" : "Unavailable"}
            </span>
          </div>

          {doctor.bio && (
            <p className="text-slate-400 text-[11px] leading-relaxed mt-2 line-clamp-2">{doctor.bio}</p>
          )}
        </div>
      </div>

      {/* Slots manager (collapsible) */}
      <div className="px-4 pb-4">
        <DoctorSlotManager doctor={doctor} />
      </div>
    </div>
  );
}

export default function DoctorsSection() {
  const doctors         = useAdminStore(s => s.clinic.doctors);
  const openDoctorModal = useAdminStore(s => s.openDoctorModal);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-900 font-bold text-base">{doctors.length} Doctors</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {doctors.filter(d => d.available).length} available today
          </p>
        </div>
        <button
          onClick={() => openDoctorModal("add")}
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} /> Add Doctor
        </button>
      </div>

      {/* Doctor cards */}
      {doctors.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
          <p className="text-slate-600 font-semibold text-sm">No doctors yet</p>
          <p className="text-slate-400 text-xs mt-1">Add your first doctor to start taking bookings</p>
          <button
            onClick={() => openDoctorModal("add")}
            className="mt-4 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Add Doctor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      )}
    </div>
  );
}