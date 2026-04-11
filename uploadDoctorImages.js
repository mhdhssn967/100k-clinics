import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { readFileSync, existsSync } from "fs";
import path from "path";

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

// Random number between 1 and 20 (for doctor images 1.jpg to 20.jpg)
function getRandomImageIndex() {
  return Math.floor(Math.random() * 20) + 1;
}

async function uploadAllDoctorImages() {
  console.log("🔥 Starting Doctor Images Uploader...");
  try {
    const clinicsRef = collection(db, "clinics");
    const snapshot = await getDocs(clinicsRef);
    
    let clinicCounter = 1;
    let totalDoctorsProcessed = 0;

    for (const docSnap of snapshot.docs) {
      const clinicData = docSnap.data();
      const clinicId = docSnap.id; // Same as ownerUid in our seed script
      
      const doctors = clinicData.doctors || [];
      if (doctors.length === 0) {
        console.log(`\n⏭️ [${clinicCounter}/${snapshot.docs.length}] No doctors found in clinic ${clinicData.name}. Skipping...`);
        clinicCounter++;
        continue;
      }

      console.log(`\n⏳ [${clinicCounter}/${snapshot.docs.length}] Processing Clinic ${clinicData.name} ID: ${clinicId} with ${doctors.length} doctors...`);
      
      const updatedDoctors = [];

      for (let i = 0; i < doctors.length; i++) {
        const docObj = doctors[i];
        const randomImgIndex = getRandomImageIndex();
        const filePath = `./doctorimages/${randomImgIndex}.jpg`;

        if (!existsSync(filePath)) {
          console.error(`   ❌ Missing local image! Expected ${filePath}`);
          updatedDoctors.push(docObj); // keep unchanged
          continue;
        }

        try {
          const fileBuffer = readFileSync(filePath);

          // Build storage path: clinics/[ownerUid]/doctors/[doctor-id-slug].jpg
          // docObj.id can safely be used if it is clean. If it has spaces, maybe sanitize it. 
          // The ids we created look like doc_16...
          const safeDocId = docObj.id.replace(/[^a-zA-Z0-9_-]/g, "");
          const storagePath = `clinics/${clinicId}/doctors/${safeDocId}.jpg`;
          const storageRef = ref(storage, storagePath);

          // Upload image
          await uploadBytes(storageRef, new Uint8Array(fileBuffer), { contentType: "image/jpeg" });
          
          // Get public URL
          const downloadURL = await getDownloadURL(storageRef);
          console.log(`   ✅ Dr. ${docObj.name} uploaded -> gs://.../${safeDocId}.jpg`);
          
          // Update local doctor object
          updatedDoctors.push({
            ...docObj,
            avatar: downloadURL
          });
          
          totalDoctorsProcessed++;

        } catch (uploadErr) {
           console.error(`   ❌ Failed to upload image for Dr. ${docObj.name}: ${uploadErr.message}`);
           updatedDoctors.push(docObj); // keep unchanged
        }
      }

      // Finally update the whole doctors array back to firestore for this clinic
      await updateDoc(doc(db, "clinics", docSnap.id), {
        doctors: updatedDoctors
      });
      console.log(`   💾 Firestore updated successfully for clinic ${clinicData.name}.`);

      clinicCounter++;
    }
    
    console.log(`\n🎉 Success! Uploaded and linked ${totalDoctorsProcessed} doctor images across ${snapshot.docs.length} clinics!`);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal Pipeline Error: ", error);
    process.exit(1);
  }
}

uploadAllDoctorImages();
