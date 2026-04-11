// components/home/BookingModal.jsx
import { useState } from "react";
import { X, Check, Calendar, Clock, User, ChevronDown } from "lucide-react";
import { useStore } from "../../../store";
import Swal from "sweetalert2";


function Step({ number, label, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
        done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
      }`}>
        {done ? <Check size={10} strokeWidth={3} /> : number}
      </div>
      <span className={`text-xs font-medium ${done ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}

function DoctorOption({ doctor, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(doctor)}
      disabled={!doctor.available}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${
        selected
          ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      } ${!doctor.available ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      <div className="flex-1 text-left min-w-0">
        <p className="text-slate-800 text-sm font-semibold leading-tight">{doctor.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">{doctor.specialty} · {doctor.experience}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
      }`}>
        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}

function TimeSlot({ slot, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(slot)}
      className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 ${
        selected
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {slot}
    </button>
  );
}

export default function BookingModal() {
  const bookingModal      = useStore(s => s.bookingModal);
  const closeBookingModal = useStore(s => s.closeBookingModal);
  const bookAppointment   = useStore(s => s.bookAppointment);
  const showToast         = useStore(s => s.showToast);
  
  // Get the logged-in user's data
  const user = useStore(s => s.user);
  const profile = useStore(s => s.profile);

  const [selectedDoctor, setSelectedDoctor] = useState(bookingModal?.doctor || null);
  const [selectedSlot,   setSelectedSlot]   = useState(bookingModal?.slot || null);
  const [selectedDate,   setSelectedDate]   = useState("");
  const [patientName,    setPatientName]    = useState(profile?.name || user?.displayName || "");
  const [patientAge,     setPatientAge]     = useState("");
  const [patientGender,  setPatientGender]  = useState("");
  const [issue,          setIssue]          = useState("");
  const [loading,        setLoading]        = useState(false);
  
  if (!bookingModal) return null;
  const { clinic } = bookingModal;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  console.log("saddsf",selectedDoctor, selectedSlot, selectedDate, user);
  const canBook = !!(
    selectedDoctor && 
    selectedSlot && 
    selectedDate && 
    user && 
    patientName.trim() && 
    patientAge && 
    patientGender && 
    issue.trim()
  );

  console.log(canBook)

  const handleBook = async () => {
    if (!canBook) {
        if (!user) showToast("Please login to book", "error");
        return;
    }

    const { isConfirmed } = await Swal.fire({
      title: 'Confirm Booking?',
      html: `
        <div style="text-align: left; font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.6;">
          <p><strong>Clinic:</strong> ${clinic.name}</p>
          <p><strong>Doctor:</strong> ${selectedDoctor.name}</p>
          <p><strong>Time:</strong> ${selectedDate} at ${selectedSlot}</p>
          <p><strong>Patient:</strong> ${patientName.trim()} (${patientAge}y, ${patientGender})</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Book Appointment',
      cancelButtonText: 'Cancel'
    });

    if (!isConfirmed) return;

    setLoading(true);
    
    // Construct the payload with both Patient and Clinic info
    const payload = {
      // Patient Info
      patientUid: user.uid,
      patientName: patientName.trim(),
      patientAge: patientAge,
      patientGender: patientGender,
      patientPhone: profile?.phone || "",
      patientProfileImage: profile?.photoURL || null,

      // Clinic Info
      clinicId: clinic.id, 
      clinicName: clinic.name,
      clinicAddress: clinic.address, 
      clinicImage: clinic.coverImage,

      // Appointment Info
      doctorId: selectedDoctor.id, 
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      date: selectedDate, 
      time: selectedSlot, 
      notes: issue.trim(),
    };

    const result = await bookAppointment(payload);
    setLoading(false);
    
    if (result) {
      showToast(`Booked at ${clinic.name}!`, "success");
      closeBookingModal(); // Close after success
    } else {
      showToast("Booking failed. Try again.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeBookingModal} />

      <div className="relative w-full bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="sticky top-0 bg-white z-10 pt-3 pb-0">
          <div className="flex justify-center mb-3">
            <span className="w-8 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-slate-900 font-bold text-[17px] tracking-tight">Book Appointment</h2>
              <p className="text-slate-400 text-xs mt-0.5">{clinic.name}</p>
            </div>
            <button
              onClick={closeBookingModal}
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X size={15} className="text-slate-600" />
            </button>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100">
            <Step number="1" label="Doctor" done={!!selectedDoctor} />
            <div className="flex-1 h-px bg-slate-100" />
            <Step number="2" label="Date & Time" done={!!selectedDate && !!selectedSlot} />
            <div className="flex-1 h-px bg-slate-100" />
            <Step number="3" label="Confirm" done={false} />
          </div>
        </div>

        <div className="px-5 pt-4 pb-6 space-y-6">
          {/* Doctor */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-2.5">Select Doctor</p>
            <div className="space-y-2">
              {clinic.doctors.map(doc => (
                <DoctorOption
                  key={doc.id} doctor={doc}
                  selected={selectedDoctor?.id === doc.id}
                  onSelect={setSelectedDoctor}
                />
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-2.5">Select Date</p>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Time slots */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-2.5">Select Time</p>
            <div className="flex flex-wrap gap-2">
              {!selectedDoctor ? (
                <p className="text-sm text-slate-400 mt-1">Please select a doctor first.</p>
              ) : selectedDoctor.timeSlots?.length > 0 ? (
                selectedDoctor.timeSlots.map(slot => (
                  <TimeSlot key={slot} slot={slot} selected={selectedSlot === slot} onSelect={setSelectedSlot} />
                ))
              ) : (
                <p className="text-sm text-slate-400 mt-1">No time slots available for this doctor.</p>
              )}
            </div>
          </div>

          {/* Patient Details & Reason */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center justify-between">
              Patient Details <span className="normal-case text-slate-400 text-[10px] font-normal">* All fields required</span>
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  placeholder="Age"
                  min="0"
                  max="120"
                  className="w-1/3 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                />
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value)}
                  className={`w-2/3 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white ${!patientGender ? "text-slate-400" : "text-slate-700"}`}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male" className="text-slate-700">Male</option>
                  <option value="Female" className="text-slate-700">Female</option>
                  <option value="Other" className="text-slate-700">Other</option>
                </select>
              </div>
              <textarea
                value={issue}
                onChange={e => setIssue(e.target.value)}
                rows={2}
                placeholder="Reason for visit / Main symptoms..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Summary chip (shows when all selected) */}
          {canBook && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-800 text-xs font-semibold truncate">{selectedDoctor?.name}</p>
                <p className="text-slate-400 text-[11px]">{selectedDate} · {selectedSlot}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleBook}
            disabled={!canBook || loading}
            className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 ${
              canBook && !loading
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Booking…" : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}