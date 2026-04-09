import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Hidden on mobile, toggleable or drawer needed later */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6">
        <div className="font-bold text-xl text-blue-600 mb-10">100K Clinics</div>
        
        <nav className="space-y-2 flex-grow">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" to="/dashboard" active />
          <NavItem icon={<Calendar size={20}/>} label="Appointments" to="/appointments" />
          <NavItem icon={<Users size={20}/>} label="Patients" to="/patients" />
          <NavItem icon={<Settings size={20}/>} label="Clinic Settings" to="/settings" />
        </nav>

        <button className="flex items-center gap-3 text-red-500 font-semibold p-3 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold">Clinic Dashboard</h1>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">D</div>
          </div>
        </header>
        
        <div className="p-8">
          <Outlet /> {/* This is where the specific feature pages render */}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, to, active }) => (
  <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
    {icon} {label}
  </Link>
);

export default DashboardLayout;