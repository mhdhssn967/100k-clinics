import { create } from "zustand";
import { fetchClinics, fetchClinicById, searchClinics } from "../services/clinicService";
import { fetchUserAppointments, createAppointment, cancelAppointment, fetchOldAppointments } from "../services/appointmentService";

// ─── Auth Slice (New) ──────────────────────────────────────────────────────
const authSlice = (set) => ({
  user: null,         // Firebase user object
  profile: null,      // Firestore data (role, clinicId, etc.)
  isAuthenticated: false,
  authLoading: false,

  setUser: (user, profile) => set({ 
    user, 
    profile, 
    isAuthenticated: !!user 
  }),
  
  logout: () => set({ 
    user: null, 
    profile: null, 
    isAuthenticated: false, 
    activePage: "marketing-home" 
  }),
});

// ─── Clinic Slice ──────────────────────────────────────────────────────────
const clinicSlice = (set, get) => ({
  clinics: [],
  filteredClinics: [],
  selectedClinic: null,
  clinicsLoading: false,
  clinicsError: null,
  searchQuery: "",
  activeFilter: "all",

  loadClinics: async () => {
    set({ clinicsLoading: true, clinicsError: null });
    try {
      const data = await fetchClinics();
      set({ clinics: data, filteredClinics: data, clinicsLoading: false });
    } catch (e) {
      set({ clinicsError: e.message, clinicsLoading: false });
    }
  },

  loadClinicById: async (id) => {
    set({ clinicsLoading: true });
    try {
      const data = await fetchClinicById(id);
      set({ selectedClinic: data, clinicsLoading: false });
    } catch (e) {
      set({ clinicsError: e.message, clinicsLoading: false });
    }
  },

  setSearchQuery: async (query) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ filteredClinics: get().clinics });
      return;
    }
    const results = await searchClinics(query);
    set({ filteredClinics: results });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
    const { clinics } = get();
    if (filter === "all") {
      set({ filteredClinics: clinics });
    } else if (filter === "open") {
      set({ filteredClinics: clinics.filter(c => c.isOpen) });
    } else if (filter === "nearby") {
      set({ filteredClinics: [...clinics].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)) });
    } else if (filter === "rated") {
      set({ filteredClinics: [...clinics].sort((a, b) => b.rating - a.rating) });
    }
  },
});

// ─── Appointment Slice ─────────────────────────────────────────────────────
const appointmentSlice = (set, get) => ({
  appointments: [],
  oldAppointments:[],
  appointmentsLoading: false,
  appointmentsError: null,
  bookingModal: null, 

  loadAppointments: async (userId) => {
  // Check if userId actually exists
  if (!userId) {
    console.warn("loadAppointments called without userId");
    return;
  }
  
  set({ appointmentsLoading: true });
  try {
    const data = await fetchUserAppointments(userId);
    console.log("Appointments fetched successfully:", data);
    const oldData = await fetchOldAppointments(userId);
    console.log("Appointments fetched successfully:", oldData);
    
    set({ 
      appointments: data || [], 
      oldAppointments: oldData || [], 
      appointmentsLoading: false,
      appointmentsError: null 
    });
  } catch (e) {
    console.error("Failed to load appointments:", e);
    set({ appointmentsError: e.message, appointmentsLoading: false });
  }
},

  openBookingModal: (clinic, doctor = null, slot = null) => {
    set({ bookingModal: { clinic, doctor, slot } });
  },

  closeBookingModal: () => set({ bookingModal: null }),

  bookAppointment: async (payload) => {
    set({ appointmentsLoading: true });
    try {
      const appt = await createAppointment(payload);
      set(state => ({
        appointments: [appt, ...state.appointments],
        appointmentsLoading: false,
        bookingModal: null,
      }));
      return appt;
    } catch (e) {
      set({ appointmentsError: e.message, appointmentsLoading: false });
      return null;
    }
  },

  cancelAppointment: async (id) => {
    await cancelAppointment(id);
    set(state => ({
      appointments: state.appointments.map(a =>
        a.id === id ? { ...a, status: "cancelled" } : a
      ),
    }));
  },

  upcomingAppointments: () => {
    const today = new Date().toISOString().split("T")[0];
    return get().appointments.filter(a => a.date >= today && a.status !== "cancelled");
  },
});

// ─── UI Slice ──────────────────────────────────────────────────────────────
const uiSlice = (set) => ({
  // marketing-home | register-clinic | login-user | login-clinic | home | clinic-detail | bookings...
  activePage: "marketing-home", 
  setActivePage: (page) => set({ activePage: page }),
  toast: null,
  showToast: (msg, type = "success") => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
});

// ─── Combined Store ────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  ...authSlice(set, get),
  ...clinicSlice(set, get),
  ...appointmentSlice(set, get),
  ...uiSlice(set, get),
}));

