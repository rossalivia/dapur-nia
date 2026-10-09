import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { MenuFeature } from '@/features/menu';
import { PelangganFeature } from '@/features/pelanggan';
import { PesananFeature } from '@/features/pesanan';
import { PesananSaya } from '@/features/pesanan/components/PesananSaya';
import { LaporanFeature } from '@/features/laporan';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rute Publik */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rute Terproteksi dengan MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/menu" replace />} />
              
              {/* Rute Umum untuk Pengguna Terautentikasi (Admin & Pelanggan) */}
              <Route path="menu" element={<MenuFeature />} />
              <Route path="pesanan-saya" element={<PesananSaya />} />

              {/* Rute Khusus Admin/Pengelola */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="pelanggan" element={<PelangganFeature />} />
                <Route path="pesanan" element={<PesananFeature />} />
                <Route path="laporan" element={<LaporanFeature />} />
              </Route>

              <Route path="*" element={<Navigate to="/menu" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
