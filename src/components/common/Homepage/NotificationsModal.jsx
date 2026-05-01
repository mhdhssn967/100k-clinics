import React from "react";
import { X, Bell, Check, Info, AlertTriangle, Calendar } from "lucide-react";
import { useStore } from "../../../store";

export default function NotificationsModal() {
  const show = useStore(s => s.showNotificationsModal);
  const setOpen = useStore(s => s.setNotificationsModal);
  const notifications = useStore(s => s.notifications);
  const loading = useStore(s => s.notificationsLoading);
  const readNotification = useStore(s => s.readNotification);

  if (!show) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      /* Green was text-emerald-500 */
      case "booking": return <Calendar size={16} className="text-sky-500" />;
      case "alert": return <AlertTriangle size={16} className="text-rose-500" />;
      case "info": return <Info size={16} className="text-blue-500" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-pageIn">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Green was text-emerald-600 */}
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-sky-600">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-lg">Notifications</h3>
              <p className="text-slate-500 text-xs font-medium">
                {unreadCount > 0 ? `You have ${unreadCount} unread messages` : "No unread notifications"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2">
          {loading ? (
            <div className="p-10 text-center space-y-3">
              {/* Green was border-emerald-100 border-t-emerald-500 */}
              <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Loading...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && readNotification(n.id)}
                /* Green was bg-emerald-50/30 */
                className={`w-full text-left px-6 py-4 transition-colors border-b border-slate-50 last:border-0 flex gap-4 ${
                  !n.read ? "bg-sky-50/30" : "bg-white opacity-70"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  /* Green was border-emerald-100 */
                  !n.read ? "bg-white shadow-sm border border-sky-100" : "bg-slate-50"
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-bold truncate ${!n.read ? "text-slate-900" : "text-slate-600"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  /* Green was bg-emerald-500 */
                  <div className="w-2 h-2 bg-sky-500 rounded-full mt-1.5 flex-shrink-0" />
                )}
              </button>
            ))
          ) : (
            <div className="p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Check size={32} />
              </div>
              <div>
                <p className="text-slate-900 font-bold">All caught up!</p>
                <p className="text-slate-500 text-xs mt-1">You don't have any new notifications at the moment.</p>
              </div>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <button 
              onClick={() => setOpen(false)}
              className="w-full py-3 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
