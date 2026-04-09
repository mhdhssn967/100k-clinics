import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Clock, ChevronRight, ArrowRight,
  Shield, Zap, Globe, CheckCircle, Calendar, MessageSquare,
  Activity, Users, Building2, User, X, Phone, Heart,
  Stethoscope, Baby, Brain, Eye, Bone, Microscope
} from 'lucide-react';

// ── Animated counter hook ──
function useCounter(end, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

const SPECIALTIES = [
  { icon: <Stethoscope size={20} />, label: 'General Medicine', color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { icon: <Heart size={20} />, label: 'Cardiology', color: 'bg-rose-50 text-rose-500 border-rose-100' },
  { icon: <Baby size={20} />, label: 'Pediatrics', color: 'bg-amber-50 text-amber-500 border-amber-100' },
  { icon: <Brain size={20} />, label: 'Neurology', color: 'bg-violet-50 text-violet-500 border-violet-100' },
  { icon: <Eye size={20} />, label: 'Ophthalmology', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { icon: <Bone size={20} />, label: 'Orthopedics', color: 'bg-orange-50 text-orange-500 border-orange-100' },
  { icon: <Microscope size={20} />, label: 'Pathology', color: 'bg-indigo-50 text-indigo-500 border-indigo-100' },
  { icon: <Activity size={20} />, label: 'Diagnostics', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
];

const CLINICS = [
  { name: 'MedCare City Clinic', specialty: 'General Medicine', rating: 4.9, reviews: 312, wait: '~8 min', location: 'Kochi, Kerala', open: true, badge: 'Top Rated' },
  { name: 'HeartLine Cardiology', specialty: 'Cardiology', rating: 4.8, reviews: 189, wait: '~15 min', location: 'Ernakulam', open: true, badge: 'Verified' },
  { name: 'Sunrise Pediatrics', specialty: 'Pediatrics', rating: 4.9, reviews: 421, wait: '~5 min', location: 'Thrissur', open: false, badge: 'Popular' },
  { name: 'NeuroPlus Centre', specialty: 'Neurology', rating: 4.7, reviews: 98, wait: '~20 min', location: 'Kottayam', open: true, badge: null },
];

const STEPS = [
  { n: '01', title: 'Find a Clinic', desc: 'Search by specialty, location, or doctor name. Filter by ratings, availability, and distance.' },
  { n: '02', title: 'Book Instantly', desc: 'Pick a time slot that works for you. Get a confirmed appointment in under 60 seconds.' },
  { n: '03', title: 'Visit & Review', desc: 'Track your token in real time. After your visit, share your experience to help others.' },
];

const REVIEWS = [
  { name: 'Aisha Nair', clinic: 'MedCare City Clinic', rating: 5, text: 'The live queue tracker is a game changer. I waited in my car and walked in right on time.', ago: '2 days ago' },
  { name: 'Rahul Menon', clinic: 'HeartLine Cardiology', rating: 5, text: 'Booking was seamless. Doctor profiles gave me confidence before I even walked through the door.', ago: '5 days ago' },
  { name: 'Priya Thomas', clinic: 'Sunrise Pediatrics', rating: 4, text: 'Great experience for my daughter\'s checkup. Clean interface and accurate wait times.', ago: '1 week ago' },
];

// ── Stat Card ──
function StatCard({ value, suffix, label, start }) {
  const count = useCounter(value, 2000, start);
  return (
    <div className="text-center">
      <p className="text-4xl font-black text-slate-900 tracking-tight">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

// ── Clinic Card ──
function ClinicCard({ c, i }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center">
          <Building2 size={18} className="text-emerald-600" />
        </div>
        <div className="flex items-center gap-2">
          {c.badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {c.badge}
            </span>
          )}
          <span className={`w-2 h-2 rounded-full ${c.open ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          <span className={`text-xs font-semibold ${c.open ? 'text-emerald-600' : 'text-slate-400'}`}>
            {c.open ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-base mb-0.5 group-hover:text-emerald-700 transition-colors">{c.name}</h3>
      <p className="text-xs text-slate-500 mb-3">{c.specialty}</p>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1"><MapPin size={11} />{c.location}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{c.wait} wait</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-900">{c.rating}</span>
          <span className="text-xs text-slate-400">({c.reviews})</span>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
          Book <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
export default function Home() {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const navigate = useNavigate();

  // Intersection observer to trigger counters
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <Activity className="text-emerald-400" size={18} />
            </div>
            <span className="text-lg font-black tracking-tight">100K<span className="text-emerald-600">Clinics</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#specialties" className="hover:text-slate-900 transition-colors">Specialties</a>
            <a href="#clinics" className="hover:text-slate-900 transition-colors">Find Clinics</a>
            <a href="#how" className="hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#reviews" className="hover:text-slate-900 transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginOptions(true)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register-clinic')}
              className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95"
            >
              List Your Clinic
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Accent blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Trusted by 1,000+ Clinics across Kerala
          </div>

          <h1 className="text-5xl md:text-[64px] font-black tracking-tight leading-[1.08] mb-6 text-slate-900">
            Healthcare, Simplified<br />
            <span className="text-emerald-600">for Everyone.</span>
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Discover top-rated clinics near you, book appointments instantly, track your live queue token,
            and share reviews — all in one place.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-4 border-r border-slate-100 shrink-0">
                <MapPin size={16} className="text-emerald-600" />
                <span className="text-sm text-slate-400 font-medium hidden sm:block">Location</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by specialty, clinic, or doctor…"
                className="flex-1 px-4 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 bg-transparent"
              />
              <button className="m-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95">
                <Search size={15} />
                <span className="hidden sm:block">Search</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 justify-center flex-wrap">
              {['General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology'].map(s => (
                <button
                  key={s}
                  onClick={() => setSearchQuery(s)}
                  className="text-xs text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-emerald-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <section ref={statsRef} className="bg-slate-900 py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={1200} suffix="+" label="Clinics Registered" start={statsVisible} />
          <StatCard value={85000} suffix="+" label="Appointments Booked" start={statsVisible} />
          <StatCard value={42000} suffix="+" label="Verified Reviews" start={statsVisible} />
          <StatCard value={98} suffix="%" label="Patient Satisfaction" start={statsVisible} />
        </div>
      </section>

      {/* ── Specialties ── */}
      <section id="specialties" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Browse by Specialty</h2>
            <p className="text-slate-500 text-sm">Find the right specialist for your health needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPECIALTIES.map((s, i) => (
              <button
                key={i}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl border ${s.color} font-semibold text-sm hover:scale-105 hover:shadow-md transition-all duration-200 text-left`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Clinics ── */}
      <section id="clinics" className="py-20 px-6 bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Top Clinics Near You</h2>
              <p className="text-slate-500 text-sm">Verified, reviewed, and ready to book</p>
            </div>
            <button className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-600">
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CLINICS.map((c, i) => <ClinicCard key={i} c={c} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">How 100KClinics Works</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">From finding a clinic to walking out healthier — it takes minutes, not hours</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-100 group-hover:border-emerald-300 flex items-center justify-center mx-auto mb-5 transition-all shadow-sm group-hover:shadow-emerald-100 group-hover:shadow-lg">
                  <span className="text-2xl font-black text-emerald-600">{s.n}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">Everything a Modern Clinic Needs</h2>
            <p className="text-slate-400 text-sm">One platform. Complete management.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Calendar className="text-emerald-400" size={22} />, title: 'Smart Scheduling', desc: 'Automated appointment slots with buffer times, cancellation handling, and waitlist management.' },
              { icon: <Activity className="text-sky-400" size={22} />, title: 'Live Queue Tracker', desc: 'Real-time token updates so patients wait comfortably — no crowded waiting rooms.' },
              { icon: <MessageSquare className="text-violet-400" size={22} />, title: 'Patient Reviews', desc: 'Collect and showcase verified reviews that build trust and attract new patients.' },
              { icon: <Shield className="text-amber-400" size={22} />, title: 'Secure Records', desc: 'End-to-end encrypted patient data compliant with healthcare data standards.' },
              { icon: <Globe className="text-teal-400" size={22} />, title: 'Location Discovery', desc: 'Geo-verified listings help patients find your clinic on search and maps.' },
              { icon: <Zap className="text-rose-400" size={22} />, title: 'Instant Onboarding', desc: 'Get your clinic live in under 10 minutes. No technical expertise required.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">What Patients Are Saying</h2>
            <p className="text-slate-500 text-sm">Real reviews from real visits</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-100 transition-all">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, j) => (
                    <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">"{r.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.clinic}</p>
                  </div>
                  <span className="text-xs text-slate-400">{r.ago}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to Join 1,200+ Clinics?</h2>
          <p className="text-emerald-100 text-sm mb-8 max-w-lg mx-auto">
            List your clinic, manage your queue, collect reviews, and grow your patient base — all for free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register-clinic')}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all active:scale-95 shadow-xl shadow-emerald-800/20"
            >
              Register Your Clinic <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setShowLoginOptions(true)}
              className="flex items-center justify-center gap-2 bg-emerald-700/50 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Activity className="text-emerald-400" size={15} />
            </div>
            <span className="font-black tracking-tight text-sm">100K<span className="text-emerald-600">Clinics</span></span>
          </div>
          <p className="text-xs text-slate-400">© 2025 100KClinics. Connecting patients with quality healthcare.</p>
          <div className="flex gap-5 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Support</a>
          </div>
        </div>
      </footer>

      {/* ── Login Options Modal ── */}
      {showLoginOptions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginOptions(false); }}
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl shadow-slate-400/20 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Welcome Back</h2>
                <p className="text-sm text-slate-500 mt-0.5">Choose how you'd like to sign in</p>
              </div>
              <button
                onClick={() => setShowLoginOptions(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setShowLoginOptions(false); navigate('/login/user'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                  <User size={20} className="text-slate-600 group-hover:text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">I'm a Patient</p>
                  <p className="text-xs text-slate-400">Book & track appointments</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 ml-auto transition-colors" />
              </button>

              <button
                onClick={() => { setShowLoginOptions(false); navigate('/login/clinic'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                  <Building2 size={20} className="text-slate-600 group-hover:text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">I'm a Clinic Admin</p>
                  <p className="text-xs text-slate-400">Manage doctors & queue</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 ml-auto transition-colors" />
              </button>
            </div>

            <p className="text-xs text-center text-slate-400 mt-6">
              New clinic?{' '}
              <button
                onClick={() => { setShowLoginOptions(false); navigate('/register-clinic'); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}