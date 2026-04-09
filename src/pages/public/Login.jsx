import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../firebaseConfig";
import {
  Activity, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle,
  Building2, User, Camera, Phone, Mail, Lock, UserCircle2, ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────
// Role config
// ─────────────────────────────────────────────
const ROLE = {
  clinic: {
    label: "Clinic Admin",
    sub: "Manage your clinic, doctors & queue",
    icon: <Building2 size={18} />,
    accent: "emerald",
    redirect: "/clinic/home",
    canRegister: false, // clinics register via /register-clinic
  },
  user: {
    label: "Patient",
    sub: "Book appointments & track your health",
    icon: <User size={18} />,
    accent: "sky",
    redirect: "/user/home",
    canRegister: true,
  },
};

const ACCENT = {
  emerald: {
    badge:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon:   "bg-emerald-100 text-emerald-700",
    btn:    "bg-emerald-600 hover:bg-emerald-500",
    ring:   "focus:ring-emerald-200",
    tab:    "border-emerald-500 text-emerald-700",
  },
  sky: {
    badge:  "bg-sky-50 text-sky-700 border border-sky-200",
    icon:   "bg-sky-100 text-sky-700",
    btn:    "bg-sky-600 hover:bg-sky-500",
    ring:   "focus:ring-sky-200",
    tab:    "border-sky-500 text-sky-700",
  },
};

// ─────────────────────────────────────────────
// Tiny reusable field
// ─────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, required, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-300 pointer-events-none">{icon}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60
            focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-offset-0 outline-none
            transition-all text-sm text-slate-900 placeholder:text-slate-300`}
        />
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Avatar picker (patient register only)
// ─────────────────────────────────────────────
function AvatarPicker({ file, onChange }) {
  const inputRef = useRef(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-sky-50 transition-all overflow-hidden group"
      >
        {previewUrl
          ? <img src={previewUrl} className="w-full h-full object-cover" alt="avatar" />
          : <UserCircle2 size={36} className="text-slate-300 mx-auto mt-3.5" />
        }
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={16} className="text-white" />
        </div>
      </button>
      <p className="text-[10px] text-slate-400">Upload profile photo <span className="text-slate-300">(optional)</span></p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onChange(e.target.files[0])} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Error banner
// ─────────────────────────────────────────────
function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in duration-200">
      <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-700">{msg}</p>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/user-not-found":      "No account found with this email.",
    "auth/invalid-credential":  "Incorrect email or password.",
    "auth/wrong-password":      "Incorrect password.",
    "auth/email-already-in-use":"An account with this email already exists.",
    "auth/too-many-requests":   "Too many attempts. Please wait and try again.",
    "auth/invalid-email":       "Please enter a valid email address.",
    "auth/weak-password":       "Password must be at least 6 characters.",
    "auth/user-disabled":       "This account has been disabled.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

// ─────────────────────────────────────────────
// Resolve role from Firestore (used on auto-redirect)
// ─────────────────────────────────────────────
async function resolveRole(uid) {
  try {
    const q = query(collection(db, "clinics"), where("ownerUid", "==", uid));
    const snap = await getDocs(q);
    if (!snap.empty) return "clinic_admin";
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) return "user";
  } catch {}
  return null;
}

// ═════════════════════════════════════════════
// Main Login component
// ═════════════════════════════════════════════
export default function Login() {
  const { role: roleParam = "user" } = useParams();
  const navigate = useNavigate();

  const role = ROLE[roleParam] ? roleParam : "user";
  const meta = ROLE[role];
  const ac   = ACCENT[meta.accent];

  // tab: "login" | "register"
  const [tab, setTab] = useState("login");

  // ── Login state ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd,   setLoginPwd]   = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState("");

  // ── Register state (patient only) ──
  const [regName,    setRegName]    = useState("");
  const [regPhone,   setRegPhone]   = useState("");
  const [regEmail,   setRegEmail]   = useState("");
  const [regPwd,     setRegPwd]     = useState("");
  const [regPwdConf, setRegPwdConf] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regPhoto,   setRegPhoto]   = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError,   setRegError]   = useState("");

  const otherRole = role === "clinic" ? "user" : "clinic";

  // Auto-redirect if already logged in
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      const r = await resolveRole(u.uid);
      if (r === "clinic_admin") navigate("/clinic/home", { replace: true });
      else if (r === "user")    navigate("/user/home",   { replace: true });
    });
    return unsub;
  }, []);

  // ── Login submit ──
  const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError("");
  setLoginLoading(true);

  try {
    const { user } = await signInWithEmailAndPassword(auth, loginEmail, loginPwd);

    // 🔍 Check role from Firestore
    const q = query(collection(db, "clinics"), where("ownerUid", "==", user.uid));
    const clinicSnap = await getDocs(q);

    let actualRole = null;

    if (!clinicSnap.empty) {
      actualRole = "clinic_admin";
    } else {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        actualRole = "user";
      }
    }

    // ❌ If role mismatch → block login
    if (
      (role === "user" && actualRole === "clinic_admin") ||
      (role === "clinic" && actualRole === "user")
    ) {
      await auth.signOut(); // 🔥 important: log them out immediately

      setLoginError(
        role === "user"
          ? "This account belongs to a clinic admin. Please login from clinic portal."
          : "This account belongs to a patient. Please login from user portal."
      );

      return;
    }

    // ✅ Correct role → allow login
    if (actualRole === "clinic_admin") {
      navigate("/clinic/home", { replace: true });
    } else {
      navigate("/user/home", { replace: true });
    }

  } catch (err) {
    setLoginError(friendlyError(err.code));
  } finally {
    setLoginLoading(false);
  }
};

  // ── Register submit (patients only) ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    if (regPwd !== regPwdConf) { setRegError("Passwords do not match."); return; }
    if (regPwd.length < 6)     { setRegError("Password must be at least 6 characters."); return; }
    setRegLoading(true);
    try {
      // 1. Create Firebase Auth user
      const { user } = await createUserWithEmailAndPassword(auth, regEmail, regPwd);

      // 2. Upload photo if provided
      let photoURL = "";
      if (regPhoto) {
        const storageRef = ref(storage, `users/${user.uid}/avatar.jpg`);
        await uploadBytes(storageRef, regPhoto);
        photoURL = await getDownloadURL(storageRef);
      }

      // 3. Save to Firestore users/{uid}
      await setDoc(doc(db, "users", user.uid), {
        uid:       user.uid,
        name:      regName.trim(),
        phone:     regPhone.trim(),
        email:     regEmail.trim().toLowerCase(),
        photoURL,
        role:      "user",
        createdAt: serverTimestamp(),
        bookings:  [],
      });

      // 4. Navigate
      navigate("/user/home", { replace: true });
    } catch (err) {
      setRegError(friendlyError(err.code));
    } finally {
      setRegLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/60 flex items-center justify-center p-4 antialiased">

      {/* dot grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative w-full max-w-sm">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 mb-7 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <Activity className="text-emerald-400" size={17} />
          </div>
          <span className="text-lg font-black tracking-tight">
            100K<span className="text-emerald-600">Clinics</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

          {/* Role header */}
          <div className="px-7 pt-6 pb-5 border-b border-slate-100">
            <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 ${ac.badge}`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center ${ac.icon}`}>{meta.icon}</span>
              {meta.label}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{meta.sub}</p>
          </div>

          {/* Tabs — only show for patients (clinics use /register-clinic) */}
          {meta.canRegister && (
            <div className="flex border-b border-slate-100">
              {["login", "register"].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setLoginError(""); setRegError(""); }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                    tab === t
                      ? `${ac.tab} bg-slate-50/60`
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <Field
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="you@example.com"
                icon={<Mail size={14} />}
                required
              />
              <Field
                label="Password"
                type={showLoginPwd ? "text" : "password"}
                value={loginPwd}
                onChange={setLoginPwd}
                placeholder="Your password"
                icon={<Lock size={14} />}
                required
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowLoginPwd(p => !p)}
                  className="absolute right-3 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showLoginPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>

              <ErrorBanner msg={loginError} />

              <div className="flex justify-end">
                <button type="button" className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading || !loginEmail || !loginPwd}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 ${ac.btn} active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {loginLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Signing in…</>
                  : `Sign in as ${meta.label}`}
              </button>

              {meta.canRegister && (
                <p className="text-center text-xs text-slate-400">
                  No account?{" "}
                  <button type="button" onClick={() => setTab("register")} className="font-bold text-sky-600 hover:underline">
                    Register here
                  </button>
                </p>
              )}
            </form>
          )}

          {/* ── REGISTER FORM (patients only) ── */}
          {tab === "register" && meta.canRegister && (
            <form onSubmit={handleRegister} className="p-6 space-y-3.5">
              <AvatarPicker file={regPhoto} onChange={setRegPhoto} />

              <Field
                label="Full Name"
                value={regName}
                onChange={setRegName}
                placeholder="Aisha Nair"
                icon={<UserCircle2 size={14} />}
                required
              />
              <Field
                label="Phone Number"
                type="tel"
                value={regPhone}
                onChange={setRegPhone}
                placeholder="+91 98765 43210"
                icon={<Phone size={14} />}
                required
              />
              <Field
                label="Email"
                type="email"
                value={regEmail}
                onChange={setRegEmail}
                placeholder="you@example.com"
                icon={<Mail size={14} />}
                required
              />
              <Field
                label="Password"
                type={showRegPwd ? "text" : "password"}
                value={regPwd}
                onChange={setRegPwd}
                placeholder="Min. 6 characters"
                icon={<Lock size={14} />}
                required
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowRegPwd(p => !p)}
                  className="absolute right-3 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showRegPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>
              <Field
                label="Confirm Password"
                type={showRegPwd ? "text" : "password"}
                value={regPwdConf}
                onChange={setRegPwdConf}
                placeholder="Repeat password"
                icon={<Lock size={14} />}
                required
              />

              <ErrorBanner msg={regError} />

              <button
                type="submit"
                disabled={regLoading || !regName || !regEmail || !regPwd || !regPwdConf || !regPhone}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 ${ac.btn} active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1`}
              >
                {regLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Creating account…</>
                  : "Create Patient Account"}
              </button>

              <p className="text-center text-xs text-slate-400">
                Already registered?{" "}
                <button type="button" onClick={() => setTab("login")} className="font-bold text-sky-600 hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Clinic: no register tab — redirect to proper register page */}
          {tab === "login" && !meta.canRegister && (
            <div className="px-6 pb-5">
              <div
                onClick={() => navigate("/register-clinic")}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">
                  <Building2 size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">New clinic?</p>
                  <p className="text-[10px] text-slate-400">Register your clinic →</p>
                </div>
                <ChevronRight size={13} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          )}
        </div>

        {/* Switch role tile */}
        <div
          onClick={() => navigate(`/login/${otherRole}`)}
          className="mt-3 flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 cursor-pointer transition-all group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors shrink-0">
            {ROLE[otherRole].icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-700">Sign in as {ROLE[otherRole].label} instead</p>
            <p className="text-[10px] text-slate-400 truncate">{ROLE[otherRole].sub}</p>
          </div>
          <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}