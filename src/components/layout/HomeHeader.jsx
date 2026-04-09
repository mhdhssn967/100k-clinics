// components/home/HomeHeader.jsx
import { useEffect, useState } from "react";
import { Search, MapPin, Bell, ChevronDown } from "lucide-react";
import { useStore } from "../../store";


export default function HomeHeader() {
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const appointments   = useStore(s => s.appointments);
  const [localQuery, setLocalQuery] = useState("");
  const [focused, setFocused] = useState(false);

    const user = useStore(s => s.user);
    const profile = useStore(s => s.profile);
    
    const payload = {
        // Patient Info (From Auth Store)
        patientUid: user.uid,
        patientName: profile?.name || user.displayName || "Guest Patient",
        patientPhone: profile?.phone || "",
        patientProfileImage:profile?.photoURL,
      };
 
  const upcoming = appointments.filter(
    a => a.date >= new Date().toISOString().split("T")[0] && a.status === "confirmed"
  ).length;
 
  const handleSearch = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    setSearchQuery(val);
  };

  // feteching location

  const [location, setLocation] = useState("Detecting location...");
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse Geocoding using a free API like OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          
          // Extract City and State
          const city = data.address.city || data.address.town || data.address.village;
          const state = data.address.state;
          
          setLocation(`${city}, ${state}`);
        } catch (error) {
          setLocation("Can't detect location"); // Fallback
        }
      }, () => {
        setLocation("Can't detect location"); // Fallback if user denies permission
      });
    }
  }, []);
  return (
    <div className="bg-white px-5 pt-12 pb-4 border-b border-slate-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <button className="flex items-center gap-1 mb-1.5 group">
            <MapPin size={11} className="text-emerald-500" strokeWidth={2.5} />
            <div className="flex items-center gap-1.5">
      {/* <MapPin size={12} className="text-emerald-500" /> */}
      <span className="text-slate-500 text-xs font-medium tracking-wide">
        {location}
      </span>
    </div>
            <ChevronDown size={11} className="text-slate-400 ml-0.5" />
          </button>
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">Good morning, {payload.patientName}</h1>
        </div>
 
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
              <Bell size={15} className="text-slate-600" strokeWidth={2} />
            </button>
            {upcoming > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {upcoming}
              </span>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
  {payload.patientProfileImage ? (
    <img 
      src={payload.patientProfileImage} 
      alt={payload.patientName || "Patient"} 
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="uppercase tracking-tighter">
      {payload.patientName?.charAt(0) || "P"}
    </span>
  )}
</div>
        </div>
      </div>
 
      <div className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 border transition-all duration-150 ${
        focused ? "bg-white border-emerald-400 shadow-sm" : "bg-slate-50 border-slate-200"
      }`}>
        <Search size={15} className={focused ? "text-emerald-500" : "text-slate-400"} strokeWidth={2.5} />
        <input
          type="text"
          value={localQuery}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Clinics, doctors, specialties…"
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
}