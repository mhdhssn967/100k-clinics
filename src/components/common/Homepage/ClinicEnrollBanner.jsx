import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function ClinicEnrollBanner() {
  const navigate = useNavigate();

  return (
    <div className="w-full relative group overflow-hidden">
      {/* Premium Background with Gradient and Blur Effects */}
      <div className="absolute -inset-1  rounded-3xl  opacity-20 group-hover:opacity-30 transition duration-500"></div>
      
      <div className="relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl -ml-12 -mb-12 opacity-40"></div>

        <div className="px-5 py-6 sm:px-8 sm:py-7 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-1 rounded-lg">
                  <Sparkles size={14} className="text-emerald-600" />
                </div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                  Partner with us
                </span>
              </div>
              
              <h2 className="text-slate-900 text-lg sm:text-xl font-extrabold tracking-tight leading-tight">
                List your clinic for just <span className="text-emerald-600">$15</span> for two years
              </h2>
              
              <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-medium">
                <ShieldCheck size={14} className="text-emerald-500/70" />
                <span>Gain more patients & digital presence today</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/register-clinic")}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] hover:shadow-lg hover:shadow-slate-200"
            >
              Register Now
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
