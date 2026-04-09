import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useStore } from "./store/index.js";

// Layout & Modals
import BottomNav    from "./components/layout/BottomNav.jsx";
import BookingModal from "./components/common/Homepage/BookingModal.jsx";

// Pages
import Home         from "./pages/public/Home.jsx";
import Login        from "./pages/public/Login.jsx";
import ClinicRegister from "./pages/auth/ClinicRegister.jsx";
import UserHome     from "./pages/public/UserHome.jsx";
import BookingsPage from "./pages/public/BookingsPage.jsx";
import ClinicDetail from "./components/common/Homepage/ClinicDetail.jsx";
import ReviewsPage  from "./pages/public/ReviewsPage.jsx";
import SettingsPage from "./pages/public/SettingsPage.jsx";
import ClinicAdminPanel from "./pages/public/ClinicAdminPanel.jsx";
import ClinicBookingsPage from "./pages/clinic-admin/ClinicBookingsPage.jsx";
// import ClinicHome from "./pages/clinic/ClinicHome.jsx";  ← uncomment when ready

// ─────────────────────────────────────────────
// Auth Context  { user, role, loading }
//   role: 'clinic_admin' | 'user' | null
// ─────────────────────────────────────────────
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

async function resolveRole(uid) {
  try {
    const snap = await getDocs(query(collection(db, "clinics"), where("ownerUid", "==", uid)));
    if (!snap.empty) return "clinic_admin";
    const uSnap = await getDoc(doc(db, "users", uid));
    if (uSnap.exists()) return "user";
  } catch (e) { console.error("resolveRole:", e); }
  return null;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); 
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 1. Change this to the correct name from your store's authSlice
  const setUserStore = useStore(s => s.setUser); 

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null); 
        setRole(null);
        // 2. Sync with Store
        setUserStore(null, null); 
        setLoading(false);
        return;
      }

      const r = await resolveRole(fbUser.uid);
      
      // Fetch Profile Data (Optional but recommended)
      // If you have a 'users' collection, fetch it here to pass to 'profile'
      const uSnap = await getDoc(doc(db, "users", fbUser.uid));
      const profileData = uSnap.exists() ? uSnap.data() : { role: r };

      setUser(fbUser); 
      setRole(r);
      
      // 3. Sync with Store - This fills 'user' and 'profile' in Zustand
      setUserStore(fbUser, profileData); 
      
      setLoading(false);
    });
    return unsub;
  }, [setUserStore]); // Add dependency for safety

  return <AuthContext.Provider value={{ user, role, loading }}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
// Route guards
// ─────────────────────────────────────────────
function SmartRoot() {
  const { user, role, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Home />;
  return <Navigate to={role === "clinic_admin" ? "/clinic/home" : "/user/home"} replace />;
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login/user" state={{ from: location }} replace />;
  if (requiredRole && role !== requiredRole)
    return <Navigate to={role === "clinic_admin" ? "/clinic/home" : "/user/home"} replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={role === "clinic_admin" ? "/clinic/home" : "/user/home"} replace />;
  return children;
}

// ─────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────
const FULL_WIDTH_PATHS = ["/", "/register-clinic"];
const SHOW_NAV_PATHS   = ["/user/home", "/bookings", "/reviews", "/settings"];

function AppShell() {
  const loc = useLocation();
  const isFullWidth = FULL_WIDTH_PATHS.includes(loc.pathname) || loc.pathname.startsWith("/login");
  const showNav     = SHOW_NAV_PATHS.includes(loc.pathname);

  return (
    <>
      <div className={isFullWidth
        ? "min-h-screen bg-slate-50 w-full"
        : "min-h-screen bg-slate-50 mx-auto relative shadow-xl shadow-slate-200/50"
      }>
        <Routes>
          {/* Smart root */}
          <Route path="/" element={<SmartRoot />} />

          {/* Auth */}
          <Route path="/login/:role" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/login"       element={<Navigate to="/login/user" replace />} />

          {/* Clinic register — always open */}
          <Route path="/register-clinic" element={<ClinicRegister />} />

          {/* Public clinic detail */}
          <Route path="/clinic/:id" element={<ClinicDetail />} />

          {/* Clinic admin dashboard */}
          <Route path="/clinic/home" element={
            <ProtectedRoute requiredRole="clinic_admin">
              {/* swap div for <ClinicHome /> when ready */}
             <ClinicAdminPanel/>
            </ProtectedRoute>
          } />
          <Route path="/clinic/appointments" element={<ClinicBookingsPage/>}/>

          {/* Patient app */}
          <Route path="/user/home" element={<ProtectedRoute requiredRole="user"><UserHome /></ProtectedRoute>} />
          <Route path="/bookings"  element={<ProtectedRoute requiredRole="user"><BookingsPage /></ProtectedRoute>} />
          <Route path="/reviews"   element={<ProtectedRoute requiredRole="user"><ReviewsPage /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute requiredRole="user"><SettingsPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showNav && <BottomNav />}
        <BookingModal />
      </div>

      <Toast />

      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translate(-50%,-10px) scale(0.95); }
          to   { opacity:1; transform:translate(-50%,0) scale(1); }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function Toast() {
  const toast = useStore(s => s.toast);
  if (!toast) return null;
  return (
    <div
      className={`fixed top-6 left-1/2 z-[100] px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl ${
        toast.type === "error" ? "bg-rose-500" : "bg-slate-900"
      }`}
      style={{ transform: "translateX(-50%)", animation: "toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      {toast.msg}
    </div>
  );
}

// ─────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center animate-pulse">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-[11px] text-slate-400 font-medium tracking-widest uppercase">Loading…</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Root — BrowserRouter stays in main.jsx
// ─────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}