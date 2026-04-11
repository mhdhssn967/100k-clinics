import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

async function check() {
  console.log("Fetching all clinics...");
  const snap = await getDocs(collection(db, "clinics"));
  snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`DocID: ${doc.id} | Name: ${data.name} | Role: ${data.role} | ownerUid: ${data.ownerUid} | Email: ${data.email}`);
  });
  process.exit();
}
check();
