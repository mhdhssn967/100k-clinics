// src/store/searchStore.js
// ─────────────────────────────────────────────────────────────────────────────
// Standalone Zustand store for all search & filter logic.
// Completely isolated from the main store (index.js).
//
// HOW IT WORKS:
//   1. Call initSearch(clinics) once after clinics load from the main store.
//   2. Use useSearchStore() anywhere in search/filter UI.
//   3. Read `results` for the filtered+sorted clinic list.
//   4. Zero interference with auth, appointments, or navigation state.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";

// ── Core filter engine ────────────────────────────────────────────────────────
function applyFilters(clinics, { query, sortBy, onlyOpen, specialty, maxDistance }) {
  let result = [...clinics];

  // Full-text search across name, specialty, tags, doctor names
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.specialty?.toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q)) ||
      c.doctors?.some(d => d.name?.toLowerCase().includes(q)) ||
      c.address?.toLowerCase().includes(q)
    );
  }

  // Open now
  if (onlyOpen) {
    result = result.filter(c => c.isOpen);
  }

  // Specialty / tag match
  if (specialty && specialty !== "all") {
    const sp = specialty.toLowerCase();
    result = result.filter(c =>
      c.specialty?.toLowerCase().includes(sp) ||
      c.tags?.some(t => t.toLowerCase().includes(sp)) ||
      c.specialities?.some(s => s.toLowerCase().includes(sp))
    );
  }

  // Max distance
  if (maxDistance !== null) {
    result = result.filter(c => parseFloat(c.distance) <= maxDistance);
  }

  // Sort
  switch (sortBy) {
    case "rated":
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "wait":
      result.sort((a, b) => parseFloat(a.waitTime ?? "99") - parseFloat(b.waitTime ?? "99"));
      break;
    case "nearby":
    default:
      result.sort((a, b) => parseFloat(a.distance ?? "99") - parseFloat(b.distance ?? "99"));
      break;
  }

  return result;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useSearchStore = create((set, get) => ({
  // ── Source data (set once after clinics load) ─────────────────────────────
  _allClinics: [],

  // ── Filter state ──────────────────────────────────────────────────────────
  query:       "",
  sortBy:      "nearby",   // "nearby" | "rated" | "wait"
  onlyOpen:    false,
  specialty:   "all",      // "all" | any specialty string
  maxDistance: null,       // null | number (km)

  // ── Output ────────────────────────────────────────────────────────────────
  results:     [],         // filtered + sorted clinics — use this in ClinicList

  // ── Internal re-run ──────────────────────────────────────────────────────
  _run: () => {
    const { _allClinics, query, sortBy, onlyOpen, specialty, maxDistance } = get();
    set({ results: applyFilters(_allClinics, { query, sortBy, onlyOpen, specialty, maxDistance }) });
  },

  // ── Init: call this once after clinics are fetched in the main store ───────
  // Usage: useSearchStore.getState().initSearch(clinics)
  initSearch: (clinics) => {
    set({ _allClinics: clinics });
    get()._run();
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  setQuery: (query) => {
    set({ query });
    get()._run();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get()._run();
  },

  setOnlyOpen: (onlyOpen) => {
    set({ onlyOpen });
    get()._run();
  },

  setSpecialty: (specialty) => {
    set({ specialty });
    get()._run();
  },

  setMaxDistance: (maxDistance) => {
    set({ maxDistance });
    get()._run();
  },

  resetFilters: () => {
    set({ query: "", sortBy: "nearby", onlyOpen: false, specialty: "all", maxDistance: null });
    get()._run();
  },

  // ── Derived helpers (call as functions) ───────────────────────────────────
  activeFilterCount: () => {
    const { onlyOpen, specialty, maxDistance, query } = get();
    return [
      onlyOpen,
      specialty !== "all",
      maxDistance !== null,
      query.trim().length > 0,
    ].filter(Boolean).length;
  },
}));