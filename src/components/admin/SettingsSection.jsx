// src/pages/clinic-admin/components/SettingsSection.jsx
import { useState } from "react";
import { AlertTriangle, Power, Clock, Edit2, Check, X, LogOut } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";

  import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useNavigate } from "react-router-dom";


function InlineEdit({ label, value, onSave, placeholder, hint }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };




  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 font-semibold text-sm">{label}</p>
        {hint && <p className="text-slate-400 text-xs mt-0.5">{hint}</p>}
        {editing ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              placeholder={placeholder}
              className="flex-1 border border-emerald-400 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <button onClick={save} className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Check size={13} className="text-white" strokeWidth={3} />
            </button>
            <button onClick={cancel} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
              <X size={13} className="text-slate-500" />
            </button>
          </div>
        ) : (
          <p className="text-slate-500 text-sm mt-1">{value || <span className="italic text-slate-300">{placeholder}</span>}</p>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <Edit2 size={12} className="text-slate-400" />
        </button>
      )}
    </div>
  );
}

export default function SettingsSection() {
  const clinic     = useAdminStore(s => s.clinic);
  const updateMeta = useAdminStore(s => s.updateMeta);
  const toggleOpen = useAdminStore(s => s.toggleOpen);
  const [confirmClose, setConfirmClose] = useState(false);

  const navigate=useNavigate()

  const handleLogout = async (navigate) => {
  try {
    await signOut(auth);

    // Redirect to login page after logout
    navigate("/"); // or "/" if you have a landing page
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

  return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-900 font-bold text-base">Clinic Settings</p>
        <p className="text-slate-400 text-sm mt-0.5">Manage your clinic's operational settings.</p>
      </div>

      {/* Opening status */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-50">
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">Status</p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-900 font-semibold text-sm">Clinic is currently</p>
              <p className={`text-sm font-bold mt-0.5 ${clinic.isOpen ? "text-emerald-600" : "text-slate-500"}`}>
                {clinic.isOpen ? "🟢 Open for bookings" : "⚫ Closed"}
              </p>
            </div>
            <button
              onClick={toggleOpen}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                clinic.isOpen
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <Power size={14} />
              {clinic.isOpen ? "Close Now" : "Open Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Operational details */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
        <div className="px-4 py-4 border-b border-slate-50">
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">Operations</p>
        </div>
        <div className="px-4 py-4">
          <InlineEdit
            label="Open Until"
            value={clinic.openUntil}
            placeholder="e.g. 9:00 PM"
            hint="Displayed to patients on the clinic card"
            onSave={val => updateMeta({ openUntil: val })}
          />
        </div>
        <div className="px-4 py-4">
          <InlineEdit
            label="Average Wait Time"
            value={clinic.waitTime}
            placeholder="e.g. ~10 min"
            hint="Helps patients plan their visit"
            onSave={val => updateMeta({ waitTime: val })}
          />
        </div>
        <div className="px-4 py-4">
          <InlineEdit
            label="Phone Number"
            value={clinic.phone}
            placeholder="+91 XXXXX XXXXX"
            hint="Visible on your clinic detail page"
            onSave={val => updateMeta({ phone: val })}
          />
        </div>
      </div>

      {/* Clinic info */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
        <div className="px-4 py-4 border-b border-slate-50">
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">Clinic Info</p>
        </div>
        <div className="px-4 py-4">
          <InlineEdit
            label="Clinic Name"
            value={clinic.name}
            placeholder="Your clinic name"
            onSave={val => updateMeta({ name: val })}
          />
        </div>
        <div className="px-4 py-4">
          <InlineEdit
            label="Tagline"
            value={clinic.tagline}
            placeholder="A short description"
            hint="Shown below the clinic name on cards"
            onSave={val => updateMeta({ tagline: val })}
          />
        </div>
        <div className="px-4 py-4">
          <InlineEdit
            label="Address"
            value={clinic.address}
            placeholder="Full clinic address"
            onSave={val => updateMeta({ address: val })}
          />
        </div>
      </div>

      {/* Read-only info */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">Clinic ID (read-only)</p>
        <p className="text-slate-700 font-mono text-sm bg-white border border-slate-200 rounded-xl px-3 py-2">{clinic.clinicId}</p>
        {/* <p className="text-slate-400 text-xs">This ID is used in the database path: <span className="font-mono">clinics/{clinic.clinicId}</span></p> */}
      </div>
       <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={handleLogout} className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-rose-50 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={16} className="text-rose-500" />
            </div>
            <p className="text-rose-500 font-semibold text-sm">Sign Out</p>
          </button>
        </div>
    </div>
  );
}