import React, { useState } from 'react';
import { useMenu } from './hooks/useMenu';
import { menuService } from './services/menuService';
import { MenuList } from './components/MenuList';
import { MenuFormSheet } from './components/MenuFormSheet';
import { PesananFormSheet } from '@/features/pesanan/components/PesananFormSheet';
import { pesananService, CreatePesananDTO } from '@/features/pesanan/services/pesananService';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Menu, Pelanggan } from '@/types';
import { Plus, Utensils, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const MenuFeature: React.FC = () => {
  const { menus, loading, error } = useMenu();
  const { role, profile } = useAuth();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const isAdmin = role === 'admin';

  const handleAddNew = () => {
    setSelectedMenu(null);
    setIsFormOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      try {
        await menuService.deleteMenu(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus menu.');
      }
    }
  };

  const handleSubmit = async (data: Omit<Menu, 'id' | 'dibuat_pada'>) => {
    if (selectedMenu?.id) {
      await menuService.updateMenu(selectedMenu.id, data);
    } else {
      await menuService.addMenu(data);
    }
  };

  const handleOrder = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsOrderOpen(true);
  };

  const handleCreatePesanan = async (dto: CreatePesananDTO) => {
    await pesananService.createPesanan(dto);
    setIsOrderOpen(false);
    alert('Pesanan berhasil dibuat! Anda dapat melihat statusnya di menu "Pesanan Saya".');
    navigate('/pesanan-saya');
  };

  // Siapkan data pelanggan untuk form pemesanan
  const currentPelangganList: Pelanggan[] = profile
    ? [profile]
    : [
        {
          id: '081234567890',
          nama: 'Pelanggan',
          no_whatsapp: '081234567890',
          alamat: 'Alamat pengiriman',
        },
      ];

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            {isAdmin ? 'Menu Harian' : 'Pilihan Menu Katering'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isAdmin
              ? 'Kelola daftar menu, harga porsi, dan ketersediaan stok'
              : 'Pilihan menu harian lezat & higienis siap dipesan'}
          </p>
        </div>

        {/* Hanya Pengelola / Admin yang bisa menambah menu baru */}
        {isAdmin && (
          <Button onClick={handleAddNew} size="sm" className="gap-1 shadow-sm">
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>

      {loading && <LoadingState message="Memuat daftar menu katering..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <MenuList
          menus={menus}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          onAddNew={isAdmin ? handleAddNew : undefined}
          onOrder={handleOrder}
          role={role}
        />
      )}

      {/* Sheet untuk Admin Menambah/Mengubah Menu */}
      {isAdmin && (
        <MenuFormSheet
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedMenu}
        />
      )}

      {/* Sheet untuk Pelanggan Melakukan Pemesanan */}
      {!isAdmin && (
        <PesananFormSheet
          isOpen={isOrderOpen}
          onClose={() => setIsOrderOpen(false)}
          onSubmit={handleCreatePesanan}
          menus={selectedMenu ? [selectedMenu] : menus}
          pelangganList={currentPelangganList}
        />
      )}
    </div>
  );
};

export default MenuFeature;
