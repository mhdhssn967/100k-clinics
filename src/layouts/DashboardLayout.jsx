import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Settings, LogOut,
  Menu, X, Bell, ChevronDown, Activity, Search
} from 'lucide-react';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { label: 'Dashboard',    to: '/dashboard',    icon: LayoutDashboard },
    { label: 'Appointments', to: '/appointments', icon: Calendar },
    { label: 'Patients',     to: '/patients',     icon: Users },
    { label: 'Settings',     to: '/settings',     icon: Settings },
  ];

  const notifications = [
    { id: 1, text: 'New appointment request', sub: 'Rahul Krishnan · 10:30 AM', dot: 'bg-blue-500', unread: true },
    { id: 2, text: 'Review received',         sub: 'Fathima N. left 5★',        dot: 'bg-green-500', unread: true },
    { id: 3, text: 'Slot reminder',            sub: '2:00 PM slot is filling up', dot: 'bg-amber-500', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-64 bg-white border-r border-slate-100
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Activity size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm leading-none">100K Clinics</div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-none">Clinic Portal</div>
          </div>
          <button
            onClick={closeSidebar}
            className="ml-auto md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Doctor Card */}
        <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center font-bold text-sm shrink-0">
              V
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm leading-snug truncate">Dr. Vivek Srinivas</div>
              <div className="text-[11px] text-blue-100 truncate">Ophthalmologist</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
            <span>Today's Slots</span>
            <span className="font-semibold text-white">6 / 12</span>
          </div>
        </div>

        {/* Nav */}
        <div className="px-3 pt-2 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-2">Menu</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {navigation.map(({ label, to, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon
                  size={17}
                  className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                  strokeWidth={active ? 2.5 : 2}
                />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3 mt-2 space-y-0.5">
          <Link
            to="/support"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Settings size={17} className="text-slate-400" strokeWidth={2} />
            Help &amp; Support
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={17} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-3 px-4 md:px-6 sticky top-0 z-30 shrink-0">

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-500 cursor-text hover:border-slate-300 transition-colors">
            <Search size={15} className="shrink-0 text-slate-400" />
            <span>Search patients, appointments…</span>
            <kbd className="ml-auto text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-mono">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-800">Notifications</span>
                    <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-blue-50/40' : ''}`}
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{n.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.sub}</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 text-center">
                    <span className="text-xs text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">View all notifications</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">V</div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">Dr. Vivek</span>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-sm text-slate-800">Dr. Vivek Srinivas</p>
                    <p className="text-xs text-slate-400 mt-0.5">vivek@100kclinics.in</p>
                  </div>
                  {[
                    { label: 'View Profile', to: '/profile' },
                    { label: 'Clinic Settings', to: '/settings' },
                    { label: 'Billing', to: '/billing' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-slate-100">
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-2.5 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">100K Clinics</span>
          <span>/</span>
          <span className="capitalize text-blue-600 font-medium">
            {location.pathname.replace('/', '') || 'dashboard'}
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;