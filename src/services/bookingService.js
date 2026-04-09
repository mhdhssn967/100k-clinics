// src/services/bookingService.js
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";

/**
 * Creates a new booking in the top-level 'bookings' collection
 */
export const createBooking = async (bookingData) => {
  try {
    const bookingsRef = collection(db, "bookings");
    
    const newBooking = {
      ...bookingData,
      status: "pending", // initial status
      createdAt: serverTimestamp(),
      // Ensure date is searchable as a string or timestamp
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(bookingsRef, newBooking);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error };
  }
};

/**
 * Fetches all bookings for a specific patient
 */
export const getPatientBookings = async (patientUid) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("patientUid", "==", patientUid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching patient bookings:", error);
    return [];
  }
};