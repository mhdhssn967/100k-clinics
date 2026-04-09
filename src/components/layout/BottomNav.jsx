import { Home, Calendar, Star, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home",     label: "Home",     Icon: Home, path: "/user/home" },
  { id: "bookings", label: "Bookings", Icon: Calendar, path: "/bookings" },
  { id: "reviews",  label: "Reviews",  Icon: Star, path: "/reviews" },
  { id: "settings", label: "Settings", Icon: Settings, path: "/settings" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto">
      <div className="mx-3 mb-3 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-2">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ id, label, Icon, path }) => {
            const active = location.pathname === path;

            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1 flex-1 py-2 relative"
                aria-label={label}
              >
                <div className={`w-10 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  active ? "bg-slate-900" : "bg-transparent"
                }`}>
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors duration-200 ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  />
                </div>

                <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                  active ? "text-slate-900" : "text-slate-400"
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}