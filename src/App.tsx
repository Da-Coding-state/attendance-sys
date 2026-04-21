import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages & Components
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherManager from './pages/admin/TeacherManager';
import FinalReport from './pages/admin/FinalReport';
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import RollCallSheet from './pages/teacher/RollCallSheet';
import ProtectedRoute from './components/ProtectedRoute';
import FullPageLoader from './components/FullPageLoader';

// យន្តការ Redirect ស្វ័យប្រវត្តិ (Root Route)
function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // បើកំពុង Login, រុញបញ្ជូនទៅកាន់ Dashboard របស់ខ្លួនឯង
  return <Navigate to={user.role === 'Admin' ? '/admin' : '/teacher'} replace />;
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'inherit',
            fontWeight: 600,
          },
        }} 
      />
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes សម្រាប់ Admin */}
          <Route element={<ProtectedRoute allowedRole="Admin" />}>
             <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="teachers" element={<TeacherManager />} />
                <Route path="reports" element={<FinalReport />} />
             </Route>
          </Route>

          {/* Protected Routes សម្រាប់ Teacher */}
          <Route element={<ProtectedRoute allowedRole="Teacher" />}>
             {/* Wrap inside layout for standard pages */}
             <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherDashboard />} />
             </Route>
             {/* RollCallSheet can be separate or inside layout. Let's keep it separate to give it full screen layout control, saving space. */}
             <Route path="/teacher/attendance/:className" element={<RollCallSheet />} />
          </Route>

          {/* ចាប់យក URL ទាំងឡាយណាដែលខុសពីខាងលើ ហើយបោះត្រលប់ទៅ Root */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
