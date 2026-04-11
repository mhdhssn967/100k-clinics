import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
  const snap = await getDocs(collection(db, "clinics"));
  console.log("Total clinics:", snap.docs.length);
  snap.docs.forEach(doc => {
    console.log("Doc ID:", doc.id, " | ownerUid:", doc.data().ownerUid, " | role:", doc.data().role, " | email:", doc.data().email);
  });
  process.exit(0);
}
check();
