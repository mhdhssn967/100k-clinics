// components/home/QuickStats.jsx
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { useStore } from "../../../store";


export default function QuickStats() {
  const appointments = useStore(s => s.appointments);
  const today = new Date().toISOString().split("T")[0];

  const upcoming  = appointments.filter(a => a.date >= today && a.status === "confirmed").length;
  const completed = appointments.filter(a => a.status === "completed").length;
  const total     = appointments.length;

  const stats = [
    { label: "Upcoming",  value: upcoming,  accent: "text-amber-500" },
    { label: "Completed", value: completed, accent: "text-emerald-600" },
    { label: "Total",     value: total,     accent: "text-slate-800" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, accent }, i) => (
        <div
          key={label}
          className="bg-white border border-slate-100 rounded-2xl px-3 py-4 flex flex-col items-center gap-1 shadow-sm"
        >
          <span className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</span>
          <span className="text-slate-400 text-[11px] font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}