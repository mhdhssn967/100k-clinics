// src/pages/clinic-admin/components/SlotsSection.jsx
import { useState } from "react";
import { Clock, Plus, X, Info } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { shallow } from "zustand/shallow";

const ALL_PRESETS = [
  "7:00 AM","7:30 AM","8:00 AM","8:30 AM",
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM",
  "1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM",
  "5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM",
];

const AM_SLOTS = ALL_PRESETS.filter(s => s.includes("AM"));
const PM_SLOTS = ALL_PRESETS.filter(s => s.includes("PM"));

export default function SlotsSection() {
  const clinic = useAdminStore(s => s.clinic);
  const updateClinicTimeSlots = useAdminStore(s => s.updateClinicTimeSlots);

  const doctors = clinic?.doctors || [];
  const timeSlots = clinic?.timeSlots || [];

  const [customSlot, setCustomSlot] = useState("");
  const [error, setError]           = useState("");

  const toggle = (slot) => {
    const next = timeSlots.includes(slot)
      ? timeSlots.filter(s => s !== slot)
      : [...timeSlots, slot].sort();
    updateClinicTimeSlots(next);
  };

  const removeSlot = (slot) => updateClinicTimeSlots(timeSlots.filter(s => s !== slot));

  const addCustom = () => {
    const t = customSlot.trim();
    if (!t) return;
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    if (!timeRegex.test(t)) { setError("Use format: 2:30 PM"); return; }
    if (timeSlots.includes(t)) { setError("Already in list"); return; }
    updateClinicTimeSlots([...timeSlots, t].sort());
    setCustomSlot("");
    setError("");
  };

  const selectAll   = () => updateClinicTimeSlots([...ALL_PRESETS]);
  const clearAll    = () => updateClinicTimeSlots([]);
  const selectAM    = () => {
    const rest = timeSlots.filter(s => !s.includes("AM"));
    updateClinicTimeSlots([...new Set([...rest, ...AM_SLOTS])].sort());
  };
  const selectPM    = () => {
    const rest = timeSlots.filter(s => !s.includes("PM"));
    updateClinicTimeSlots([...new Set([...rest, ...PM_SLOTS])].sort());
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-slate-900 font-bold text-base">Clinic Time Slots</p>
        <p className="text-slate-400 text-sm mt-0.5">
          These are the general booking windows patients can choose from.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
        <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-700 text-xs leading-relaxed">
          These clinic-wide slots appear on your listing. Each doctor can also have their own specific slots set from the <strong>Doctors</strong> tab.
        </p>
      </div>

      {/* Active slots chips */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
            Active Slots ({timeSlots.length})
          </p>
          <div className="flex gap-2">
            <button onClick={clearAll} className="text-rose-400 text-[11px] font-semibold hover:text-rose-600">Clear all</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {timeSlots.length === 0 && (
            <span className="text-slate-300 text-xs italic self-center">No slots selected</span>
          )}
          {timeSlots.map(slot => (
            <span key={slot} className="flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl">
              <Clock size={10} />
              {slot}
              <button onClick={() => removeSlot(slot)} className="text-white/50 hover:text-white transition-colors ml-0.5">
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2">
        {[
          { label: "Select All",  action: selectAll },
          { label: "AM Only",     action: selectAM },
          { label: "PM Only",     action: selectPM },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex-1 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Preset AM grid */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-3">Morning — AM</p>
        <div className="grid grid-cols-4 gap-2">
          {AM_SLOTS.map(slot => {
            const active = timeSlots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggle(slot)}
                className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 ${
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset PM grid */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-3">Afternoon / Evening — PM</p>
        <div className="grid grid-cols-4 gap-2">
          {PM_SLOTS.map(slot => {
            const active = timeSlots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggle(slot)}
                className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 ${
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom slot */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-3">Add Custom Slot</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              value={customSlot}
              onChange={e => { setCustomSlot(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              placeholder="e.g. 2:15 PM"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all ${
                error ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
          </div>
          <button
            onClick={addCustom}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}