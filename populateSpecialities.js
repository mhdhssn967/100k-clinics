import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

async function run() {
  console.log("🔥 Starting Specialities Migration...");
  try {
    const clinicsRef = collection(db, "clinics");
    const snapshot = await getDocs(clinicsRef);
    
    let processed = 0;
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const doctors = data.doctors || [];
      
      const specs = new Set();
      doctors.forEach(d => {
        if (d.specialty) specs.add(d.specialty);
      });
      
      const specialitiesArray = Array.from(specs);
      
      await updateDoc(doc(db, "clinics", docSnap.id), {
        specialities: specialitiesArray
      });
      
      console.log(`✅ Clinic ${data.name} updated with ${specialitiesArray.length} specialities: [${specialitiesArray.join(", ")}]`);
      processed++;
    }
    
    console.log(`\n🎉 Migration complete! ${processed} clinics processed.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
  }
}

run();
