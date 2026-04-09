// src/services/appointmentService.js
// src/services/appointmentService.js
import { db } from "../../firebaseConfig";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc, addDoc, 
  serverTimestamp  } from "firebase/firestore";


export const createAppointment = async (payload) => {
  try {
    // Path: db/bookings/active/ (This creates a document inside 'active')
    const activeBookingsRef = collection(db, "bookings", "active", "list");
    
    const bookingData = {
      ...payload,
      status: "active", // Internal flag for easy logic
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(activeBookingsRef, bookingData);
    
    return { id: docRef.id, ...bookingData };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    throw error;
  }
};

/**
 * Fetches all appointments for a specific patient
 */
export const fetchUserAppointments = async (userId) => {
  // 1. Path for active bookings
  const activeRef = collection(db, "bookings", "active", "list");
  
  const q = query(
    activeRef,
    where("patientUid", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    category: "active" // Helper to track where it came from
  }));
};

// fetch cnacelled appoinments
export const fetchOldAppointments = async (userId) => {
  // 1. Path for active bookings
  const activeRef = collection(db, "bookings", "inactive", "list");
  
  const q = query(
    activeRef,
    where("patientUid", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    category: "inactive" // Helper to track where it came from
  }));
};

/**
 * Cancels an appointment
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    const activeDocRef = doc(db, "bookings", "active", "list", appointmentId);
    const inactiveDocRef = doc(db, "bookings", "inactive", "list", appointmentId);

    // 1. Get the current data
    const docSnap = await getDoc(activeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // 2. Add to Inactive collection
      await setDoc(inactiveDocRef, {
        ...data,
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      });

      // 3. Delete from Active collection
      await deleteDoc(activeDocRef);
      
      return true;
    }
  } catch (error) {
    console.error("Error moving appointment to inactive:", error);
    throw error;
  }
};

