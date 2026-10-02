import React from 'react';
import { Menu } from '@/types';
import { MenuCard } from './MenuCard';
import { EmptyState } from '@/components/shared/EmptyState';

interface MenuListProps {
  menus: Menu[];
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const MenuList: React.FC<MenuListProps> = ({ menus, onEdit, onDelete, onAddNew }) => {
  if (menus.length === 0) {
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
      {menus.map((menu) => (
        <MenuCard
          key={menu.id || menu.nama}
          menu={menu}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
