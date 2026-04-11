import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { readFileSync } from "fs";

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
const storage = getStorage(app);

async function uploadAllImages() {
  console.log("🔥 Starting Storage Linker...");
  try {
    const clinicsRef = collection(db, "clinics");
    const snapshot = await getDocs(clinicsRef);
    
    let index = 1;
    for (const docSnap of snapshot.docs) {
      if (index > 15) break; // Only 15 images
      const clinic = docSnap.data();
      const clinicId = clinic.clinicId; 
      
      const filePath = `./clinicimages/${index}.jpg`;
      console.log(`\n⏳ [${index}/15] Processing ${clinic.name} (${clinicId}) -> ${filePath}...`);
      
      // Read file
      let fileBuffer;
      try {
         fileBuffer = readFileSync(filePath);
      } catch (err) {
         console.error(`❌ Could not find ${filePath}. Skipping...`);
         index++;
         continue;
      }
      
      // Upload to Storage
      const storagePath = `clinics/${clinicId}/cover.jpg`;
      const storageRef = ref(storage, storagePath);
      
      console.log(`   Uploading to gs://${firebaseConfig.storageBucket}/${storagePath}`);
      await uploadBytes(storageRef, new Uint8Array(fileBuffer), { contentType: "image/jpeg" });
      
      // Get URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`   Fetched Download URL: ${downloadURL.substring(0, 50)}...`);
      
      // Update Firestore
      await updateDoc(doc(db, "clinics", docSnap.id), {
        coverImage: downloadURL
      });
      console.log(`✅ Firestore record updated for ${clinic.name}!`);
      
      index++;
    }
    
    console.log("\n🎉 All 15 images successfully uploaded and linked to Firestore!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Pipeline Error: ", error);
    process.exit(1);
  }
}

uploadAllImages();
