import React, { useState, useRef } from 'react';
import { auth, db, storage } from '../../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MapPin, Camera, Loader2, Upload, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';


const STEPS = ['Clinic Info', 'Contact & Auth', 'Location'];

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-slate-900 text-white ring-4 ring-slate-900/10' : 'bg-slate-100 text-slate-400'}
            `}>
              {i < current ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap transition-colors ${i === current ? 'text-slate-900' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 transition-all duration-500 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ type = 'text', value, onChange, placeholder, required, className = '', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`
        w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50
        focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-900/8
        outline-none transition-all text-sm text-slate-900 placeholder:text-slate-300
        ${className}
      `}
      {...props}
    />
  );
}

// ────────── Location Status Badge ──────────
function LocationBadge({ status, coords, address }) {
  if (status === 'idle') return null;
  if (status === 'loading') return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs">
      <Loader2 size={12} className="animate-spin" /> Acquiring GPS signal…
    </div>
  );
  if (status === 'error') return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs">
      <AlertCircle size={12} /> Location unavailable. Please enter manually.
    </div>
  );
  if (status === 'success') return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
      <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Location Verified</p>
        {address && <p className="text-xs text-emerald-700 truncate">{address}</p>}
        <p className="text-[10px] text-emerald-500 font-mono mt-0.5">
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}

// ────────── Map Pin Preview ──────────
function MiniMap({ lat, lng }) {
  if (!lat || !lng) return null;
  // Static map using OpenStreetMap tiles via a no-auth embed
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 h-36 mt-2">
      <iframe
        title="Clinic location"
        src={mapUrl}
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}

// ══════════════════════════════════════════════
export default function ClinicRegister() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locStatus, setLocStatus] = useState('idle'); // idle | loading | success | error
  const [image, setImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const navigate=useNavigate()

  const [formData, setFormData] = useState({
    name: '', regNumber: '', specialty: '',
    email: '', phone: '', password: '',
    address: '', lat: null, lng: null,
    geoAddress: '',     // reverse-geocoded readable address
    plusCode: '',       // Google Plus Code if available
    accuracy: null,     // GPS accuracy in meters
    altitude: null,
  });

const performSearch = async (query) => {
  if (!query || query.length < 3) {
    setSearchResults([]);
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      {
        headers: {
          // IMPORTANT: Nominatim requires a User-Agent. 
          // Replace with your own app name/email to avoid being flagged as a bot.
          'User-Agent': '100KClinics-App/1.0 (contact@yourdomain.com)'
        }
      }
    );
    
    if (res.status === 429) {
      console.error("Rate limit hit. Wait a few seconds.");
      return;
    }

    const data = await res.json();
    setSearchResults(data);
  } catch (err) {
    console.error("Search error", err);
  }
}; 
  
const debouncedSearch = React.useMemo(
  () => debounce((q) => performSearch(q), 600),
  []
);

const handleSearchLocation = (query) => {
  set("searchQuery", query); // Update the UI input immediately
  debouncedSearch(query);     // Delay the API call
};

const handleSelectLocation = (place) => {
  const lat = parseFloat(place.lat);
  const lng = parseFloat(place.lon);

  set("lat", lat);
  set("lng", lng);
  set("geoAddress", place.display_name);
  set("address", place.display_name);

  setSearchResults([]);
};
  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const generateClinicId = (name) => {
    const prefix = (name.substring(0, 2) || 'CL').toUpperCase();
    const suffix = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${suffix}`;
  };

  // ── Reverse geocode using Nominatim (free, no key needed) ──
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  };

  const handleLocationFetch = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      return;
    }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, altitude } = pos.coords;
        const geoAddress = await reverseGeocode(lat, lng);
        setFormData(p => ({
          ...p,
          lat, lng, accuracy,
          altitude: altitude ?? null,
          geoAddress: geoAddress || '',
          // Pre-fill address field if empty
          address: p.address || geoAddress || p.address,
        }));
        setLocStatus('success');
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Image handling ──
  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setImage(file);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;
      const clinicId = generateClinicId(formData.name);

      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `clinics/${clinicId}/cover.jpg`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Build the location object — GeoPoint for Firestore geo-queries
      const locationPayload = formData.lat && formData.lng
        ? {
            geoPoint: new GeoPoint(formData.lat, formData.lng),
            lat: formData.lat,
            lng: formData.lng,
            accuracy: formData.accuracy,
            altitude: formData.altitude,
            geoAddress: formData.geoAddress,
          }
        : null;

      await setDoc(doc(db, 'clinics', uid), {
        clinicId,
        ownerUid: uid,
        name: formData.name,
        regNumber: formData.regNumber,
        specialty: formData.specialty,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        location: locationPayload,
        coverImage: imageUrl,
        createdAt: serverTimestamp(),
        isOpen: false,
        rating: 5.0,
        reviewCount: 0,
        doctors: [],
        facilities: [],
        role: 'clinic_admin',
      });

      navigate('/')
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return formData.name.trim() && formData.regNumber.trim();
    if (step === 1) return formData.email.trim() && formData.password.length >= 6;
    return true;
  };


  // ══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100KClinics Network
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register Your Clinic</h1>
          <p className="text-slate-500 text-sm mt-1.5">Join thousands of clinics managing patients smarter</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <StepIndicator current={step} />

            {/* ───── Step 0: Clinic Info ───── */}
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-0.5">Clinic Details</h2>
                  <p className="text-sm text-slate-500">Basic information about your medical facility</p>
                </div>

                {/* Cover image upload */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden group
                    ${dragOver ? 'border-emerald-400 bg-emerald-50' : image ? 'border-transparent' : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/60'}
                  `}
                >
                  {image ? (
                    <>
                      <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Clinic cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <Upload size={14} /> Change Photo
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                      <Camera size={24} className="opacity-50" />
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-widest">Upload Clinic Cover</p>
                        <p className="text-[11px] mt-0.5">Drag & drop or click · JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Clinic Name" hint="Required">
                    <Input value={formData.name} onChange={v => set('name', v)} placeholder="City Health Clinic" required />
                  </Field>
                  <Field label="Registration Number" hint="Required">
                    <Input value={formData.regNumber} onChange={v => set('regNumber', v)} placeholder="MED-99201" required />
                  </Field>
                </div>

                <Field label="Specialty / Services">
                  <Input value={formData.specialty} onChange={v => set('specialty', v)} placeholder="General Medicine, Pediatrics, Dermatology…" />
                </Field>
              </div>
            )}

            {/* ───── Step 1: Contact & Auth ───── */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-0.5">Contact & Access</h2>
                  <p className="text-sm text-slate-500">How patients and admins reach you</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Address" hint="Required">
                    <Input type="email" value={formData.email} onChange={v => set('email', v)} placeholder="admin@clinic.com" required />
                  </Field>
                  <Field label="Phone Number">
                    <Input type="tel" value={formData.phone} onChange={v => set('phone', v)} placeholder="+91 98765 43210" />
                  </Field>
                </div>

                <Field label="Password" hint="Min. 6 characters">
                  <Input type="password" value={formData.password} onChange={v => set('password', v)} placeholder="Create a strong password" required />
                </Field>

                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3 items-start">
                  <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Your email becomes the admin login for this clinic account. Keep credentials secure and accessible only to authorized staff.
                  </p>
                </div>
              </div>
            )}

            {/* ───── Step 2: Location ───── */}
            {step === 2 && (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-0.5">Clinic Location</h2>
      <p className="text-sm text-slate-500">
        Use GPS or search for your clinic location manually
      </p>
    </div>

    {/* 🔍 SEARCH LOCATION */}
    <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-white">
      <p className="text-sm font-bold text-slate-700">Search Location</p>

      <div className="relative">
        <Input
          value={formData.searchQuery || ""}
          onChange={(v) => handleSearchLocation(v)} // 👈 implement below
          placeholder="Search clinic address..."
          className="pr-10"
        />
        <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          {searchResults.map((place, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectLocation(place)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b last:border-0"
            >
              {place.display_name}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* 📍 GPS OPTION */}
    <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/50">
      <div className="flex flex-col items-center text-center gap-2">
        <p className="text-sm font-bold text-slate-700">Use Device GPS</p>

        <button
          type="button"
          onClick={handleLocationFetch}
          disabled={locStatus === "loading"}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
            ${
              locStatus === "success"
                ? "bg-emerald-500 text-white"
                : "bg-slate-900 text-white hover:bg-slate-700 active:scale-95"
            }
            disabled:opacity-60
          `}
        >
          {locStatus === "loading" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Navigation size={13} />
          )}
          {locStatus === "success" ? "Re-capture" : "Capture GPS"}
        </button>

        <p className="text-xs text-slate-500">
          Uses your current location automatically
        </p>
      </div>

      <LocationBadge
        status={locStatus}
        coords={formData.lat ? { lat: formData.lat, lng: formData.lng } : null}
        address={formData.geoAddress}
      />

      {formData.lat && formData.lng && (
        <MiniMap lat={formData.lat} lng={formData.lng} />
      )}
    </div>

    {/* 📍 Address Field */}
    <Field label="Street Address" hint="Auto-filled from search or GPS">
      <div className="relative">
        <Input
          value={formData.address}
          onChange={(v) => set("address", v)}
          placeholder="123 Medical Drive, City, State"
          className="pr-10"
        />
        <MapPin
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </Field>

    {/* Debug */}
    {formData.lat && (
      <details className="text-xs">
        <summary className="text-slate-400 cursor-pointer hover:text-slate-600">
          View stored GPS data →
        </summary>
        <div className="mt-2 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded-xl px-4 py-3 space-y-0.5">
          <div>lat: {formData.lat}</div>
          <div>lng: {formData.lng}</div>
          <div>accuracy: ±{formData.accuracy?.toFixed(1)}m</div>
          <div>geoAddress: {formData.geoAddress || "—"}</div>
        </div>
      </details>
    )}
  </div>
)}

            {/* ───── Navigation ───── */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-0 transition-all"
              >
                ← Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="px-8 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 active:scale-95 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Registering…</> : <>Complete Registration ✓</>}
                </button>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-10 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="text-[11px] text-slate-400">
              Already registered? <a href="/login" className="text-slate-700 font-semibold hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}