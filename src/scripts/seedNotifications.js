import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV6tcC9RWelDtFR77cai7W_Ubi5fVcoXw",
  authDomain: "k-clinics.firebaseapp.com",
  projectId: "k-clinics",
  storageBucket: "k-clinics.firebasestorage.app",
  messagingSenderId: "1048954351527",
  appId: "1:1048954351527:web:3917183378d7eb24215082",
  measurementId: "G-S2T3F78WHR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = "tZ9L3Hn8pXOfZ7U2m1W7G7j2P0q2"; // Example user ID (usually the one you use for testing)

const MOCK_NOTIFICATIONS = [
  {
    userId: userId,
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Sharma at Vanguard Health has been confirmed for tomorrow at 10:00 AM.",
    type: "booking",
    read: false,
    createdAt: serverTimestamp()
  },
  {
    userId: userId,
    title: "Health Tip",
    message: "Don't forget to stay hydrated! Drinking 8 glasses of water a day improves your skin and energy levels.",
    type: "info",
    read: false,
    createdAt: serverTimestamp()
  },
  {
    userId: userId,
    title: "Clinic Update",
    message: "Radiant Health is now offering specialized pediatric care on weekends.",
    type: "alert",
    read: true,
    createdAt: serverTimestamp()
  }
];

async function seedNotifications() {
  try {
    for (const n of MOCK_NOTIFICATIONS) {
      await addDoc(collection(db, "notifications"), n);
      console.log(`Added notification: ${n.title}`);
    }
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seedNotifications();
