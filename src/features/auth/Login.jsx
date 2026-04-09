import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, LogIn, Loader2, HeartPulse } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4">
      
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-blue-100 p-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <HeartPulse className="text-blue-600" size={28} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            Clinic Portal Login
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Secure access to your clinic dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Clinic Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-blue-400" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                className="w-full pl-10 pr-4 py-3 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-blue-400" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Button */}
          <button
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isSubmitting 
              ? <Loader2 className="animate-spin" size={20} /> 
              : <LogIn size={20} />
            }
            {isSubmitting ? 'Verifying...' : 'Login to Dashboard'}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Clinic Management System
        </div>

      </div>
    </div>
  );
};

export default Login;