// src/pages/clinic-admin/components/DoctorModal.jsx
import { useState, useRef, useEffect } from "react";
import { X, Check, Camera, Plus, Trash2, Clock } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";

const SLOT_PRESETS = [
  "7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM",
  "10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM",
  "1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM",
];

const SPECIALTIES = [
  "General Physician","Cardiologist","Neurologist","Orthopedic",
  "Pediatrician","Dermatologist","Psychiatrist","Ophthalmologist",
  "Gynecologist","Dentist","ENT Specialist","Physiotherapist",
  "Radiologist","Endocrinologist","Nephrologist","Urologist","Other",
];

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all";

export default function DoctorModal() {
  const modal         = useAdminStore(s => s.doctorModal);
  const close         = useAdminStore(s => s.closeDoctorModal);
  const addDoctor     = useAdminStore(s => s.addDoctor);
  const editDoctor    = useAdminStore(s => s.editDoctor);
  const saving        = useAdminStore(s => s.saving);

  const isEdit = modal?.mode === "edit";
  const src    = modal?.doctor;

  const [form, setForm] = useState({
    name: "", specialty: "", qualification: "", experience: "",
    bio: "", consultFee: "", available: true, timeSlots: [],
  });
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [customSlot, setCustomSlot]       = useState("");
  const [slotError, setSlotError]         = useState("");
  const fileRef = useRef();

  // Pre-fill on edit
  useEffect(() => {
    if (modal) {
      if (isEdit && src) {
        setForm({
          name: src.name || "",
          specialty: src.specialty || "",
          qualification: src.qualification || "",
          experience: src.experience || "",
          bio: src.bio || "",
          consultFee: src.consultFee || "",
          available: src.available ?? true,
          timeSlots: src.timeSlots || [],
        });
        setAvatarPreview(src.avatar || null);
      } else {
        setForm({ name: "", specialty: "", qualification: "", experience: "", bio: "", consultFee: "", available: true, timeSlots: [] });
        setAvatarPreview(null);
      }
      setAvatarFile(null);
      setCustomSlot("");
      setSlotError("");
    }
  }, [modal]);

  if (!modal) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const togglePresetSlot = (slot) => {
    setForm(f => ({
      ...f,
      timeSlots: f.timeSlots.includes(slot)
        ? f.timeSlots.filter(s => s !== slot)
        : [...f.timeSlots, slot].sort(),
    }));
  };

  const addCustomSlot = () => {
    const trimmed = customSlot.trim();
    if (!trimmed) return;
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    if (!timeRegex.test(trimmed)) { setSlotError("Use format like 2:30 PM"); return; }
    if (form.timeSlots.includes(trimmed)) { setSlotError("Already added"); return; }
    setForm(f => ({ ...f, timeSlots: [...f.timeSlots, trimmed].sort() }));
    setCustomSlot("");
    setSlotError("");
  };

  const removeSlot = (slot) => setForm(f => ({ ...f, timeSlots: f.timeSlots.filter(s => s !== slot) }));

  const canSubmit = form.name.trim() && form.specialty;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (isEdit) {
      await editDoctor({ ...src, ...form }, avatarFile);
    } else {
      await addDoctor(form, avatarFile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={close} />

      <div className="relative w-full bg-white rounded-t-3xl max-h-[95vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0">
          <span className="w-8 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-slate-900 font-bold text-[17px] tracking-tight">
              {isEdit ? "Edit Doctor" : "Add Doctor"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {isEdit ? `Editing ${src?.name}` : "Fill in the doctor's details"}
            </p>
          </div>
          <button onClick={close} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X size={15} className="text-slate-600" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl font-bold">
                      {form.name?.[0]?.toUpperCase() || "?"}
                    </div>
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white"
              >
                <Camera size={12} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
            <div className="flex-1">
              <p className="text-slate-700 text-sm font-semibold">Doctor Photo</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Upload a clear, professional photo. Square format works best.</p>
              <button onClick={() => fileRef.current?.click()} className="mt-2 text-xs text-emerald-600 font-semibold">
                {avatarPreview ? "Change photo" : "Upload photo"}
              </button>
            </div>
          </div>

          {/* Name */}
          <Field label="Full Name" required>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Dr. First Last" className={inputCls} />
          </Field>

          {/* Specialty */}
          <Field label="Specialty" required>
            <select value={form.specialty} onChange={e => set("specialty", e.target.value)} className={inputCls}>
              <option value="">Select specialty…</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {/* Qualification + Experience */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qualification">
              <input value={form.qualification} onChange={e => set("qualification", e.target.value)} placeholder="MBBS, MD…" className={inputCls} />
            </Field>
            <Field label="Experience">
              <input value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. 10 yrs" className={inputCls} />
            </Field>
          </div>

          {/* Consult Fee */}
          <Field label="Consultation Fee">
            <input value={form.consultFee} onChange={e => set("consultFee", e.target.value)} placeholder="e.g. ₹500" className={inputCls} />
          </Field>

          {/* Bio */}
          <Field label="Short Bio">
            <textarea
              value={form.bio}
              onChange={e => set("bio", e.target.value)}
              placeholder="Brief professional background…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Availability toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
            <div>
              <p className="text-slate-800 text-sm font-semibold">Available Today</p>
              <p className="text-slate-400 text-xs mt-0.5">Patients can book this doctor</p>
            </div>
            <button
              onClick={() => set("available", !form.available)}
              className={`w-12 h-6 rounded-full transition-all duration-200 relative ${form.available ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${form.available ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Time Slots */}
          <div>
            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-3">
              Time Slots
              <span className="normal-case font-normal text-slate-300 ml-1">({form.timeSlots.length} selected)</span>
            </p>

            {/* Preset grid */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SLOT_PRESETS.map(slot => {
                const active = form.timeSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => togglePresetSlot(slot)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all duration-150 ${
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

            {/* Custom slot */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  value={customSlot}
                  onChange={e => { setCustomSlot(e.target.value); setSlotError(""); }}
                  onKeyDown={e => e.key === "Enter" && addCustomSlot()}
                  placeholder="Custom time e.g. 2:30 PM"
                  className={`${inputCls} ${slotError ? "border-rose-400" : ""}`}
                />
                {slotError && <p className="text-rose-500 text-[11px] mt-1">{slotError}</p>}
              </div>
              <button onClick={addCustomSlot} className="px-3 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            {/* Selected slots as removable chips */}
            {form.timeSlots.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.timeSlots.map(slot => (
                  <span key={slot} className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    <Clock size={10} />
                    {slot}
                    <button onClick={() => removeSlot(slot)} className="text-emerald-400 hover:text-rose-500 transition-colors ml-0.5">
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all ${
              canSubmit && !saving
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}