// pages/patient/SettingsPage.jsx
import { useState } from "react";
import {
  User, Bell, Shield, HelpCircle, LogOut, ChevronRight,
  Edit3, Camera, X, Check, Phone, Mail, Lock, Info,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
// ─── helpers ────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── drawer / modal primitive ───────────────────────────────────────────────

function Drawer({ open, onClose, title, children }) {
  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`} style={{paddingBottom:'80px'}}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="px-5 py-4 pb-10">{children}</div>
      </div>
    </>
  );
}

// ─── confirm logout modal ────────────────────────────────────────────────────

function LogoutModal({ open, onClose, onConfirm }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`fixed inset-x-5 z-50 bg-white rounded-3xl p-6 transition-all duration-300 ${
          open ? "opacity-100 scale-100 top-1/2 -translate-y-1/2" : "opacity-0 scale-95 top-1/2 -translate-y-1/2 pointer-events-none"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <LogOut size={20} className="text-rose-500" />
        </div>
        <h3 className="text-center font-bold text-slate-900 text-lg mb-1">Sign out?</h3>
        <p className="text-center text-slate-400 text-sm mb-6">You'll need to log back in to access your account.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// ─── settings row ────────────────────────────────────────────────────────────

function SettingsRow({ label, sub, Icon, accent, onClick, last }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left ${
        !last ? "border-b border-slate-50" : ""
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 font-semibold text-sm">{label}</p>
        <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
      </div>
      <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
    </button>
  );
}

// ─── field row used inside drawers ───────────────────────────────────────────

function FieldRow({ label, value }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || <span className="text-slate-300 font-normal">Not set</span>}</p>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const profile = useStore((s) => s.profile);

  const patientName = profile?.name || user?.displayName || "Guest Patient";
  const patientPhone = profile?.phone || "";
  const patientEmail = user?.email || "";
  const patientPhotoURL = profile?.photoURL || user?.photoURL || null;
  const initials = getInitials(patientName);

  const [activeDrawer, setActiveDrawer] = useState(null); // 'profile' | 'notifications' | 'privacy' | 'help'
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const GROUPS = [
    {
      title: "Account",
      items: [
        {
          key: "profile",
          label: "Edit Profile",
          sub: "Name, photo, contact",
          Icon: User,
          accent: "bg-blue-50 text-blue-600",
        },
        {
          key: "notifications",
          label: "Notifications",
          sub: "Reminders & alerts",
          Icon: Bell,
          accent: "bg-amber-50 text-amber-600",
        },
        {
          key: "privacy",
          label: "Privacy & Security",
          sub: "Password, data & account",
          Icon: Shield,
          accent: "bg-emerald-50 text-emerald-600",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          key: "help",
          label: "Help & FAQs",
          sub: "Get help or contact us",
          Icon: HelpCircle,
          accent: "bg-purple-50 text-purple-600",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100">
        <h1 className="text-slate-900 text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-5 mt-5 mb-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {patientPhotoURL ? (
                <img
                  src={patientPhotoURL}
                  alt={patientName}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                  {initials || "?"}
                </div>
              )}
              <button
                onClick={() => setActiveDrawer("profile")}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white hover:bg-slate-700 transition-colors active:scale-95"
              >
                <Camera size={11} className="text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-bold text-[17px] leading-tight truncate">{patientName}</p>
              {patientEmail && (
                <p className="text-slate-400 text-sm mt-0.5 truncate">{patientEmail}</p>
              )}
              {patientPhone && (
                <p className="text-slate-400 text-xs mt-0.5">{patientPhone}</p>
              )}
            </div>

            {/* Edit chip */}
            <button
              onClick={() => setActiveDrawer("profile")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-semibold text-slate-600 flex-shrink-0"
            >
              <Edit3 size={11} />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="px-5 space-y-4">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-2 px-1">
              {group.title}
            </p>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              {group.items.map((item, i) => (
                <SettingsRow
                  key={item.key}
                  {...item}
                  last={i === group.items.length - 1}
                  onClick={() => setActiveDrawer(item.key)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-rose-50 active:bg-rose-100 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={16} className="text-rose-500" />
            </div>
            <p className="flex-1 text-rose-500 font-semibold text-sm">Sign Out</p>
          </button>
        </div>

        <p className="text-center text-slate-300 text-xs py-4">100K Clinics · v0.1.0</p>
      </div>

      {/* ── Drawers ─────────────────────────────────────────── */}

      {/* Profile Drawer */}
      <Drawer
        open={activeDrawer === "profile"}
        onClose={() => setActiveDrawer(null)}
        title="Your profile"
      >
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
          {patientPhotoURL ? (
            <img src={patientPhotoURL} className="w-12 h-12 rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900">{patientName}</p>
            <p className="text-xs text-slate-400">Patient account</p>
          </div>
        </div>
        <FieldRow label="Full name" value={patientName} />
        <FieldRow label="Email address" value={patientEmail} />
        <FieldRow label="Phone number" value={patientPhone} />
        <button className="mt-5 w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors active:scale-[0.98]">
          Update profile
        </button>
      </Drawer>

      {/* Notifications Drawer */}
      <Drawer
        open={activeDrawer === "notifications"}
        onClose={() => setActiveDrawer(null)}
        title="Notifications"
      >
        {[
          { label: "Appointment reminders", sub: "Get reminded before upcoming visits", on: true },
          { label: "Doctor replies", sub: "When your doctor sends a message", on: true },
          { label: "Promotions & offers", sub: "Deals and health tips", on: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${item.on ? "bg-emerald-500" : "bg-slate-200"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.on ? "translate-x-5" : "translate-x-1"}`} />
            </div>
          </div>
        ))}
      </Drawer>

      {/* Privacy Drawer */}
      <Drawer
        open={activeDrawer === "privacy"}
        onClose={() => setActiveDrawer(null)}
        title="Privacy & Security"
      >
        {[
          { Icon: Lock, label: "Change password", sub: "Update your login password" },
          { Icon: Shield, label: "Two-factor auth", sub: "Add an extra layer of security" },
          { Icon: Info, label: "Delete account", sub: "Permanently remove your data", danger: true },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 py-3.5 border-b border-slate-100 last:border-0 text-left hover:bg-slate-50 transition-colors rounded-xl px-1"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.danger ? "bg-rose-50" : "bg-slate-100"}`}>
              <item.Icon size={14} className={item.danger ? "text-rose-500" : "text-slate-500"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${item.danger ? "text-rose-500" : "text-slate-800"}`}>{item.label}</p>
              <p className="text-xs text-slate-400">{item.sub}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 ml-auto" />
          </button>
        ))}
      </Drawer>

      {/* Help Drawer */}
      <Drawer
        open={activeDrawer === "help"}
        onClose={() => setActiveDrawer(null)}
        title="Help & FAQs"
      >
        {[
          "How do I book an appointment?",
          "Can I cancel or reschedule?",
          "How does video consultation work?",
          "Is my data safe?",
          "Contact support",
        ].map((q) => (
          <button
            key={q}
            className="w-full flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 text-left hover:bg-slate-50 transition-colors px-1 rounded-xl"
          >
            <span className="text-sm font-semibold text-slate-700">{q}</span>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
          </button>
        ))}
      </Drawer>

      {/* Logout Confirm Modal */}
      <LogoutModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}