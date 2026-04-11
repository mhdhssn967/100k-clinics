import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

const SLOT_PRESETS = [
  "7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM",
  "10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM",
  "1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM",
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSlots(count) {
  const shuffled = [...SLOT_PRESETS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).sort((a, b) => {
      return new Date('1970/01/01 ' + a) - new Date('1970/01/01 ' + b);
  });
}

async function runMigration() {
  console.log("🔥 Starting doctor timeSlot migration...");
  try {
    const clinicsRef = collection(db, "clinics");
    const snapshot = await getDocs(clinicsRef);
    let updatedCount = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const doctors = data.doctors || [];
      
      let changed = false;
      const updatedDoctors = doctors.map(doc => {
        if (!doc.timeSlots || doc.timeSlots.length === 0) {
          changed = true;
          return {
            ...doc,
            timeSlots: getRandomSlots(getRandomInt(3, 5))
          };
        }
        return doc;
      });

      if (changed) {
        await updateDoc(doc(db, "clinics", docSnap.id), {
          doctors: updatedDoctors
        });
        updatedCount++;
        console.log(`✅ Updated ${docSnap.id} with timeSlots for doctors`);
      }
    }
    
    console.log(`🎉 Migration complete! Modified ${updatedCount} clinics.`);
  } catch (err) {
    console.error("❌ Failed migration:", err);
  } finally {
    process.exit(0);
  }
}

runMigration();
