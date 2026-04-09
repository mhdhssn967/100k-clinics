import { db, storage } from "../../firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, query, collection, where, orderBy, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


// ── Helpers ─────────────────────────────────────────────────────────────────
function generateDoctorId(name) {
  return "dr-" + name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
}

// ── Status ───────────────────────────────────────────────────────────────────
export async function updateClinicStatus(clinicId, isOpen) {
  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { isOpen });
  return true;
}

export async function updateClinicMeta(clinicId, fields) {
  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { 
    ...fields, 
    updatedAt: serverTimestamp() 
  });
  return true;
}

// ── Cover Image ──────────────────────────────────────────────────────────────
export async function updateCoverImage(clinicId, file) {
  const storageRef = ref(storage, `clinics/${clinicId}/cover.jpg`);
  
  // Upload file
  await uploadBytes(storageRef, file);
  
  // Get URL and update Firestore
  const coverImage = await getDownloadURL(storageRef);
  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { coverImage });
  
  return coverImage;
}

// ── Facilities ───────────────────────────────────────────────────────────────
export async function updateFacilities(clinicId, facilities) {
  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { facilities });
  return true;
}

// ── Time Slots (clinic-level) ─────────────────────────────────────────────
export async function updateClinicTimeSlots(clinicId, timeSlots) {
  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { timeSlots });
  return true;
}

// ── Doctors ──────────────────────────────────────────────────────────────────
export async function addDoctor(clinicId, doctorData, avatarFile) {
  const doctorId = generateDoctorId(doctorData.name);
  let avatar = "";

  if (avatarFile) {
    const storageRef = ref(storage, `clinics/${clinicId}/doctors/${doctorId}.jpg`);
    await uploadBytes(storageRef, avatarFile);
    avatar = await getDownloadURL(storageRef);
  } else {
    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=e2e8f0&color=475569&size=128`;
  }

  const doctor = { 
    id: doctorId, 
    ...doctorData, 
    avatar, 
    createdAt: new Date().toISOString() // arrayUnion doesn't like serverTimestamp() inside objects
  };

  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { 
    doctors: arrayUnion(doctor) 
  });

  return doctor;
}

export async function updateDoctor(clinicId, updatedDoctor, doctors, avatarFile) {
  let avatar = updatedDoctor.avatar;

  if (avatarFile) {
    const storageRef = ref(storage, `clinics/${clinicId}/doctors/${updatedDoctor.id}.jpg`);
    await uploadBytes(storageRef, avatarFile);
    avatar = await getDownloadURL(storageRef);
  }

  const finalDoctor = { ...updatedDoctor, avatar };
  const newDoctors = doctors.map(d => d.id === updatedDoctor.id ? finalDoctor : d);

  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { doctors: newDoctors });

  return finalDoctor;
}

export async function removeDoctor(clinicId, doctorId, doctors) {
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return;

  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { 
    doctors: arrayRemove(doctor) 
  });

  // Cleanup storage if avatar exists and isn't a default UI avatar
  if (doctor.avatar && !doctor.avatar.includes("ui-avatars.com")) {
    try {
      const storageRef = ref(storage, `clinics/${clinicId}/doctors/${doctorId}.jpg`);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Storage deletion failed:", error);
    }
  }
}

export async function toggleDoctorAvailability(clinicId, doctorId, available, doctors) {
  const newDoctors = doctors.map(d => 
    d.id === doctorId ? { ...d, available } : d
  );

  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { doctors: newDoctors });
}

export async function updateDoctorSlots(clinicId, doctorId, timeSlots, doctors) {
  const newDoctors = doctors.map(d => 
    d.id === doctorId ? { ...d, timeSlots } : d
  );

  const clinicRef = doc(db, "clinics", clinicId);
  await updateDoc(clinicRef, { doctors: newDoctors });
}

// Fetch appoinments for clinics
export const fetchClinicActiveBookings = async (clinicId) => {
  try {
    const q = query(
      collection(db, "bookings", "active", "list"),
      where("clinicId", "==", clinicId),
      where("status", "==", "active"), // Added filter
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in fetchClinicActiveBookings:", error);
    throw error;
  }
};

export const fetchClinicHistoryBookings = async (clinicId) => {
  try {
    const q = query(
      collection(db, "bookings", "inactive", "list"),
      where("clinicId", "==", clinicId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in fetchClinicHistoryBookings:", error);
    throw error;
  }
};

export const completeAppointment = async (bookingId) => {
  try {
    const activeRef = doc(db, "bookings", "active", "list", bookingId);
    const inactiveRef = doc(db, "bookings", "inactive", "list", bookingId);

    // 1. Get the data from active
    const snap = await getDoc(activeRef);
    if (!snap.exists()) throw new Error("Booking not found");

    const data = snap.data();

    // 2. Write to inactive with updated status
    await setDoc(inactiveRef, {
      ...data,
      status: "completed",
      completedAt: serverTimestamp(),
    });

    // 3. Delete from active
    await deleteDoc(activeRef);
    return true;
  } catch (error) {
    console.error("Complete Appointment Error:", error);
    throw error;
  }
};