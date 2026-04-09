import { create } from "zustand";
import * as svc from "../services/clinicAdminService"
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

console.log("Admin Service Exports:", Object.keys(svc));

export const useAdminStore = create((set, get) => ({
  // Start with null so we can show a loading state in the UI
  clinic: null, 
  loading: true,
  saving: false,
  activeSection: "overview", 
  doctorModal: null,         
  toast: null,

  // ── Initialize / Fetch Data ───────────────────────────────────────────
  // Call this when the Admin Dashboard mounts
  fetchClinicData: async (clinicId) => {
    console.log(clinicId);
    
    set({ loading: true });
    try {
      const docRef = doc(db, "clinics", clinicId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ clinic: docSnap.data(), loading: false });
      } else {
        console.error("No such clinic found in Firestore!");
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching clinic:", error);
      set({ loading: false });
    }
  },

  // ── Toast ──────────────────────────────────────────────────────────────
  showToast: (msg, type = "success") => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },

  setActiveSection: (s) => set({ activeSection: s }),

  // ── Status Toggle ──────────────────────────────────────────────────────
  toggleOpen: async () => {
    const { clinic } = get();
    if (!clinic) return;

    const newVal = !clinic.isOpen;
    // Optimistic Update
    set(s => ({ clinic: { ...s.clinic, isOpen: newVal } }));
    
    await svc.updateClinicStatus(clinic.ownerUid, newVal);
    get().showToast(`Clinic marked as ${newVal ? "Open" : "Closed"}`);
  },

  // ── Meta fields ────────────────────────────────────────────────────────
  updateMeta: async (fields) => {
    const { clinic } = get();
    set({ saving: true });
    
    // Optimistic Update
    set(s => ({ clinic: { ...s.clinic, ...fields } }));
    
    await svc.updateClinicMeta(clinic.ownerUid, fields);
    set({ saving: false });
    get().showToast("Changes saved");
  },

  // ── Cover Image ────────────────────────────────────────────────────────
  updateCoverImage: async (file) => {
    const { clinic } = get();
    set({ saving: true });
    
    const url = await svc.updateCoverImage(clinic.ownerUid, file);
    set(s => ({ clinic: { ...s.clinic, coverImage: url }, saving: false }));
    get().showToast("Cover image updated");
  },

  // ── Facilities ─────────────────────────────────────────────────────────
  updateFacilities: async (facilities) => {
    const { clinic } = get();
    set(s => ({ clinic: { ...s.clinic, facilities } }));
    await svc.updateFacilities(clinic.ownerUid, facilities);
    get().showToast("Facilities updated");
  },

  // ── Clinic Time Slots ──────────────────────────────────────────────────
  updateClinicTimeSlots: async (timeSlots) => {
    const { clinic } = get();
    set(s => ({ clinic: { ...s.clinic, timeSlots } }));
    await svc.updateClinicTimeSlots(clinic.ownerUid, timeSlots);
    get().showToast("Time slots updated");
  },

  // ── Doctor Modal ───────────────────────────────────────────────────────
  openDoctorModal: (mode, doctor = null) => set({ doctorModal: { mode, doctor } }),
  closeDoctorModal: () => set({ doctorModal: null }),

  // ── Add Doctor ─────────────────────────────────────────────────────────
  addDoctor: async (data, avatarFile) => {
    const { clinic } = get();
    set({ saving: true });
    
    const doctor = await svc.addDoctor(clinic.ownerUid, data, avatarFile);
    
    set(s => ({
      clinic: { ...s.clinic, doctors: [...(s.clinic.doctors || []), doctor] },
      saving: false,
      doctorModal: null,
    }));
    get().showToast(`${doctor.name} added`);
  },

  // ── Edit Doctor ────────────────────────────────────────────────────────
  editDoctor: async (updated, avatarFile) => {
    const { clinic } = get();
    set({ saving: true });
    
    const doctor = await svc.updateDoctor(clinic.ownerUid, updated, clinic.doctors, avatarFile);
    
    set(s => ({
      clinic: {
        ...s.clinic,
        doctors: s.clinic.doctors.map(d => d.id === doctor.id ? doctor : d),
      },
      saving: false,
      doctorModal: null,
    }));
    get().showToast(`${doctor.name} updated`);
  },

  // ── Remove Doctor ──────────────────────────────────────────────────────
  removeDoctor: async (doctorId) => {
    const { clinic } = get();
    // Optimistic UI removal
    set(s => ({
      clinic: { ...s.clinic, doctors: s.clinic.doctors.filter(d => d.id !== doctorId) },
    }));
    
    await svc.removeDoctor(clinic.ownerUid, doctorId, clinic.doctors);
    get().showToast("Doctor removed");
  },

  // ── Toggle Doctor Availability ─────────────────────────────────────────
  toggleDoctorAvailability: async (doctorId) => {
    const { clinic } = get();
    const doctor = clinic.doctors.find(d => d.id === doctorId);
    const newVal = !doctor.available;
    
    set(s => ({
      clinic: {
        ...s.clinic,
        doctors: s.clinic.doctors.map(d => d.id === doctorId ? { ...d, available: newVal } : d),
      },
    }));
    
    await svc.toggleDoctorAvailability(clinic.ownerUid, doctorId, newVal, clinic.doctors);
  },

// Appoitment load for admin
// Inside useAdminStore
appointments: [],
historyAppointments: [],
appointmentsLoading: false,

loadClinicBookings: async (clinicId) => {
  if (!clinicId) return;
  set({ appointmentsLoading: true });
  try {
    const [active, history] = await Promise.all([
      svc.fetchClinicActiveBookings(clinicId),
      svc.fetchClinicHistoryBookings(clinicId)
    ]);
    
    set({ 
      appointments: active, 
      historyAppointments: history, 
      appointmentsLoading: false 
    });
  } catch (error) {
    console.error("Error loading clinic bookings:", error);
    set({ appointmentsLoading: false });
  }
},

// Add an action to complete/update an appointment
updateBookingStatus: async (bookingId, newStatus) => {
   // Logic to move from active to inactive would go here
   // Similar to the user cancelAppointment logic but for 'completed'
},
  
  // ── Update Doctor Time Slots ───────────────────────────────────────────
  updateDoctorSlots: async (doctorId, timeSlots) => {
    const { clinic } = get();
    set(s => ({
      clinic: {
        ...s.clinic,
        doctors: s.clinic.doctors.map(d => d.id === doctorId ? { ...d, timeSlots } : d),
      },
    }));
    
    await svc.updateDoctorSlots(clinic.ownerUid, doctorId, timeSlots, clinic.doctors);
    get().showToast("Slots updated");
  },


  // complete booking
  // Inside useAdminStore
completeBooking: async (bookingId) => {
  try {
    await svc.completeAppointment(bookingId);
    
    // Update local state: remove from active, add to history
    set((state) => {
      const completedAppt = state.appointments.find(a => a.id === bookingId);
      return {
        appointments: state.appointments.filter(a => a.id !== bookingId),
        historyAppointments: [
          { ...completedAppt, status: "completed" }, 
          ...state.historyAppointments
        ]
      };
    });
    return true;
  } catch (error) {
    get().showToast("Failed to complete appointment", "error");
    return false;
  }
},
}));



