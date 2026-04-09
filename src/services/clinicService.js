import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calculateDistance, getUserLocation } from "./helper";

const CLINICS_COLLECTION = "clinics";

/**
 * Fetch all registered clinics from Firestore
 */
export async function fetchClinics() {
  try {
    const clinicsRef = collection(db, CLINICS_COLLECTION);
    const q = query(clinicsRef);
    const querySnapshot = await getDocs(q);

    // 🌍 Get user location
    let userLocation = null;
    try {
      userLocation = await getUserLocation();
    } catch (err) {
      console.warn("Location permission denied");
    }

    const clinics = querySnapshot.docs.map(doc => {
      const data = doc.data();

      let distance = "Location unavailable";

      if (userLocation && data?.location?.lat && data?.location?.lng) {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          data.location.lat,
          data.location.lng
        );

        distance = `${dist.toFixed(1)} km`;
      }

      return {
        id: doc.id,
        ...data,
        distance,
      };
    });

    // 🔥 Optional: sort by nearest
    clinics.sort((a, b) => {
      const d1 = parseFloat(a.distance) || Infinity;
      const d2 = parseFloat(b.distance) || Infinity;
      return d1 - d2;
    });

    return clinics;

  } catch (error) {
    console.error("Error fetching clinics:", error);
    throw new Error("Failed to load clinics. Please check your connection.");
  }
}

/**
 * Fetch a single clinic by its custom clinicId (the document ID)
 */
export async function fetchClinicById(id) {
  try {
    const docRef = doc(db, CLINICS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn("No such clinic found with ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error fetching clinic detail:", error);
    throw error;
  }
}

/**
 * Basic search functionality using Firestore.
 * Note: Firestore doesn't support full-text search (like "contains").
 * For now, we fetch and filter client-side. 
 * For large datasets, consider Algolia or simple "startAt" queries.
 */
export async function searchClinics(searchString) {
  try {
    const allClinics = await fetchClinics();
    const q = searchString.toLowerCase();
    
    return allClinics.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      c.specialty?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  } catch (error) {
    console.error("Error searching clinics:", error);
    return [];
  }
}