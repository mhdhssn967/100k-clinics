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

const GALLERIES = [
  [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
    "https://images.unsplash.com/photo-1538108149393-fdfd81895907?w=800&q=80",
    "https://images.unsplash.com/photo-1502740330022-c7b97ef78070?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&q=80",
    "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=800&q=80",
    "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1631217818242-df0c67242ad5?w=800&q=80",
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&q=80",
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80"
  ]
];

async function addGalleries() {
  try {
    const querySnapshot = await getDocs(collection(db, "clinics"));
    let count = 0;
    
    for (const docSnap of querySnapshot.docs) {
      if (count >= 10) break;
      
      const clinicRef = doc(db, "clinics", docSnap.id);
      const gallery = GALLERIES[count % GALLERIES.length];
      
      await updateDoc(clinicRef, {
        gallery: gallery,
        coverImage: gallery[0]
      });
      
      console.log(`Updated clinic: ${docSnap.data().name}`);
      count++;
    }
    
    console.log(`Migration complete! Updated ${count} clinics.`);
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

addGalleries();
