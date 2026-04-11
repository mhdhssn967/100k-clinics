// src/utils/constants.js

export const SPECIALTIES = [
  { id: "all",              label: "All Specialties" },
  { id: "General Practice", label: "General Practice" },
  { id: "Cardiology",       label: "Cardiology" },
  { id: "Dentistry",        label: "Dentistry" },
  { id: "Neurology",        label: "Neurology" },
  { id: "Orthopedics",      label: "Orthopedics" },
  { id: "Pediatrics",       label: "Pediatrics" },
  { id: "Dermatology",      label: "Dermatology" },
  { id: "Gynecology",       label: "Gynecology" },
  { id: "ENT",              label: "ENT" },
  { id: "Other",            label: "Other" }
];

export const SPECIALTY_NAMES = SPECIALTIES.filter(s => s.id !== "all").map(s => s.id);
