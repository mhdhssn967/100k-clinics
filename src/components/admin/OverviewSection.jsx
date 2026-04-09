import { useState, useRef } from "react";
import { Camera, Plus, X, Check, Edit2, BookIcon, BookImageIcon, Clock10Icon } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { useNavigate } from "react-router-dom";

// ── Inline editable field ─────────────────────────────────────────────────
function EditableField({ label, value, onSave, multiline = false, placeholder = "" }) {

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !multiline) handleSave();
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  };

  return (
    <div className="group">
      <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-1">{label}</p>
      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              autoFocus
              rows={3}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 text-sm text-slate-800 border border-emerald-400 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none bg-white"
            />
          ) : (
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="flex-1 text-sm text-slate-800 border border-emerald-400 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-100 bg-white"
            />
          )}
          <button onClick={handleSave} className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-white" strokeWidth={3} />
          </button>
          <button onClick={() => { setDraft(value); setEditing(false); }} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="w-full text-left flex items-start gap-2 group/row"
        >
          <span className={`flex-1 text-sm leading-relaxed ${value ? "text-slate-800" : "text-slate-300 italic"}`}>
            {value || placeholder || "Tap to edit…"}
          </span>
          <Edit2 size={13} className="text-slate-300 group-hover/row:text-slate-500 transition-colors mt-0.5 flex-shrink-0" />
        </button>
      )}
    </div>
  );
}

// ── Facilities editor ─────────────────────────────────────────────────────
function FacilitiesEditor() {
  const clinic = useAdminStore(s => s.clinic);
  const updateFacilities = useAdminStore(s => s.updateFacilities);
  const [newItem, setNewItem] = useState("");

  const facilities = clinic?.facilities || [];

  const add = () => {
    const trimmed = newItem.trim();
    if (!trimmed || facilities.includes(trimmed)) return;
    updateFacilities([...facilities, trimmed]);
    setNewItem("");
  };

  const remove = (f) => updateFacilities(facilities.filter(x => x !== f));

  return (
    <div>
      <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-2.5">Facilities</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {facilities.map(f => (
          <span key={f} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-xl">
            {f}
            <button onClick={() => remove(f)} className="text-slate-300 hover:text-rose-500 transition-colors">
              <X size={11} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        {facilities.length === 0 && (
          <span className="text-slate-300 text-xs italic">No facilities added</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add facility (e.g. ICU, Lab…)"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function OverviewSection() {
  const clinic           = useAdminStore(s => s.clinic);
  const loading          = useAdminStore(s => s.loading);
  const updateMeta       = useAdminStore(s => s.updateMeta);
  const updateCoverImage = useAdminStore(s => s.updateCoverImage);
  const fileRef           = useRef();

  const navigate=useNavigate()

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (file) updateCoverImage(file);
  };

  // Guard for null clinic data
  if (loading || !clinic) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover image */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100">
        <img src={clinic.coverImage} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:bg-white transition-colors"
        >
          <Camera size={14} /> Change Cover
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />

        {/* Live status badge on cover */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full ${
          clinic.isOpen ? "bg-emerald-500 text-white" : "bg-slate-800/80 text-white/80"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${clinic.isOpen ? "bg-white" : "bg-slate-400"}`} />
          {clinic.isOpen ? `Open · till ${clinic.openUntil || '--'}` : "Closed"}
        </div>
      </div>
      <button onClick={()=>{navigate('/clinic/appointments')}} className="text-center w-full bg-emerald-600 border-emerald-800 border-1 text-white flex justify-center gap-2 p-3 rounded-2xl"><Clock10Icon/> View Appointments</button>

      {/* Editable meta fields */}
      <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 shadow-sm overflow-hidden">
        {[
          { label: "Clinic Name",   field: "name",         multiline: false },
          { label: "Tagline",       field: "tagline",      multiline: false },
          { label: "Specialty",     field: "specialty",    multiline: false },
          { label: "Phone",         field: "phone",        multiline: false },
          { label: "Address",       field: "address",      multiline: false },
          { label: "Description",   field: "description",  multiline: true  },
        ].map(({ label, field, multiline }) => (
          <div key={field} className="px-4 py-4">
            <EditableField
              label={label}
              value={clinic[field] || ""}
              multiline={multiline}
              onSave={(val) => updateMeta({ [field]: val })}
            />
          </div>
        ))}
      </div>

      {/* Open Until + Wait Time side by side */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Open Until", field: "openUntil", placeholder: "e.g. 9:00 PM" },
          { label: "Wait Time",  field: "waitTime",  placeholder: "e.g. ~10 min" },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm">
            <EditableField
              label={label}
              value={clinic[field] || ""}
              placeholder={placeholder}
              onSave={(val) => updateMeta({ [field]: val })}
            />
          </div>
        ))}
      </div>

      {/* Facilities */}
      <div className="bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm">
        <FacilitiesEditor />
      </div>

      {/* Stats row (read-only) */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Rating",    value: clinic.rating || "5.0" },
          { label: "Reviews",   value: clinic.reviewCount || "0" },
          { label: "Doctors",   value: clinic.doctors?.length || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-slate-900 text-xl font-bold">{value}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}