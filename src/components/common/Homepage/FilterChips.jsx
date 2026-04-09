// components/home/FilterChips.jsx
import { Sparkles, Clock4, Navigation, Star } from "lucide-react";
import { useStore } from "../../../store";

const FILTERS = [
  { id: "all",    label: "All",        Icon: Sparkles },
  { id: "open",   label: "Open Now",   Icon: Clock4 },
  { id: "nearby", label: "Nearby",     Icon: Navigation },
  { id: "rated",  label: "Top Rated",  Icon: Star },
];

export default function FilterChips() {
  const activeFilter    = useStore(s => s.activeFilter);
  const setActiveFilter = useStore(s => s.setActiveFilter);

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {FILTERS.map(({ id, label, Icon }) => {
        const active = activeFilter === id;
        return (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Icon size={11} strokeWidth={active ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}