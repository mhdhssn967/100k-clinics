// components/home/ClinicSearchCard.jsx
// Agoda-style search card — popped, colour-accented, fully responsive.
// Reads/writes ONLY to searchStore. Zero interference with other components.

import { useState, useRef } from "react";
import { Search, X, ChevronDown, Check,
  Navigation, Star, Clock4, MapPin,
  Stethoscope, Zap, Activity
} from "lucide-react";
import { useSearchStore } from "../../../store/searchStore";
import { SPECIALTIES } from "../../../utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "clinic",  label: "Clinics",  Icon: Activity },
  { id: "doctor",  label: "Doctors",  Icon: Stethoscope },
  { id: "open",    label: "Open Now", Icon: Zap },
];



const DISTANCE_OPTIONS = [
  { label: "Any",       value: null },
  { label: "< 1 km",   value: 1 },
  { label: "< 2 km",   value: 2 },
  { label: "< 5 km",   value: 5 },
  { label: "< 10 km",  value: 10 },
];

const SORT_OPTIONS = [
  { id: "nearby", label: "Nearest",     Icon: Navigation },
  { id: "rated",  label: "Top Rated",   Icon: Star },
  { id: "wait",   label: "Least Wait",  Icon: Clock4 },
];

const QUICK_SEARCHES = [
  "Cardiologist", "Dentist", "Eye specialist",
  "General physician", "Pediatrician", "Physiotherapy",
];

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown
// ─────────────────────────────────────────────────────────────────────────────
function Dropdown({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden min-w-[140px]">
        {children}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Selector field — the Agoda-style "box with label + value + chevron"
// ─────────────────────────────────────────────────────────────────────────────
function SelectorField({ label, value, active, onClick, children, dropdownOpen, onClose }) {
  return (
    <div className="relative flex-1 min-w-0">
      <button
        onClick={onClick}
        className={`w-full flex flex-col items-start px-3 py-2.5 rounded-xl border transition-all duration-150 text-left ${
          active
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
        }`}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </span>
        <div className="flex items-center gap-1 w-full min-w-0">
          <span className={`text-[13px] font-bold truncate flex-1 leading-tight ${
            active ? "text-emerald-700" : "text-slate-700"
          }`}>
            {value}
          </span>
          <ChevronDown
            size={12}
            className={`flex-shrink-0 transition-transform duration-150 ${
              dropdownOpen ? "rotate-180 text-emerald-500" : "text-slate-400"
            }`}
          />
        </div>
      </button>
      <Dropdown open={dropdownOpen} onClose={onClose}>
        {children}
      </Dropdown>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active filter pill
// ─────────────────────────────────────────────────────────────────────────────
function FilterPill({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
      {label}
      <button
        onClick={onRemove}
        className="text-emerald-500 hover:text-emerald-800 transition-colors ml-0.5"
      >
        <X size={10} strokeWidth={3} />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function ClinicSearchCard() {
  // Store
  const query         = useSearchStore(s => s.query);
  const sortBy        = useSearchStore(s => s.sortBy);
  const onlyOpen      = useSearchStore(s => s.onlyOpen);
  const specialty     = useSearchStore(s => s.specialty);
  const maxDistance   = useSearchStore(s => s.maxDistance);
  const results       = useSearchStore(s => s.results);
  const setQuery      = useSearchStore(s => s.setQuery);
  const setSortBy     = useSearchStore(s => s.setSortBy);
  const setOnlyOpen   = useSearchStore(s => s.setOnlyOpen);
  const setSpecialty  = useSearchStore(s => s.setSpecialty);
  const setMaxDist    = useSearchStore(s => s.setMaxDistance);
  const resetFilters  = useSearchStore(s => s.resetFilters);
  const activeFilterCount = useSearchStore(s => s.activeFilterCount);

  // Local UI
  const [activeTab,       setActiveTab]       = useState("clinic");
  const [localQuery,      setLocalQuery]      = useState("");
  const [focused,         setFocused]         = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openDropdown,    setOpenDropdown]    = useState(null);
  const inputRef = useRef();

  // Tabs
  const handleTab = (id) => {
    setActiveTab(id);
    if (id === "open")   { setOnlyOpen(true);  setSortBy("nearby"); }
    if (id === "nearby") { setOnlyOpen(false); setSortBy("nearby"); }
    if (id === "clinic") { setOnlyOpen(false); }
    if (id === "doctor") { setOnlyOpen(false); }
  };

  // Query
  const handleInput = (val) => {
    setLocalQuery(val);
    setQuery(val);
    setShowSuggestions(val.length === 0 && focused);
  };
  const clearQuery = () => {
    setLocalQuery(""); setQuery("");
    setShowSuggestions(true);
    inputRef.current?.focus();
  };
  const pickSuggestion = (s) => {
    setLocalQuery(s); setQuery(s);
    setShowSuggestions(false);
  };

  const closeDropdown  = () => setOpenDropdown(null);
  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const activeCount    = activeFilterCount();

  const specialtyLabel = SPECIALTIES.find(s => s.id === specialty)?.label || "Any";
  const distanceLabel  = maxDistance !== null ? `< ${maxDistance} km` : "Any";
  const sortLabel      = SORT_OPTIONS.find(s => s.id === sortBy)?.label || "Nearest";

  return (
    <div className="w-full relative group z-20">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
      <div className="bg-white rounded-2xl overflow-visible shadow-xl border border-white relative">

        {/* ── Coloured header band ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-t-2xl px-4 pt-4 pb-0">
          {/* Label */}
          <p className="text-emerald-100 text-[11px] font-semibold uppercase tracking-widest mb-2.5">
            Find healthcare near you
          </p>

          {/* Tabs on the coloured band */}
          <div className="flex gap-1">
            {TABS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-[12px] font-bold transition-all duration-150 flex-1 justify-center ${
                    active
                      ? "bg-white text-emerald-700"
                      : "text-emerald-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={12} strokeWidth={active ? 2.5 : 2} />
                  <span className="hidden xs:inline sm:inline">{label}</span>
                  {/* On very small screens show only icon — label still accessible via aria */}
                  <span className="xs:hidden sm:hidden">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── White body ───────────────────────────────────────────────── */}
        <div className="p-4 space-y-3">

          {/* ── Search input ─────────────────────────────────────────── */}
          <div className="relative">
            <div className={`flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-3 transition-all duration-200 ${
              focused
                ? "border-emerald-500 bg-white shadow-sm shadow-emerald-100"
                : "border-slate-200 bg-slate-50"
            }`}>
              <Search
                size={17}
                strokeWidth={2.5}
                className={`flex-shrink-0 transition-colors ${focused ? "text-emerald-500" : "text-slate-400"}`}
              />
              <input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={e => handleInput(e.target.value)}
                onFocus={() => { setFocused(true); if (!localQuery) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => { setFocused(false); setShowSuggestions(false); }, 160)}
                placeholder={
                  activeTab === "doctor"  ? "Doctor name or specialty…"
                  : activeTab === "open"  ? "Search open clinics…"
                  : activeTab === "nearby"? "Search nearby clinics…"
                  : "Clinic name, specialty, or doctor…"
                }
                className="flex-1 bg-transparent text-[14px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
              />
              {localQuery && (
                <button
                  onClick={clearQuery}
                  className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors flex-shrink-0"
                >
                  <X size={10} className="text-slate-600" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Suggestion dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Popular</p>
                </div>
                <div className="p-1.5">
                  {QUICK_SEARCHES.map(s => (
                    <button
                      key={s}
                      onMouseDown={() => pickSuggestion(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 text-left transition-colors"
                    >
                      <Search size={12} className="text-slate-300 flex-shrink-0" />
                      <span className="text-slate-700 text-[13px] font-medium">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 3 selector fields — responsive row ───────────────────── */}
          {/* On mobile: row of 3 compact boxes. On sm+: slightly roomier. */}
          <div className="flex gap-2">
            <SelectorField
              label="Specialty"
              value={specialty === "all" ? "Any" : specialtyLabel}
              active={specialty !== "all"}
              onClick={() => toggleDropdown("specialty")}
              dropdownOpen={openDropdown === "specialty"}
              onClose={closeDropdown}
            >
              <div className="max-h-56 overflow-y-auto">
                {SPECIALTIES.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => { setSpecialty(sp.id); closeDropdown(); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors text-[13px] text-slate-700 border-b border-slate-50 last:border-0"
                  >
                    <span>{sp.label}</span>
                    {specialty === sp.id && <Check size={13} className="text-emerald-600" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </SelectorField>

            <SelectorField
              label="Distance"
              value={distanceLabel}
              active={maxDistance !== null}
              onClick={() => toggleDropdown("distance")}
              dropdownOpen={openDropdown === "distance"}
              onClose={closeDropdown}
            >
              {DISTANCE_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => { setMaxDist(opt.value); closeDropdown(); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors text-[13px] text-slate-700 border-b border-slate-50 last:border-0"
                >
                  <span>{opt.label}</span>
                  {maxDistance === opt.value && <Check size={13} className="text-emerald-600" strokeWidth={2.5} />}
                </button>
              ))}
            </SelectorField>

            <SelectorField
              label="Sort by"
              value={sortLabel}
              active={false}
              onClick={() => toggleDropdown("sort")}
              dropdownOpen={openDropdown === "sort"}
              onClose={closeDropdown}
            >
              {SORT_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setSortBy(id); closeDropdown(); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left transition-colors text-[13px] text-slate-700 border-b border-slate-50 last:border-0"
                >
                  <span className="flex items-center gap-2">
                    <Icon size={12} className="text-slate-400" />
                    {label}
                  </span>
                  {sortBy === id && <Check size={13} className="text-emerald-600" strokeWidth={2.5} />}
                </button>
              ))}
            </SelectorField>
          </div>

          {/* ── Open now + clear row ──────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setOnlyOpen(!onlyOpen)}
              className="flex items-center gap-2 group"
            >
              <div className={`w-9 h-[18px] rounded-full relative transition-all duration-200 ${
                onlyOpen ? "bg-emerald-500" : "bg-slate-200"
              }`}>
                <span className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all duration-200 ${
                  onlyOpen ? "left-[18px]" : "left-[2px]"
                }`} />
              </div>
              <span className={`text-[12px] font-semibold transition-colors ${
                onlyOpen ? "text-emerald-700" : "text-slate-500"
              }`}>
                Open now only
              </span>
              {onlyOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {activeCount > 0 && (
              <button
                onClick={() => { resetFilters(); setLocalQuery(""); }}
                className="text-[11px] text-rose-500 font-semibold hover:text-rose-700 transition-colors flex items-center gap-1"
              >
                <X size={10} strokeWidth={2.5} /> Reset
              </button>
            )}
          </div>

          {/* ── Search CTA ────────────────────────────────────────────── */}
          <button
            onClick={() => {
              // Search is instant/live — just close suggestions and let results update
              setShowSuggestions(false);
              inputRef.current?.blur();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-[14px] py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-emerald-200/60"
          >
            <Search size={15} strokeWidth={2.5} />
            {results.length > 0
              ? `Show ${results.length} clinic${results.length !== 1 ? "s" : ""}`
              : "Search Clinics"
            }
          </button>
        </div>

        {/* ── Active filter pills (only shown when filters are set) ──── */}
        {activeCount > 0 && (
          <div className="px-4 pb-3.5 flex gap-2 flex-wrap">
            {query.trim()        && <FilterPill label={`"${query}"`}          onRemove={() => { setQuery(""); setLocalQuery(""); }} />}
            {specialty !== "all" && <FilterPill label={specialtyLabel}         onRemove={() => setSpecialty("all")} />}
            {maxDistance         && <FilterPill label={`< ${maxDistance} km`}  onRemove={() => setMaxDist(null)} />}
            {onlyOpen            && <FilterPill label="Open now"               onRemove={() => setOnlyOpen(false)} />}
          </div>
        )}
      </div>
    </div>
  );
}