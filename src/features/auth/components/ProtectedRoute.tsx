import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { LoadingState } from '@/components/shared/LoadingState';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingState message="Memeriksa sesi pengguna..." />
      </div>
    );
  }

  // Belum login -> arahkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika dibatasi role tertentu dan role saat ini tidak diizinkan
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/menu" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
