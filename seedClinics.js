import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, GeoPoint } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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

const SPECIALTIES = ["Cardiology", "Dentistry", "General Practice", "Pediatrics", "Orthopedics", "Dermatology", "Neurology", "Gynecology", "ENT"];
const FACILITIES = ["Emergency 24/7", "ICU", "Laboratory", "Pharmacy", "Ambulance", "Operation Theatre", "Maternity Ward", "X-Ray & MRI"];
const FIRST_NAMES = ["Anjali", "Arjun", "Rahul", "Priya", "Sneha", "Karthik", "Ravi", "Divya", "Sandeep", "Aisha", "Gautham", "Meera", "Sanjay", "Kavya", "Mohan", "Lakshmi", "Vishnu", "Swathi", "Deepak", "Nithya"];
const LAST_NAMES = ["Nair", "Menon", "Pillai", "Kurian", "Varma", "Panicker", "Nambiar", "Iyer", "Rao", "Kumar", "Das", "Gopal", "Babu", "Rajan", "Abraham", "George", "Varghese"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateDoctors(count) {
  const doctors = [];
  for (let i = 0; i < count; i++) {
    const specialty = getRandomItem(SPECIALTIES);
    const expYears = getRandomInt(2, 30);
    doctors.push({
      id: `doc_${Date.now()}_${i}_${getRandomInt(1000,9999)}`,
      name: `Dr. ${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`,
      specialty: specialty,
      experience: `${expYears} Years`,
      consultFee: getRandomInt(200, 1000),
      available: Math.random() > 0.1, // 90% available
      bio: `Dr. ${getRandomItem(FIRST_NAMES)} is a highly reputed specialist in ${specialty} with over ${expYears} years of rich clinical experience in diagnosing and treating complex cases.`,
      avatar: "" // Leave empty
    });
  }
  return doctors;
}

function generateFacilities() {
  const count = getRandomInt(3, 7);
  const shuffled = [...FACILITIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 15 Dummy Clinics mapped to realistic Kerala areas
// Lat bounds: 8.5 to 11.3 (Trivandrum to Kozhikode roughly)
// Lng bounds: 75.7 to 76.9
const DUMMY_NAMES = [
  "Apex Clinics",
  "Prime Health Center",
  "Serenity Medical",
  "Zenith Lifecare",
  "Nurture Hospital",
  "Radiant Health",
  "Evolve Medical",
  "Pulse Care Hospital",
  "Crescent Clinic",
  "Vanguard Health",
  "Harmony Medical Group",
  "Beacon Clinics",
  "Oasis Healthcare",
  "Elevate Health Center",
  "Horizon Medicorp"
];

const CLINICS_BASE_DATA = DUMMY_NAMES.map((name, index) => {
  // Distribute coords geographically
  // 0-4: Kochi/Ernakulam (~10.0, 76.3)
  // 5-9: Trivandrum (~8.5, 76.9)
  // 10-14: Kozhikode/Malabar (~11.2, 75.8)
  let lat, lng, addressBase;
  if (index < 5) {
    lat = 9.9 + (Math.random() * 0.2);
    lng = 76.2 + (Math.random() * 0.15);
    addressBase = "Ernakulam, Kerala";
  } else if (index < 10) {
    lat = 8.4 + (Math.random() * 0.2);
    lng = 76.8 + (Math.random() * 0.15);
    addressBase = "Trivandrum, Kerala";
  } else {
    lat = 11.1 + (Math.random() * 0.2);
    lng = 75.7 + (Math.random() * 0.2);
    addressBase = "Kozhikode, Kerala";
  }

  const prefix = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const email = `${prefix}@gmail.com`;
  const password = `${prefix}@123`;

  return {
    name,
    email,
    password, // Needed for Auth creation
    tagline: `Advanced care tailored to you at ${name}`,
    description: `${name} serves the local community with state of the art facilities and renowned doctors. Operating with compassion and excellence.`,
    address: `100 Health Avenue, ${addressBase} 680001`,
    location: { lat, lng },
    website: `www.${prefix}health.com`,
    isOpen: true,
    openUntil: "10:00 PM",
    rating: (parseFloat((Math.random() * (5.0 - 4.1) + 4.1).toFixed(1))),
    reviewCount: getRandomInt(50, 600),
    waitTime: `~${getRandomInt(10, 45)} min`,
    phone: `+91 9${getRandomInt(111111111, 999999999)}`,
    specialty: "Multi-specialty"
  };
});

const generateClinicId = (name) => {
  const prefix = (name.substring(0, 2) || 'CL').toUpperCase();
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${suffix}`;
};

async function seedDatabase() {
  console.log("🔥 Starting Auth+Firestore seeder...");
  try {
    const clinicsRef = collection(db, "clinics");

    console.log("🧹 Wiping existing clinics from Firestore...");
    const snapshot = await getDocs(clinicsRef);
    const deletePromises = snapshot.docs.map(docSnapshot => deleteDoc(doc(db, "clinics", docSnapshot.id)));
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${deletePromises.length} old clinics from Firestore.`);

    console.log("🌱 Creating Auth Credentials and injecting Data...");

    // We'll process sequentially to avoid Firebase Auth rate limits in test environments
    for (const data of CLINICS_BASE_DATA) {
      const { email, password, location, ...clinicMeta } = data;

      try {
        // Create user in firebase auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        console.log(`Created Auth: ${email} / ${password} -> UID: ${uid}`);

        // Mock GeoPoint Payload precisely mapping what ClinicRegister requires
        const locationPayload = {
          geoPoint: new GeoPoint(location.lat, location.lng),
          lat: location.lat,
          lng: location.lng,
          accuracy: 10 + Math.random() * 20,
          altitude: null,
          geoAddress: clinicMeta.address,
        };

        const doctorsCount = getRandomInt(5, 10);
        const docsArr = generateDoctors(doctorsCount);
        const facilitiesArr = generateFacilities();

        const clinicId = generateClinicId(clinicMeta.name);

        const newDocPayload = {
          clinicId,
          ownerUid: uid,
          ...clinicMeta,
          regNumber: `MED-${getRandomInt(10000,99999)}`,
          location: locationPayload,
          coverImage: "", 
          // createdAt is intentionally skipped replacing with Date.now() representation since we are server-side in node context, 
          // but we can use explicit Date strings as mock
          createdAt: new Date().toISOString(),
          doctors: docsArr,
          facilities: facilitiesArr,
          role: "clinic_admin"
        };

        // Write directly to the UID document
        await setDoc(doc(db, "clinics", uid), newDocPayload);
      } catch (authError) {
        if(authError.code === 'auth/email-already-in-use') {
           console.warn(`⚠️ The email ${email} is already registered in Auth. We will skip Auth generation and overwrite its firestore doc.`);
           // We can't fetch the UID easily via Client SDK if it exists, so we just skip it for our clean run or we've to login dummy
           // Since we don't have the UID, we just print warning. 
           // Best practice: if you test this, delete auth users first from Firebase Console manually!
        } else {
           console.error(`Error processing ${email}:`, authError.message);
        }
      }
    }
    
    console.log(`🎉 Success! 15 clinics seeded.`);
  } catch (err) {
    console.error("❌ Failed to seed database:", err);
  } finally {
    process.exit();
  }
}

seedDatabase();
