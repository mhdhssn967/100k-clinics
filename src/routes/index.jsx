import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../features/auth/Login';
import ClinicDashboard from '../features/clinic/ClinicDashboard';
import DashboardLayout from '../layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';

// 1. Loading Component for a smooth app experience
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader2 className="animate-spin text-blue-600" size={40} />
  </div>
);

// 2. Protected Route: Redirects to Login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// 3. Public Route: Redirects to Dashboard if ALREADY logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* If user hits root '/', redirect based on auth status */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Page - uses PublicRoute to kick active users to dashboard */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Clinic Dashboard App Interface */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ClinicDashboard />} />
          {/* Future app pages go here */}
          <Route path="appointments" element={<div>Appointments Page</div>} />
          <Route path="patients" element={<div>Patients Page</div>} />
        </Route>

        {/* Catch-all: back to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};