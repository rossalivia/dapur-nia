import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MenuFeature } from '@/features/menu';
import { PelangganFeature } from '@/features/pelanggan';
import { PesananFeature } from '@/features/pesanan';
import { LaporanFeature } from '@/features/laporan';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/menu" replace />} />
          <Route path="menu" element={<MenuFeature />} />
          <Route path="pelanggan" element={<PelangganFeature />} />
          <Route path="pesanan" element={<PesananFeature />} />
          <Route path="laporan" element={<LaporanFeature />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
