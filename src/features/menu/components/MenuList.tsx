import React from 'react';
import { Menu } from '@/types';
import { MenuCard } from './MenuCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { UserRole } from '@/features/auth/types';

interface MenuListProps {
  menus: Menu[];
  onEdit?: (menu: Menu) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  onOrder?: (menu: Menu) => void;
  role?: UserRole | null;
}

export const MenuList: React.FC<MenuListProps> = ({
  menus,
  onEdit,
  onDelete,
  onAddNew,
  onOrder,
  role = 'admin',
}) => {
  // Pelanggan hanya melihat menu yang statusnya tersedia
  const displayMenus =
    role === 'pelanggan' ? menus.filter((m) => m.tersedia) : menus;

  if (displayMenus.length === 0) {
    if (role === 'pelanggan') {
      return (
        <EmptyState
          title="Belum Ada Menu Tersedia"
          description="Saat ini belum ada menu katering yang dibuka untuk pemesanan. Silakan cek kembali nanti ya!"
        />
      );
    }

    return (
      <EmptyState
        title="Belum Ada Menu"
        description="Daftar menu harian masih kosong. Tambahkan menu baru untuk mulai mengelola katering."
        actionLabel="+ Tambah Menu"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {displayMenus.map((menu) => (
        <MenuCard
          key={menu.id || menu.nama}
          menu={menu}
          onEdit={onEdit}
          onDelete={onDelete}
          onOrder={onOrder}
          role={role}
        />
      ))}
    </div>
  );
};
