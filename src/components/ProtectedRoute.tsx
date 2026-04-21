import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRole?: 'Admin' | 'Teacher';
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // រង់ចាំរហូតដល់ទាញយកទិន្នន័យ (Auto-Login) ចប់
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // បើមិនទាន់ Login ទេ បោះទៅទំព័រ /login វិញ
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // ផ្ទៀងផ្ទាត់ Role (Admin vs Teacher)
  if (allowedRole && user.role !== allowedRole) {
    // បើ Role ខុស (ឧ. Teacher ចង់ចូលទំព័រ Admin) រុញត្រលប់ទៅ Dashboard របស់គេវិញ
    return <Navigate to={user.role === 'Admin' ? '/admin' : '/teacher'} replace />;
  }

  // បើត្រូវលក្ខខណ្ឌទាំងអស់ អនុញ្ញាតឲ្យចូលមើលទំព័របាន (Render Child Routes)
  return <Outlet />;
}
