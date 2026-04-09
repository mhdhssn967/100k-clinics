import React from 'react';
import { 
  Users, 
  MousePointer2, 
  MessageCircle, 
  QrCode, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

const ClinicDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Good morning, Dr. Vivek</h2>
          <p className="text-slate-500">Here is what's happening with your clinic today.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all">
          <QrCode size={18} /> View My QR Code
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Profile Views" 
          value="1,284" 
          trend="+12%" 
        />
        <StatCard 
          icon={<MessageCircle className="text-green-600" />} 
          label="WhatsApp Clicks" 
          value="85" 
          trend="+5%" 
        />
        <StatCard 
          icon={<MousePointer2 className="text-purple-600" />} 
          label="Appt. Bookings" 
          value="32" 
          trend="+18%" 
        />
        <StatCard 
          icon={<TrendingUp className="text-orange-600" />} 
          label="Patient Growth" 
          value="24%" 
          trend="+2%" 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Appointments */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Upcoming Appointments</h3>
            <button className="text-blue-600 text-sm font-semibold">View All</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">P</div>
                  <div>
                    <p className="font-bold text-slate-900">Patient Name {item}</p>
                    <p className="text-xs text-slate-500">General Consultation • 10:30 AM</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ArrowUpRight size={18} className="text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Local Language Support Preview */}
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
          <h3 className="font-bold text-lg mb-4">Multi-language Support</h3>
          <p className="text-blue-100 text-sm mb-6">
            Your profile is currently live in 5 languages. 
            Check how it looks to your local patients.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {['മലയാളം', 'हिन्दी', 'தமிழ்', 'తెలుగు'].map((lang) => (
              <div key={lang} className="bg-white/10 border border-white/20 rounded-xl p-2 text-center text-xs font-medium">
                {lang}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
  </div>
);

export default ClinicDashboard;