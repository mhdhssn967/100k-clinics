// src/pages/clinic-admin/components/AdminToast.jsx
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";

export default function AdminToast() {
  const toast = useAdminStore(s => s.toast);
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl ${
        toast.type === "error" ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
      }`}
      style={{ transform: "translateX(-50%)", animation: "toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      {toast.type === "error"
        ? <AlertCircle size={15} className="flex-shrink-0" />
        : <CheckCircle size={15} className="flex-shrink-0" />
      }
      {toast.msg}
    </div>
  );
}